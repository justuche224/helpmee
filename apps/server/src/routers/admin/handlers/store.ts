import { adminProcedure } from "@/lib/orpc";
import { z } from "zod";
import {
  storeCategory,
  storeTemplate,
  storeTier,
  storeTierIdentifier,
  tierPerks,
  store,
  storeExtraDetails,
  storeBanners,
  user,
} from "@/db/schema";
import { db } from "@/db";
import { eq, and, desc, asc, like, sql, or, ilike, inArray } from "drizzle-orm";
import { ORPCError } from "@orpc/server";
import { uploadFile } from "@/lib/uploadthing/upload-file";

const createStoreTierSchema = z.object({
  name: z.string(),
  identifier: z.enum(storeTierIdentifier.enumValues),
  description: z.string(),
});

const createStoreTier = adminProcedure
  .input(createStoreTierSchema)
  .handler(async ({ input }) => {
    const { name, identifier, description } = input;

    const existingTier = await db
      .select()
      .from(storeTier)
      .where(eq(storeTier.identifier, identifier))
      .limit(1);

    if (existingTier.length > 0) {
      throw new ORPCError("BAD_REQUEST", {
        message:
          "Store tier already exists. Please choose a different identifier.",
      });
    }

    await db.insert(storeTier).values({
      name,
      identifier,
      description,
    });

    return {
      message: "Store tier created successfully",
    };
  });

const getStoreTiers = adminProcedure.handler(async () => {
  const tiers = await db.select().from(storeTier);
  return tiers;
});

const getTierWithPerks = adminProcedure.handler(async () => {
  const tiers = await db
    .select({
      id: storeTier.id,
      name: storeTier.name,
      identifier: storeTier.identifier,
      description: storeTier.description,
    })
    .from(storeTier);

  const perks = await db
    .select({
      tierId: tierPerks.tierId,
      perk: tierPerks.perk,
    })
    .from(tierPerks);

  const tiersWithPerks = tiers.map((tier) => {
    const tierPerks = perks
      .filter((perk) => perk.tierId === tier.id)
      .map((perk) => perk.perk);

    return {
      ...tier,
      perks: tierPerks,
    };
  });

  return tiersWithPerks;
});

const createTierPerkSchema = z.object({
  tierId: z.string(),
  perk: z.string(),
});

const createTierPerk = adminProcedure
  .input(createTierPerkSchema)
  .handler(async ({ input }) => {
    const { tierId, perk } = input;

    const existingPerk = await db
      .select()
      .from(tierPerks)
      .where(eq(tierPerks.perk, perk))
      .limit(1);

    if (existingPerk.length > 0) {
      throw new ORPCError("BAD_REQUEST", {
        message: "Tier perk already exists. Please choose a different perk.",
      });
    }
    await db.insert(tierPerks).values({
      tierId,
      perk,
    });

    return {
      message: "Tier perk created successfully",
    };
  });

const createStoreTemplateSchema = z.object({
  name: z.string(),
  tierId: z.string(),
  coverImage: z.string(),
  description: z.string(),
});

const createStoreTemplate = adminProcedure
  .input(createStoreTemplateSchema)
  .handler(async ({ input }) => {
    const { name, tierId, coverImage, description } = input;

    const existingTemplate = await db
      .select()
      .from(storeTemplate)
      .where(eq(storeTemplate.name, name))
      .limit(1);

    if (existingTemplate.length > 0) {
      throw new ORPCError("BAD_REQUEST", {
        message:
          "Store template already exists. Please choose a different name.",
      });
    }

    let coverImageUrl: string;

    try {
      const base64Data = coverImage.replace(/^data:.*?;base64,/, "");
      const buffer = Buffer.from(base64Data, "base64");

      const fileName = `cover-image-${Date.now()}.png`;
      const file = new File([buffer], fileName, {
        type: "image/png",
      });

      coverImageUrl = await uploadFile(file, "storeTemplateCoverImage");
    } catch (error) {
      throw new Error("Failed to upload cover image");
    }

    await db.insert(storeTemplate).values({
      name,
      tierId,
      coverImage: coverImageUrl,
      description,
    });

    return {
      message: "Store template created successfully",
    };
  });

const getStoreTemplates = adminProcedure.handler(async () => {
  const templates = await db.select().from(storeTemplate);
  return templates;
});

const createStoreCategorySchema = z.object({
  name: z.string(),
  icon: z.string(),
});

