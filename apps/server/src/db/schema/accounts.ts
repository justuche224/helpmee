// src/db/schema/accounts.ts
import { pgTable, text, bigint, bigserial, timestamp, jsonb } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { ledger_entries } from "./ledger-entries";
import { user } from "./auth";

export const accounts = pgTable("accounts", {
  id: bigserial("id", { mode: "number" }).primaryKey(),
  type: text("type").notNull(),
  owner_id: text("owner_id").references(() => user.id),
  parent_account_id: bigint("parent_account_id", { mode: "number" }),
  currency: text("currency").notNull().default("NGN"),
  metadata: jsonb("metadata"),
  description: text("description"),
  created_at: timestamp("created_at").notNull().defaultNow(),
  updated_at: timestamp("updated_at").notNull().defaultNow(),
});

// Add relations afterwards
export const accountsRelations = relations(accounts, ({ many, one }) => ({
  ledger_entries: many(ledger_entries),
  parent: one(accounts, {
    fields: [accounts.parent_account_id],
    references: [accounts.id],
  }),
}));
