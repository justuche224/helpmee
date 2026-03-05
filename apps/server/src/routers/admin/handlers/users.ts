import { adminProcedure } from "@/lib/orpc";
import { ORPCError } from "@orpc/server";
import { db } from "@/db";
import { user } from "@/db/schema/auth";
import {
  store as storeTable,
  storeStatus,
  storeVerificationStatus,
} from "@/db/schema/store";
import { kyc as kycTable } from "@/db/schema/kyc";
import { z } from "zod";
import { eq, and, desc, asc, like, sql, or, ilike } from "drizzle-orm";

// Get all users with optional filtering and pagination
const getAllUsers = adminProcedure
  .input(
    z.object({
      limit: z.number().min(1).max(100).default(20),
      offset: z.number().min(0).default(0),
      role: z.enum(["USER", "ADMIN", "MODERATOR"]).optional(),
      kycVerified: z.boolean().optional(),
      emailVerified: z.boolean().optional(),
      search: z.string().optional(),
      sortBy: z
        .enum(["createdAt", "name", "email"])
        .default("createdAt"),
      sortOrder: z.enum(["asc", "desc"]).default("desc"),
    })
  )
  .handler(async ({ input }) => {
    try {
      let whereConditions = [];

      if (input.role) {
        whereConditions.push(eq(user.role, input.role));
      }

      if (input.kycVerified !== undefined) {
        whereConditions.push(eq(user.kycVerified, input.kycVerified));
      }

      if (input.emailVerified !== undefined) {
        whereConditions.push(eq(user.emailVerified, input.emailVerified));
      }

      if (input.search) {
        whereConditions.push(
          or(
            ilike(user.name, `%${input.search}%`),
            ilike(user.email, `%${input.search}%`),
          )
        );
      }

      const orderBy =
        input.sortOrder === "desc"
          ? desc(user[input.sortBy])
          : asc(user[input.sortBy]);

      const users = await db
        .select({
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          kycVerified: user.kycVerified,
          emailVerified: user.emailVerified,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt,
        })
        .from(user)
        .where(whereConditions.length > 0 ? and(...whereConditions) : undefined)
        .orderBy(orderBy)
        .limit(input.limit)
        .offset(input.offset);

      // Get total count for pagination
      const totalCount = await db
        .select({ count: sql<number>`count(*)` })
        .from(user)
        .where(
          whereConditions.length > 0 ? and(...whereConditions) : undefined
        );

      return {
        users,
        total: totalCount[0].count,
        limit: input.limit,
        offset: input.offset,
      };
    } catch (error) {
      console.warn("Failed to get all users");
      console.error(error);
      throw new ORPCError("GET_ALL_USERS_FAILED", {
        message: "Failed to get all users",
      });
    }
  });

// Get user by ID with full details including stores and KYC
const getUserById = adminProcedure
  .input(z.object({ id: z.string() }))
  .handler(async ({ input }) => {
    try {
      const userData = await db
        .select()
        .from(user)
        .where(eq(user.id, input.id));

      if (userData.length === 0) {
        throw new ORPCError("USER_NOT_FOUND", {
          message: "User not found",
        });
      }

      // Get user's stores
      const stores = await db
        .select({
          id: storeTable.id,
          name: storeTable.name,
          slug: storeTable.slug,
          status: storeTable.status,
          verificationStatus: storeTable.verificationStatus,
          createdAt: storeTable.createdAt,
        })
        .from(storeTable)
        .where(eq(storeTable.userId, input.id));

      // Get user's KYC
      const kyc = await db
        .select({
          id: kycTable.id,
          status: kycTable.status,
          name: kycTable.name,
          email: kycTable.email,
          phoneNumber: kycTable.phoneNumber,
          identificationType: kycTable.identificationType,
          identificationStatus: kycTable.identificationStatus,
          createdAt: kycTable.createdAt,
          updatedAt: kycTable.updatedAt,
        })
        .from(kycTable)
        .where(eq(kycTable.userId, input.id));

      return {
        ...userData[0],
        stores,
        kyc: kyc[0] || null,
      };
    } catch (error) {
      if (error instanceof ORPCError) throw error;
      console.warn("Failed to get user by ID");
      console.error(error);
      throw new ORPCError("GET_USER_BY_ID_FAILED", {
        message: "Failed to get user by ID",
      });
    }
  });

