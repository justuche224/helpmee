import type { Context as HonoContext } from "hono";
import { db } from "@/db";
import crypto from "crypto";
import {
  idempotency_keys,
  integrity_issues,
  journals,
  ledger_entries,
  outbox_events,
  provider_requests,
  transactions,
  wallets,
  webhook_logs,
} from "@/db/schema";
import { providers } from "@/db/schema/providers";
import { SEED } from "@/lib/SEED";
import { eq, and, sql } from "drizzle-orm";
import { WalletService } from "./wallet.service";

export class DepositService {
  private readonly paystackSecretKey = process.env.PAYSTACK_SECRET_KEY;
  private readonly apiUrl = process.env.PAYSTACK_API_URL;
  private readonly walletService = new WalletService();

  async initiateDeposit(
    userId: string,
    email: string,
    amount: number,
    providerName: string,
    dempotency_key?: string
  ): Promise<{
    trx_id: string;
    authorization_url: string;
    reference: string;
    idempotency_key: string;
    status?: string;
  }> {
    if (!this.paystackSecretKey || !this.apiUrl) {
      throw new Error("Paystack secret key and API URL are required");
    }

    if (!userId || !email || !amount || !providerName) {
      throw new Error("Email and amount are required");
    }

    // !CURRENTLY ONLY PAYSTACK IS SUPPORTED
    if (providerName.trim() !== "Paystack") {
      throw new Error("Provider not supported");
    }

    if (dempotency_key) {
      const idemRows = await db
        .select()
        .from(idempotency_keys)
        .where(eq(idempotency_keys.key, dempotency_key))
        .limit(1);

      if (idemRows.length) {
        const mappedTxnId = idemRows[0].txn_id;

        if (!mappedTxnId) {
          throw new Error(
            "Inconsistent idempotency state: idempotency key maps to missing transaction ID"
          );
        }

        const txRows = await db
          .select({ id: transactions.id, status: transactions.status })
          .from(transactions)
          .where(eq(transactions.id, mappedTxnId))
          .limit(1);

        if (!txRows.length) {
          await db.insert(integrity_issues).values({
            user_id: userId,
            issue_type: "idempotency_mismatch",
            details: {
              message:
                "idempotency key maps to txn_id, but transaction row missing",
              idempotency_key: dempotency_key,
              txn_id: mappedTxnId,
            },
          });
          throw new Error(
            "Inconsistent idempotency state: existing idempotency key points to missing transaction"
          );
        }

        const provReq = await db
          .select()
          .from(provider_requests)
          .where(eq(provider_requests.txn_id, mappedTxnId))
          .limit(1);

        const response_payload: any = provReq[0].response_payload;

        if (provReq.length && response_payload && response_payload.status) {
          const payload = response_payload;
          if (payload.data && payload.data.authorization_url) {
            return {
              trx_id: mappedTxnId.toString(),
              authorization_url: payload.data.authorization_url,
              idempotency_key: dempotency_key,
              reference: payload.data.reference,
            };
          }
        }

        return {
          trx_id: mappedTxnId.toString(),
          status: "pending",
          authorization_url: "",
          idempotency_key: dempotency_key,
          reference: "",
        };
      }
    }

    const provider = await db
      .select({ id: providers.id })
      .from(providers)
      .where(eq(providers.name, providerName))
      .limit(1);

    if (!provider.length) {
      throw new Error("Provider not found");
    }

    const result = await db.transaction(async (tx) => {
      const trxId = crypto.randomUUID();
      const idmKey = crypto.randomUUID();

      const amountKobo = BigInt(Math.round(amount * 100));

      const [idempotencyKey] = await tx
        .insert(idempotency_keys)
        .values({
          key: idmKey,
          txn_id: trxId,
        })
        .returning({ key: idempotency_keys.key });

      const [journal] = await tx
        .insert(journals)
        .values({
          source_type: "transaction",
          source_id: trxId,
          metadata: {
            idempotency_key: idempotencyKey.key,
            email: email,
            amount: Number(amountKobo),
            provider: providerName,
            user_id: userId,
          },
        })
        .returning({ id: journals.id });

      const [transaction] = await tx
        .insert(transactions)
        .values({
          id: trxId,
          user_id: userId,
          type: "funding",
          amount: Number(amountKobo),
          currency: "NGN",
          journal_id: journal.id,
          idempotency_key: idempotencyKey.key,
          metadata: {
            email: email,
            amount: Number(amountKobo),
            provider: providerName,
            user_id: userId,
          },
        })
        .returning({ id: transactions.id });

      const debit = await tx
        .insert(ledger_entries)
        .values({
          journal_id: journal.id,
          account_id: SEED.providerFloatId,
          amount: Number(amountKobo),
          entry_type: "debit",
          metadata: {
            txn_id: trxId,
            user_id: userId,
            note: "deposit-init (pending)",
          },
        })
        .returning({
          id: ledger_entries.id,
          amount: ledger_entries.amount,
          entry_type: ledger_entries.entry_type,
        });

      const credit = await tx
        .insert(ledger_entries)
        .values({
          journal_id: journal.id,
          account_id: SEED.platformIncomingId,
          amount: Number(amountKobo),
          entry_type: "credit",
          metadata: {
            txn_id: trxId,
            user_id: userId,
            note: "deposit-init (pending)",
          },
        })
        .returning({
          id: ledger_entries.id,
          amount: ledger_entries.amount,
          entry_type: ledger_entries.entry_type,
        });

      if (
        !debit.length ||
        !credit.length ||
        BigInt(debit[0].amount) !== BigInt(credit[0].amount)
      ) {
        await tx.insert(integrity_issues).values({
          user_id: userId,
          issue_type: "journal_unbalanced",
          details: {
            journal_id: journal.id,
            debit: debit[0] ?? null,
            credit: credit[0] ?? null,
          },
        });
        throw new Error("Journal entries failed to balance");
      }

      const params = {
        email: email,
        amount: Number(amountKobo),
        currency: "NGN",
        metadata: {
          email: email,
          amount: Number(amountKobo),
          provider: providerName,
          user_id: userId,
          idempotency_key: idempotencyKey.key,
          trx_id: trxId,
        },
      };

      await tx.insert(provider_requests).values({
        provider_id: provider[0].id,
        txn_id: transaction.id,
        request_payload: params,
        status: "pending",
        attempts: 0,
      });

      const [outboxEvent] = await tx
        .insert(outbox_events)
        .values({
          event_type: "deposit_initiated",
          payload: params,
          attempts: 0,
        })
        .returning();

      // !FOR NOW I WILL SYNCRONOUSLY WAIT FOR THE PROVIDER REQUEST TO BE PROCESSED
      // !I AM STILL PROTOTYPING SO WE WILL DO THIS FOR NOW

      console.log("outboxEvent", outboxEvent);
      console.log("idempotencyKey", idempotencyKey);
      console.log("transaction", transaction);

      return {
        idempotency_key: idempotencyKey.key,
        trx_id: transaction.id,
        outboxEvent,
      };
    });

    try {
      const res = await fetch(`${this.apiUrl}/transaction/initialize`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${this.paystackSecretKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(result.outboxEvent.payload),
      });
      const data = await res.json();

      console.log("data", data);

      if (data && data.status && data.data.authorization_url) {
        return {
          idempotency_key: result.idempotency_key,
          trx_id: result.trx_id,
          authorization_url: data.data.authorization_url,
          reference: data.data.reference,
        };
      }
      throw new Error("Failed to initiate deposit");
    } catch (error) {
      console.error(error);
      throw new Error("Failed to initiate deposit");
    }
  }

