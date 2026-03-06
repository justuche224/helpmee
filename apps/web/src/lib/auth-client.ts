import { createAuthClient } from "better-auth/react";

const isProd = process.env.NODE_ENV === "production";
const serverIp = process.env.NEXT_PUBLIC_SERVER_IP;
const port = process.env.NEXT_PUBLIC_SERVER_PORT;

const baseURL = isProd
  ? process.env.NEXT_PUBLIC_SERVER_URL
  : `http://${serverIp}:${port}`;

export const authClient = createAuthClient({
  baseURL,
});
