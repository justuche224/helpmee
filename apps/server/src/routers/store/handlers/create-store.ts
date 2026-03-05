import { protectedProcedure } from "@/lib/orpc";
import { z } from "zod";
import { db } from "@/db";
import {
  kyc,
  storeCategory,
  store as storeTable,
  storeTemplate,
  storeTier,
} from "@/db/schema";
import { uploadFile } from "@/lib/uploadthing/upload-file";
import { eq } from "drizzle-orm";
import { ORPCError } from "@orpc/server";

const createStoreSchema = z.object({
  name: z.string().min(1, "Store name is required"),
  ownerName: z.string().min(1, "Owner name is required"),
  phoneNumber: z.string().min(1, "Phone number is required"),
  country: z.string().min(1, "Country is required"),
  state: z.string().min(1, "State is required"),
  zipCode: z.string().min(1, "Zip code is required"),
  address: z.string().min(1, "Address is required"),
  businessRegistration: z.string().optional(),
  description: z.string().min(1, "Description is required"),
  categoryId: z.string().min(1, "Category is required"),
  templateId: z.string(),
});

const createStore = protectedProcedure
  .input(createStoreSchema)
  .handler(async ({ input, context }) => {
    const userId = context.session.user.id;
    const {
      name,
      ownerName,
      phoneNumber,
      country,
      state,
      zipCode,
      address,
      businessRegistration,
      description,
      categoryId,
      templateId,
    } = input;

    console.log(categoryId);

    try {
      const userKYC = await db
        .select({
          id: kyc.id,
          status: kyc.status,
        })
        .from(kyc)
        .where(eq(kyc.userId, userId))
        .limit(1);

      if (
        (!userKYC || userKYC[0].status !== "APPROVED") &&
        context.session.user.role !== "ADMIN"
      ) {
        throw new ORPCError("UNAUTHORIZED", {
          message:
            "User KYC is not verified. Please complete your KYC to create a store",
        });
      }

      let businessRegistrationUrl: string | undefined;

      if (businessRegistration) {
        console.log("business reg provided");
        try {
          const base64Data = businessRegistration.replace(
            /^data:.*?;base64,/,
            ""
          );
          const buffer = Buffer.from(base64Data, "base64");

          const fileName = `business-registration-${Date.now()}.png`;
          const file = new File([buffer], fileName, {
            type: "image/png",
          });

          businessRegistrationUrl = await uploadFile(
            file,
            "businessRegistration",
            userId
          );
          console.log("business reg uploaded");
        } catch (error) {
          console.warn("error in business registration upload");
          console.error(error);
          throw new Error("Failed to upload business registration file");
        }
      }

      let storeSlug: string;

      const slug = name
        .toLowerCase()
        .replace(/\s+/g, "-")
        .replace(/[^a-z0-9-]/g, "");

      const slugExists = await db
        .select({ id: storeTable.id })
        .from(storeTable)
        .where(eq(storeTable.slug, slug));

      if (slugExists.length > 0) {
        storeSlug = `${slug}-${crypto.randomUUID().slice(0, 4)}`;
      } else {
        storeSlug = slug;
      }

      const category = await db
        .select({ id: storeCategory.id })
        .from(storeCategory)
        .where(eq(storeCategory.id, categoryId));

      console.log("category", category);

      if (!category || category.length === 0) {
        throw new ORPCError("BAD_REQUEST", {
          message: "Invalid category",
        });
      }

      // get the SILVER tier id (this is the default tier for all stores)
      const silverTierRes = await db
        .select({ id: storeTier.id })
        .from(storeTier)
        .where(eq(storeTier.identifier, "SILVER"))
        .limit(1);

      if (!silverTierRes || silverTierRes.length === 0) {
        throw new ORPCError("INTERNAL_SERVER_ERROR", {
          message:
            "SILVER tier does not exist. Please contact the support team.",
        });
      }

      const silverTierId = silverTierRes[0].id;

      const templateRes = await db
        .select({
          id: storeTemplate.id,
          tierId: storeTemplate.tierId,
          tierIdentifier: storeTier.identifier,
        })
        .from(storeTemplate)
        .leftJoin(storeTier, eq(storeTemplate.tierId, storeTier.id))
        .where(eq(storeTemplate.id, templateId))
        .limit(1);

      if (!templateRes || templateRes.length === 0) {
        throw new ORPCError("BAD_REQUEST", {
          message: "Invalid template",
        });
      }

      // !!IMPORTANT: require that the chosen template belongs to the SILVER tier
      if (templateRes[0].tierIdentifier !== "SILVER") {
        throw new ORPCError("BAD_REQUEST", {
          message:
            "Invalid template: to get started, please select a SILVER tier template. You can upgrade your tier later to choose a different template.",
        });
      }

      const inserted = await db.insert(storeTable).values({
        userId,
        name,
        slug: storeSlug,
        ownerName,
        phoneNumber,
        country,
        state,
        zipCode,
        address,
        businessRegistration: businessRegistrationUrl,
        description,
        categoryId,
        tierId: silverTierId,
        templateId,
      });
    } catch (error) {
      console.warn("error in create store oRPC handler");
      console.error(error);
      throw new ORPCError("INTERNAL_SERVER_ERROR", {
        message: "Failed to create store",
      });
    }
  });

export { createStore };
