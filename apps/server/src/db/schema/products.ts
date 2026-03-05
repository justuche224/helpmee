import {
  boolean,
  decimal,
  index,
  integer,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
} from "drizzle-orm/pg-core";
import { store } from "./store";
import { user } from "./auth";
import { relations, sql } from "drizzle-orm";

export const productUnits = pgEnum("product_units", [
  "kg",
  "g",
  "l",
  "ml",
  "pcs",
  "box",
  "bag",
  "bundle",
  "set",
  "pair",
  "dozen",
  "other",
]);

export const products = pgTable(
  "products",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    name: text("name").notNull(),
    slug: text("slug").notNull(),
    description: text("description").notNull(),
    price: decimal("price", { precision: 10, scale: 2 }).notNull(),
    quantity: integer("quantity").notNull(),
    unit: productUnits("unit").notNull(),
    inStock: boolean("in_stock").notNull().default(true),
    sku: text("sku"),
    weight: text("weight"),
    dimensions: text("dimensions"),
    badge: text("badge"),
    storeId: text("store_id")
      .notNull()
      .references(() => store.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (table) => [
    uniqueIndex("unique_store_product_slug").on(table.slug, table.storeId),
    index("idx_product_name").on(table.name),
    index("idx_product_slug").on(table.slug),
    index("idx_product_sku").on(table.sku),
    index("idx_product_store_id").on(table.storeId),
    index("idx_product_in_stock").on(table.inStock),
    index("idx_product_price").on(table.price),
    index("idx_product_quantity").on(table.quantity),
  ]
);

export const reviews = pgTable(
  "reviews",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    productId: text("product_id")
      .notNull()
      .references(() => products.id, { onDelete: "cascade" }),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    title: text("title"),
    content: text("content").notNull(),
    helpful: integer("helpful").default(0),
    verified: boolean("verified").default(false),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (table) => [
    uniqueIndex("unique_product_review").on(table.productId, table.userId),
    index("idx_review_product_id").on(table.productId),
    index("idx_review_user_id").on(table.userId),
    index("idx_review_helpful").on(table.helpful),
    index("idx_review_verified").on(table.verified),
  ]
);

export const ratings = pgTable(
  "ratings",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    productId: text("product_id")
      .notNull()
      .references(() => products.id, { onDelete: "cascade" }),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    rating: decimal("rating", { precision: 3, scale: 2 }).notNull(),
  },
  (table) => [
    uniqueIndex("unique_product_rating").on(table.productId, table.userId),
    index("idx_rating_product_id").on(table.productId),
    index("idx_rating_user_id").on(table.userId),
  ]
);

export const productImages = pgTable(
  "product_images",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    productId: text("product_id")
      .notNull()
      .references(() => products.id, { onDelete: "cascade" }),
    url: text("url").notNull(),
    alt: text("alt"),
    isPrimary: boolean("is_primary").notNull().default(false),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (table) => [
    index("idx_product_image_product_id").on(table.productId),
    index("idx_product_image_is_primary").on(table.isPrimary),
    sql`CREATE UNIQUE INDEX unique_primary_image ON product_images(product_id) WHERE is_primary = true`,
  ]
);

export const productRelations = relations(products, ({ one, many }) => ({
  store: one(store, {
    fields: [products.storeId],
    references: [store.id],
  }),
  images: many(productImages),
  reviews: many(reviews),
  ratings: many(ratings),
}));

export const productImagesRelations = relations(productImages, ({ one }) => ({
  product: one(products, {
    fields: [productImages.productId],
    references: [products.id],
  }),
}));

export const reviewsRelations = relations(reviews, ({ one }) => ({
  product: one(products, {
    fields: [reviews.productId],
    references: [products.id],
  }),
  user: one(user, {
    fields: [reviews.userId],
    references: [user.id],
  }),
}));

export const ratingsRelations = relations(ratings, ({ one }) => ({
  product: one(products, {
    fields: [ratings.productId],
    references: [products.id],
  }),
  user: one(user, {
    fields: [ratings.userId],
    references: [user.id],
  }),
}));
