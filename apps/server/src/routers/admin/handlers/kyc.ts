import { adminProcedure } from "@/lib/orpc";
import { ORPCError } from "@orpc/server";
import { db } from "@/db";
import { kyc as kycTable, bvn as bvnTable } from "@/db/schema/kyc";
import { user } from "@/db/schema/auth";
import { z } from "zod";
import { eq, desc, sql } from "drizzle-orm";

const getAllKyc = adminProcedure.handler(async () => {
  try {
    const kyc = await db.select().from(kycTable);
    return kyc;
  } catch (error) {
    console.warn("Failed to get all KYC");
    console.error(error);
    throw new ORPCError("GET_ALL_KYC_FAILED", {
      message: "Failed to get all KYC",
    });
  }
});

const getKycById = adminProcedure
  .input(z.object({ id: z.string() }))
  .handler(async ({ input }) => {
    try {
      const kyc = await db
        .select()
        .from(kycTable)
        .where(eq(kycTable.id, input.id));
      return kyc;
    } catch (error) {
      console.warn("Failed to get KYC by ID");
      console.error(error);
      throw new ORPCError("GET_KYC_BY_ID_FAILED", {
        message: "Failed to get KYC by ID",
      });
    }
  });

const getPendingKyc = adminProcedure.handler(async () => {
  try {
    const pendingKyc = await db
      .select()
      .from(kycTable)
      .where(eq(kycTable.status, "PENDING"))
      .orderBy(desc(kycTable.createdAt));
    return pendingKyc;
  } catch (error) {
    console.warn("Failed to get pending KYC");
    console.error(error);
    throw new ORPCError("GET_PENDING_KYC_FAILED", {
      message: "Failed to get pending KYC",
    });
  }
});

const getKycWithUserDetails = adminProcedure
  .input(z.object({ id: z.string() }))
  .handler(async ({ input }) => {
    try {
      const kycWithUser = await db
        .select({
          kyc: kycTable,
          user: {
            id: user.id,
            name: user.name,
            email: user.email,
            kycVerified: user.kycVerified,
          },
        })
        .from(kycTable)
        .leftJoin(user, eq(kycTable.userId, user.id))
        .where(eq(kycTable.id, input.id));

      if (kycWithUser.length === 0) {
        throw new ORPCError("KYC_NOT_FOUND", {
          message: "KYC record not found",
        });
      }

      return kycWithUser[0];
    } catch (error) {
      if (error instanceof ORPCError) throw error;
      console.warn("Failed to get KYC with user details");
      console.error(error);
      throw new ORPCError("GET_KYC_WITH_USER_FAILED", {
        message: "Failed to get KYC with user details",
      });
    }
  });

const approveKyc = adminProcedure
  .input(
    z.object({
      id: z.string(),
      adminId: z.string(),
    })
  )
  .handler(async ({ input }) => {
    try {
      const result = await db
        .update(kycTable)
        .set({
          status: "APPROVED",
          identificationStatus: "APPROVED",
          updatedAt: new Date(),
        })
        .where(eq(kycTable.id, input.id))
        .returning();

      if (result.length === 0) {
        throw new ORPCError("KYC_NOT_FOUND", {
          message: "KYC record not found",
        });
      }

      await db
        .update(user)
        .set({
          kycVerified: true,
          updatedAt: new Date(),
        })
        .where(eq(user.id, result[0].userId));

      return { success: true, kyc: result[0] };
    } catch (error) {
      if (error instanceof ORPCError) throw error;
      console.warn("Failed to approve KYC");
      console.error(error);
      throw new ORPCError("APPROVE_KYC_FAILED", {
        message: "Failed to approve KYC",
      });
    }
  });

const rejectKyc = adminProcedure
  .input(
    z.object({
      id: z.string(),
      rejectionReason: z.string().min(1, "Rejection reason is required"),
      adminId: z.string(),
    })
  )
  .handler(async ({ input }) => {
    try {
      const result = await db
        .update(kycTable)
        .set({
          status: "REJECTED",
          identificationStatus: "REJECTED",
          identificationRejectionReason: input.rejectionReason,
          identificationRejectionDate: new Date(),
          identificationRejectionBy: input.adminId,
          updatedAt: new Date(),
        })
        .where(eq(kycTable.id, input.id))
        .returning();

      if (result.length === 0) {
        throw new ORPCError("KYC_NOT_FOUND", {
          message: "KYC record not found",
        });
      }

      return { success: true, kyc: result[0] };
    } catch (error) {
      if (error instanceof ORPCError) throw error;
      console.warn("Failed to reject KYC");
      console.error(error);
      throw new ORPCError("REJECT_KYC_FAILED", {
        message: "Failed to reject KYC",
      });
    }
  });

