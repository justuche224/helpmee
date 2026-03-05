import { protectedProcedure } from "@/lib/orpc";
import { TransactionPinService } from "@/services/finance/transaction-pin.service";
import { ORPCError } from "@orpc/server";
import { z } from "zod";

const pin = new TransactionPinService();

const setPinSchema = z.object({
  pin: z.string().min(4).max(4),
  confirmPin: z.string().min(4).max(4),
});

const changePinSchema = z.object({
  oldPin: z.string().min(4).max(4),
  newPin: z.string().min(4).max(4),
  confirmNewPin: z.string().min(4).max(4),
});

const hasPin = protectedProcedure.handler(async ({ context }) => {
  const { session } = context;
  const userId = session?.user.id;
  if (!userId) {
    throw new ORPCError("UNAUTHORIZED");
  }
  try {
    const hasPin = await pin.hasPin(userId);
    return hasPin;
  } catch (error) {
    console.error(error);
    throw new ORPCError("HAS_PIN_FAILED", {
      message: "Failed to check if user has pin",
    });
  }
});

const setPin = protectedProcedure
  .input(setPinSchema)
  .handler(async ({ context, input }) => {
    const { session } = context;
    const userId = session?.user.id;
    if (!userId) {
      throw new ORPCError("UNAUTHORIZED");
    }
    try {
      if (input.pin !== input.confirmPin) {
        throw new ORPCError("PIN_MISMATCH", {
          message: "Pin and confirm pin do not match",
        });
      }
      await pin.setPin(userId, input.pin);
      return {
        success: true,
        message: "Pin set successfully",
      };
    } catch (error) {
      console.warn("SET PIN ERROR");
      console.error(error);
      if (
        error instanceof Error &&
        error.message === "PIN already exists - use changePin to update it"
      ) {
        throw new ORPCError("PIN_ALREADY_EXISTS", {
          message: "PIN already exists - use change PIN instead",
        });
      }
      throw new ORPCError("SET_PIN_FAILED", {
        message: "Failed to set pin",
      });
    }
  });

const changePin = protectedProcedure
  .input(changePinSchema)
  .handler(async ({ context, input }) => {
    const { session } = context;
    const userId = session?.user.id;
    if (!userId) {
      throw new ORPCError("UNAUTHORIZED");
    }
    try {
      if (input.newPin !== input.confirmNewPin) {
        throw new ORPCError("PIN_MISMATCH", {
          message: "New pin and confirm new pin do not match",
        });
      }
      await pin.changePin(userId, input.oldPin, input.newPin);
      return {
        success: true,
        message: "Pin changed successfully",
      };
    } catch (error) {
      console.warn("CHANGE PIN ERROR");
      console.error(error);
      if (error instanceof Error && error.message === "Old PIN is incorrect") {
        throw new ORPCError("INVALID_OLD_PIN", {
          message: "Old PIN is incorrect",
        });
      }
      throw new ORPCError("CHANGE_PIN_FAILED", {
        message: "Failed to change pin",
      });
    }
  });

export { setPin, changePin, hasPin };