  async handleChargeSuccess(
    webhookPayload: any,
    webhookLogId: number
  ): Promise<void> {
    console.log("a1");
    const { data: chargeData } = webhookPayload;
    const {
      reference: externalRef,
      amount: amountKobo,
      metadata,
      id: externalEventId,
    } = chargeData;
    console.log("a2");
    if (
      !externalRef ||
      !amountKobo ||
      !metadata?.trx_id ||
      !metadata?.user_id
    ) {
      console.log("a3");
      await db.insert(integrity_issues).values({
        user_id: metadata?.user_id || null,
        issue_type: "webhook_invalid_payload",
        details: {
          webhook_log_id: webhookLogId,
          missing_fields: {
            reference: !externalRef,
            amount: !amountKobo,
            trx_id: !metadata?.trx_id,
            user_id: !metadata?.user_id,
          },
          payload: chargeData,
        },
      });
      console.log("a4");
      throw new Error("Invalid webhook payload: missing required fields");
    }

    const userId = metadata.user_id;
    const txnId = metadata.trx_id;
    const expectedAmount = Number(amountKobo);
    console.log("a5");
    return db.transaction(async (tx) => {
      console.log("a6");
      const existingWebhookLog = await tx
        .select()
        .from(webhook_logs)
        .where(
          and(
            eq(webhook_logs.external_event_id, externalEventId.toString()),
            eq(webhook_logs.processed, true)
          )
        )
        .limit(1);
      console.log("a7");
      if (existingWebhookLog.length > 0) {
        console.log(
          `Webhook already processed for external event ID: ${externalEventId}`
        );
        return;
      }
      console.log("a8");
      const originalTxn = await tx
        .select()
        .from(transactions)
        .where(eq(transactions.id, txnId))
        .limit(1);
      console.log("a9");
      if (!originalTxn.length) {
        await tx.insert(integrity_issues).values({
          user_id: userId,
          issue_type: "webhook_transaction_not_found",
          details: {
            webhook_log_id: webhookLogId,
            txn_id: txnId,
            external_ref: externalRef,
            payload: chargeData,
          },
        });
        throw new Error(`Transaction not found: ${txnId}`);
      }
      console.log("a10");
      const transaction = originalTxn[0];

      if (transaction.status === "completed") {
        console.log(`Transaction ${txnId} already completed, skipping`);
        return;
      }
      console.log("a11");
      if (BigInt(transaction.amount) !== BigInt(expectedAmount)) {
        await tx.insert(integrity_issues).values({
          user_id: userId,
          issue_type: "webhook_amount_mismatch",
          details: {
            webhook_log_id: webhookLogId,
            txn_id: txnId,
            expected_amount: Number(transaction.amount),
            webhook_amount: expectedAmount,
            external_ref: externalRef,
          },
        });
        throw new Error(`Amount mismatch for transaction ${txnId}`);
      }
      console.log("a12");
      const userAccounts = await this.walletService.ensureUserAccounts(userId);

      const [completionJournal] = await tx
        .insert(journals)
        .values({
          source_type: "transaction",
          source_id: txnId,
          description: `Deposit completion for ${externalRef}`,
          metadata: {
            webhook_log_id: webhookLogId,
            external_ref: externalRef,
            external_event_id: externalEventId,
            original_txn_id: txnId,
            user_id: userId,
          },
        })
        .returning({ id: journals.id });
      console.log("a13");
      const [debitEntry] = await tx
        .insert(ledger_entries)
        .values({
          journal_id: completionJournal.id,
          account_id: SEED.platformIncomingId,
          amount: expectedAmount,
          entry_type: "debit",
          metadata: {
            txn_id: txnId,
            user_id: userId,
            external_ref: externalRef,
            note: "deposit-completion (debit platformIncoming)",
          },
        })
        .returning({
          id: ledger_entries.id,
          amount: ledger_entries.amount,
        });
      console.log("a14");
      const [creditEntry] = await tx
        .insert(ledger_entries)
        .values({
          journal_id: completionJournal.id,
          account_id: userAccounts.userWalletAccountId,
          amount: expectedAmount,
          entry_type: "credit",
          metadata: {
            txn_id: txnId,
            user_id: userId,
            external_ref: externalRef,
            note: "deposit-completion (credit user wallet)",
          },
        })
        .returning({
          id: ledger_entries.id,
          amount: ledger_entries.amount,
        });
      console.log("a15");
      if (BigInt(debitEntry.amount) !== BigInt(creditEntry.amount)) {
        await tx.insert(integrity_issues).values({
          user_id: userId,
          issue_type: "journal_unbalanced",
          details: {
            journal_id: completionJournal.id,
            debit_amount: Number(debitEntry.amount),
            credit_amount: Number(creditEntry.amount),
            total: BigInt(debitEntry.amount) - BigInt(creditEntry.amount),
            webhook_log_id: webhookLogId,
          },
        });
        throw new Error("Journal entries failed to balance");
      }
      console.log("a16");
      await tx
        .update(transactions)
        .set({
          status: "completed",
          external_ref: externalRef,
          updated_at: new Date(),
        })
        .where(eq(transactions.id, txnId));
      console.log("a17");
      await tx
        .update(provider_requests)
        .set({
          status: "completed",
          response_payload: chargeData,
          external_ref: externalRef,
          updated_at: new Date(),
        })
        .where(eq(provider_requests.txn_id, txnId));
      console.log("a18");
      const userWalletBalance = await tx
        .select({
          balance: sql<number>`COALESCE(SUM(${ledger_entries.amount}), 0)`,
        })
        .from(ledger_entries)
        .where(eq(ledger_entries.account_id, userAccounts.userWalletAccountId));
      console.log("a19");
      const currentWallet = await tx
        .select()
        .from(wallets)
        .where(eq(wallets.user_id, userId))
        .limit(1);
      console.log("a20");
      if (currentWallet.length > 0) {
        await tx
          .update(wallets)
          .set({
            available_balance: Number(userWalletBalance[0].balance),
            version: Number(currentWallet[0].version) + 1,
            last_updated: new Date(),
          })
          .where(eq(wallets.user_id, userId));
      }
      console.log("a21");
      await tx
        .update(webhook_logs)
        .set({
          processed: true,
          processed_at: new Date(),
          external_event_id: externalEventId.toString(),
        })
        .where(eq(webhook_logs.id, webhookLogId));
      console.log("a22");
      console.log(
        `Successfully processed charge success for transaction ${txnId}, amount: ${expectedAmount} kobo`
      );
    });
  }

