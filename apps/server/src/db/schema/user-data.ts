import {
  pgTable,
  text,
  index,
  uniqueIndex,
  boolean,
} from "drizzle-orm/pg-core";
import { storeCategory } from "./store";
import { user } from "./auth";

export const preferedStoreCategories = pgTable(
  "prefered_store_categories",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    categoryId: text("category_id")
      .notNull()
      .references(() => storeCategory.id, { onDelete: "cascade" }),
  },
  (table) => [
    index("idx_prefered_store_categories_user_id").on(table.userId),
    index("idx_prefered_store_categories_category_id").on(table.categoryId),
    uniqueIndex("unique_prefered_store_categories_user_id_category_id").on(
      table.userId,
      table.categoryId
    ),
  ]
);

export const userLocation = pgTable(
  "user_location",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    country: text("country"),
    state: text("state"),
    city: text("city"),
  },
  (table) => [index("idx_user_location_user_id").on(table.userId)]
);

export const userShippingAddress = pgTable(
  "user_shipping_address",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    fullName: text("full_name").notNull(),
    address: text("address").notNull(),
    email: text("email").notNull(),
    zipCode: text("zip_code").notNull(),
    phone: text("phone").notNull(),
    country: text("country").notNull(),
    city: text("city").notNull(),
    state: text("state").notNull(),
    isDefault: boolean("is_default").notNull().default(false),
  },
  (table) => [
    index("idx_user_shipping_address_user_id").on(table.userId),
    uniqueIndex("unique_user_shipping_address_user_id_is_default").on(
      table.userId,
      table.isDefault
    ),
  ]
);