const createStoreCategory = adminProcedure
  .input(createStoreCategorySchema)
  .handler(async ({ input }) => {
    const { name, icon } = input;

    const slug = name
      .toLowerCase()
      .replace(/\s+/g, "-")
      .replace(/[^a-z0-9-]/g, "");

    const existingCategory = await db
      .select()
      .from(storeCategory)
      .where(eq(storeCategory.slug, slug))
      .limit(1);

    if (existingCategory.length > 0) {
      throw new ORPCError("BAD_REQUEST", {
        message:
          "Store category already exists. Please choose a different name.",
      });
    }

    let iconUrl: string;

    try {
      const base64Data = icon.replace(/^data:.*?;base64,/, "");
      const buffer = Buffer.from(base64Data, "base64");

      const fileName = `icon-${Date.now()}.png`;
      const file = new File([buffer], fileName, {
        type: "image/png",
      });

      iconUrl = await uploadFile(file, "storeCategoryIcon");
    } catch (error) {
      throw new Error("Failed to upload icon");
    }

    await db.insert(storeCategory).values({
      name,
      slug,
      icon: iconUrl,
    });

    return {
      message: "Store category created successfully",
    };
  });

const getStoreCategories = adminProcedure.handler(async () => {
  const categories = await db.select().from(storeCategory);
  return categories;
});

const deleteStoreCategorySchema = z.object({
  id: z.string(),
});

const deleteStoreCategory = adminProcedure
  .input(deleteStoreCategorySchema)
  .handler(async ({ input }) => {
    const { id } = input;
    await db.delete(storeCategory).where(eq(storeCategory.id, id));
    return { message: "Store category deleted successfully" };
  });

const getAllStores = adminProcedure.handler(async () => {
  const stores = await db
    .select({
      id: store.id,
      name: store.name,
      slug: store.slug,
      description: store.description,
      businessRegistration: store.businessRegistration,
      status: store.status,
      verificationStatus: store.verificationStatus,
      ownerName: store.ownerName,
      phoneNumber: store.phoneNumber,
      country: store.country,
      state: store.state,
      zipCode: store.zipCode,
      address: store.address,
      createdAt: store.createdAt,
      updatedAt: store.updatedAt,
      user: user.name,
      tier: storeTier.name,
      category: storeCategory.name,
      template: storeTemplate.name,
    })
    .from(store)
    .leftJoin(user, eq(store.userId, user.id))
    .leftJoin(storeTier, eq(store.tierId, storeTier.id))
    .leftJoin(storeCategory, eq(store.categoryId, storeCategory.id))
    .leftJoin(storeTemplate, eq(store.templateId, storeTemplate.id));
  return stores;
});

const getStoresWithFilters = adminProcedure
  .input(
    z.object({
      limit: z.number().min(1).max(100).default(20),
      offset: z.number().min(0).default(0),
      status: z
        .enum(["PENDING", "APPROVED", "REJECTED", "SUSPENDED"])
        .optional(),
      verificationStatus: z
        .enum(["PENDING", "APPROVED", "REJECTED"])
        .optional(),
      tierId: z.string().optional(),
      categoryId: z.string().optional(),
      search: z.string().optional(),
      sortBy: z.enum(["createdAt", "name", "status"]).default("createdAt"),
      sortOrder: z.enum(["asc", "desc"]).default("desc"),
    })
  )
  .handler(async ({ input }) => {
    try {
      let whereConditions = [];

      if (input.status) {
        whereConditions.push(eq(store.status, input.status));
      }

      if (input.verificationStatus) {
        whereConditions.push(
          eq(store.verificationStatus, input.verificationStatus)
        );
      }

      if (input.tierId) {
        whereConditions.push(eq(store.tierId, input.tierId));
      }

      if (input.categoryId) {
        whereConditions.push(eq(store.categoryId, input.categoryId));
      }

      if (input.search) {
        whereConditions.push(
          or(
            ilike(store.name, `%${input.search}%`),
            ilike(store.ownerName, `%${input.search}%`),
            ilike(store.slug, `%${input.search}%`)
          )
        );
      }

      const orderBy =
        input.sortOrder === "desc"
          ? desc(store[input.sortBy])
          : asc(store[input.sortBy]);

      const stores = await db
        .select({
          id: store.id,
          name: store.name,
          slug: store.slug,
          description: store.description,
          ownerName: store.ownerName,
          phoneNumber: store.phoneNumber,
          country: store.country,
          state: store.state,
          status: store.status,
          verificationStatus: store.verificationStatus,
          createdAt: store.createdAt,
          updatedAt: store.updatedAt,
          user: user.name,
          tier: storeTier.name,
          category: storeCategory.name,
          template: storeTemplate.name,
        })
        .from(store)
        .leftJoin(user, eq(store.userId, user.id))
        .leftJoin(storeTier, eq(store.tierId, storeTier.id))
        .leftJoin(storeCategory, eq(store.categoryId, storeCategory.id))
        .leftJoin(storeTemplate, eq(store.templateId, storeTemplate.id))
        .where(whereConditions.length > 0 ? and(...whereConditions) : undefined)
        .orderBy(orderBy)
        .limit(input.limit)
        .offset(input.offset);

      const totalCount = await db
        .select({ count: sql<number>`count(*)` })
        .from(store)
        .where(
          whereConditions.length > 0 ? and(...whereConditions) : undefined
        );

      return {
        stores,
        total: totalCount[0].count,
        limit: input.limit,
        offset: input.offset,
      };
    } catch (error) {
      console.warn("Failed to get stores with filters");
      console.error(error);
      throw new ORPCError("GET_STORES_WITH_FILTERS_FAILED", {
        message: "Failed to get stores with filters",
      });
    }
  });

