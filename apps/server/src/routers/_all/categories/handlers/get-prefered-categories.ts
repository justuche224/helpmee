import { db } from "@/db";
import { preferedStoreCategories as preferedStoreCategoriesTable } from "@/db/schema";
import { protectedProcedure } from "@/lib/orpc";
import { eq } from "drizzle-orm";
import { storeCategory as storeCategoryTable } from "@/db/schema";

const getPreferedCategories = protectedProcedure.handler(
  async ({ context }) => {
    const userId = context.session.user.id;

    const preferedStoreCategories = await db
      .select({
        id: preferedStoreCategoriesTable.categoryId,
        name: storeCategoryTable.name,
        icon: storeCategoryTable.icon,
        slug: storeCategoryTable.slug,
      })
      .from(preferedStoreCategoriesTable)
      .where(eq(preferedStoreCategoriesTable.userId, userId))
      .rightJoin(
        storeCategoryTable,
        eq(preferedStoreCategoriesTable.categoryId, storeCategoryTable.id)
      )
      .limit(4);

    return preferedStoreCategories;
  }
);

export { getPreferedCategories };
