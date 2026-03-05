import { Hono } from "hono";
import { auth } from "../../lib/auth";
import {
  getErrorPageHTML,
  getResetPasswordFormHTML,
  getSuccessPageHTML,
} from "../../templates/password-reset-html";

const authRoutes = new Hono();

// GET /v1/auth/reset-password - Show reset password form
authRoutes.get("/reset-password", (c) => {
  const token = c.req.query("token");
  const error = c.req.query("error");

  if (error) {
    return c.html(
      getErrorPageHTML(
        "Reset Link Expired",
        "The password reset link has expired or is invalid. Please request a new password reset link."
      )
    );
  }

  if (!token) {
    return c.html(
      getErrorPageHTML(
        "Invalid Reset Link",
        "The password reset link is missing or invalid. Please request a new password reset link."
      )
    );
  }

  return c.html(getResetPasswordFormHTML(token));
});

// POST /v1/auth/reset-password - Handle password reset
authRoutes.post("/reset-password", async (c) => {
  try {
    const { newPassword, token } = await c.req.json();

    if (!newPassword || !token) {
      return c.json(
        { success: false, message: "Password and token are required" },
        400
      );
    }

    if (newPassword.length < 6) {
      return c.json(
        { success: false, message: "Password must be at least 6 characters" },
        400
      );
    }

    const result = await auth.api.resetPassword({
      body: { newPassword, token },
    });

    if (!result) {
      return c.json(
        { success: false, message: "Failed to reset password" },
        400
      );
    }

    return c.json({ success: true, message: "Password reset successfully" });
  } catch (error) {
    console.error("Password reset error:", error);
    return c.json(
      {
        success: false,
        message:
          error instanceof Error ? error.message : "Failed to reset password",
      },
      500
    );
  }
});

// GET /v1/auth/reset-password/success - Show success page
authRoutes.get("/reset-password/success", (c) => {
  return c.html(
    getSuccessPageHTML({
      heading: "Password Reset Successful",
      message:
        "Your password has been successfully reset. You can now sign in with your new password.",
      helpLink: "https://helpmee.com/help",
    })
  );
});

// GET /v1/auth/email-verificatied - Show email verification success page
authRoutes.get("/email-verificatied", (c) => {
  return c.html(
    getSuccessPageHTML({
      heading: "Email Verification Successful",
      message:
        "Your email has been successfully verified. You can now sign in with your new email.",
      helpLink: "https://helpmee.com/help",
    })
  );
});

export { authRoutes };
