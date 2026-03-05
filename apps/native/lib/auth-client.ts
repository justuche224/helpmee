import { createAuthClient } from "better-auth/react";
import { expoClient } from "@better-auth/expo/client";
import * as SecureStore from "expo-secure-store";

// Function to clear stored session token
export const clearStoredSession = async () => {
  await SecureStore.deleteItemAsync("helpmee_session_token");
};

// Function to get stored session token
export const getStoredSessionToken = async () => {
  return await SecureStore.getItemAsync("helpmee_session_token");
};

export const authClient = createAuthClient({
  baseURL: process.env.EXPO_PUBLIC_SERVER_URL,
  plugins: [
    expoClient({
      scheme: "helpmee",
      storagePrefix: "helpmee",
      storage: SecureStore,
    })
  ],
  fetchOptions: {
    onRequest: async (context) => {
      console.log("Auth request:", context.url);

      // Try to get session token from manual storage
      const storedToken = await SecureStore.getItemAsync(
        "helpmee_session_token"
      );

      // Check if we need to use stored token
      const existingCookie = context.headers.get("cookie") || "";
      const hasValidSessionToken =
        existingCookie.includes("better-auth.session_token=") &&
        !existingCookie.includes("better-auth.session_token=;");

      if (storedToken && !hasValidSessionToken) {
        console.log("Using stored session token");
        if (existingCookie && existingCookie !== "; null=") {
          // Append to existing cookie
          context.headers.set(
            "cookie",
            `${existingCookie}; better-auth.session_token=${storedToken}`
          );
        } else {
          // Replace invalid cookie
          context.headers.set(
            "cookie",
            `better-auth.session_token=${storedToken}`
          );
        }
      }

      console.log("Auth request headers:", Object.fromEntries(context.headers));
    },
    onResponse: async (context) => {
      console.log("Auth response:", context.response.status);
      console.log(
        "Auth response headers:",
        Object.fromEntries(context.response.headers)
      );

      // Handle session invalidation
      if (context.response.status === 401 || context.response.status === 403) {
        console.log("Session invalid, clearing stored token");
        await clearStoredSession();
      }

      // Check if this is a get-session request with empty response (no session)
      // We can't easily identify the request type here, so we'll check all 200 responses
      // with content-length 4 (which indicates "null" response)
      if (context.response.status === 200) {
        const contentLength = context.response.headers.get("content-length");
        if (contentLength === "4") {
          // "null" is 4 characters
          console.log("No session in response, clearing stored token");
          await clearStoredSession();
        }
      }

      // Log the set-cookie header if present
      const setCookie = context.response.headers.get("set-cookie");
      if (setCookie) {
        console.log("Auth set-cookie:", setCookie);
        // Manually store session token if present
        const sessionTokenMatch = setCookie.match(
          /better-auth\.session_token=([^;]+)/
        );
        if (sessionTokenMatch) {
          const token = sessionTokenMatch[1];
          console.log("Storing session token:", token);
          await SecureStore.setItemAsync("helpmee_session_token", token);
        }
      }
    },
  },
});
