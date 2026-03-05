// src/services/WalletService.ts
import { db } from "@/db";
import crypto from "crypto";
import {
  accounts,
  journals,
  ledger_entries,
  wallets,
  transactions,
  provider_requests,
  payout_requests,
} from "@/db/schema";
import { and, desc, eq, inArray, sql } from "drizzle-orm";

/**
 * WalletService
 * - Responsible for returning/creating user ledger accounts & cached wallet row.
 * - Provides read helpers (cached & ledger sums) and a sample reserveFunds operation.
 *
 * Be sure to:
 * - See if System accounts (platform_incoming, pending_payouts, etc.) exist (seeded).
 * - All amounts are integers in kobo.
 */
export class WalletService {
  // ---------------------
  // Account helpers
  // ---------------------

  /** Find the user's wallet account row (accounts.type = 'user_wallet') */
  async findUserWalletAccount(userId: string) {
    const row = await db.query.accounts.findFirst({
      where: and(
        eq(accounts.owner_id, userId),
        eq(accounts.type, "user_wallet")
      ),
    });
    return row ?? null;
  }

  /** Find the user's reserved account (accounts.type = 'user_reserved') */
  async findUserReservedAccount(userId: string) {
    const row = await db.query.accounts.findFirst({
      where: and(
        eq(accounts.owner_id, userId),
        eq(accounts.type, "user_reserved")
      ),
    });
    return row ?? null;
  }

  /**
   * Ensure the user has the necessary accounts + wallet row.
   * Idempotent: safe to call on signup or lazily on first wallet use.
   * Returns: { userWalletAccountId, userReservedAccountId, walletRow }
   */
  async ensureUserAccounts(userId: string) {
    return db.transaction(async (tx) => {
      // 1) Try find existing accounts
      const existingWallet = await tx
        .select()
        .from(accounts)
        .where(
          and(eq(accounts.owner_id, userId), eq(accounts.type, "user_wallet"))
        )
        .limit(1);

      let userWalletAccountId: number;
      if (existingWallet.length) {
        userWalletAccountId = existingWallet[0].id;
      } else {
        const inserted = await tx
          .insert(accounts)
          .values({
            type: "user_wallet",
            owner_id: userId,
            currency: "NGN",
            description: `user_wallet for ${userId}`,
          })
          .returning({ id: accounts.id });
        userWalletAccountId = inserted[0].id;
      }

      // reserved account (sub-account)
      const existingReserved = await tx
        .select()
        .from(accounts)
        .where(
          and(eq(accounts.owner_id, userId), eq(accounts.type, "user_reserved"))
        )
        .limit(1);

      let userReservedAccountId: number;
      if (existingReserved.length) {
        userReservedAccountId = existingReserved[0].id;
      } else {
        const inserted = await tx
          .insert(accounts)
          .values({
            type: "user_reserved",
            owner_id: userId,
            parent_account_id: userWalletAccountId,
            currency: "NGN",
            description: `user_reserved for ${userId}`,
          })
          .returning({ id: accounts.id });
        userReservedAccountId = inserted[0].id;
      }

      // ensure wallets cached row exists and points to userWalletAccountId
      const existingWalletRow = await tx
        .select()
        .from(wallets)
        .where(eq(wallets.user_id, userId))
        .limit(1);
      let walletRow = null;
      if (!existingWalletRow.length) {
        const insertWallet = await tx
          .insert(wallets)
          .values({
            user_id: userId,
            account_id: userWalletAccountId,
            available_balance: 0,
            reserved_balance: 0,
            currency: "NGN",
            version: 1,
          })
          .returning({
            user_id: wallets.user_id,
            account_id: wallets.account_id,
            available_balance: wallets.available_balance,
            reserved_balance: wallets.reserved_balance,
          });
        walletRow = insertWallet[0];
      } else {
        // ensure account_id set
        const w = existingWalletRow[0];
        if (!w.account_id) {
          await tx
            .update(wallets)
            .set({ account_id: userWalletAccountId })
            .where(eq(wallets.user_id, userId));
          walletRow = { ...w, account_id: userWalletAccountId };
        } else {
          walletRow = w;
        }
      }

      return {
        userWalletAccountId,
        userReservedAccountId,
        walletRow,
      };
    });
  }

  // ---------------------
  // Read helpers
  // ---------------------

  /** Return the cached wallet row or null if none exists (fast). */
  async getCachedWallet(userId: string) {
    const row = await db.query.wallets.findFirst({
      where: eq(wallets.user_id, userId),
    });
    return row ?? null;
  }

  /** Throws if no wallet cached row exists. */
  async requireCachedWallet(userId: string) {
    const w = await this.getCachedWallet(userId);
    if (!w) throw new Error("Wallet not found for user");
    return w;
  }

  /**
   * Return the cached balances (available & reserved).
   * Fast read used by UI.
   */
  async getCachedBalances(userId: string) {
    const w = await this.getCachedWallet(userId);
    if (!w)
      return { available_balance: 0, reserved_balance: 0, currency: "NGN" };
    return {
      available_balance: Number(w.available_balance),
      reserved_balance: Number(w.reserved_balance),
      currency: w.currency,
    };
  }

