import {
  pgTable,
  bigserial,
  text,
  bigint,
  jsonb,
  timestamp,
} from "drizzle-orm/pg-core";

export const payout_requests = pgTable("payout_requests", {
  id: bigserial("id", { mode: "number" }).primaryKey(),
  user_id: text("user_id"),
  txn_id: text("txn_id"),
  bank_details: jsonb("bank_details"),
  amount: bigint("amount", { mode: "number" }).notNull(),
  fee: bigint("fee", { mode: "number" }).default(0),
  status: text("status").notNull().default("requested"),
  external_ref: text("external_ref"),
  metadata: jsonb("metadata"),
  created_at: timestamp("created_at").notNull().defaultNow(),
  updated_at: timestamp("updated_at").notNull().defaultNow(),
});
