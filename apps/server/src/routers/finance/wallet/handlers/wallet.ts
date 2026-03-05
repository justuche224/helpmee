import { protectedProcedure } from "@/lib/orpc";
import { WalletService } from "@/services/finance/wallet.service";
import { ORPCError } from "@orpc/server";
import { z } from "zod";

const getTransactionHistorySchema = z.object({
  limit: z.number().optional(),
  offset: z.number().optional(),
});

const walletService = new WalletService();

const getUserWallet = protectedProcedure.handler(async ({ context }) => {
  const { session } = context;
  const userId = session?.user.id;
  if (!userId) {
    throw new ORPCError("UNAUTHORIZED");
  }
  try {
    const wallet = await walletService.getCachedWallet(userId);
    if (!wallet) {
      return null;
    }
    return wallet;
  } catch (error) {
    console.error(error);
    throw new ORPCError("GET_USER_WALLET_FAILED", {
      message: "Failed to get user wallet",
    });
  }
});

const createAccount = protectedProcedure.handler(async ({ context }) => {
  const { session } = context;
  const userId = session?.user.id;

  if (!userId) {
    throw new ORPCError("UNAUTHORIZED");
  }

  try {
    const account = await walletService.ensureUserAccounts(userId);
    return account;
  } catch (error) {
    console.error(error);
    throw new ORPCError("CREATE_ACCOUNT_FAILED", {
      message: "Failed to create account",
    });
  }
});

const getTransactionHistory = protectedProcedure
  .input(getTransactionHistorySchema)
  .handler(async ({ context, input }) => {
    const { session } = context;
    const userId = session?.user.id;
    if (!userId) {
      throw new ORPCError("UNAUTHORIZED");
    }

    const { limit, offset } = input;

    try {
      const transactionHistory = await walletService.getTransactionHistory(
        userId,
        { limit, offset }
      );
      return transactionHistory;
    } catch (error) {
      console.warn("GET TRANSACTION HISTORY ERROR");
      console.error(error);
      throw new ORPCError("GET_TRANSACTION_HISTORY_FAILED", {
        message: "Failed to get transaction history",
      });
    }
  });

const hasWallet = protectedProcedure.handler(async ({ context }) => {
  const { session } = context;
  const userId = session?.user.id;
  if (!userId) {
    throw new ORPCError("UNAUTHORIZED");
  }
  try {
    const hasWallet = await walletService.hasWallet(userId);
    return hasWallet;
  } catch (error) {
    console.warn("HAS WALLET ERROR");
    console.error(error);
    throw new ORPCError("HAS_WALLET_FAILED", {
      message: "Failed to check if user has wallet",
    });
  }
});

export { getUserWallet, createAccount, getTransactionHistory, hasWallet };
