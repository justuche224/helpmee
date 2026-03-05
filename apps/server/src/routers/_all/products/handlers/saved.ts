import { protectedProcedure } from "@/lib/orpc";
import { z } from "zod";
import { savedItem as savedItemTable } from "@/db/schema/saved";
import { db } from "@/db";
import { eq, and } from "drizzle-orm";
import { ORPCError } from "@orpc/server";
import { productImages, products as productsTable } from "@/db/schema/products";
import { store as storeTable } from "@/db/schema/store";

const addToSavedSchema = z.object({
  productId: z.string(),
  storeId: z.string(),
});

const removeFromSavedSchema = z.object({
  savedItemId: z.string(),
});

const getSavedItemByProductIdSchema = z.object({
  productId: z.string(),
  storeId: z.string(),
});

const savedHandlers = {
  addToSaved: protectedProcedure
    .input(addToSavedSchema)
    .handler(async ({ context, input }) => {
      const { productId, storeId } = input;
      const userId = context.session.user.id;

      try {
        const savedItem = await db
          .select()
          .from(savedItemTable)
          .where(
            and(
              eq(savedItemTable.userId, userId),
              eq(savedItemTable.productId, productId),
              eq(savedItemTable.storeId, storeId)
            )
          );

        if (savedItem.length > 0) {
          throw new ORPCError("BAD_REQUEST", {
            message: "Item already in saved",
          });
        }

        await db.insert(savedItemTable).values({
          userId,
          productId,
          storeId,
        });
      } catch (error) {
        console.warn("Failed to add item to saved");
        console.error(error);
        throw new ORPCError("INTERNAL_SERVER_ERROR", {
          message: "Failed to add item to saved",
        });
      }

      return {
        message: "Item added to saved successfully",
      };
    }),
  removeFromSaved: protectedProcedure
    .input(removeFromSavedSchema)
    .handler(async ({ context, input }) => {
      const { savedItemId } = input;
      const userId = context.session.user.id;

      const item = await db
        .select()
        .from(savedItemTable)
        .where(
          and(
            eq(savedItemTable.id, savedItemId),
            eq(savedItemTable.userId, userId)
          )
        );

      if (item.length === 0) {
        throw new ORPCError("BAD_REQUEST", {
          message: "Item not found",
        });
      }

      await db.delete(savedItemTable).where(eq(savedItemTable.id, savedItemId));
    }),
  getSavedItems: protectedProcedure.handler(async ({ context }) => {
    const userId = context.session.user.id;
    const savedItems = await db
      .select({
        id: savedItemTable.id,
        updatedAt: savedItemTable.updatedAt,
        productId: savedItemTable.productId,
        productName: productsTable.name,
        productSlug: productsTable.slug,
        productPrice: productsTable.price,
        productInStock: productsTable.inStock,
        productImage: productImages.url,
        storeId: storeTable.id,
        storeName: storeTable.name,
      })
      .from(savedItemTable)
      .leftJoin(productsTable, eq(savedItemTable.productId, productsTable.id))
      .leftJoin(
        productImages,
        and(
          eq(productImages.productId, productsTable.id),
          eq(productImages.isPrimary, true)
        )
      )
      .leftJoin(storeTable, eq(savedItemTable.storeId, storeTable.id))
      .where(eq(savedItemTable.userId, userId));

    return savedItems.map((item) => ({
      id: item.id,
      updatedAt: item.updatedAt,
      product: {
        id: item.productId,
        name: item.productName,
        slug: item.productSlug,
        price: item.productPrice,
        inStock: item.productInStock,
        image: item.productImage,
        store: {
          id: item.storeId,
          name: item.storeName,
        },
      },
    }));
  }),
  getSavedItemByProductId: protectedProcedure
    .input(getSavedItemByProductIdSchema)
    .handler(async ({ context, input }) => {
      const { productId, storeId } = input;
      const userId = context.session.user.id;

      const savedItem = await db
        .select({
          id: savedItemTable.id,
          updatedAt: savedItemTable.updatedAt,
          productId: savedItemTable.productId,
        })
        .from(savedItemTable)
        .where(
          and(
            eq(savedItemTable.userId, userId),
            eq(savedItemTable.productId, productId),
            eq(savedItemTable.storeId, storeId)
          )
        );

      return savedItem[0] || null;
    }),

  clearSavedItems: protectedProcedure.handler(async ({ context }) => {
    const userId = context.session.user.id;
    await db.delete(savedItemTable).where(eq(savedItemTable.userId, userId));
    return {
      message: "Saved items cleared successfully",
    };
  }),
};

export { savedHandlers };