// Update user role
const updateUserRole = adminProcedure
  .input(
    z.object({
      id: z.string(),
      role: z.enum(["USER", "ADMIN", "MODERATOR"]),
      adminId: z.string(),
    })
  )
  .handler(async ({ input }) => {
    try {
      const result = await db
        .update(user)
        .set({
          role: input.role,
          updatedAt: new Date(),
        })
        .where(eq(user.id, input.id))
        .returning();

      if (result.length === 0) {
        throw new ORPCError("USER_NOT_FOUND", {
          message: "User not found",
        });
      }

      return { success: true, user: result[0] };
    } catch (error) {
      if (error instanceof ORPCError) throw error;
      console.warn("Failed to update user role");
      console.error(error);
      throw new ORPCError("UPDATE_USER_ROLE_FAILED", {
        message: "Failed to update user role",
      });
    }
  });

// Update user verification status
const updateUserVerification = adminProcedure
  .input(
    z.object({
      id: z.string(),
      kycVerified: z.boolean().optional(),
      emailVerified: z.boolean().optional(),
      adminId: z.string(),
    })
  )
  .handler(async ({ input }) => {
    try {
      const updateData: any = {
        updatedAt: new Date(),
      };

      if (input.kycVerified !== undefined) {
        updateData.kycVerified = input.kycVerified;
      }

      if (input.emailVerified !== undefined) {
        updateData.emailVerified = input.emailVerified;
      }

      const result = await db
        .update(user)
        .set(updateData)
        .where(eq(user.id, input.id))
        .returning();

      if (result.length === 0) {
        throw new ORPCError("USER_NOT_FOUND", {
          message: "User not found",
        });
      }

      return { success: true, user: result[0] };
    } catch (error) {
      if (error instanceof ORPCError) throw error;
      console.warn("Failed to update user verification");
      console.error(error);
      throw new ORPCError("UPDATE_USER_VERIFICATION_FAILED", {
        message: "Failed to update user verification",
      });
    }
  });

// Update user profile information
const updateUserProfile = adminProcedure
  .input(
    z.object({
      id: z.string(),
      name: z.string().optional(),
      email: z.string().email().optional(),
      adminId: z.string(),
    })
  )
  .handler(async ({ input }) => {
    try {
      const updateData: any = {
        updatedAt: new Date(),
      };

      if (input.name) updateData.name = input.name;
      if (input.email) updateData.email = input.email;

      const result = await db
        .update(user)
        .set(updateData)
        .where(eq(user.id, input.id))
        .returning();

      if (result.length === 0) {
        throw new ORPCError("USER_NOT_FOUND", {
          message: "User not found",
        });
      }

      return { success: true, user: result[0] };
    } catch (error) {
      if (error instanceof ORPCError) throw error;
      console.warn("Failed to update user profile");
      console.error(error);
      throw new ORPCError("UPDATE_USER_PROFILE_FAILED", {
        message: "Failed to update user profile",
      });
    }
  });

// Get users by role
const getUsersByRole = adminProcedure
  .input(z.object({ role: z.enum(["USER", "ADMIN", "MODERATOR"]) }))
  .handler(async ({ input }) => {
    try {
      const users = await db
        .select({
          id: user.id,
          name: user.name,
          email: user.email,
          kycVerified: user.kycVerified,
          emailVerified: user.emailVerified,
          createdAt: user.createdAt,
        })
        .from(user)
        .where(eq(user.role, input.role))
        .orderBy(desc(user.createdAt));

      return users;
    } catch (error) {
      console.warn("Failed to get users by role");
      console.error(error);
      throw new ORPCError("GET_USERS_BY_ROLE_FAILED", {
        message: "Failed to get users by role",
      });
    }
  });

// Get user statistics
const getUserStatistics = adminProcedure.handler(async () => {
  try {
    // Get role distribution
    const roleStats = await db
      .select({
        role: user.role,
        count: sql<number>`count(*)`,
      })
      .from(user)
      .groupBy(user.role);

    // Get verification stats
    const kycStats = await db
      .select({
        kycVerified: user.kycVerified,
        count: sql<number>`count(*)`,
      })
      .from(user)
      .groupBy(user.kycVerified);

    const emailStats = await db
      .select({
        emailVerified: user.emailVerified,
        count: sql<number>`count(*)`,
      })
      .from(user)
      .groupBy(user.emailVerified);

    // Get total users
    const totalUsers = await db
      .select({ count: sql<number>`count(*)` })
      .from(user);

    // Get recent users (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const recentUsers = await db
      .select({ count: sql<number>`count(*)` })
      .from(user)
      .where(sql`${user.createdAt} >= ${thirtyDaysAgo}`);

    return {
      total: totalUsers[0].count,
      recent: recentUsers[0].count,
      byRole: roleStats,
      byKycStatus: kycStats,
      byEmailStatus: emailStats,
    };
  } catch (error) {
    console.warn("Failed to get user statistics");
    console.error(error);
    throw new ORPCError("GET_USER_STATISTICS_FAILED", {
      message: "Failed to get user statistics",
    });
  }
});