  /**
   * Authoritative balance computed from ledger (sum of ledger_entries for user's accounts).
   * Useful for reconciliation and verification.
   */
  async getLedgerBalances(userId: string) {
    // find account ids for user_wallet and user_reserved
    const userAccounts = await db.query.accounts.findMany({
      where: and(
        eq(accounts.owner_id, userId),
        inArray(accounts.type, ["user_wallet", "user_reserved"])
      ),
      columns: { id: true, type: true },
    });

    if (!userAccounts.length)
      return { user_wallet: 0, user_reserved: 0, total: 0 };

    // compute sums per account
    // !!USE DIRECT DB SUM LATER
    /*
      const sums = await db
        .select({
          accountId: ledger_entries.account_id,
          sum: sql<number>`COALESCE(SUM(${ledger_entries.amount}), 0)`,
        })
        .from(ledger_entries)
        .where(inArray(ledger_entries.account_id, userAccountIds)) // where userAccountIds is an array of all user account IDs
        .groupBy(ledger_entries.account_id);
    */
    const results: Record<number, number> = {};
    for (const a of userAccounts) {
      const res = await db
        .select({
          sum: sql<number>`COALESCE(SUM(${ledger_entries.amount}), 0)`,
        })
        .from(ledger_entries)
        .where(eq(ledger_entries.account_id, a.id));
      results[a.id] = res[0].sum ?? 0;
    }

    const map: any = {};
    let total = 0;
    for (const a of userAccounts) {
      map[a.type] = Number(results[a.id] ?? 0);
      total += Number(results[a.id] ?? 0);
    }

    return { ...map, total };
  }

  /**
   * Return user's transaction history (ledger entries) in a friendly shape.
   * Supports cursor/limit pagination via offset/limit.
   */
  async getTransactionHistory(
    userId: string,
    opts?: { limit?: number; offset?: number }
  ) {
    const walletAcc = await this.findUserWalletAccount(userId);
    if (!walletAcc) return { items: [], nextOffset: 0 };

    const limit = opts?.limit ?? 50;
    const offset = opts?.offset ?? 0;

    // join ledger entries -> journals (for human description)
    const rows = await db
      .select({
        id: ledger_entries.id,
        amount: ledger_entries.amount,
        entry_type: ledger_entries.entry_type,
        metadata: ledger_entries.metadata,
        created_at: ledger_entries.created_at,
        journal_id: ledger_entries.journal_id,
      })
      .from(ledger_entries)
      .where(eq(ledger_entries.account_id, walletAcc.id))
      .orderBy(desc(ledger_entries.created_at))
      .limit(limit)
      .offset(offset);

    // map to friendly events (you can enrich with counterparty, txn info by querying journal/transactions)
    const items = rows.map((r) => ({
      id: r.id,
      amount: Number(r.amount),
      type: r.entry_type,
      metadata: r.metadata,
      created_at: r.created_at,
      journal_id: r.journal_id,
    }));

    // naive next offset
    const nextOffset = items.length === limit ? offset + limit : 0;
    return { items, nextOffset };
  }

