import { db } from "@/db";
import { eq, and } from "drizzle-orm";
import { protectedProcedure } from "@/lib/orpc";
import { z } from "zod";
import { store as storeTable, storeExtraDetails } from "@/db/schema";
import { ORPCError } from "@orpc/server";

const updatePublicDescription = protectedProcedure
  .input(
    z.object({
      publicDescription: z.string(),
      storeId: z.string(),
    })
  )
  .handler(async ({ context, input }) => {
    const { publicDescription, storeId } = input;

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

    const storeExtraDetailsRecord = await db
      .select()
      .from(storeExtraDetails)
      .where(eq(storeExtraDetails.storeId, store[0].id));

    if (storeExtraDetailsRecord.length > 0) {
      await db
        .update(storeExtraDetails)
        .set({
          publicDescription: publicDescription,
        })
        .where(eq(storeExtraDetails.storeId, store[0].id));
    } else {
      await db.insert(storeExtraDetails).values({
        storeId: store[0].id,
        publicDescription: publicDescription,
      });
    }

    return {
      message: "Public description updated successfully",
    };
  });

export { updatePublicDescription };
