import "dotenv/config";
import { OpenAPIHandler } from "@orpc/openapi/fetch";
import { OpenAPIReferencePlugin } from "@orpc/openapi/plugins";
import { ZodToJsonSchemaConverter } from "@orpc/zod/zod4";
import { RPCHandler } from "@orpc/server/fetch";
import { onError } from "@orpc/server";
import { createContext } from "./lib/context";
import { appRouter } from "./routers/index";
import { auth } from "./lib/auth";
import { Hono } from "hono";
import { getConnInfo } from "hono/bun";
import { ipRestriction } from "hono/ip-restriction";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import { authRoutes } from "./routers/auth";
import { DepositService } from "./services/finance/deposit.service";

const app = new Hono();

app.use(logger());
app.use(
  "/*",
  cors({
    origin: process.env.CORS_ORIGIN || "",
    allowMethods: ["GET", "POST", "OPTIONS"],
    allowHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);

// app.use(
// 	'/v1/paystack/webhook',
// 	ipRestriction(getConnInfo, {
// 	  denyList: [],
// 	  allowList: ['52.31.139.75', '52.49.173.169', "52.214.14.220"],
// 	})
//   )

app.on(["POST", "GET"], "/api/auth/**", (c) => auth.handler(c.req.raw));

export const apiHandler = new OpenAPIHandler(appRouter, {
  plugins: [
    new OpenAPIReferencePlugin({
      schemaConverters: [new ZodToJsonSchemaConverter()],
    }),
  ],
  interceptors: [
    onError((error) => {
      console.error(error);
    }),
  ],
});

export const rpcHandler = new RPCHandler(appRouter, {
  interceptors: [
    onError((error) => {
      console.error(error);
    }),
  ],
});

app.use("/*", async (c, next) => {
  const context = await createContext({ context: c });

  const rpcResult = await rpcHandler.handle(c.req.raw, {
    prefix: "/rpc",
    context: context,
  });

  if (rpcResult.matched) {
    return c.newResponse(rpcResult.response.body, rpcResult.response);
  }

  const apiResult = await apiHandler.handle(c.req.raw, {
    prefix: "/api",
    context: context,
  });

  if (apiResult.matched) {
    return c.newResponse(apiResult.response.body, apiResult.response);
  }

  await next();
});

app.route("/v1/auth", authRoutes);

app.post("/v1/paystack/webhook", async (c) => {
  console.log("Paystack webhook received");
  const depositService = new DepositService();
  return await depositService.payStackwebhook(c);
});

app.get("/", (c) => {
  return c.text("OK");
});

export default app;
