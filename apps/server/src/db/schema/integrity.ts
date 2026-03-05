import { pgTable, bigserial, text, jsonb, boolean, timestamp } from "drizzle-orm/pg-core";

export const integrity_issues = pgTable("integrity_issues", {
  id: bigserial("id", { mode: "number" }).primaryKey(),
  user_id: text("user_id"),
  issue_type: text("issue_type").notNull(),
  details: jsonb("details"),
  resolved: boolean("resolved").notNull().default(false),
  created_at: timestamp("created_at").notNull().defaultNow(),
  resolved_at: timestamp("resolved_at"),
});
