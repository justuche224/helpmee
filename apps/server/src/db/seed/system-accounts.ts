// src/services/accountService.ts
import "dotenv/config";
import { db } from "../../db"; // your drizzle client
import { eq, isNull, and } from "drizzle-orm";
import { accounts } from "../schema/accounts";

type AccountSeed = {
  type: string;
  ownerId?: string | null;
  parentAccountId?: number | null;
  currency?: string;
  metadata?: Record<string, any>;
  description?: string;
};

// Get or create an account (idempotent). Run inside a transaction (tx).
export async function getOrCreateAccount(tx: any, seed: AccountSeed) {
  // Try to find an existing account with same (type, owner_id, parent_account_id)
  const whereClause = seed.ownerId
    ? and(eq(accounts.type, seed.type), eq(accounts.owner_id, seed.ownerId))
    : and(eq(accounts.type, seed.type), isNull(accounts.owner_id));

  // include parent match if supplied to avoid collisions between same type with different parents
  const fullWhere =
    seed.parentAccountId != null
      ? and(whereClause, eq(accounts.parent_account_id, seed.parentAccountId))
      : whereClause;

  const found = await tx.select().from(accounts).where(fullWhere).limit(1);
  if (found.length) return found[0].id;

  // otherwise insert
  const insertRes = await tx
    .insert(accounts)
    .values({
      type: seed.type,
      owner_id: seed.ownerId ?? null,
      parent_account_id: seed.parentAccountId ?? null,
      currency: seed.currency ?? "NGN",
      metadata: seed.metadata ?? null,
      description: seed.description ?? null,
    })
    .returning({ id: accounts.id });

  return insertRes[0].id;
}

// src/services/accountService.ts (continued)
export async function seedSystemAccounts() {
  // returns a map of account type => id
  return db.transaction(async (tx) => {
    // Top-level platform account (parent)
    const platformParentId = await getOrCreateAccount(tx, {
      type: "platform",
      ownerId: null,
      description: "Platform parent account - grouping",
      metadata: { createdBy: "seed" },
    });

    // Typical system accounts
    const platformIncomingId = await getOrCreateAccount(tx, {
      type: "platform_incoming",
      ownerId: null,
      parentAccountId: platformParentId,
      description: "Incoming funds (temporary holding before user credit)",
    });

    const pendingPayoutsId = await getOrCreateAccount(tx, {
      type: "pending_payouts",
      ownerId: null,
      parentAccountId: platformParentId,
      description: "Funds reserved for user withdrawals",
    });

    const platformOperationalId = await getOrCreateAccount(tx, {
      type: "platform_operational",
      ownerId: null,
      parentAccountId: platformParentId,
      description: "Platform operational (settled) funds",
    });

    const feesAccountId = await getOrCreateAccount(tx, {
      type: "fees",
      ownerId: null,
      parentAccountId: platformParentId,
      description: "Fees collected by platform",
    });

    // provider float example (create per-provider later; seed one generic placeholder)
    const providerFloatId = await getOrCreateAccount(tx, {
      type: "provider_float",
      ownerId: null,
      parentAccountId: platformParentId,
      description:
        "Generic provider float (use provider-specific floats in production)",
    });

    // return mapping
    return {
      platformParentId,
      platformIncomingId,
      pendingPayoutsId,
      platformOperationalId,
      feesAccountId,
      providerFloatId,
    };
  });
}

async function bootstrap() {
  const accountsMap = await seedSystemAccounts();
  console.log("System accounts ready:", accountsMap);
  Bun.write("./accounts.json", JSON.stringify(accountsMap, null, 2));
  process.exit(0);
}

bootstrap().catch((err) => {
  console.error("Seeding failed", err);
  process.exit(1);
});
