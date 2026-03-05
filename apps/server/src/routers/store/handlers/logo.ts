import { db } from "@/db";
import { eq, and } from "drizzle-orm";
import { protectedProcedure } from "@/lib/orpc";
import { z } from "zod";
import { store as storeTable, storeExtraDetails } from "@/db/schema";
import { ORPCError } from "@orpc/server";
import { uploadFile } from "@/lib/uploadthing/upload-file";

const uploadLogo = protectedProcedure
  .input(
    z.object({
      logo: z.string(),
      storeId: z.string(),
    })
  )
  .handler(async ({ context, input }) => {
    const { logo, storeId } = input;

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

    let logoUrl: string;

    try {
      const base64Data = logo.replace(/^data:.*?;base64,/, "");
      const buffer = Buffer.from(base64Data, "base64");

      const fileName = `logo-${Date.now()}.png`;
      const file = new File([buffer], fileName, {
        type: "image/png",
      });

      logoUrl = await uploadFile(file, "logo", store[0].id);
    } catch (error) {
      throw new Error("Failed to upload logo");
    }

    const storeExtraDetailsRecord = await db
      .select()
      .from(storeExtraDetails)
      .where(eq(storeExtraDetails.storeId, store[0].id));

    if (storeExtraDetailsRecord.length > 0) {
      await db
        .update(storeExtraDetails)
        .set({
          logo: logoUrl,
        })
        .where(eq(storeExtraDetails.storeId, store[0].id));
    } else {
      await db.insert(storeExtraDetails).values({
        storeId: store[0].id,
        logo: logoUrl,
      });
    }

    return {
      message: "Logo uploaded successfully",
    };
  });

export { uploadLogo };
