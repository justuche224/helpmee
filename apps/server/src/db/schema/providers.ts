import { pgTable, bigserial, text, timestamp, jsonb, bigint } from "drizzle-orm/pg-core";

export const providers = pgTable("providers", {
  id: bigserial("id", { mode: "number" }).primaryKey(),
  name: text("name").notNull(),
  type: text("type").notNull(),
  balance_account_id: bigint("balance_account_id", { mode: "number" }).references(() => require("./accounts").accounts.id),
  credentials: jsonb("credentials"),
  metadata: jsonb("metadata"),
  created_at: timestamp("created_at").notNull().defaultNow(),
  updated_at: timestamp("updated_at").notNull().defaultNow(),
});
