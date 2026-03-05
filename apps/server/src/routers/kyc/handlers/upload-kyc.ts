import { protectedProcedure } from "@/lib/orpc";
import { z } from "zod";
import { identificationType } from "@/db/schema/kyc";
import { uploadFile } from "@/lib/uploadthing/upload-file";
import { ORPCError } from "@orpc/client";
import { db } from "@/db";
import { bvn, kyc } from "@/db/schema/kyc";

const base64ToFile = (base64String: string, fileName: string): File => {
  const base64Data = base64String.replace(/^data:.*?;base64,/, "");
  const buffer = Buffer.from(base64Data, "base64");
  const file = new File([buffer], fileName, { type: "image/png" });
  return file;
};

const schema = z.object({
  name: z.string(),
  phoneNumber: z.string(),
  email: z.email(),
  identificationType: z.enum(identificationType.enumValues),
  identificationNumber: z.string(),
  identificationFrontImage: z.string(),
  identificationBackImage: z.string(),
  identificationSelfie: z.string(),
  bvn: z.string(),
});

const uploadKYC = protectedProcedure
  .input(schema)
  .handler(async ({ input, context }) => {
    console.log("hit");
    const {
      name,
      phoneNumber,
      email,
      identificationType,
      identificationNumber,
      identificationFrontImage,
      identificationBackImage,
      identificationSelfie,
      bvn: bvnNumber,
    } = input;

    const userId = context.session.user.id;

    try {
      const identificationFrontImageFile = base64ToFile(
        identificationFrontImage,
        `identification-front-${Date.now()}.png`
      );
      const identificationBackImageFile = base64ToFile(
        identificationBackImage,
        `identification-back-${Date.now()}.png`
      );
      const identificationSelfieFile = base64ToFile(
        identificationSelfie,
        `identification-selfie-${Date.now()}.png`
      );

      const identificationFrontImageUrl = await uploadFile(
        identificationFrontImageFile,
        "identification_front_image",
        userId
      );
      const identificationBackImageUrl = await uploadFile(
        identificationBackImageFile,
        "identification_back_image",
        userId
      );
      const identificationSelfieUrl = await uploadFile(
        identificationSelfieFile,
        "identification_selfie",
        userId
      );

      await db.insert(kyc).values({
        userId,
        name,
        phoneNumber,
        email,
        identificationType,
        identificationNumber,
        identificationFrontImage: identificationFrontImageUrl,
        identificationBackImage: identificationBackImageUrl,
        identificationSelfie: identificationSelfieUrl,
        identificationStatus: "PENDING",
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      await db.insert(bvn).values({
        userId,
        bvn: bvnNumber,
        bvnStatus: "PENDING",
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      return {
        message: "KYC uploaded successfully",
      };
    } catch (error) {
      throw new ORPCError("INTERNAL_SERVER_ERROR", {
        message: "Failed to upload KYC",
      });
    }
  });

export { uploadKYC };
