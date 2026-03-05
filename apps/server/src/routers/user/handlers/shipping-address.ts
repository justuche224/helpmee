import { userShippingAddress } from "@/db/schema/user-data";
import { protectedProcedure } from "@/lib/orpc";
import { db } from "@/db";
import { and, eq } from "drizzle-orm";
import { z } from "zod";

const createShippingAddressSchema = z.object({
  fullName: z.string(),
  address: z.string(),
  email: z.string(),
  zipCode: z.string(),
  phone: z.string(),
  country: z.string(),
  city: z.string(),
  state: z.string(),
  isDefault: z.boolean(),
});

const shippingAddress = {
  getShippingAddress: protectedProcedure.handler(async ({ context }) => {
    const userId = context.session.user.id;
    const shippingAddress = await db.select().from(userShippingAddress).where(eq(userShippingAddress.userId, userId));
    return shippingAddress;
  }),
  createShippingAddress: protectedProcedure
    .input(createShippingAddressSchema)
    .handler(async ({ context, input }) => {
      const userId = context.session.user.id;
      const {
        fullName,
        address,
        email,
        zipCode,
        phone,
        country,
        city,
        state,
        isDefault,
      } = input;

      if (isDefault) {
        await db
          .update(userShippingAddress)
          .set({
            isDefault: false,
          })
          .where(
            and(
              eq(userShippingAddress.userId, userId),
              eq(userShippingAddress.isDefault, true)
            )
          );
      }

      await db.insert(userShippingAddress).values({
        userId,
        fullName,
        address,
        email,
        zipCode,
        phone,
        country,
        city,
        state,
        isDefault,
      });

      return {
        message: "Shipping address created successfully",
      };
    }),

  markAsDefaultShippingAddress: protectedProcedure
    .input(
      z.object({
        id: z.string(),
      })
    )
    .handler(async ({ context, input }) => {
      const userId = context.session.user.id;
      const { id } = input;
      await db
        .update(userShippingAddress)
        .set({ isDefault: true })
        .where(
          and(
            eq(userShippingAddress.id, id),
            eq(userShippingAddress.userId, userId)
          )
        );
      return { message: "Shipping address marked as default successfully" };
    }),
  deleteShippingAddress: protectedProcedure
    .input(
      z.object({
        id: z.string(),
      })
    )
    .handler(async ({ context, input }) => {
      const userId = context.session.user.id;
      const { id } = input;
      await db
        .delete(userShippingAddress)
        .where(
          and(
            eq(userShippingAddress.id, id),
            eq(userShippingAddress.userId, userId)
          )
        );

      return { message: "Shipping address deleted successfully" };
    }),
};

export { shippingAddress };