const getStoreById = adminProcedure
  .input(z.object({ id: z.string() }))
  .handler(async ({ input }) => {
    try {
      const storeData = await db
        .select({
          id: store.id,
          name: store.name,
          slug: store.slug,
          ownerName: store.ownerName,
          phoneNumber: store.phoneNumber,
          country: store.country,
          state: store.state,
          zipCode: store.zipCode,
          address: store.address,
          businessRegistration: store.businessRegistration,
          description: store.description,
          status: store.status,
          verificationStatus: store.verificationStatus,
          createdAt: store.createdAt,
          updatedAt: store.updatedAt,
          user: {
            id: user.id,
            name: user.name,
            email: user.email,
            kycVerified: user.kycVerified,
          },
          tier: {
            id: storeTier.id,
            name: storeTier.name,
            identifier: storeTier.identifier,
          },
          category: {
            id: storeCategory.id,
            name: storeCategory.name,
          },
          template: storeTemplate.name,
        })
        .from(store)
        .leftJoin(user, eq(store.userId, user.id))
        .leftJoin(storeTier, eq(store.tierId, storeTier.id))
        .leftJoin(storeCategory, eq(store.categoryId, storeCategory.id))
        .leftJoin(storeTemplate, eq(store.templateId, storeTemplate.id))
        .where(eq(store.id, input.id));

      if (storeData.length === 0) {
        throw new ORPCError("STORE_NOT_FOUND", {
          message: "Store not found",
        });
      }

      const extraDetails = await db
        .select()
        .from(storeExtraDetails)
        .where(eq(storeExtraDetails.storeId, input.id));

      const banners = await db
        .select()
        .from(storeBanners)
        .where(eq(storeBanners.storeId, input.id));

      return {
        ...storeData[0],
        extraDetails: extraDetails[0] || null,
        banners,
      };
    } catch (error) {
      if (error instanceof ORPCError) throw error;
      console.warn("Failed to get store by ID");
      console.error(error);
      throw new ORPCError("GET_STORE_BY_ID_FAILED", {
        message: "Failed to get store by ID",
      });
    }
  });

const updateStoreStatus = adminProcedure
  .input(
    z.object({
      id: z.string(),
      status: z
        .enum(["PENDING", "APPROVED", "REJECTED", "SUSPENDED"])
        .optional(),
      verificationStatus: z
        .enum(["PENDING", "APPROVED", "REJECTED"])
        .optional(),
      adminId: z.string(),
    })
  )
  .handler(async ({ input }) => {
    try {
      const updateData: any = {
        updatedAt: new Date(),
      };

      if (input.status) updateData.status = input.status;
      if (input.verificationStatus)
        updateData.verificationStatus = input.verificationStatus;

      const result = await db
        .update(store)
        .set(updateData)
        .where(eq(store.id, input.id))
        .returning();

      if (result.length === 0) {
        throw new ORPCError("STORE_NOT_FOUND", {
          message: "Store not found",
        });
      }

      return { success: true, store: result[0] };
    } catch (error) {
      if (error instanceof ORPCError) throw error;
      console.warn("Failed to update store status");
      console.error(error);
      throw new ORPCError("UPDATE_STORE_STATUS_FAILED", {
        message: "Failed to update store status",
      });
    }
  });

