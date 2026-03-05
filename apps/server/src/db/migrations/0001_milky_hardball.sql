CREATE TYPE "public"."bvn_status" AS ENUM('PENDING', 'APPROVED', 'REJECTED');--> statement-breakpoint
CREATE TYPE "public"."identification_type" AS ENUM('passport', 'national_id', 'driver_license', 'other');--> statement-breakpoint
CREATE TYPE "public"."kyc_status" AS ENUM('PENDING', 'APPROVED', 'REJECTED');--> statement-breakpoint
CREATE TYPE "public"."store_status" AS ENUM('PENDING', 'APPROVED', 'REJECTED', 'SUSPENDED');--> statement-breakpoint
CREATE TYPE "public"."store_tier_identifier" AS ENUM('SILVER', 'GOLD', 'PLATINUM');--> statement-breakpoint
CREATE TYPE "public"."store_verification_status" AS ENUM('PENDING', 'APPROVED', 'REJECTED');--> statement-breakpoint
CREATE TYPE "public"."product_units" AS ENUM('kg', 'g', 'l', 'ml', 'pcs', 'box', 'bag', 'bundle', 'set', 'pair', 'dozen', 'other');--> statement-breakpoint
CREATE TABLE "cart" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"product_id" text,
	"store_id" text NOT NULL,
	"quantity" integer DEFAULT 1 NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "bvn" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"bvn" text NOT NULL,
	"bvn_status" "bvn_status" DEFAULT 'PENDING' NOT NULL,
	"bvn_rejection_reason" text,
	"bvn_rejection_date" timestamp,
	"bvn_rejection_by" text,
	"created_at" timestamp NOT NULL,
	"updated_at" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "kyc" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"status" "kyc_status" DEFAULT 'PENDING' NOT NULL,
	"name" text NOT NULL,
	"phone_number" text NOT NULL,
	"email" text NOT NULL,
	"identification_type" "identification_type" NOT NULL,
	"identification_number" text NOT NULL,
	"identification_front_image" text NOT NULL,
	"identification_back_image" text NOT NULL,
	"identification_selfie" text NOT NULL,
	"identification_status" text NOT NULL,
	"identification_rejection_reason" text,
	"identification_rejection_date" timestamp,
	"identification_rejection_by" text,
	"created_at" timestamp NOT NULL,
	"updated_at" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "store" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"name" text NOT NULL,
	"slug" text NOT NULL,
	"owner_name" text NOT NULL,
	"phone_number" text NOT NULL,
	"country" text NOT NULL,
	"state" text NOT NULL,
	"zip_code" text NOT NULL,
	"address" text NOT NULL,
	"business_registration" text,
	"description" text NOT NULL,
	"category_id" text NOT NULL,
	"status" "store_status" DEFAULT 'PENDING' NOT NULL,
	"verification_status" "store_verification_status" DEFAULT 'PENDING' NOT NULL,
	"tier_id" text NOT NULL,
	"template_id" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "store_banners" (
	"id" text PRIMARY KEY NOT NULL,
	"store_id" text NOT NULL,
	"banner" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "store_category" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"slug" text NOT NULL,
	"icon" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "store_extra_details" (
	"id" text PRIMARY KEY NOT NULL,
	"store_id" text NOT NULL,
	"logo" text,
	"cover_image" text,
	"public_description" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "store_template" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"tier_id" text NOT NULL,
	"cover_image" text NOT NULL,
	"description" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "store_tier" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"identifier" "store_tier_identifier" NOT NULL,
	"description" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "tier_perks" (
	"id" text PRIMARY KEY NOT NULL,
	"tier_id" text NOT NULL,
	"perk" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "product_images" (
	"id" text PRIMARY KEY NOT NULL,
	"product_id" text NOT NULL,
	"url" text NOT NULL,
	"alt" text,
	"is_primary" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "products" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"slug" text NOT NULL,
	"description" text NOT NULL,
	"price" numeric(10, 2) NOT NULL,
	"quantity" integer NOT NULL,
	"unit" "product_units" NOT NULL,
	"in_stock" boolean DEFAULT true NOT NULL,
	"sku" text,
	"weight" text,
	"dimensions" text,
	"badge" text,
	"store_id" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "ratings" (
	"id" text PRIMARY KEY NOT NULL,
	"product_id" text NOT NULL,
	"user_id" text NOT NULL,
	"rating" numeric(3, 2) NOT NULL
);
--> statement-breakpoint
CREATE TABLE "reviews" (
	"id" text PRIMARY KEY NOT NULL,
	"product_id" text NOT NULL,
	"user_id" text NOT NULL,
	"title" text,
	"content" text NOT NULL,
	"helpful" integer DEFAULT 0,
	"verified" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "prefered_store_categories" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"category_id" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "user_location" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"country" text,
	"state" text,
	"city" text
);
--> statement-breakpoint
CREATE TABLE "user_shipping_address" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"full_name" text NOT NULL,
	"address" text NOT NULL,
	"email" text NOT NULL,
	"zip_code" text NOT NULL,
	"phone" text NOT NULL,
	"country" text NOT NULL,
	"city" text NOT NULL,
	"state" text NOT NULL,
	"is_default" boolean DEFAULT false NOT NULL
);
--> statement-breakpoint
CREATE TABLE "saved" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"product_id" text,
	"store_id" text NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "gender" text;--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "kyc_verified" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "role" text DEFAULT 'USER' NOT NULL;--> statement-breakpoint
ALTER TABLE "cart" ADD CONSTRAINT "cart_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cart" ADD CONSTRAINT "cart_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cart" ADD CONSTRAINT "cart_store_id_store_id_fk" FOREIGN KEY ("store_id") REFERENCES "public"."store"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bvn" ADD CONSTRAINT "bvn_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "kyc" ADD CONSTRAINT "kyc_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "store" ADD CONSTRAINT "store_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "store" ADD CONSTRAINT "store_category_id_store_category_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."store_category"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "store" ADD CONSTRAINT "store_tier_id_store_tier_id_fk" FOREIGN KEY ("tier_id") REFERENCES "public"."store_tier"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "store" ADD CONSTRAINT "store_template_id_store_template_id_fk" FOREIGN KEY ("template_id") REFERENCES "public"."store_template"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "store_banners" ADD CONSTRAINT "store_banners_store_id_store_id_fk" FOREIGN KEY ("store_id") REFERENCES "public"."store"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "store_extra_details" ADD CONSTRAINT "store_extra_details_store_id_store_id_fk" FOREIGN KEY ("store_id") REFERENCES "public"."store"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "store_template" ADD CONSTRAINT "store_template_tier_id_store_tier_id_fk" FOREIGN KEY ("tier_id") REFERENCES "public"."store_tier"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tier_perks" ADD CONSTRAINT "tier_perks_tier_id_store_tier_id_fk" FOREIGN KEY ("tier_id") REFERENCES "public"."store_tier"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "product_images" ADD CONSTRAINT "product_images_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "products" ADD CONSTRAINT "products_store_id_store_id_fk" FOREIGN KEY ("store_id") REFERENCES "public"."store"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ratings" ADD CONSTRAINT "ratings_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ratings" ADD CONSTRAINT "ratings_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "prefered_store_categories" ADD CONSTRAINT "prefered_store_categories_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "prefered_store_categories" ADD CONSTRAINT "prefered_store_categories_category_id_store_category_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."store_category"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_location" ADD CONSTRAINT "user_location_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_shipping_address" ADD CONSTRAINT "user_shipping_address_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "saved" ADD CONSTRAINT "saved_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "saved" ADD CONSTRAINT "saved_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "saved" ADD CONSTRAINT "saved_store_id_store_id_fk" FOREIGN KEY ("store_id") REFERENCES "public"."store"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "unique_cart_user_id_product_id_store_id" ON "cart" USING btree ("user_id","product_id","store_id");--> statement-breakpoint
CREATE INDEX "idx_cart_user_id" ON "cart" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_cart_product_id" ON "cart" USING btree ("product_id");--> statement-breakpoint
CREATE INDEX "idx_cart_store_id" ON "cart" USING btree ("store_id");--> statement-breakpoint
CREATE UNIQUE INDEX "unique_user_bvn" ON "bvn" USING btree ("user_id");--> statement-breakpoint
CREATE UNIQUE INDEX "unique_bvn" ON "bvn" USING btree ("bvn");--> statement-breakpoint
CREATE UNIQUE INDEX "unique_identification_number" ON "kyc" USING btree ("identification_number");--> statement-breakpoint
CREATE UNIQUE INDEX "unique_user_kyc_only" ON "kyc" USING btree ("user_id");--> statement-breakpoint
CREATE UNIQUE INDEX "unique_store_slug" ON "store" USING btree ("slug");--> statement-breakpoint
CREATE INDEX "idx_store_status" ON "store" USING btree ("status");--> statement-breakpoint
CREATE INDEX "idx_store_verification_status" ON "store" USING btree ("verification_status");--> statement-breakpoint
CREATE INDEX "idx_store_category_id" ON "store" USING btree ("category_id");--> statement-breakpoint
CREATE INDEX "idx_store_tier_id" ON "store" USING btree ("tier_id");--> statement-breakpoint
CREATE INDEX "idx_store_template_id" ON "store" USING btree ("template_id");--> statement-breakpoint
CREATE INDEX "idx_store_user_id" ON "store" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_store_created_at" ON "store" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "idx_store_banners_store_id" ON "store_banners" USING btree ("store_id");--> statement-breakpoint
CREATE INDEX "idx_store_banners_created_at" ON "store_banners" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "idx_store_banners_updated_at" ON "store_banners" USING btree ("updated_at");--> statement-breakpoint
CREATE UNIQUE INDEX "unique_store_category_slug" ON "store_category" USING btree ("slug");--> statement-breakpoint
CREATE UNIQUE INDEX "unique_store_category_name" ON "store_category" USING btree ("name");--> statement-breakpoint
CREATE UNIQUE INDEX "unique_store_extra_details_store_id" ON "store_extra_details" USING btree ("store_id");--> statement-breakpoint
CREATE INDEX "idx_store_extra_details_store_id" ON "store_extra_details" USING btree ("store_id");--> statement-breakpoint
CREATE INDEX "idx_store_extra_details_created_at" ON "store_extra_details" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "idx_store_extra_details_updated_at" ON "store_extra_details" USING btree ("updated_at");--> statement-breakpoint
CREATE INDEX "idx_store_template_tier_id" ON "store_template" USING btree ("tier_id");--> statement-breakpoint
CREATE INDEX "idx_store_template_created_at" ON "store_template" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "idx_store_template_updated_at" ON "store_template" USING btree ("updated_at");--> statement-breakpoint
CREATE INDEX "idx_store_tier_created_at" ON "store_tier" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "idx_store_tier_updated_at" ON "store_tier" USING btree ("updated_at");--> statement-breakpoint
CREATE INDEX "idx_tier_perks_tier_id" ON "tier_perks" USING btree ("tier_id");--> statement-breakpoint
CREATE INDEX "idx_tier_perks_created_at" ON "tier_perks" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "idx_tier_perks_updated_at" ON "tier_perks" USING btree ("updated_at");--> statement-breakpoint
CREATE INDEX "idx_product_image_product_id" ON "product_images" USING btree ("product_id");--> statement-breakpoint
CREATE INDEX "idx_product_image_is_primary" ON "product_images" USING btree ("is_primary");--> statement-breakpoint
CREATE UNIQUE INDEX "unique_store_product_slug" ON "products" USING btree ("slug","store_id");--> statement-breakpoint
CREATE INDEX "idx_product_name" ON "products" USING btree ("name");--> statement-breakpoint
CREATE INDEX "idx_product_slug" ON "products" USING btree ("slug");--> statement-breakpoint
CREATE INDEX "idx_product_sku" ON "products" USING btree ("sku");--> statement-breakpoint
CREATE INDEX "idx_product_store_id" ON "products" USING btree ("store_id");--> statement-breakpoint
CREATE INDEX "idx_product_in_stock" ON "products" USING btree ("in_stock");--> statement-breakpoint
CREATE INDEX "idx_product_price" ON "products" USING btree ("price");--> statement-breakpoint
CREATE INDEX "idx_product_quantity" ON "products" USING btree ("quantity");--> statement-breakpoint
CREATE UNIQUE INDEX "unique_product_rating" ON "ratings" USING btree ("product_id","user_id");--> statement-breakpoint
CREATE INDEX "idx_rating_product_id" ON "ratings" USING btree ("product_id");--> statement-breakpoint
CREATE INDEX "idx_rating_user_id" ON "ratings" USING btree ("user_id");--> statement-breakpoint
CREATE UNIQUE INDEX "unique_product_review" ON "reviews" USING btree ("product_id","user_id");--> statement-breakpoint
CREATE INDEX "idx_review_product_id" ON "reviews" USING btree ("product_id");--> statement-breakpoint
CREATE INDEX "idx_review_user_id" ON "reviews" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_review_helpful" ON "reviews" USING btree ("helpful");--> statement-breakpoint
CREATE INDEX "idx_review_verified" ON "reviews" USING btree ("verified");--> statement-breakpoint
CREATE INDEX "idx_prefered_store_categories_user_id" ON "prefered_store_categories" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_prefered_store_categories_category_id" ON "prefered_store_categories" USING btree ("category_id");--> statement-breakpoint
CREATE UNIQUE INDEX "unique_prefered_store_categories_user_id_category_id" ON "prefered_store_categories" USING btree ("user_id","category_id");--> statement-breakpoint
CREATE INDEX "idx_user_location_user_id" ON "user_location" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_user_shipping_address_user_id" ON "user_shipping_address" USING btree ("user_id");--> statement-breakpoint
CREATE UNIQUE INDEX "unique_user_shipping_address_user_id_is_default" ON "user_shipping_address" USING btree ("user_id","is_default");--> statement-breakpoint
CREATE UNIQUE INDEX "unique_saved_user_id_product_id_store_id" ON "saved" USING btree ("user_id","product_id","store_id");--> statement-breakpoint
CREATE INDEX "idx_saved_user_id" ON "saved" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_saved_product_id" ON "saved" USING btree ("product_id");--> statement-breakpoint
CREATE INDEX "idx_saved_store_id" ON "saved" USING btree ("store_id");