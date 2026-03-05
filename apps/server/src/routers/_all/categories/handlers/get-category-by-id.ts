import { db } from "@/db";
import { storeCategory } from "@/db/schema/store";
import { protectedProcedure } from "@/lib/orpc";
import { z } from "zod";
import { eq } from "drizzle-orm";

const getCategoryById = protectedProcedure
  .input(z.object({ id: z.string() }))
  .handler(async ({ input }) => {
    const categories = await db
      .select({
        id: storeCategory.id,
        name: storeCategory.name,
        slug: storeCategory.slug,
        icon: storeCategory.icon,
      })
      .from(storeCategory)
      .where(eq(storeCategory.id, input.id))
      .limit(1);

    return categories[0] || null;
  });

export { getCategoryById };
