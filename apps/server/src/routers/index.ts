import { protectedProcedure, publicProcedure } from "../lib/orpc";
import type { RouterClient } from "@orpc/server";
import { kycRouter } from "./kyc";
import { adminRouter } from "./admin";
import { storeRouter } from "./store";
import { productsRouter } from "./products";
import { userRouter } from "./user";
import { generalRouter } from "./_all";
import { todoRouter } from "./todo";
import { financeRouter } from "./finance";

export const appRouter = {
  healthCheck: publicProcedure.handler(() => {
    return "OK";
  }),
  privateData: protectedProcedure.handler(({ context }) => {
    return {
      message: "This is private",
      user: context.session?.user,
    };
  }),
  todo: todoRouter,
  kyc: kycRouter,
  admin: adminRouter,
  store: storeRouter,
  products: productsRouter,
  user: userRouter,
  general: generalRouter,
  finance: financeRouter,
};
export type AppRouter = typeof appRouter;
export type AppRouterClient = RouterClient<typeof appRouter>;
