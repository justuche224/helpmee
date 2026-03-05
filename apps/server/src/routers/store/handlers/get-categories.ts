import { protectedProcedure } from "@/lib/orpc";
import { db } from "@/db";
import { storeCategory } from "@/db/schema/store";

const getStoreCategories = protectedProcedure.handler(async () => {
  const categories = await db
    .select({
      id: storeCategory.id,
      name: storeCategory.name,
      slug: storeCategory.slug,
      icon: storeCategory.icon,
    })
    .from(storeCategory);
  return categories;
});

export { getStoreCategories };
