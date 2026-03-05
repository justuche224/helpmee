// @ts-nocheck
import * as React from "react";
import { Button, Heading, Text, Section, Hr } from "@react-email/components";
import { BaseEmailTemplate } from "../base-template";

interface PasswordResetEmailProps {
  resetUrl: string;
  companyName: string;
  brandColor?: string;
  logoUrl?: string;
  logoAlt?: string;
}

export const PasswordResetEmail: React.FC<PasswordResetEmailProps> = ({
  resetUrl,
  companyName,
  brandColor = "#007bff",
  logoUrl,
  logoAlt,
}) => {
  const title = "Reset Your Password";
  const preheader = `Use this link to reset your password for ${companyName}. Link expires soon.`;

  return React.createElement(
    BaseEmailTemplate,
    {
      title,
      preheader,
      brandColor,
      logoUrl,
      logoAlt,
      companyName,
    },
    React.createElement(
      Heading,
      {
        style: {
          margin: "0 0 20px 0",
          fontSize: "24px",
          lineHeight: "1.3",
          color: "#333333",
          fontWeight: "normal",
        },
      },
      "Reset Your Password"
    ),

    React.createElement(Text, null, "Hi there,"),

    React.createElement(
      Text,
      null,
      `We received a request to reset the password for your ${companyName} account. You can do this by clicking the button below.`
    ),

    React.createElement(
      Section,
      { style: { margin: "30px 0", textAlign: "center" } },
      React.createElement(
        Button,
        {
          href: resetUrl,
          style: {
            backgroundColor: brandColor,
            borderRadius: "5px",
            color: "#ffffff",
            fontSize: "15px",
            fontWeight: "bold",
            textDecoration: "none",
            textAlign: "center",
            display: "inline-block",
            padding: "12px 25px",
            border: `1px solid ${brandColor}`,
          },
        },
        "Reset Password"
      )
    ),

    React.createElement(
      Text,
      null,
      "This password reset link is only valid for the next ",
      React.createElement("strong", null, "30 minutes"),
      "."
    ),

    React.createElement(
      Text,
      null,
      "If you didn't request a password reset, you don't need to do anything. Just ignore this email."
    ),

    React.createElement(Hr, {
      style: {
        border: "0",
        borderTop: "1px solid #eaeaea",
        margin: "30px 0",
      },
    }),

    React.createElement(
      Text,
      { style: { fontSize: "13px", color: "#888888" } },
      "If the button doesn't work, copy and paste this link into your browser:"
    ),

    React.createElement(
      Text,
      {
        style: {
          fontSize: "13px",
          color: "#888888",
          wordBreak: "break-all",
        },
      },
      resetUrl
    )
  );
};
