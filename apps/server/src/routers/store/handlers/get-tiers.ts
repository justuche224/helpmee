import { protectedProcedure } from "@/lib/orpc";
import { db } from "@/db";
import { storeTier } from "@/db/schema/store";
import { ORPCError } from "@orpc/client";

const getStoreTiers = protectedProcedure.handler(async () => {
  try {
    const tiers = await db
      .select({
        id: storeTier.id,
        name: storeTier.name,
        description: storeTier.description,
        identifier: storeTier.identifier,
      })
      .from(storeTier);

    return tiers;
  } catch (error) {
    console.warn("Failed to get store tiers");
    console.error(error);
    throw new ORPCError("GET_STORE_TIERS_FAILED", {
      message: "Failed to get store tiers",
    });
  }
});

export { getStoreTiers };
