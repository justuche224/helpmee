import {
  pgTable,
  bigserial,
  text,
  timestamp,
  index,
  integer,
} from "drizzle-orm/pg-core";
import { user } from "./auth";

export const pin_status = ["active", "blocked", "reset_pending", "deleted"] as const;

export const transaction_pins = pgTable(
  "transaction_pins",
  {
    id: bigserial("id", { mode: "number" }).primaryKey(),
    user_id: text("user_id")
      .notNull()
      .references(() => user.id),
    pin_hash: text("pin_hash"),
    failed_attempts: integer("failed_attempts").notNull().default(0),
    locked_until: timestamp("locked_until"), // nullable, only set when locked
    status: text("status")
      .notNull()
      .default("active" as (typeof pin_status)[number])
      .$type<(typeof pin_status)[number]>(),
    created_at: timestamp("created_at").notNull().defaultNow(),
    updated_at: timestamp("updated_at").notNull().defaultNow(),
  },
  (table) => [index("transaction_pin_index").on(table.user_id)]
);
