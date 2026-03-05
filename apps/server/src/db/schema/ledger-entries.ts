// src/db/schema/ledger-entries.ts
import {
  pgTable,
  bigserial,
  bigint,
  timestamp,
  jsonb,
  text,
} from "drizzle-orm/pg-core";
import { journals } from "./journals";
import { accounts } from "./accounts";

export const entryType = ["debit", "credit"] as const;

export const ledger_entries = pgTable("ledger_entries", {
  id: bigserial("id", { mode: "number" }).primaryKey(),
  journal_id: bigint("journal_id", { mode: "number" })
    .notNull()
    .references(() => journals.id),
  account_id: bigint("account_id", { mode: "number" })
    .notNull()
    .references(() => accounts.id),
  amount: bigint("amount", { mode: "number" }).notNull(), // in kobo
  balance_after: bigint("balance_after", { mode: "number" }),
  entry_type: text("entry_type").$type<(typeof entryType)[number]>(),
  metadata: jsonb("metadata"),
  created_at: timestamp("created_at").notNull().defaultNow(),
});
