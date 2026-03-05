import nodemailer from "nodemailer";
import type { MailOptions } from "@/types/mail.types.js";
import { info } from "@/constants";
import { render } from "@react-email/components";
import { PasswordResetEmail } from "./templates/password-reset";
import { EmailVerificationTemplate } from "./templates/email-verification";

/**
 * Mail service for sending emails
 */
class MailService {
  private transporter!: nodemailer.Transporter;

  constructor() {
    this.initializeTransporter();
  }

  /**
   * Initialize the nodemailer transporter
   */
  // private initializeTransporter() {
  //   console.log("initializing mail transporter....");
  //   this.transporter = nodemailer.createTransport({
  //     service: "gmail",
  //     auth: {
  //       user: process.env.MAILER_EMAIL,
  //       pass: process.env.MAILER_PASSWORD,
  //     },
  //     logger: process.env.NODE_ENV !== "production",
  //     debug: process.env.NODE_ENV !== "production",
  //   });
  // }
  private initializeTransporter() {
    this.transporter = nodemailer.createTransport({
      host: process.env.MAILER_HOST,
      port: Number(process.env.MAILER_PORT),
      secure: true,
      auth: {
        user: process.env.MAILER_EMAIL,
        pass: process.env.MAILER_PASSWORD,
      },
      logger: process.env.NODE_ENV !== "production",
      debug: process.env.NODE_ENV !== "production",
    });
  }

  /**
   * Send an email
   */
  async sendMail({ to, subject, text, html }: MailOptions): Promise<void> {
    const mailOptions = {
      from: `"${info.name}" <${process.env.MAILER_EMAIL}>`,
      to,
      subject,
      text,
      html,
    };

    try {
      await this.transporter.sendMail(mailOptions);
      console.log(`Email sent successfully to ${to}`);
    } catch (error) {
      console.error("Failed to send email:", error);
      if (error instanceof Error) {
        throw new Error(`Failed to send email: ${error.message}`);
      }
      throw new Error("Failed to send email due to an unknown error.");
    }
  }

  /**
   * Send password reset email
   */
  async sendPasswordResetEmail(email: string, resetUrl: string): Promise<void> {
    const subject = `Reset Your ${info.name} Password`;

    const html = await render(
      // @ts-ignore - React Email render function has type issues with current setup
      PasswordResetEmail({
        resetUrl,
        companyName: info.name,
        brandColor: info.brandColor,
        logoUrl: info.logoUrl,
        logoAlt: `${info.name} Logo`,
      })
    );
    const text = `Hi there,\n\nYou requested a password reset for your ${info.name} account. Click the link below (or copy and paste it into your browser) to set a new password. This link will expire in 30 minutes.\n\n${resetUrl}\n\nIf you didn't request this, please ignore this email.\n\nThanks,\nThe ${info.name} Team`;

    await this.sendMail({
      to: email,
      subject,
      text,
      html,
    });
  }

  /**
   * Send email verification
   */
  async sendVerificationEmail(
    email: string,
    verificationUrl: string
  ): Promise<void> {
    const subject = `Verify Your Email for ${info.name}`;

    const html = await render(
      // @ts-ignore - React Email render function has type issues with current setup
      EmailVerificationTemplate({
        verificationUrl,
        companyName: info.name,
        brandColor: info.brandColor,
        logoUrl: info.logoUrl,
        logoAlt: `${info.name} Logo`,
      })
    );
    const text = `Welcome to ${info.name}!\n\nTo finish setting up your account, please verify your email address by clicking the link below (or copy and paste it into your browser):\n\n${verificationUrl}\n\nThanks for joining!\nThe ${info.name} Team`;

    // fire off without waitihng
    this.sendMail({
      to: email,
      subject,
      text,
      html,
    });
  }
}

export const mailService = new MailService();
