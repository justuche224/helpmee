import {
  index,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
} from "drizzle-orm/pg-core";
import { user } from "./auth";
import { relations } from "drizzle-orm";
import { cartItem } from "./cart";
import { savedItem } from "./saved";

export const storeStatus = pgEnum("store_status", [
  "PENDING",
  "APPROVED",
  "REJECTED",
  "SUSPENDED",
]);

export const storeVerificationStatus = pgEnum("store_verification_status", [
  "PENDING",
  "APPROVED",
  "REJECTED",
]);

export const storeTierIdentifier = pgEnum("store_tier_identifier", [
  "SILVER",
  "GOLD",
  "PLATINUM",
]);

export const storeTier = pgTable(
  "store_tier",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    name: text("name").notNull(),
    identifier: storeTierIdentifier("identifier").notNull(),
    description: text("description").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => [
    index("idx_store_tier_created_at").on(table.createdAt),
    index("idx_store_tier_updated_at").on(table.updatedAt),
  ]
);

export const tierPerks = pgTable(
  "tier_perks",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    tierId: text("tier_id")
      .notNull()
      .references(() => storeTier.id, { onDelete: "cascade" }),
    perk: text("perk").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => [
    index("idx_tier_perks_tier_id").on(table.tierId),
    index("idx_tier_perks_created_at").on(table.createdAt),
    index("idx_tier_perks_updated_at").on(table.updatedAt),
  ]
);

export const storeTemplate = pgTable(
  "store_template",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    name: text("name").notNull(),
    tierId: text("tier_id")
      .notNull()
      .references(() => storeTier.id, { onDelete: "cascade" }),
    coverImage: text("cover_image").notNull(),
    description: text("description").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => [
    index("idx_store_template_tier_id").on(table.tierId),
    index("idx_store_template_created_at").on(table.createdAt),
    index("idx_store_template_updated_at").on(table.updatedAt),
  ]
);

export const storeCategory = pgTable(
  "store_category",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    name: text("name").notNull(),
    slug: text("slug").notNull(),
    icon: text("icon").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => [
    uniqueIndex("unique_store_category_slug").on(table.slug),
    uniqueIndex("unique_store_category_name").on(table.name),
  ]
);

export const store = pgTable(
  "store",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    slug: text("slug").notNull(),
    ownerName: text("owner_name").notNull(),
    phoneNumber: text("phone_number").notNull(),
    country: text("country").notNull(),
    state: text("state").notNull(),
    zipCode: text("zip_code").notNull(),
    address: text("address").notNull(),
    businessRegistration: text("business_registration"),
    description: text("description").notNull(),
    categoryId: text("category_id")
      .notNull()
      .references(() => storeCategory.id, { onDelete: "restrict" }),
    status: storeStatus("status").notNull().default("PENDING"),
    verificationStatus: storeVerificationStatus("verification_status")
      .notNull()
      .default("PENDING"),
    tierId: text("tier_id")
      .notNull()
      .references(() => storeTier.id, { onDelete: "restrict" }),
    templateId: text("template_id").references(() => storeTemplate.id, {
      onDelete: "set null",
    }),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => [
    uniqueIndex("unique_store_slug").on(table.slug),
    index("idx_store_status").on(table.status),
    index("idx_store_verification_status").on(table.verificationStatus),
    index("idx_store_category_id").on(table.categoryId),
    index("idx_store_tier_id").on(table.tierId),
    index("idx_store_template_id").on(table.templateId),
    index("idx_store_user_id").on(table.userId),
    index("idx_store_created_at").on(table.createdAt),
  ]
);

export const storeExtraDetails = pgTable(
  "store_extra_details",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    storeId: text("store_id")
      .notNull()
      .references(() => store.id, { onDelete: "cascade" }),
    logo: text("logo"),
    coverImage: text("cover_image"),
    publicDescription: text("public_description"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => [
    uniqueIndex("unique_store_extra_details_store_id").on(table.storeId),
    index("idx_store_extra_details_store_id").on(table.storeId),
    index("idx_store_extra_details_created_at").on(table.createdAt),
    index("idx_store_extra_details_updated_at").on(table.updatedAt),
  ]
);

export const storeBanners = pgTable(
  "store_banners",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    storeId: text("store_id")
      .notNull()
      .references(() => store.id, { onDelete: "cascade" }),
    banner: text("banner").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => [
    index("idx_store_banners_store_id").on(table.storeId),
    index("idx_store_banners_created_at").on(table.createdAt),
    index("idx_store_banners_updated_at").on(table.updatedAt),
  ]
);

export const storeRelations = relations(store, ({ one, many }) => ({
  user: one(user, {
    fields: [store.userId],
    references: [user.id],
  }),
  tier: one(storeTier, {
    fields: [store.tierId],
    references: [storeTier.id],
  }),
  template: one(storeTemplate, {
    fields: [store.templateId],
    references: [storeTemplate.id],
  }),
  extraDetails: one(storeExtraDetails, {
    fields: [store.id],
    references: [storeExtraDetails.storeId],
  }),
  category: one(storeCategory, {
    fields: [store.categoryId],
    references: [storeCategory.id],
  }),
  banners: many(storeBanners),
  cartItems: many(cartItem),
  savedItems: many(savedItem),
}));

export const storeExtraDetailsRelations = relations(
  storeExtraDetails,
  ({ one }) => ({
    store: one(store, {
      fields: [storeExtraDetails.storeId],
      references: [store.id],
    }),
  })
);

export const storeTemplateRelations = relations(storeTemplate, ({ one }) => ({
  tier: one(storeTier, {
    fields: [storeTemplate.tierId],
    references: [storeTier.id],
  }),
}));

export const tierPerksRelations = relations(tierPerks, ({ one }) => ({
  tier: one(storeTier, {
    fields: [tierPerks.tierId],
    references: [storeTier.id],
  }),
}));

export const storeCategoryRelations = relations(storeCategory, ({ many }) => ({
  stores: many(store),
}));

export const storeBannersRelations = relations(storeBanners, ({ one }) => ({
  store: one(store, {
    fields: [storeBanners.storeId],
    references: [store.id],
  }),
}));

export type Store = typeof store.$inferSelect;
export type StoreInsert = typeof store.$inferInsert;
export type StoreCategory = typeof storeCategory.$inferSelect;
export type StoreCategoryInsert = typeof storeCategory.$inferInsert;
export type StoreTier = typeof storeTier.$inferSelect;
export type StoreTierInsert = typeof storeTier.$inferInsert;
export type StoreTemplate = typeof storeTemplate.$inferSelect;
export type StoreTemplateInsert = typeof storeTemplate.$inferInsert;
export type StoreExtraDetails = typeof storeExtraDetails.$inferSelect;
export type StoreExtraDetailsInsert = typeof storeExtraDetails.$inferInsert;
export type TierPerks = typeof tierPerks.$inferSelect;
export type TierPerksInsert = typeof tierPerks.$inferInsert;

export type StoreStatus = (typeof storeStatus.enumValues)[number];
export type StoreVerificationStatus =
  (typeof storeVerificationStatus.enumValues)[number];
export type StoreTierIdentifier =
  (typeof storeTierIdentifier.enumValues)[number];
