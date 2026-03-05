import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { expo } from "@better-auth/expo";
import { db } from "../db";
import * as schema from "../db/schema/auth";
import { mailService } from "@/services/mail";

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "pg",
    schema: schema,
  }),
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
    },
  },
  trustedOrigins: [process.env.CORS_ORIGIN || "", "helpmee://"],
  baseURL: process.env.BETTER_AUTH_URL,
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: true,
    sendResetPassword: async ({ user, url, token }) => {
      console.log("Reset URL:", url);
      await mailService.sendPasswordResetEmail(user.email, url);
    },
  },
  emailVerification: {
    autoSignInAfterVerification: false,
    sendVerificationEmail: async ({ user, url, token }) => {
      console.log("Verification URL:", url);
      await mailService.sendVerificationEmail(user.email, url);
    },
  },
  user: {
    additionalFields: {
      role: {
        type: "string",
        default: "USER",
        enum: ["USER", "ADMIN", "MODERATOR"],
      },
    },
  },
  session: {
    expiresIn: 60 * 60 * 24 * 7, // 7 days
    updateAge: 60 * 60 * 24, // 1 day
  },
  advanced: {
    defaultCookieAttributes: {
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      secure: process.env.NODE_ENV === "production",
      httpOnly: true,
    },
  },
  plugins: [expo()],
});
