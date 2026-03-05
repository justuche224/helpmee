import {
  pgTable,
  bigserial,
  text,
  timestamp,
  jsonb,
  boolean,
  bigint,
} from "drizzle-orm/pg-core";

export const reconciliation_reports = pgTable("reconciliation_reports", {
  id: bigserial("id", { mode: "number" }).primaryKey(),
  provider: text("provider").notNull(),
  report_date: timestamp("report_date").notNull(),
  content: jsonb("content").notNull(),
  processed: boolean("processed").notNull().default(false),
  created_at: timestamp("created_at").notNull().defaultNow(),
});

export const reconciliation_items = pgTable("reconciliation_items", {
  id: bigserial("id", { mode: "number" }).primaryKey(),
  report_id: bigint("report_id", { mode: "number" })
    .notNull()
    .references(() => reconciliation_reports.id),
  txn_id: text("txn_id"),
  external_ref: text("external_ref"),
  matched: boolean("matched").notNull().default(false),
  discrepancy_amount: bigint("discrepancy_amount", { mode: "number" }),
  resolution_status: text("resolution_status").notNull().default("pending"),
  notes: text("notes"),
  created_at: timestamp("created_at").notNull().defaultNow(),
});
