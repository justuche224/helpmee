// @ts-nocheck
import * as React from "react";
import {
  Button,
  Html,
  Head,
  Body,
  Container,
  Heading,
  Text,
  Section,
  Hr,
  Link,
} from "@react-email/components";

interface BaseEmailProps {
  title: string;
  preheader: string;
  children: React.ReactNode;
  brandColor?: string;
  logoUrl?: string;
  logoAlt?: string;
  companyName?: string;
}

export const BaseEmailTemplate: React.FC<BaseEmailProps> = ({
  title,
  preheader,
  children,
  brandColor = "#007bff",
  logoUrl = "https://via.placeholder.com/150x50?text=YourLogo",
  logoAlt = "Logo",
  companyName = "Helpmee",
}) => {
  const currentYear = new Date().getFullYear();

  return React.createElement(
    Html,
    { lang: "en" },
    React.createElement(
      Head,
      null,
      React.createElement("title", null, title),
      React.createElement("meta", { name: "description", content: preheader })
    ),
    React.createElement(
      Body,
      {
        style: {
          backgroundColor: "#f4f4f4",
          fontFamily: "Helvetica Neue, Helvetica, Arial, sans-serif",
          margin: 0,
          padding: 0,
        },
      },
      React.createElement(
        "div",
        {
          style: {
            display: "none",
            fontSize: "1px",
            lineHeight: "1px",
            maxHeight: "0px",
            maxWidth: "0px",
            opacity: 0,
            overflow: "hidden",
          },
        },
        preheader
      ),

      React.createElement(
        Container,
        {
          style: {
            backgroundColor: "#ffffff",
            maxWidth: "600px",
            margin: "0 auto",
          },
        },
        React.createElement(
          Section,
          { style: { padding: "20px", textAlign: "center" } },
          React.createElement("img", {
            src: logoUrl,
            width: "150",
            alt: logoAlt,
            style: {
              height: "auto",
              backgroundColor: "#dddddd",
              fontSize: "15px",
              lineHeight: "15px",
              color: "#555555",
            },
          })
        ),

        React.createElement(
          Section,
          {
            style: {
              padding: "20px 40px 40px 40px",
              fontSize: "15px",
              lineHeight: "1.6",
              color: "#555555",
            },
          },
          children
        ),

        React.createElement(
          Section,
          {
            style: {
              padding: "20px 40px",
              fontSize: "12px",
              lineHeight: "1.5",
              textAlign: "center",
              color: "#888888",
            },
          },
          React.createElement(
            Text,
            { style: { margin: "0 0 5px 0" } },
            companyName
          ),
          React.createElement(
            Text,
            { style: { margin: "0 0 5px 0" } },
            "123 App Street, Suite 100, City, State 12345"
          ),
          React.createElement(
            Text,
            { style: { margin: 0 } },
            `© ${currentYear} ${companyName}. All rights reserved.`
          )
        )
      )
    )
  );
};
