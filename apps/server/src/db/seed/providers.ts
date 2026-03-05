import "dotenv/config";
import { db } from "../index";
import { accounts } from "../schema/accounts";
import { providers as providersSchema } from "../schema/providers";
import { eq } from "drizzle-orm";
import fs from "fs/promises";
import path from "path";

const providers = [
  {
    name: "Paystack",
    type: "payment",
  },
];

const seedProviders = async () => {
  try {
    console.log("Seeding providers...");
    const accountsJsonPath = path.join(__dirname, "../accounts.json");
    const accountsMap = JSON.parse(
      await fs.readFile(accountsJsonPath, "utf-8")
    );
    const { platformParentId } = accountsMap;

    if (!platformParentId) {
      throw new Error(
        "platformParentId not found in accounts.json. Run system-accounts seeder first."
      );
    }

    await db.transaction(async (tx) => {
      for (const p of providers) {
        const existingProvider = await tx
          .select()
          .from(providersSchema)
          .where(eq(providersSchema.name, p.name))
          .limit(1);

        if (existingProvider.length > 0) {
          console.log(`Provider ${p.name} already exists. Skipping.`);
          continue;
        }

        const [newAccount] = await tx
          .insert(accounts)
          .values({
            type: "provider_float",
            parent_account_id: platformParentId,
            description: `${p.name} float account`,
            metadata: { provider_name: p.name },
            owner_id: null,
          })
          .returning({ id: accounts.id });

        const newProvider = await tx
          .insert(providersSchema)
          .values({
            name: p.name,
            type: p.type,
            balance_account_id: newAccount.id,
          })
          .returning({ id: providersSchema.id });

        console.log(
          `Created provider ${p.name} with balance account ${newAccount.id} and provider id ${newProvider[0].id}`
        );
        Bun.write(
          path.join(__dirname, "../providers.json"),
          JSON.stringify(newProvider[0].id, null, 2)
        );
      }
    });
    console.log("Providers seeded successfully.");
  } catch (error) {
    console.log("Failed to seed providers");
    console.error(error);
    process.exit(1);
  }
};

seedProviders();
