import {
  pgEnum,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
} from "drizzle-orm/pg-core";
import { user } from "./auth";
import { relations } from "drizzle-orm";

export const identificationType = pgEnum("identification_type", [
  "passport",
  "national_id",
  "driver_license",
  "other",
]);

export const kycStatus = pgEnum("kyc_status", [
  "PENDING",
  "APPROVED",
  "REJECTED",
]);

export const bvnStatus = pgEnum("bvn_status", [
  "PENDING",
  "APPROVED",
  "REJECTED",
]);

export const kyc = pgTable(
  "kyc",
  {
    id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    status: kycStatus("status").notNull().default("PENDING"),
    name: text("name").notNull(),
    phoneNumber: text("phone_number").notNull(),
    email: text("email").notNull(),
    identificationType: identificationType("identification_type").notNull(),
    identificationNumber: text("identification_number").notNull(),
    identificationFrontImage: text("identification_front_image").notNull(),
    identificationBackImage: text("identification_back_image").notNull(),
    identificationSelfie: text("identification_selfie").notNull(),
    identificationStatus: text("identification_status").notNull(),
    identificationRejectionReason: text("identification_rejection_reason"),
    identificationRejectionDate: timestamp("identification_rejection_date"),
    identificationRejectionBy: text("identification_rejection_by"),
    createdAt: timestamp("created_at").notNull(),
    updatedAt: timestamp("updated_at").notNull(),
  },
  (table) => [
    uniqueIndex("unique_identification_number").on(table.identificationNumber),
    uniqueIndex("unique_user_kyc_only").on(table.userId),
  ]
);

export const bvn = pgTable(
  "bvn",
  {
    id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    bvn: text("bvn").notNull(),
    bvnStatus: bvnStatus("bvn_status").notNull().default("PENDING"),
    bvnRejectionReason: text("bvn_rejection_reason"),
    bvnRejectionDate: timestamp("bvn_rejection_date"),
    bvnRejectionBy: text("bvn_rejection_by"),
    createdAt: timestamp("created_at").notNull(),
    updatedAt: timestamp("updated_at").notNull(),
  },
  (table) => [
    uniqueIndex("unique_user_bvn").on(table.userId),
    uniqueIndex("unique_bvn").on(table.bvn),
  ]
);

export type IdentificationType = (typeof identificationType.enumValues)[number];


export const kycRelations = relations(kyc, ({ one }) => ({
  user: one(user, {
    fields: [kyc.userId],
    references: [user.id],
  }),
}));

export const bvnRelations = relations(bvn, ({ one }) => ({
  user: one(user, {
    fields: [bvn.userId],
    references: [user.id],
  }),
}));