import { protectedProcedure } from "@/lib/orpc";
import {
  products as productsTable,
  ratings,
  productImages,
} from "@/db/schema/products";
import { store as storeTable } from "@/db/schema/store";
import { db } from "@/db";
import { eq, sql, avg } from "drizzle-orm";
import { ORPCError } from "@orpc/server";
import { z } from "zod";

const getProducts = protectedProcedure
  .input(
    z.object({
      limit: z.number().optional(),
      page: z.number().optional(),
      offset: z.number().optional(),
    })
  )
  .handler(async ({ context, input }) => {
    const userId = context.session.user.id;

    const store = await db
      .select()
      .from(storeTable)
      .where(eq(storeTable.userId, userId));

    if (!store) {
      throw new ORPCError("NOT_FOUND", {
        message: "Store not found",
      });
    }

    const products = await db
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
        averageRating: sql<number>`COALESCE(${avg(ratings.rating)}, 0)`.as(
          "averageRating"
        ),
        primaryImage: productImages.url,
      })
      .from(productsTable)
      .leftJoin(ratings, eq(productsTable.id, ratings.productId))
      .leftJoin(
        productImages,
        sql`${productImages.productId} = ${productsTable.id} AND ${productImages.isPrimary} = true`
      )
      .where(eq(productsTable.storeId, store[0].id))
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
        productImages.url
      );

    return products;
  });

export { getProducts };
