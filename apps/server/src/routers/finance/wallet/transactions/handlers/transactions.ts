import { protectedProcedure } from "@/lib/orpc";
import { z } from "zod";
import { TransactionService } from "@/services/finance/transaction.service";

const transactionService = new TransactionService();

const getTransactionByReference = protectedProcedure
  .input(z.object({ reference: z.string().min(1) }))
  .handler(async ({ input }) => {
    console.log("getTransactionByReference");
    const { reference } = input;
    const transaction =
      await transactionService.getTransactionByReference(reference);
    return {
      message: "Transaction retrieved successfully",
      data: transaction,
    };
  });

export { getTransactionByReference };
