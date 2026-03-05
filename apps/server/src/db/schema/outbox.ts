import { pgTable, bigserial, text, timestamp, integer, jsonb, boolean } from "drizzle-orm/pg-core";

export const outbox_events = pgTable("outbox_events", {
  id: bigserial("id", { mode: "number" }).primaryKey(),
  event_type: text("event_type").notNull(),
  payload: jsonb("payload").notNull(),
  attempts: integer("attempts").notNull().default(0),
  next_retry_at: timestamp("next_retry_at"),
  processed: boolean("processed").notNull().default(false),
  last_error: text("last_error"),
  created_at: timestamp("created_at").notNull().defaultNow(),
  updated_at: timestamp("updated_at").notNull().defaultNow(),
});