// Get recent users
const getRecentUsers = adminProcedure
  .input(
    z.object({
      limit: z.number().min(1).max(100).default(20),
      days: z.number().min(1).max(365).default(30),
    })
  )
  .handler(async ({ input }) => {
    try {
      const dateThreshold = new Date();
      dateThreshold.setDate(dateThreshold.getDate() - input.days);

      const recentUsers = await db
        .select({
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          kycVerified: user.kycVerified,
          emailVerified: user.emailVerified,
          createdAt: user.createdAt,
        })
        .from(user)
        .where(sql`${user.createdAt} >= ${dateThreshold}`)
        .orderBy(desc(user.createdAt))
        .limit(input.limit);

      return recentUsers;
    } catch (error) {
      console.warn("Failed to get recent users");
      console.error(error);
      throw new ORPCError("GET_RECENT_USERS_FAILED", {
        message: "Failed to get recent users",
      });
    }
  });

// Get users with stores
const getUsersWithStores = adminProcedure
  .input(
    z.object({
      limit: z.number().min(1).max(100).default(20),
      offset: z.number().min(0).default(0),
      storeStatus: z
        .enum(["PENDING", "APPROVED", "REJECTED", "SUSPENDED"])
        .optional(),
    })
  )
  .handler(async ({ input }) => {
    try {
      let whereConditions = [];

      if (input.storeStatus) {
        whereConditions.push(eq(storeTable.status, input.storeStatus));
      }

      const usersWithStores = await db
        .select({
          user: {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            kycVerified: user.kycVerified,
          },
          store: {
            id: storeTable.id,
            name: storeTable.name,
            slug: storeTable.slug,
            status: storeTable.status,
            verificationStatus: storeTable.verificationStatus,
            createdAt: storeTable.createdAt,
          },
        })
        .from(storeTable)
        .leftJoin(user, eq(storeTable.userId, user.id))
        .where(whereConditions.length > 0 ? and(...whereConditions) : undefined)
        .orderBy(desc(storeTable.createdAt))
        .limit(input.limit)
        .offset(input.offset);

      return usersWithStores;
    } catch (error) {
      console.warn("Failed to get users with stores");
      console.error(error);
      throw new ORPCError("GET_USERS_WITH_STORES_FAILED", {
        message: "Failed to get users with stores",
      });
    }
  });

// Update user store status
const updateUserStoreStatus = adminProcedure
  .input(
    z.object({
      storeId: z.string(),
      status: z.enum(["PENDING", "APPROVED", "REJECTED", "SUSPENDED"]),
      verificationStatus: z
        .enum(["PENDING", "APPROVED", "REJECTED"])
        .optional(),
      adminId: z.string(),
    })
  )
  .handler(async ({ input }) => {
    try {
      const updateData: any = {
        status: input.status,
        updatedAt: new Date(),
      };

      if (input.verificationStatus) {
        updateData.verificationStatus = input.verificationStatus;
      }

      const result = await db
        .update(storeTable)
        .set(updateData)
        .where(eq(storeTable.id, input.storeId))
        .returning();

      if (result.length === 0) {
        throw new ORPCError("STORE_NOT_FOUND", {
          message: "Store not found",
        });
      }

      return { success: true, store: result[0] };
    } catch (error) {
      if (error instanceof ORPCError) throw error;
      console.warn("Failed to update user store status");
      console.error(error);
      throw new ORPCError("UPDATE_USER_STORE_STATUS_FAILED", {
        message: "Failed to update user store status",
      });
    }
  });

// Search users
const searchUsers = adminProcedure
  .input(
    z.object({
      query: z.string().min(1),
      limit: z.number().min(1).max(50).default(20),
    })
  )
  .handler(async ({ input }) => {
    try {
      const users = await db
        .select({
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          kycVerified: user.kycVerified,
          emailVerified: user.emailVerified,
          createdAt: user.createdAt,
        })
        .from(user)
        .where(
          or(
            ilike(user.name, `%${input.query}%`),
            ilike(user.email, `%${input.query}%`),
          )
        )
        .orderBy(desc(user.createdAt))
        .limit(input.limit);

      return users;
    } catch (error) {
      console.warn("Failed to search users");
      console.error(error);
      throw new ORPCError("SEARCH_USERS_FAILED", {
        message: "Failed to search users",
      });
    }
  });

export {
  getAllUsers,
  getUserById,
  updateUserRole,
  updateUserVerification,
  updateUserProfile,
  getUsersByRole,
  getUserStatistics,
  getRecentUsers,
  getUsersWithStores,
  updateUserStoreStatus,
  searchUsers,
};
