import { db } from "@/db";
import {
  storeBanners,
  storeCategory,
  storeExtraDetails,
  store as storeTable,
  storeTemplate,
  storeTier,
} from "@/db/schema";
import { protectedProcedure } from "@/lib/orpc";
import { ORPCError } from "@orpc/server";
import { eq } from "drizzle-orm";

const getUsersStore = protectedProcedure.handler(async ({ context }) => {
  const userId = context.session.user.id;

  try {
    const store = await db
      .select({
        id: storeTable.id,
        name: storeTable.name,
        slug: storeTable.slug,
        ownerName: storeTable.ownerName,
        phoneNumber: storeTable.phoneNumber,
        country: storeTable.country,
        state: storeTable.state,
        zipCode: storeTable.zipCode,
        address: storeTable.address,
        status: storeTable.status,
        verificationStatus: storeTable.verificationStatus,
        tier: storeTier.identifier,
        logo: storeExtraDetails.logo,
        template: storeTemplate.name,
        description: storeExtraDetails.publicDescription,
        category: storeCategory.name,
      })
      .from(storeTable)
      .where(eq(storeTable.userId, userId))
      .leftJoin(storeExtraDetails, eq(storeTable.id, storeExtraDetails.storeId))
      .leftJoin(storeTemplate, eq(storeTable.templateId, storeTemplate.id))
      .leftJoin(storeCategory, eq(storeTable.categoryId, storeCategory.id))
      .leftJoin(storeTier, eq(storeTable.tierId, storeTier.id))
      .limit(1);

    console.log("store", store);

    if (!store || store.length === 0) {
      throw new ORPCError("NOT_FOUND", {
        message: "You don't have a store",
      });
    }

    const banners = await db
      .select({
        id: storeBanners.id,
        banner: storeBanners.banner,
        storeId: storeBanners.storeId,
        createdAt: storeBanners.createdAt,
      })
      .from(storeBanners)
      .where(eq(storeBanners.storeId, store[0].id))
      .orderBy(storeBanners.createdAt)
      .limit(10);

    return {
      ...store[0],
      banners,
    };
  } catch (error: any) {
    console.warn("Failed to get store (catch block)");
    console.error(error);
    throw new ORPCError(
      error instanceof ORPCError ? error.code : "INTERNAL_SERVER_ERROR",
      {
        message: error?.message || "Failed to get store",
      }
    );
  }
});

export { getUsersStore };
