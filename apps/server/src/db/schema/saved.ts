import { pgTable, text, timestamp, integer, index } from "drizzle-orm/pg-core";
import { uniqueIndex } from "drizzle-orm/pg-core";
import { user } from "./auth";
import { products } from "./products";
import { store } from "./store";
import { relations } from "drizzle-orm";

export const savedItem = pgTable(
  "saved",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    userId: text("user_id")
      .references(() => user.id)
      .notNull(),
    productId: text("product_id").references(() => products.id),
    storeId: text("store_id")
      .references(() => store.id)
      .notNull(),
    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at").defaultNow(),
  },
  (table) => [
    uniqueIndex("unique_saved_user_id_product_id_store_id").on(
      table.userId,
      table.productId,
      table.storeId
    ),
    index("idx_saved_user_id").on(table.userId),
    index("idx_saved_product_id").on(table.productId),
    index("idx_saved_store_id").on(table.storeId),
  ]
);

export const savedRelations = relations(savedItem, ({ one }) => ({
  user: one(user, {
    fields: [savedItem.userId],
    references: [user.id],
  }),
  product: one(products, {
    fields: [savedItem.productId],
    references: [products.id],
  }),
  store: one(store, {
    fields: [savedItem.storeId],
    references: [store.id],
  }),
}));