const bulkUpdateStoreStatus = adminProcedure
  .input(
    z.object({
      storeIds: z.array(z.string()),
      status: z
        .enum(["PENDING", "APPROVED", "REJECTED", "SUSPENDED"])
        .optional(),
      verificationStatus: z
        .enum(["PENDING", "APPROVED", "REJECTED"])
        .optional(),
      adminId: z.string(),
    })
  )
  .handler(async ({ input }) => {
    try {
      const updateData: any = {
        updatedAt: new Date(),
      };

      if (input.status) updateData.status = input.status;
      if (input.verificationStatus)
        updateData.verificationStatus = input.verificationStatus;

      const result = await db
        .update(store)
        .set(updateData)
        .where(inArray(store.id, input.storeIds))
        .returning();

      return {
        success: true,
        updatedCount: result.length,
        stores: result,
      };
    } catch (error) {
      console.warn("Failed to bulk update store status");
      console.error(error);
      throw new ORPCError("BULK_UPDATE_STORE_STATUS_FAILED", {
        message: "Failed to bulk update store status",
      });
    }
  });

const updateStoreExtraDetails = adminProcedure
  .input(
    z.object({
      storeId: z.string(),
      logo: z.string().optional(),
      coverImage: z.string().optional(),
      publicDescription: z.string().optional(),
      adminId: z.string(),
    })
  )
  .handler(async ({ input }) => {
    try {
      let logoUrl: string | undefined;
      let coverImageUrl: string | undefined;

      if (input.logo) {
        try {
          const base64Data = input.logo.replace(/^data:.*?;base64,/, "");
          const buffer = Buffer.from(base64Data, "base64");
          const fileName = `store-logo-${Date.now()}.png`;
          const file = new File([buffer], fileName, {
            type: "image/png",
          });
          logoUrl = await uploadFile(file, "storeLogo");
        } catch (error) {
          throw new Error("Failed to upload logo");
        }
      }

      if (input.coverImage) {
        try {
          const base64Data = input.coverImage.replace(/^data:.*?;base64,/, "");
          const buffer = Buffer.from(base64Data, "base64");
          const fileName = `store-cover-${Date.now()}.png`;
          const file = new File([buffer], fileName, {
            type: "image/png",
          });
          coverImageUrl = await uploadFile(file, "storeCoverImage");
        } catch (error) {
          throw new Error("Failed to upload cover image");
        }
      }

      const updateData: any = {
        updatedAt: new Date(),
      };

      if (logoUrl !== undefined) updateData.logo = logoUrl;
      if (coverImageUrl !== undefined) updateData.coverImage = coverImageUrl;
      if (input.publicDescription !== undefined)
        updateData.publicDescription = input.publicDescription;

      const existingDetails = await db
        .select()
        .from(storeExtraDetails)
        .where(eq(storeExtraDetails.storeId, input.storeId));

      let result;
      if (existingDetails.length > 0) {
        result = await db
          .update(storeExtraDetails)
          .set(updateData)
          .where(eq(storeExtraDetails.storeId, input.storeId))
          .returning();
      } else {
        result = await db
          .insert(storeExtraDetails)
          .values({
            storeId: input.storeId,
            ...updateData,
          })
          .returning();
      }

      return { success: true, extraDetails: result[0] };
    } catch (error) {
      console.warn("Failed to update store extra details");
      console.error(error);
      throw new ORPCError("UPDATE_STORE_EXTRA_DETAILS_FAILED", {
        message: "Failed to update store extra details",
      });
    }
  });

const addStoreBanner = adminProcedure
  .input(
    z.object({
      storeId: z.string(),
      banner: z.string(), // Base64 image
      adminId: z.string(),
    })
  )
  .handler(async ({ input }) => {
    try {
      let bannerUrl: string;

      try {
        const base64Data = input.banner.replace(/^data:.*?;base64,/, "");
        const buffer = Buffer.from(base64Data, "base64");
        const fileName = `store-banner-${Date.now()}.png`;
        const file = new File([buffer], fileName, {
          type: "image/png",
        });
        bannerUrl = await uploadFile(file, "storeBanner");
      } catch (error) {
        throw new Error("Failed to upload banner");
      }

      const result = await db
        .insert(storeBanners)
        .values({
          storeId: input.storeId,
          banner: bannerUrl,
        })
        .returning();

      return { success: true, banner: result[0] };
    } catch (error) {
      console.warn("Failed to add store banner");
      console.error(error);
      throw new ORPCError("ADD_STORE_BANNER_FAILED", {
        message: "Failed to add store banner",
      });
    }
  });

