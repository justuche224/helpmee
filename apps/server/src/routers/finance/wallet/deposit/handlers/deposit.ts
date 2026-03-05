import { protectedProcedure } from "@/lib/orpc";
import { DepositService } from "@/services/finance/deposit.service";
import { ORPCError } from "@orpc/server";
import { z } from "zod";

const depositService = new DepositService();

const depositSchema = z.object({
  amount: z.number().min(100),
  email: z.email(),
  providerName: z.string(),
});

const initiateDeposit = protectedProcedure
  .input(depositSchema)
  .handler(async ({ input, context }) => {
    const { amount, email, providerName } = input;
    const userId = context.session.user.id;

    if (!userId) {
      throw new ORPCError("UNAUTHORIZED");
    }

    if (!email) {
      throw new ORPCError("BAD_REQUEST", {
        message: "Email is required",
      });
    }

    if (!amount || amount < 100) {
      throw new ORPCError("BAD_REQUEST", {
        message: "Amount must be greater than 100 naira",
      });
    }
    if (!providerName) {
      throw new ORPCError("BAD_REQUEST", {
        message: "Provider name is required",
      });
    }

    const deposit = await depositService.initiateDeposit(
      userId,
      email,
      amount,
      providerName
    );

    return {
      message:
        "Deposit initiated successfully, proceed to complete the payment",
      data: deposit,
    };
  });

const getPaymentStatusByReference = protectedProcedure
  .input(z.object({ reference: z.string() }))
  .handler(async ({ input }) => {
    console.log("getPaymentStatusByReference");
    const { reference } = input;
    const transaction =
      await depositService.getPaymentStatusByReference(reference);
    console.log(transaction);
    return {
      message: "Transaction retrieved successfully",
      data: transaction,
    };
  });

export { initiateDeposit, getPaymentStatusByReference };