  async payStackwebhook(context: HonoContext) {
    console.log("1");
    const secretKey = this.paystackSecretKey;
    if (!secretKey) {
      throw new Error("Paystack secret key is not set");
    }
    console.log("2");
    const body = await context.req.raw.json();
    const signature = context.req.raw.headers.get("x-paystack-signature");
    const bodyString = JSON.stringify(body);
    console.log("3");
    const hash = crypto
      .createHmac("sha512", secretKey)
      .update(bodyString)
      .digest("hex");
    console.log("4");
    const isVerified = hash === signature;
    const payload = body;
    console.log("5");
    const [webhookLog] = await db
      .insert(webhook_logs)
      .values({
        provider: "Paystack",
        event_type: payload.event || "unknown",
        payload: payload,
        signature: signature || null,
        verified: isVerified,
        processed: false,
        external_event_id: payload.data?.id?.toString() || null,
      })
      .returning({ id: webhook_logs.id });
    console.log("6");
    if (!isVerified) {
      await db.insert(integrity_issues).values({
        user_id: payload.data?.metadata?.user_id || null,
        issue_type: "webhook_verification_failed",
        details: {
          webhook_log_id: webhookLog.id,
          expected_signature: hash,
          received_signature: signature,
          event_type: payload.event,
        },
      });
      console.log("7");
      await db
        .update(webhook_logs)
        .set({
          error: "Signature verification failed",
        })
        .where(eq(webhook_logs.id, webhookLog.id));
      console.log("8");
      // Always return 200 to prevent Paystack retries, even for verification failures
      return context.json(
        { status: "error", message: "Signature verification failed" },
        200
      );
    }
    console.log("9");
    try {
      switch (payload.event) {
        case "charge.success":
          await this.handleChargeSuccess(payload, webhookLog.id);
          break;

        case "charge.failed":
          await this.handleChargeFailed(payload, webhookLog.id);
          break;

        default:
          console.log("Unhandled webhook event:", payload.event);
          // Mark as processed even for unhandled events to avoid reprocessing
          await db
            .update(webhook_logs)
            .set({
              processed: true,
              processed_at: new Date(),
              error: `Unhandled event type: ${payload.event}`,
            })
            .where(eq(webhook_logs.id, webhookLog.id));
      }
      console.log("10");
    } catch (error) {
      console.log("11");
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";

      await db
        .update(webhook_logs)
        .set({
          error: errorMessage,
          processed: false,
        })
        .where(eq(webhook_logs.id, webhookLog.id));
      console.log("12");
      // Always return 200 to prevent Paystack retries, even for processing errors
      return context.json(
        { status: "error", message: "Webhook processing failed" },
        200
      );
    }

    // Return a successful response to acknowledge webhook receipt
    return context.json(
      { status: "success", message: "Webhook processed" },
      200
    );
  }

