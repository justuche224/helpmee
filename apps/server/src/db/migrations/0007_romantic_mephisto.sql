ALTER TABLE "journals" ALTER COLUMN "source_type" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "ledger_entries" ALTER COLUMN "entry_type" DROP NOT NULL;