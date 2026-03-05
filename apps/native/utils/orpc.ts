import { createORPCClient } from "@orpc/client";
import { RPCLink } from "@orpc/client/fetch";
import { createTanstackQueryUtils } from "@orpc/tanstack-query";
import { QueryCache, QueryClient } from "@tanstack/react-query";
import type { AppRouterClient } from "../../server/src/routers";
import { authClient, getStoredSessionToken } from "@/lib/auth-client";
import * as SecureStore from "expo-secure-store";

export const queryClient = new QueryClient({
  queryCache: new QueryCache({
    onError: (error) => {
      console.log(error);
    },
  }),
});

const isProd = process.env.NODE_ENV === "production";
const serverIp = process.env.EXPO_PUBLIC_SERVER_IP;
const port = process.env.EXPO_PUBLIC_SERVER_PORT;

const baseURL = isProd ? process.env.EXPO_PUBLIC_SERVER_URL : `http://${serverIp}:${port}`;

export const link = new RPCLink({
  url: `${baseURL}/rpc`,
  async headers() {
    const headers = new Map<string, string>();

    // Try to get cookies from auth client first
    let cookies = authClient.getCookie();
    console.log("ORPC - Auth client cookies:", cookies);

    // If no cookies from auth client, try stored token as fallback
    if (!cookies || cookies.trim() === "; null=") {
      console.log(
        "ORPC - No valid cookies from auth client, trying stored token"
      );
      const storedToken = await SecureStore.getItemAsync(
        "helpmee_session_token"
      );
      if (storedToken) {
        console.log("ORPC - Using stored session token");
        cookies = `better-auth.session_token=${storedToken}`;
      }
    }

    if (cookies && cookies.trim() !== "; null=") {
      headers.set("Cookie", cookies);
      console.log("ORPC - Final cookies:", cookies);
    } else {
      console.log("ORPC - No cookies available");
    }

    return Object.fromEntries(headers);
  },
});

export const client: AppRouterClient = createORPCClient(link);

export const orpc = createTanstackQueryUtils(client);
