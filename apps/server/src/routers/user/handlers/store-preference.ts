import { db } from "@/db";
import {
  userLocation as userLocationTable,
  preferedStoreCategories as preferedStoreCategoriesTable,
  user as userTable,
} from "@/db/schema";
import { protectedProcedure } from "@/lib/orpc";
import { eq, inArray } from "drizzle-orm";
import { storeCategory as storeCategoryTable } from "@/db/schema";
import { z } from "zod";
import { ORPCError } from "@orpc/server";

const getStorePreference = protectedProcedure.handler(async ({ context }) => {
  const userId = context.session.user.id;

  const userLocation = await db
    .select({
      country: userLocationTable.country,
      state: userLocationTable.state,
      city: userLocationTable.city,
    })
    .from(userLocationTable)
    .where(eq(userLocationTable.userId, userId))
    .limit(1);

  const preferedStoreCategories = await db
    .select({
      id: preferedStoreCategoriesTable.categoryId,
      name: storeCategoryTable.name,
      icon: storeCategoryTable.icon,
      slug: storeCategoryTable.slug,
    })
    .from(preferedStoreCategoriesTable)
    .where(eq(preferedStoreCategoriesTable.userId, userId))
    .leftJoin(
      storeCategoryTable,
      eq(preferedStoreCategoriesTable.categoryId, storeCategoryTable.id)
    )
    .limit(4);

  const userGender = await db
    .select({
      gender: userTable.gender,
    })
    .from(userTable)
    .where(eq(userTable.id, userId))
    .limit(1);

  return {
    userLocation,
    preferedStoreCategories,
    userGender,
  };
});

const updatePreferedStoreCategories = protectedProcedure
  .input(
    z.object({
      categories: z.array(z.string()),
    })
  )
  .handler(async ({ context, input }) => {
    const userId = context.session.user.id;
    const { categories } = input;

    const validCategories = await db
      .select()
      .from(storeCategoryTable)
      .where(inArray(storeCategoryTable.id, categories));

    if (validCategories.length !== categories.length) {
      throw new ORPCError("BAD_REQUEST", {
        message: "Invalid categories",
      });
    }

    const existingPreferedStoreCategories = await db
      .select({
        id: preferedStoreCategoriesTable.id,
        categoryId: preferedStoreCategoriesTable.categoryId,
      })
      .from(preferedStoreCategoriesTable)
      .where(eq(preferedStoreCategoriesTable.userId, userId));

    // Filter out categories that are already preferred by the user
    const existingCategoryIds = new Set(
      existingPreferedStoreCategories.map((pref) => pref.categoryId)
    );

    const newCategories = categories.filter(
      (categoryId) => !existingCategoryIds.has(categoryId)
    );

    // Only insert categories that aren't already preferred
    if (newCategories.length > 0) {
      await db.insert(preferedStoreCategoriesTable).values(
        newCategories.map((categoryId) => ({
          userId,
          categoryId,
        }))
      );
    }

    return { success: true };
  });

const updateUserLocation = protectedProcedure
  .input(
    z
      .object({
        country: z.string().optional(),
        state: z.string().optional(),
        city: z.string().optional(),
      })
      .refine(
        (data) => {
          return Object.values(data).some((value) => value !== undefined);
        },
        {
          message: "At least one field must be provided",
        }
      )
  )
  .handler(async ({ context, input }) => {
    const userId = context.session.user.id;
    const { country, state, city } = input;

    await db
      .update(userLocationTable)
      .set({ country, state, city })
      .where(eq(userLocationTable.userId, userId));

    return { success: true };
  });

const deleteUserLocation = protectedProcedure.handler(async ({ context }) => {
  const userId = context.session.user.id;

  await db
    .delete(userLocationTable)
    .where(eq(userLocationTable.userId, userId));

  return { success: true };
});

export {
  getStorePreference,
  updatePreferedStoreCategories,
  updateUserLocation,
  deleteUserLocation,
};
