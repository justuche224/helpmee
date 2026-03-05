ALTER TABLE "provider_requests" DROP CONSTRAINT "provider_requests_txn_id_transactions_id_fk";
--> statement-breakpoint
ALTER TABLE "payout_requests" ALTER COLUMN "txn_id" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "reconciliation_items" ALTER COLUMN "txn_id" SET DATA TYPE text;