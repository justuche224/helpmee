import { pgTable, text, bigint, timestamp, integer } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { user } from "./auth";
import { accounts } from "./accounts";

export const wallets = pgTable("wallets", {
  user_id: text("user_id").primaryKey().references(() => user.id, { onDelete: "cascade" }),
  account_id: bigint("account_id", { mode: "number" }).references(() => accounts.id),
  available_balance: bigint("available_balance", { mode: "number" }).notNull().default(0),
  reserved_balance: bigint("reserved_balance", { mode: "number" }).notNull().default(0),
  currency: text("currency").notNull().default("NGN"),
  version: integer("version").notNull().default(1),
  last_updated: timestamp("last_updated").notNull().defaultNow(),
});

export const walletsRelations = relations(wallets, ({ one }) => ({
  user: one(user, { fields: [wallets.user_id], references: [user.id] }),
  account: one(accounts, { fields: [wallets.account_id], references: [accounts.id] }),
}));