const deleteStoreBanner = adminProcedure
  .input(z.object({ bannerId: z.string(), adminId: z.string() }))
  .handler(async ({ input }) => {
    try {
      const result = await db
        .delete(storeBanners)
        .where(eq(storeBanners.id, input.bannerId))
        .returning();

      if (result.length === 0) {
        throw new ORPCError("BANNER_NOT_FOUND", {
          message: "Banner not found",
        });
      }

      return { success: true };
    } catch (error) {
      if (error instanceof ORPCError) throw error;
      console.warn("Failed to delete store banner");
      console.error(error);
      throw new ORPCError("DELETE_STORE_BANNER_FAILED", {
        message: "Failed to delete store banner",
      });
    }
  });

const getStoreStatistics = adminProcedure.handler(async () => {
  try {
    const statusStats = await db
      .select({
        status: store.status,
        count: sql<number>`count(*)`,
      })
      .from(store)
      .groupBy(store.status);

    const verificationStats = await db
      .select({
        verificationStatus: store.verificationStatus,
        count: sql<number>`count(*)`,
      })
      .from(store)
      .groupBy(store.verificationStatus);

    const tierStats = await db
      .select({
        tier: storeTier.name,
        count: sql<number>`count(*)`,
      })
      .from(store)
      .leftJoin(storeTier, eq(store.tierId, storeTier.id))
      .groupBy(storeTier.name);

    const totalStores = await db
      .select({ count: sql<number>`count(*)` })
      .from(store);

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const recentStores = await db
      .select({ count: sql<number>`count(*)` })
      .from(store)
      .where(sql`${store.createdAt} >= ${thirtyDaysAgo}`);

    const storesWithDetails = await db
      .select({ count: sql<number>`count(*)` })
      .from(storeExtraDetails);

    const totalBanners = await db
      .select({ count: sql<number>`count(*)` })
      .from(storeBanners);

    return {
      total: totalStores[0].count,
      recent: recentStores[0].count,
      withDetails: storesWithDetails[0].count,
      totalBanners: totalBanners[0].count,
      byStatus: statusStats,
      byVerificationStatus: verificationStats,
      byTier: tierStats,
    };
  } catch (error) {
    console.warn("Failed to get store statistics");
    console.error(error);
    throw new ORPCError("GET_STORE_STATISTICS_FAILED", {
      message: "Failed to get store statistics",
    });
  }
});

const getPendingStores = adminProcedure
  .input(
    z.object({
      limit: z.number().min(1).max(50).default(20),
      offset: z.number().min(0).default(0),
    })
  )
  .handler(async ({ input }) => {
    try {
      const pendingStores = await db
        .select({
          id: store.id,
          name: store.name,
          slug: store.slug,
          ownerName: store.ownerName,
          description: store.description,
          phoneNumber: store.phoneNumber,
          country: store.country,
          state: store.state,
          status: store.status,
          verificationStatus: store.verificationStatus,
          createdAt: store.createdAt,
          user: {
            id: user.id,
            name: user.name,
            email: user.email,
            kycVerified: user.kycVerified,
          },
          tier: storeTier.name,
          category: storeCategory.name,
        })
        .from(store)
        .leftJoin(user, eq(store.userId, user.id))
        .leftJoin(storeTier, eq(store.tierId, storeTier.id))
        .leftJoin(storeCategory, eq(store.categoryId, storeCategory.id))
        .where(
          or(
            eq(store.status, "PENDING"),
            eq(store.verificationStatus, "PENDING")
          )
        )
        .orderBy(desc(store.createdAt))
        .limit(input.limit)
        .offset(input.offset);

      const totalCount = await db
        .select({ count: sql<number>`count(*)` })
        .from(store)
        .where(
          or(
            eq(store.status, "PENDING"),
            eq(store.verificationStatus, "PENDING")
          )
        );

      return {
        stores: pendingStores,
        total: totalCount[0].count,
        limit: input.limit,
        offset: input.offset,
      };
    } catch (error) {
      console.warn("Failed to get pending stores");
      console.error(error);
      throw new ORPCError("GET_PENDING_STORES_FAILED", {
        message: "Failed to get pending stores",
      });
    }
  });

