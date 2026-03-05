import { pgTable, text, timestamp } from "drizzle-orm/pg-core";

export const idempotency_keys = pgTable("idempotency_keys", {
  key: text("key").primaryKey(),
  txn_id: text("txn_id"),
  created_at: timestamp("created_at").notNull().defaultNow(),
  expires_at: timestamp("expires_at"),
});
