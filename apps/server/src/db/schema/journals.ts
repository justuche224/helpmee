import {
  pgTable,
  bigserial,
  text,
  timestamp,
  jsonb,
} from "drizzle-orm/pg-core";

export const sourceType = [
  "transaction",
  "reconciliation",
  "manual_adjustment",
  "payout",
] as const;

export const journals = pgTable("journals", {
  id: bigserial("id", { mode: "number" }).primaryKey(),
  source_type: text("source_type").$type<(typeof sourceType)[number]>(),
  source_id: text("source_id"),
  description: text("description"),
  metadata: jsonb("metadata"),
  created_at: timestamp("created_at").notNull().defaultNow(),
});
