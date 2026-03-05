import { pgTable, text, bigint, timestamp, jsonb } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { user } from "./auth";
import { journals } from "./journals";

const transactionType = [
  "funding",
  "withdrawal",
  "airtime",
  "bill",
  "internal_purchase",
  "refund",
] as const;
const transactionStatus = ["pending", "completed", "failed"] as const;

export const transactions = pgTable("transactions", {
  id: text("id").primaryKey(),
  user_id: text("user_id").references(() => user.id),
  type: text("type").notNull().$type<(typeof transactionType)[number]>(),
  status: text("status")
    .notNull()
    .default("pending")
    .$type<(typeof transactionStatus)[number]>(),
  amount: bigint("amount", { mode: "number" }).notNull(),
  currency: text("currency").notNull().default("NGN"),
  external_ref: text("external_ref"),
  idempotency_key: text("idempotency_key"),
  journal_id: bigint("journal_id", { mode: "number" }).references(
    () => journals.id
  ),
  metadata: jsonb("metadata"),
  created_at: timestamp("created_at").notNull().defaultNow(),
  updated_at: timestamp("updated_at").notNull().defaultNow(),
});

export const transactionsRelations = relations(transactions, ({ one }) => ({
  user: one(user, { fields: [transactions.user_id], references: [user.id] }),
  journal: one(journals, {
    fields: [transactions.journal_id],
    references: [journals.id],
  }),
}));
