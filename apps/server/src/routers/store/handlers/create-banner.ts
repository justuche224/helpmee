import { db } from "@/db";
import { protectedProcedure } from "@/lib/orpc";
import { store as storeTable, storeBanners } from "@/db/schema";
import z from "zod";
import { ORPCError } from "@orpc/server";
import { uploadFile } from "@/lib/uploadthing/upload-file";
import { eq, and } from "drizzle-orm";

const createBanner = protectedProcedure
  .input(
    z.object({
      banner: z.string(),
      storeId: z.string(),
    })
  )
  .handler(async ({ input, context }) => {
    const { banner, storeId } = input;

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

    let bannerUrl: string;

    try {
      const base64Data = banner.replace(/^data:.*?;base64,/, "");
      const buffer = Buffer.from(base64Data, "base64");

      const fileName = `banner-${Date.now()}.png`;
      const file = new File([buffer], fileName, {
        type: "image/png",
      });

      bannerUrl = await uploadFile(file, "banner", store[0].id);
    } catch (error) {
      console.warn("error in create banner oRPC handler");
      console.error(error);
      throw new ORPCError("INTERNAL_SERVER_ERROR", {
        message: "Failed to upload banner",
      });
    }

    console.log("banner url", bannerUrl);
    console.log("store id", store[0].id);

    try {
      await db.insert(storeBanners).values({
        banner: bannerUrl,
        storeId: store[0].id,
      });
    } catch (error) {
      console.warn("error in create banner oRPC handler");
      console.error(error);
      throw new ORPCError("INTERNAL_SERVER_ERROR", {
        message: "Failed to create banner",
      });
    }

    return {
      message: "Banner created successfully",
    };
  });

export { createBanner };
