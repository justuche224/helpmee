import { protectedProcedure } from "@/lib/orpc";
import z from "zod";
import { storeBanners, store as storeTable } from "@/db/schema";
import { db } from "@/db";
import { eq, and } from "drizzle-orm";
import { ORPCError } from "@orpc/server";

const getStoreBanners = protectedProcedure
  .input(
    z.object({
      storeId: z.string(),
      limit: z.number().optional(),
    })
  )
  .handler(async ({ context, input }) => {
    const { storeId, limit } = input;

    const store = await db
      .select()
      .from(storeTable)
      .where(
        and(
          eq(storeTable.id, storeId),
          eq(storeTable.userId, context.session.user.id)
        )
      );

    if (!store) {
      throw new ORPCError("NOT_FOUND", {
        message: "Store not found",
      });
    }

    const banners = await db
      .select()
      .from(storeBanners)
      .where(eq(storeBanners.storeId, store[0].id))
      .limit(limit || 5);

    return banners;
  });

export { getStoreBanners };
