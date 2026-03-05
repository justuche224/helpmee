import { protectedProcedure } from "@/lib/orpc";
import { db } from "@/db";
import { storeTemplate, storeTier } from "@/db/schema/store";
import { eq } from "drizzle-orm";
import { ORPCError } from "@orpc/client";

const getStoreTemplates = protectedProcedure.handler(async () => {
  try {
    const templates = await db
      .select({
        id: storeTemplate.id,
        name: storeTemplate.name,
        coverImage: storeTemplate.coverImage,
        description: storeTemplate.description,
        tierId: storeTemplate.tierId,
        tierName: storeTier.name,
      })
      .from(storeTemplate)
      .groupBy(
        storeTemplate.id,
        storeTemplate.name,
        storeTemplate.coverImage,
        storeTemplate.description,
        storeTemplate.tierId,
        storeTier.name
      )
      .leftJoin(storeTier, eq(storeTemplate.tierId, storeTier.id));

    return templates;
  } catch (error) {
    console.warn("Failed to get store templates");
    console.error(error);
    throw new ORPCError("GET_STORE_TEMPLATES_FAILED", {
      message: "Failed to get store templates",
    });
  }
});

export { getStoreTemplates };
