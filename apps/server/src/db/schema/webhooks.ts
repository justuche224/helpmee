import { pgTable, bigserial, text, timestamp, boolean, jsonb } from "drizzle-orm/pg-core";

export const webhook_logs = pgTable("webhook_logs", {
  id: bigserial("id", { mode: "number" }).primaryKey(),
  provider: text("provider").notNull(),
  event_type: text("event_type").notNull(),
  payload: jsonb("payload").notNull(),
  signature: text("signature"),
  verified: boolean("verified").notNull().default(false),
  processed: boolean("processed").notNull().default(false),
  processed_at: timestamp("processed_at"),
  error: text("error"),
  external_event_id: text("external_event_id"),
  created_at: timestamp("created_at").notNull().defaultNow(),
});