const updateKycIdentificationStatus = adminProcedure
  .input(
    z.object({
      id: z.string(),
      status: z.enum(["APPROVED", "REJECTED", "PENDING"]),
      rejectionReason: z.string().optional(),
      adminId: z.string(),
    })
  )
  .handler(async ({ input }) => {
    try {
      const updateData: any = {
        identificationStatus: input.status,
        updatedAt: new Date(),
      };

      if (input.status === "REJECTED") {
        updateData.identificationRejectionReason = input.rejectionReason;
        updateData.identificationRejectionDate = new Date();
        updateData.identificationRejectionBy = input.adminId;
      } else if (input.status === "APPROVED") {
        updateData.identificationRejectionReason = null;
        updateData.identificationRejectionDate = null;
        updateData.identificationRejectionBy = null;
      }

      const result = await db
        .update(kycTable)
        .set(updateData)
        .where(eq(kycTable.id, input.id))
        .returning();

      if (result.length === 0) {
        throw new ORPCError("KYC_NOT_FOUND", {
          message: "KYC record not found",
        });
      }

      if (input.status === "APPROVED") {
        await db
          .update(user)
          .set({
            kycVerified: true,
            updatedAt: new Date(),
          })
          .where(eq(user.id, result[0].userId));
      }

      return { success: true, kyc: result[0] };
    } catch (error) {
      if (error instanceof ORPCError) throw error;
      console.warn("Failed to update KYC identification status");
      console.error(error);
      throw new ORPCError("UPDATE_KYC_IDENTIFICATION_FAILED", {
        message: "Failed to update KYC identification status",
      });
    }
  });

const getKycStatistics = adminProcedure.handler(async () => {
  try {
    const stats = await db
      .select({
        status: kycTable.status,
        count: sql<number>`count(*)`,
      })
      .from(kycTable)
      .groupBy(kycTable.status);

    const total = stats.reduce((sum, stat) => sum + stat.count, 0);

    return {
      total,
      byStatus: stats,
      pending: stats.find((s) => s.status === "PENDING")?.count || 0,
      approved: stats.find((s) => s.status === "APPROVED")?.count || 0,
      rejected: stats.find((s) => s.status === "REJECTED")?.count || 0,
    };
  } catch (error) {
    console.warn("Failed to get KYC statistics");
    console.error(error);
    throw new ORPCError("GET_KYC_STATISTICS_FAILED", {
      message: "Failed to get KYC statistics",
    });
  }
});

const getKycByUserId = adminProcedure
  .input(z.object({ userId: z.string() }))
  .handler(async ({ input }) => {
    try {
      const kyc = await db
        .select()
        .from(kycTable)
        .where(eq(kycTable.userId, input.userId));
      return kyc;
    } catch (error) {
      console.warn("Failed to get KYC by user ID");
      console.error(error);
      throw new ORPCError("GET_KYC_BY_USER_ID_FAILED", {
        message: "Failed to get KYC by user ID",
      });
    }
  });

const getAllBvn = adminProcedure.handler(async () => {
  try {
    const bvns = await db
      .select({
        bvn: bvnTable,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
        },
      })
      .from(bvnTable)
      .leftJoin(user, eq(bvnTable.userId, user.id));
    return bvns;
  } catch (error) {
    console.warn("Failed to get all BVN");
    console.error(error);
    throw new ORPCError("GET_ALL_BVN_FAILED", {
      message: "Failed to get all BVN",
    });
  }
});

const approveBvn = adminProcedure
  .input(
    z.object({
      id: z.string(),
      adminId: z.string(),
    })
  )
  .handler(async ({ input }) => {
    try {
      const result = await db
        .update(bvnTable)
        .set({
          bvnStatus: "APPROVED",
          updatedAt: new Date(),
        })
        .where(eq(bvnTable.id, input.id))
        .returning();

      if (result.length === 0) {
        throw new ORPCError("BVN_NOT_FOUND", {
          message: "BVN record not found",
        });
      }

      return { success: true, bvn: result[0] };
    } catch (error) {
      if (error instanceof ORPCError) throw error;
      console.warn("Failed to approve BVN");
      console.error(error);
      throw new ORPCError("APPROVE_BVN_FAILED", {
        message: "Failed to approve BVN",
      });
    }
  });

const rejectBvn = adminProcedure
  .input(
    z.object({
      id: z.string(),
      rejectionReason: z.string().min(1, "Rejection reason is required"),
      adminId: z.string(),
    })
  )
  .handler(async ({ input }) => {
    try {
      const result = await db
        .update(bvnTable)
        .set({
          bvnStatus: "REJECTED",
          bvnRejectionReason: input.rejectionReason,
          bvnRejectionDate: new Date(),
          bvnRejectionBy: input.adminId,
          updatedAt: new Date(),
        })
        .where(eq(bvnTable.id, input.id))
        .returning();

      if (result.length === 0) {
        throw new ORPCError("BVN_NOT_FOUND", {
          message: "BVN record not found",
        });
      }

      return { success: true, bvn: result[0] };
    } catch (error) {
      if (error instanceof ORPCError) throw error;
      console.warn("Failed to reject BVN");
      console.error(error);
      throw new ORPCError("REJECT_BVN_FAILED", {
        message: "Failed to reject BVN",
      });
    }
  });

export {
  getAllKyc,
  getKycById,
  getPendingKyc,
  getKycWithUserDetails,
  approveKyc,
  rejectKyc,
  updateKycIdentificationStatus,
  getKycStatistics,
  getKycByUserId,
  getAllBvn,
  approveBvn,
  rejectBvn,
};
