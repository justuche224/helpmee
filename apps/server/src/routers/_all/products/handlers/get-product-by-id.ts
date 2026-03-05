import { db } from "@/db";
import { protectedProcedure } from "@/lib/orpc";
import {
  products as productsTable,
  reviews,
  ratings,
  productImages,
} from "@/db/schema/products";
import { z } from "zod";
import { eq, sql } from "drizzle-orm";
import {
  store as storeTable,
  storeCategory,
  storeExtraDetails,
} from "@/db/schema/store";
import { ORPCError } from "@orpc/server";

const getProductById = protectedProcedure
  .input(z.object({ id: z.string() }))
  .handler(async ({ context, input }) => {
    try {
      const product = await db
        .select({
          id: productsTable.id,
          name: productsTable.name,
          slug: productsTable.slug,
          description: productsTable.description,
          price: productsTable.price,
          quantity: productsTable.quantity,
          unit: productsTable.unit,
          inStock: productsTable.inStock,
          badge: productsTable.badge,
          dimensions: productsTable.dimensions,
          weight: productsTable.weight,
          storeId: productsTable.storeId,
          storeName: storeTable.name,
          storeLogo: storeExtraDetails.logo,
          storeCategory: storeCategory.name,
          storeVerificationStatus: storeTable.verificationStatus,
          reviewCount: sql<number>`count(distinct ${reviews.id})`.as(
            "review_count"
          ),
          averageRating: sql<number>`avg(${ratings.rating})`.as(
            "average_rating"
          ),
          totalRatings: sql<number>`count(distinct ${ratings.id})`.as(
            "total_ratings"
          ),
          images: sql<
            string[]
          >`array_agg(distinct ${productImages.url}) filter (where ${productImages.url} is not null)`.as(
            "images"
          ),
          primaryImage:
            sql<string>`max(${productImages.url}) filter (where ${productImages.isPrimary} = true)`.as(
              "primary_image"
            ),
        })
        .from(productsTable)
        .leftJoin(storeTable, eq(productsTable.storeId, storeTable.id))
        .leftJoin(storeCategory, eq(storeTable.categoryId, storeCategory.id))
        .leftJoin(
          storeExtraDetails,
          eq(storeTable.id, storeExtraDetails.storeId)
        )
        .leftJoin(reviews, eq(productsTable.id, reviews.productId))
        .leftJoin(ratings, eq(productsTable.id, ratings.productId))
        .leftJoin(productImages, eq(productsTable.id, productImages.productId))
        .where(eq(productsTable.id, input.id))
        .groupBy(
          productsTable.id,
          productsTable.name,
          productsTable.slug,
          productsTable.description,
          productsTable.price,
          productsTable.quantity,
          productsTable.unit,
          productsTable.inStock,
          productsTable.badge,
          productsTable.dimensions,
          productsTable.weight,
          productsTable.storeId,
          storeTable.id,
          storeTable.name,
          storeExtraDetails.logo,
          storeCategory.name,
          storeTable.verificationStatus
        )
        .limit(1);

      return product[0] || null;
    } catch (error) {
      console.warn("Failed to get product by ID");
      console.error(error);
      throw new ORPCError("INTERNAL_SERVER_ERROR", {
        message: "Internal server error",
        cause: error,
      });
    }
  });

export { getProductById };
