ALTER TABLE "transaction_pins" ADD COLUMN "failed_attempts" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "transaction_pins" ADD COLUMN "locked_until" timestamp;--> statement-breakpoint
ALTER TABLE "transaction_pins" ADD COLUMN "status" text DEFAULT 'active' NOT NULL;