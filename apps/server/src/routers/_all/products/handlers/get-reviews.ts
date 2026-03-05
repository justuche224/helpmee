import { protectedProcedure } from "@/lib/orpc";
import { z } from "zod";
import { reviews as reviewsTable } from "@/db/schema/products";
import { user as userTable } from "@/db/schema/auth";
import { db } from "@/db";
import { eq } from "drizzle-orm";

const getReviews = protectedProcedure
  .input(
    z.object({
      productId: z.string(),
    })
  )
  .handler(async ({ input }) => {
    const { productId } = input;

    const reviews = await db
      .select({
        id: reviewsTable.id,
        title: reviewsTable.title,
        content: reviewsTable.content,
        helpful: reviewsTable.helpful,
        verified: reviewsTable.verified,
        updatedAt: reviewsTable.updatedAt,
        user: {
          id: userTable.id,
          name: userTable.name,
          image: userTable.image,
        },
      })
      .from(reviewsTable)
      .where(eq(reviewsTable.productId, productId))
      .leftJoin(userTable, eq(reviewsTable.userId, userTable.id));

    return reviews;
  });

export { getReviews };
