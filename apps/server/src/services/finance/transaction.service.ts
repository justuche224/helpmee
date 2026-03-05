import { transactions } from "@/db/schema";
import { db } from "@/db";
import { eq } from "drizzle-orm";

export class TransactionService {
  async getTransactionByReference(reference: string) {
    console.log("getTransactionByReference in service");
    try {
      const [transaction] = await db
        .select()
        .from(transactions)
        .where(eq(transactions.external_ref, reference))
        .limit(1);

      if (!transaction) {
        throw new Error("Transaction not found");
      }
      return transaction;
    } catch (error) {
      console.error(error);
      throw new Error("Failed to get transaction by reference");
    }
  }
}
