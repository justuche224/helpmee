import { pgTable, text, timestamp, integer, index } from "drizzle-orm/pg-core";
import { uniqueIndex } from "drizzle-orm/pg-core";
import { user } from "./auth";
import { products } from "./products";
import { store } from "./store";
import { relations } from "drizzle-orm";

export const cartItem = pgTable(
  "cart",
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
    quantity: integer("quantity").default(1).notNull(),
    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at").defaultNow(),
  },
  (table) => [
    uniqueIndex("unique_cart_user_id_product_id_store_id").on(
      table.userId,
      table.productId,
      table.storeId
    ),
    index("idx_cart_user_id").on(table.userId),
    index("idx_cart_product_id").on(table.productId),
    index("idx_cart_store_id").on(table.storeId),
  ]
);

export const cartRelations = relations(cartItem, ({ one }) => ({
  user: one(user, {
    fields: [cartItem.userId],
    references: [user.id],
  }),
  product: one(products, {
    fields: [cartItem.productId],
    references: [products.id],
  }),
  store: one(store, {
    fields: [cartItem.storeId],
    references: [store.id],
  }),
}));
