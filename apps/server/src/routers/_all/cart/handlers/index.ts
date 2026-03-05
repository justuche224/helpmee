import { db } from "@/db";
import { cartItem as cartItemTable } from "@/db/schema/cart";
import { products as productsTable, productImages } from "@/db/schema/products";
import { store as storeTable } from "@/db/schema/store";
import { protectedProcedure } from "@/lib/orpc";
import { ORPCError } from "@orpc/server";
import { and, eq } from "drizzle-orm";
import z from "zod";

// TODO: enforce inventory count validation

const addToCartSchema = z.object({
  productId: z.string(),
  quantity: z.number(),
  storeId: z.string(),
});

const removeFromCartSchema = z.object({
  cartItemId: z.string(),
});

const incrementCartItemQuantitySchema = z.object({
  cartItemId: z.string(),
  quantity: z.number(),
});

const decrementCartItemQuantitySchema = z.object({
  cartItemId: z.string(),
  quantity: z.number(),
});

const getCartItemByProductIdSchema = z.object({
  productId: z.string(),
  storeId: z.string(),
});

const cartHandlers = {
  addToCart: protectedProcedure
    .input(addToCartSchema)
    .handler(async ({ context, input }) => {
      try {
        const { productId, quantity, storeId } = input;
        const userId = context.session.user.id;

        const cartItem = await db
          .select()
          .from(cartItemTable)
          .where(
            and(
              eq(cartItemTable.userId, userId),
              eq(cartItemTable.productId, productId),
              eq(cartItemTable.storeId, storeId)
            )
          )
          .limit(1);

        if (cartItem.length > 0 && cartItem[0]) {
          throw new ORPCError("BAD_REQUEST", {
            message: "Item already in cart, please update the quantity",
          });
        }
        await db.insert(cartItemTable).values({
          userId,
          productId,
          storeId,
          quantity,
        });
        return {
          message: "Item added to cart successfully",
        };
      } catch (error) {
        console.warn("Failed to add item to cart");
        console.error(error);
        throw new ORPCError("INTERNAL_SERVER_ERROR", {
          message: "Failed to add item to cart",
        });
      }
    }),
  removeFromCart: protectedProcedure
    .input(removeFromCartSchema)
    .handler(async ({ context, input }) => {
      const { cartItemId } = input;
      const userId = context.session.user.id;
      const cartItem = await db
        .select()
        .from(cartItemTable)
        .where(
          and(
            eq(cartItemTable.id, cartItemId),
            eq(cartItemTable.userId, userId)
          )
        );
      if (cartItem.length === 0 && cartItem[0]) {
        throw new ORPCError("NOT_FOUND", {
          message: "Cart item not found",
        });
      }
      await db.delete(cartItemTable).where(eq(cartItemTable.id, cartItemId));
      return {
        message: "Item removed from cart successfully",
      };
    }),
  incrementCartItemQuantity: protectedProcedure
    .input(incrementCartItemQuantitySchema)
    .handler(async ({ context, input }) => {
      const { cartItemId, quantity } = input;
      const userId = context.session.user.id;
      const cartItem = await db
        .select()
        .from(cartItemTable)
        .where(
          and(
            eq(cartItemTable.id, cartItemId),
            eq(cartItemTable.userId, userId)
          )
        );
      if (cartItem.length === 0 && cartItem[0]) {
        throw new ORPCError("BAD_REQUEST", {
          message: "Cart item not found",
        });
      }
      if (cartItem[0].quantity + quantity < 0) {
        throw new ORPCError("BAD_REQUEST", {
          message: "Cart item quantity cannot be less than 0",
        });
      }
      await db
        .update(cartItemTable)
        .set({ quantity: cartItem[0].quantity + quantity })
        .where(eq(cartItemTable.id, cartItemId));
      return {
        message: "Cart item quantity updated successfully",
      };
    }),
  decrementCartItemQuantity: protectedProcedure
    .input(decrementCartItemQuantitySchema)
    .handler(async ({ context, input }) => {
      const { cartItemId, quantity } = input;
      const userId = context.session.user.id;
      const cartItem = await db
        .select()
        .from(cartItemTable)
        .where(
          and(
            eq(cartItemTable.id, cartItemId),
            eq(cartItemTable.userId, userId)
          )
        );
      if (cartItem.length === 0 && cartItem[0]) {
        throw new ORPCError("BAD_REQUEST", {
          message: "Cart item not found",
        });
      }
      if (cartItem[0].quantity - quantity < 0) {
        throw new ORPCError("BAD_REQUEST", {
          message: "Cart item quantity cannot be less than 0",
        });
      }
      await db
        .update(cartItemTable)
        .set({ quantity: cartItem[0].quantity - quantity })
        .where(eq(cartItemTable.id, cartItemId));
      return {
        message: "Cart item quantity decremented successfully",
      };
    }),
  getCart: protectedProcedure.handler(async ({ context }) => {
    const userId = context.session.user.id;
    const cartItems = await db
      .select({
        id: cartItemTable.id,
        quantity: cartItemTable.quantity,
        updatedAt: cartItemTable.updatedAt,
        productId: productsTable.id,
        productName: productsTable.name,
        productSlug: productsTable.slug,
        productPrice: productsTable.price,
        productInStock: productsTable.inStock,
        productImage: productImages.url,
        storeId: storeTable.id,
        storeName: storeTable.name,
      })
      .from(cartItemTable)
      .leftJoin(productsTable, eq(cartItemTable.productId, productsTable.id))
      .leftJoin(
        productImages,
        and(
          eq(productImages.productId, productsTable.id),
          eq(productImages.isPrimary, true)
        )
      )
      .leftJoin(storeTable, eq(cartItemTable.storeId, storeTable.id))
      .where(eq(cartItemTable.userId, userId));

    return cartItems.map((item) => ({
      id: item.id,
      quantity: item.quantity,
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
  getCartItemByProductId: protectedProcedure
    .input(getCartItemByProductIdSchema)
    .handler(async ({ context, input }) => {
      const { productId, storeId } = input;
      const userId = context.session.user.id;
      const cartItem = await db
        .select({
          id: cartItemTable.id,
          quantity: cartItemTable.quantity,
          updatedAt: cartItemTable.updatedAt,
          productId: cartItemTable.productId,
        })
        .from(cartItemTable)
        .where(
          and(
            eq(cartItemTable.productId, productId),
            eq(cartItemTable.storeId, storeId),
            eq(cartItemTable.userId, userId)
          )
        );
      return cartItem[0] || null;
    }),
  clearCart: protectedProcedure.handler(async ({ context }) => {
    const userId = context.session.user.id;

    await db.delete(cartItemTable).where(eq(cartItemTable.userId, userId));

    return {
      message: "Cart cleared successfully",
    };
  }),
};

export { cartHandlers };