const searchStores = adminProcedure
  .input(
    z.object({
      query: z.string().min(1),
      limit: z.number().min(1).max(50).default(20),
    })
  )
  .handler(async ({ input }) => {
    try {
      const stores = await db
        .select({
          id: store.id,
          name: store.name,
          slug: store.slug,
          ownerName: store.ownerName,
          description: store.description,
          status: store.status,
          verificationStatus: store.verificationStatus,
          createdAt: store.createdAt,
          user: user.name,
          tier: storeTier.name,
          category: storeCategory.name,
        })
        .from(store)
        .leftJoin(user, eq(store.userId, user.id))
        .leftJoin(storeTier, eq(store.tierId, storeTier.id))
        .leftJoin(storeCategory, eq(store.categoryId, storeCategory.id))
        .where(
          or(
            ilike(store.name, `%${input.query}%`),
            ilike(store.ownerName, `%${input.query}%`),
            ilike(store.slug, `%${input.query}%`),
            ilike(store.description, `%${input.query}%`)
          )
        )
        .orderBy(desc(store.createdAt))
        .limit(input.limit);

      return stores;
    } catch (error) {
      console.warn("Failed to search stores");
      console.error(error);
      throw new ORPCError("SEARCH_STORES_FAILED", {
        message: "Failed to search stores",
      });
    }
  });

const deleteStore = adminProcedure
  .input(
    z.object({
      id: z.string(),
      adminId: z.string(),
    })
  )
  .handler(async ({ input }) => {
    try {
      const existingStore = await db
        .select()
        .from(store)
        .where(eq(store.id, input.id));

      if (existingStore.length === 0) {
        throw new ORPCError("STORE_NOT_FOUND", {
          message: "Store not found",
        });
      }

      await db.delete(store).where(eq(store.id, input.id));

      return { success: true };
    } catch (error) {
      if (error instanceof ORPCError) throw error;
      console.warn("Failed to delete store");
      console.error(error);
      throw new ORPCError("DELETE_STORE_FAILED", {
        message: "Failed to delete store",
      });
    }
  });

const updateStoreTier = adminProcedure
  .input(
    z.object({
      storeId: z.string(),
      tierId: z.string(),
      adminId: z.string(),
    })
  )
  .handler(async ({ input }) => {
    try {
      const result = await db
        .update(store)
        .set({
          tierId: input.tierId,
          updatedAt: new Date(),
        })
        .where(eq(store.id, input.storeId))
        .returning();

      if (result.length === 0) {
        throw new ORPCError("STORE_NOT_FOUND", {
          message: "Store not found",
        });
      }

      return { success: true, store: result[0] };
    } catch (error) {
      if (error instanceof ORPCError) throw error;
      console.warn("Failed to update store tier");
      console.error(error);
      throw new ORPCError("UPDATE_STORE_TIER_FAILED", {
        message: "Failed to update store tier",
      });
    }
  });

const getStoresByUser = adminProcedure
  .input(z.object({ userId: z.string() }))
  .handler(async ({ input }) => {
    try {
      const stores = await db
        .select({
          id: store.id,
          name: store.name,
          slug: store.slug,
          status: store.status,
          verificationStatus: store.verificationStatus,
          createdAt: store.createdAt,
          tier: storeTier.name,
          category: storeCategory.name,
        })
        .from(store)
        .leftJoin(storeTier, eq(store.tierId, storeTier.id))
        .leftJoin(storeCategory, eq(store.categoryId, storeCategory.id))
        .where(eq(store.userId, input.userId))
        .orderBy(desc(store.createdAt));

      return stores;
    } catch (error) {
      console.warn("Failed to get stores by user");
      console.error(error);
      throw new ORPCError("GET_STORES_BY_USER_FAILED", {
        message: "Failed to get stores by user",
      });
    }
  });

export {
  createStoreTier,
  createTierPerk,
  createStoreTemplate,
  createStoreCategory,
  getStoreTemplates,
  getStoreTiers,
  getTierWithPerks,
  getStoreCategories,
  deleteStoreCategory,
  getAllStores,
  getStoresWithFilters,
  getStoreById,
  updateStoreStatus,
  bulkUpdateStoreStatus,
  updateStoreExtraDetails,
  addStoreBanner,
  deleteStoreBanner,
  getStoreStatistics,
  getPendingStores,
  searchStores,
  deleteStore,
  updateStoreTier,
  getStoresByUser,
};
