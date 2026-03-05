import { protectedProcedure } from "@/lib/orpc";
import { db } from "@/db";
import { user as userTable } from "@/db/schema/auth";
import { eq } from "drizzle-orm";
import { z } from "zod";

const getUserGender = protectedProcedure.handler(async ({ context }) => {
  const userId = context.session.user.id;
  const user = await db
    .select({
      gender: userTable.gender,
    })
    .from(userTable)
    .where(eq(userTable.id, userId))
    .limit(1);
  return user;
});

const updateUserGender = protectedProcedure
  .input(
    z.object({
      gender: z.enum(["MALE", "FEMALE"]),
    })
  )
  .handler(async ({ context, input }) => {
    const userId = context.session.user.id;
    const { gender } = input;
    await db.update(userTable).set({ gender }).where(eq(userTable.id, userId));
    return { success: true };
  });

export { getUserGender, updateUserGender };