  private async handleChargeFailed(
    webhookPayload: any,
    webhookLogId: number
  ): Promise<void> {
    const { data: chargeData } = webhookPayload;
    const { metadata, id: externalEventId } = chargeData;
    console.log("b1");
    if (!metadata?.trx_id) {
      await db.insert(integrity_issues).values({
        user_id: metadata?.user_id || null,
        issue_type: "webhook_invalid_payload",
        details: {
          webhook_log_id: webhookLogId,
          error: "Missing transaction ID in failed charge webhook",
          payload: chargeData,
        },
      });
      return;
    }
    console.log("b2");
    const txnId = metadata.trx_id;
    console.log("b3");
    await db.transaction(async (tx) => {
      await tx
        .update(transactions)
        .set({
          status: "failed",
          updated_at: new Date(),
        })
        .where(eq(transactions.id, txnId));
      console.log("b4");
      await tx
        .update(provider_requests)
        .set({
          status: "failed",
          response_payload: chargeData,
          updated_at: new Date(),
        })
        .where(eq(provider_requests.txn_id, txnId));
      console.log("b5");
      await tx
        .update(webhook_logs)
        .set({
          processed: true,
          processed_at: new Date(),
          external_event_id: externalEventId?.toString() || null,
        })
        .where(eq(webhook_logs.id, webhookLogId));
      console.log("b6");
    });

    console.log(`Processed failed charge for transaction ${txnId}`);
  }

  async getPaymentStatusByReference(reference: string): Promise<string> {
    console.log("getPaymentStatusByReference in service");
    try {
      const res = await fetch(
        `${this.apiUrl}/transaction/verify/${reference}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${this.paystackSecretKey}`,
          },
        }
      );
      const payload = await res.json();
      const status = payload.data.status as string;
      return status;
    } catch (error) {
      console.error(error);
      throw new Error("Failed to get payment status");
    }
  }
}
