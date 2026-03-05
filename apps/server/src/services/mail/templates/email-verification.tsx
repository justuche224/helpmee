// @ts-nocheck
import * as React from "react";
import { Button, Heading, Text, Section, Hr } from "@react-email/components";
import { BaseEmailTemplate } from "../base-template";

interface EmailVerificationProps {
  verificationUrl: string;
  companyName: string;
  brandColor?: string;
  logoUrl?: string;
  logoAlt?: string;
}

export const EmailVerificationTemplate: React.FC<EmailVerificationProps> = ({
  verificationUrl,
  companyName,
  brandColor = "#007bff",
  logoUrl,
  logoAlt,
}) => {
  const title = "Verify Your Email Address";
  const preheader = `Welcome to ${companyName}! Click here to verify your email and get started.`;

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
      `Welcome to ${companyName}!`
    ),

    React.createElement(Text, null, "Hi there,"),

    React.createElement(
      Text,
      null,
      "Thanks for signing up! We're excited to have you."
    ),

    React.createElement(
      Text,
      null,
      "Please click the button below to verify your email address and complete your registration:"
    ),

    React.createElement(
      Section,
      { style: { margin: "30px 0", textAlign: "center" } },
      React.createElement(
        Button,
        {
          href: verificationUrl,
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
        "Verify Email Address"
      )
    ),

    React.createElement(
      Text,
      null,
      `Once verified, you can start exploring all that ${companyName} has to offer.`
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
      verificationUrl
    )
  );
};
