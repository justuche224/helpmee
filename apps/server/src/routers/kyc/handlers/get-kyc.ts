import { protectedProcedure } from "@/lib/orpc";
import { db } from "@/db";
import { eq } from "drizzle-orm";
import { bvn, kyc } from "@/db/schema/kyc";

const getUserKYC = protectedProcedure.handler(async ({ context }) => {
  const userId = context.session.user.id;
  const kycData = await db.select().from(kyc).where(eq(kyc.userId, userId)).limit(1);

  const bvnData = await db.select().from(bvn).where(eq(bvn.userId, userId)).limit(1);
  return {
    kycData: kycData[0] || undefined,
    bvnData: bvnData[0] || undefined
  };
});

export { getUserKYC };