  // ---------------------
  // Sample money op: reserve funds (user_wallet -> user_reserved)
  // ---------------------
  /**
   * Reserve funds for an operation (example: airtime/payout).
   * - Checks available balance, locks wallet row (FOR UPDATE).
   * - Creates a journal and two ledger_entries (debit wallet, credit reserved).
   * - Updates cached wallets row in same tx.
   *
   * Returns transaction id (business txn) to track operation.
   */
  async reserveFunds(userId: string, amountKobo: number, metadata: any = {}) {
    if (amountKobo <= 0) throw new Error("invalid amount");

    return db.transaction(async (tx) => {
      // lock wallet row (FOR UPDATE) to avoid concurrent spends
      const lockRes = await tx.execute(
        sql`SELECT available_balance, reserved_balance, version FROM wallets WHERE user_id = ${userId} FOR UPDATE`
      );
      const walletRow = lockRes[0];
      if (!walletRow) throw new Error("wallet not found");

      const available = Number(walletRow.available_balance);
      if (available < amountKobo) throw new Error("insufficient funds");

      // create journal
      const [journal] = await tx
        .insert(journals)
        .values({
          source_type: "transaction",
          description: "reserve funds",
          metadata,
        })
        .returning({ id: journals.id });

      const id = crypto.randomUUID();

      // create business transaction record
      const [txn] = await tx
        .insert(transactions)
        .values({
          id,
          user_id: userId,
          type: "refund",
          status: "pending",
          amount: amountKobo,
          currency: "NGN",
          journal_id: journal.id,
          metadata,
        })
        .returning({ id: transactions.id });

      // get accounts
      const userWalletAcc = await tx
        .select()
        .from(accounts)
        .where(
          and(eq(accounts.owner_id, userId), eq(accounts.type, "user_wallet"))
        )
        .limit(1);
      const userReservedAcc = await tx
        .select()
        .from(accounts)
        .where(
          and(eq(accounts.owner_id, userId), eq(accounts.type, "user_reserved"))
        )
        .limit(1);
      if (!userWalletAcc.length || !userReservedAcc.length)
        throw new Error("user accounts missing");

      // ledger lines - using positive amounts with proper entry types
      await tx.insert(ledger_entries).values({
        journal_id: journal.id,
        account_id: userWalletAcc[0].id,
        amount: amountKobo,
        entry_type: "debit",
        metadata: { phase: "reserve", txn: txn.id },
      });

      await tx.insert(ledger_entries).values({
        journal_id: journal.id,
        account_id: userReservedAcc[0].id,
        amount: amountKobo,
        entry_type: "credit",
        metadata: { phase: "reserve", txn: txn.id },
      });

      // Recalculate wallet balances from ledger entries (source of truth)
      const userWalletBalance = await tx
        .select({
          balance: sql<number>`COALESCE(SUM(${ledger_entries.amount}), 0)`,
        })
        .from(ledger_entries)
        .where(eq(ledger_entries.account_id, userWalletAcc[0].id));

      const userReservedBalance = await tx
        .select({
          balance: sql<number>`COALESCE(SUM(${ledger_entries.amount}), 0)`,
        })
        .from(ledger_entries)
        .where(eq(ledger_entries.account_id, userReservedAcc[0].id));

      // update cached wallet balances
      await tx
        .update(wallets)
        .set({
          available_balance: Number(userWalletBalance[0].balance),
          reserved_balance: Number(userReservedBalance[0].balance),
          version: Number(walletRow.version) + 1,
          last_updated: new Date(),
        })
        .where(eq(wallets.user_id, userId));

      return { txnId: txn.id, journalId: journal.id };
    });
  }

  /**
   * Release reserved funds (refund) for a transaction.
   * This moves money back from user_reserved -> user_wallet and updates caches.
   * Use when provider call failed.
   */
  async refundReserved(userId: string, txnId: string) {
    return db.transaction(async (tx) => {
      // lock wallet
      const lockRes = await tx.execute(
        sql`SELECT available_balance, reserved_balance, version FROM wallets WHERE user_id = ${userId} FOR UPDATE`
      );
      const walletRow = lockRes[0];
      if (!walletRow) throw new Error("wallet not found");

      // find transaction and amount
      const t = await tx
        .select()
        .from(transactions)
        .where(eq(transactions.id, txnId))
        .limit(1);
      if (!t.length) throw new Error("txn not found");

      const amount = Number(t[0].amount);

      // journal
      const [journal] = await tx
        .insert(journals)
        .values({ source_type: "transaction", description: "refund reserved" })
        .returning({ id: journals.id });

      // accounts
      const userReservedAcc = await tx
        .select()
        .from(accounts)
        .where(
          and(eq(accounts.owner_id, userId), eq(accounts.type, "user_reserved"))
        )
        .limit(1);
      const userWalletAcc = await tx
        .select()
        .from(accounts)
        .where(
          and(eq(accounts.owner_id, userId), eq(accounts.type, "user_wallet"))
        )
        .limit(1);

      await tx.insert(ledger_entries).values({
        journal_id: journal.id,
        account_id: userReservedAcc[0].id,
        amount: amount,
        entry_type: "debit",
        metadata: { refund_of: txnId },
      });

      await tx.insert(ledger_entries).values({
        journal_id: journal.id,
        account_id: userWalletAcc[0].id,
        amount: amount,
        entry_type: "credit",
        metadata: { refund_of: txnId },
      });

      // Recalculate wallet balances from ledger entries (source of truth)
      const userWalletBalance = await tx
        .select({
          balance: sql<number>`COALESCE(SUM(${ledger_entries.amount}), 0)`,
        })
        .from(ledger_entries)
        .where(eq(ledger_entries.account_id, userWalletAcc[0].id));

      const userReservedBalance = await tx
        .select({
          balance: sql<number>`COALESCE(SUM(${ledger_entries.amount}), 0)`,
        })
        .from(ledger_entries)
        .where(eq(ledger_entries.account_id, userReservedAcc[0].id));

      // update cached wallet
      await tx
        .update(wallets)
        .set({
          available_balance: Number(userWalletBalance[0].balance),
          reserved_balance: Number(userReservedBalance[0].balance),
          version: Number(walletRow.version) + 1,
          last_updated: new Date(),
        })
        .where(eq(wallets.user_id, userId));

      // mark txn as failed/refunded
      await tx
        .update(transactions)
        .set({ status: "failed", updated_at: new Date() })
        .where(eq(transactions.id, txnId));
    });
  }

  async hasWallet(userId: string): Promise<boolean> {
    const wallet = await db.query.wallets.findFirst({
      where: eq(wallets.user_id, userId),
    });
    return wallet !== undefined && wallet !== null;
  }
}
