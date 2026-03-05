ALTER TABLE "provider_requests" DROP CONSTRAINT "provider_requests_txn_id_transactions_id_fk";--> statement-breakpoint
ALTER TABLE "idempotency_keys" ALTER COLUMN "txn_id" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "transactions" ALTER COLUMN "id" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "provider_requests" ALTER COLUMN "txn_id" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "provider_requests" ADD CONSTRAINT "provider_requests_txn_id_transactions_id_fk" FOREIGN KEY ("txn_id") REFERENCES "transactions"("id") ON DELETE no action ON UPDATE no action;