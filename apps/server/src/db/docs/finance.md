# Financial Subsystem — Table Reference

This document explains the purpose, important columns, invariants, common usage patterns, and admin queries for each table in the wallet/financial subsystem. Use this as the canonical reference for developers, QA, and operators working on payments, ledger, and reconciliation flows.

> **Note:** money is stored in the smallest currency unit (kobo) as `bigint`. Currency is recorded on rows for future multi-currency support.

---

## Summary of tables

- `accounts`
- `journals`
- `ledger_entries`
- `wallets`
- `transactions`
- `webhook_logs`
- `outbox_events`
- `failed_jobs`
- `providers`
- `provider_requests`
- `payout_requests`
- `reconciliation_reports`
- `reconciliation_items`
- `idempotency_keys`
- `integrity_issues`

---

## `accounts`
**Purpose:** Represents ledger accounts used by the double-entry system. Accounts are the atoms of the ledger (user wallets, reserved sub-accounts, platform holding accounts, provider floats, pending payouts, fees, etc.).

**Important columns:**
- `id` — primary key.
- `type` — logical account type (`user_wallet`, `user_reserved`, `platform_incoming`, `pending_payouts`, `provider_float`, `merchant`, `fees`, etc.).
- `owner_id` — optional reference to `users.id` when the account belongs to a user.
- `parent_account_id` — optional hierarchical grouping for account trees.
- `currency`, `metadata`, `description`, timestamps.

**Usage:**
- Create per-user `user_wallet` and `user_reserved` accounts at signup.
- Create system accounts at bootstrap (e.g., `platform_incoming`, `platform_operational`, `pending_payouts`).

**Invariants & rules:**
- Account types drive business logic (e.g., only `user_reserved` is used in reservation flows).
- Do not delete accounts; instead mark them inactive in `metadata` if needed.

**Admin queries:**
- List system accounts: `SELECT * FROM accounts WHERE owner_id IS NULL;`

---

## `journals`
**Purpose:** Group a set of `ledger_entries` created by a single business event. A journal is the transaction boundary in accounting terms.

**Important columns:**
- `id`, `source_type` (`transaction`, `reconciliation`, `manual_adjustment`, `payout`), `source_id`, `description`, `metadata`, `created_at`.

**Usage:**
- Every business event (funding webhook, purchase, refund, provider settlement) creates a `journals` row, then one or more `ledger_entries` referencing it.

**Invariants:**
- For a journal, `SUM(ledger_entries.amount) = 0` (total debits == total credits). This is enforced by application logic and monitored by reconciliation jobs.

**Admin queries:**
- Show entries for a journal: `SELECT * FROM ledger_entries WHERE journal_id = :id ORDER BY created_at;`

---

## `ledger_entries`
**Purpose:** Append-only, immutable records of each debit/credit. This is the canonical audit trail for all money movements.

**Important columns:**
- `id`, `journal_id`, `account_id`, `amount` (kobo, signed or by `entry_type`), `balance_after`, `entry_type` (`debit`/`credit`), `metadata`, `created_at`.

**Usage & notes:**
- Always insert these inside the same DB transaction as related updates (wallet cache, transactions table).
- Use partitioning (monthly) for performance and archival.

**Invariants:**
- Append-only: updates should be rare and only for correction journals (which create new ledger entries). Never overwrite historic rows.
- For each `journal_id`: `SUM(amount) = 0`.

**Indexing / Partitioning:**
- Indexed by `(account_id, created_at DESC)` for fast balance history.
- Partition by `created_at` (monthly range partitions). Create future partitions via scheduled job.

**Admin queries:**
- Compute account balance from ledger: `SELECT SUM(amount) FROM ledger_entries WHERE account_id = :account_id;`
- Recent entries for user: `SELECT * FROM ledger_entries WHERE account_id IN (...) ORDER BY created_at DESC LIMIT 100;`

---

## `wallets`
**Purpose:** Cached view of a user's balances for fast reads: `available_balance` and `reserved_balance`. Also stores `account_id` linking to the user's `accounts` row.

**Important columns:**
- `user_id` (PK), `account_id`, `available_balance`, `reserved_balance`, `currency`, `version`, `last_updated`.

**Usage & rules:**
- Always update `wallets` inside the same DB transaction as `ledger_entries` to prevent divergence.
- Use `SELECT ... FOR UPDATE` when doing debits/reserves to ensure concurrency safety.
- `version` used for optimistic locking if desired.

**Integrity checks:**
- Nightly reconciliation should recompute the sum from `ledger_entries` and compare with `wallets.available_balance + wallets.reserved_balance`.

**Admin queries:**
- Find negative balances: `SELECT * FROM wallets WHERE available_balance < 0 OR reserved_balance < 0;`

---

## `transactions`
**Purpose:** Business-level objects representing funding, withdrawal, airtime, purchases, refunds, etc. They map to journals/ledger entries and to external provider refs.

**Important columns:**
- `id`, `user_id`, `type`, `status` (`pending|initiated|settled|failed|reversed`), `amount`, `currency`, `external_ref`, `idempotency_key`, `journal_id`, `metadata`, timestamps.

**Usage:**
- Use `transactions.external_ref` and `idempotency_key` to prevent double-processing of webhooks or duplicated client requests.
- A `transactions` row is created for every user-initiated or provider-initiated business operation.

**Admin queries:**
- Find unsettled transactions: `SELECT * FROM transactions WHERE status = 'pending';`
- Lookup by provider: `SELECT * FROM transactions WHERE external_ref = :ref;`

---

## `webhook_logs`
**Purpose:** Immutable log of incoming provider webhooks (Paystack, VTpass, etc.) for replay, forensics, and debugging.

**Important columns:**
- `id`, `provider`, `event_type`, `payload` (raw JSON), `signature`, `verified`, `processed`, `processed_at`, `error`, `external_event_id`, `created_at`.

**Usage & rules:**
- Insert webhook payloads immediately on receipt, verify signatures, then process idempotently. Mark `processed` when complete.
- Use `external_event_id` to avoid replay processing of the same provider event.

**Admin queries:**
- Unprocessed webhooks: `SELECT * FROM webhook_logs WHERE processed = false;`

---

## `outbox_events`
**Purpose:** Durable outbox for reliable side-effects (calling Paystack, VTpass, sending emails). Write outbox rows inside the business DB transaction; workers poll outbox to execute external calls.

**Important columns:**
- `event_type`, `payload` (json), `attempts`, `next_retry_at`, `processed`, `last_error`, timestamps.

**Usage patterns:**
- Create `outbox_events` in the same DB transaction that creates the `journal`/`transactions` row. Worker reads unprocessed events (and `next_retry_at <= now()`), processes them, and marks them processed or schedules retries.

**Admin queries:**
- Backlog: `SELECT * FROM outbox_events WHERE processed = false ORDER BY next_retry_at ASC LIMIT 100;`

---

## `failed_jobs`
**Purpose:** Store job payloads that exceeded retry thresholds and require human attention. Acts as a fallback/triage list.

**Key columns:**
- `job_type`, `payload`, `attempts`, `next_retry`, `last_error`, timestamps.

**Usage:**
- When outbox worker exceeds its attempt limit, move job into `failed_jobs` (or flag and notify an operator). Admin UI should expose these for retry or manual resolution.

---

## `providers`
**Purpose:** Register third-party providers and link them to ledger accounts (provider floats). Examples: VTpass, telecom APIs, other aggregators.

**Important columns:**
- `id`, `name`, `type` (`airtime`, `electricity`, `data`, `payment_gateway`), `balance_account_id` (links to an `accounts` float), `credentials` (minimal, prefer secrets manager), `metadata`.

**Usage:**
- Use `providers.balance_account_id` when you top-up or consume provider float.

**Admin queries:**
- Providers with negative float: `SELECT p.*, a.* FROM providers p JOIN accounts a ON p.balance_account_id = a.id WHERE a.id IS NOT NULL;`

---

## `provider_requests`
**Purpose:** Record each call to aggregator providers (vtpass, etc.) — request, response, status. Useful for retries and for audit trails.

**Important columns:**
- `id`, `provider_id`, `txn_id`, `request_payload`, `response_payload`, `external_ref`, `status`, `attempts`, timestamps.

**Usage:**
- Insert a `provider_requests` row when initiating a provider call; update it with `response_payload` and `status` when provider responds. Tie to `transactions.txn_id`.

**Admin queries:**
- Lookup failed provider calls: `SELECT * FROM provider_requests WHERE status != 'success' ORDER BY created_at DESC;`

---

## `payout_requests`
**Purpose:** Track user withdrawal requests and their lifecycle (requested → initiated → paid/failed/refunded). Separate from `transactions` to keep a clean payout workflow.

**Important columns:**
- `id`, `user_id`, `txn_id`, `bank_details` (mask sensitive data), `amount`, `fee`, `status`, `external_ref` (paystack transfer id), `metadata`, timestamps.

**Usage & workflow:**
1. User requests withdrawal → create `transactions` + `payout_requests` + `journal` + `ledger_entries` (user_wallet → pending_payouts) and enqueue outbox event to call Paystack.
2. Worker creates transfer (records `external_ref`).
3. Paystack webhook updates `payout_requests` and `transactions` to `paid` or `failed` and creates settlement ledger entries.

**Admin queries:**
- Pending payouts: `SELECT * FROM payout_requests WHERE status IN ('requested','initiated');`

---

## `reconciliation_reports` & `reconciliation_items`
**Purpose:** Store provider-supplied settlement reports (e.g., Paystack settlement files) and per-item matching results. Helps detect missing/extra items and amounts.

**Important columns:**
- `reconciliation_reports`: `id`, `provider`, `report_date`, `content` (parsed JSON), `processed`.
- `reconciliation_items`: `report_id`, `txn_id`, `external_ref`, `matched` (bool), `discrepancy_amount`, `resolution_status` (`pending|resolved_auto|resolved_manual`), `notes`.

**Usage:**
- Import provider reports, attempt automated matching against `transactions.external_ref` or `ledger_entries`, create `reconciliation_items` for unmatched or mismatched items.
- Flag unresolved items for manual investigation.

**Admin queries:**
- Unmatched items: `SELECT * FROM reconciliation_items WHERE matched = false;`

---

## `idempotency_keys`
**Purpose:** Prevent duplicate processing of client-initiated requests (withdrawals, complex multi-step actions). Store idempotency keys given by clients or created by backend.

**Important columns:**
- `key` (PK), `txn_id`, `created_at`, `expires_at`.

**Usage:**
- On a client request with an idempotency key, check `idempotency_keys`. If present, return the previous result. If absent, create the key row within the same DB transaction as the operation.

---

## `integrity_issues`
**Purpose:** Store automatic detection of integrity problems (balance mismatch, negative balance, unmatched provider records) and to track resolution status.

**Important columns:**
- `id`, `user_id`, `issue_type`, `details` (json), `resolved`, `created_at`, `resolved_at`.

**Usage:**
- Reconciliation/maintenance jobs insert rows here when problems are detected. Admin UI picks these up for manual resolution and records `resolved_at` when fixed.

---

# Common admin queries (examples)

- Compute a user's ledger-derived balance:
```sql
SELECT SUM(le.amount) AS ledger_total
FROM accounts a
JOIN ledger_entries le ON le.account_id = a.id
WHERE a.owner_id = :user_id AND a.type IN ('user_wallet','user_reserved');
```

- Find wallets that differ from ledger-derived balances:
```sql
SELECT w.user_id, w.available_balance, w.reserved_balance, ledger_sum.ledger_total
FROM wallets w
JOIN (
  SELECT a.owner_id AS user_id, SUM(le.amount) AS ledger_total
  FROM ledger_entries le
  JOIN accounts a ON le.account_id = a.id
  WHERE a.type IN ('user_wallet','user_reserved')
  GROUP BY a.owner_id
) ledger_sum ON ledger_sum.user_id = w.user_id
WHERE ledger_sum.ledger_total <> (w.available_balance + w.reserved_balance);
```

- Reconciliation mismatch report (unmatched provider items):
```sql
SELECT ri.*, rr.provider, rr.report_date
FROM reconciliation_items ri
JOIN reconciliation_reports rr ON ri.report_id = rr.id
WHERE ri.matched = false;
```

---

# Partitioning, indexes & performance

- **Partition `ledger_entries` by `created_at` RANGE (monthly)**; keep partitions for recent N months in hot DB and archive older partitions to cold storage.
- **Indexes:**
  - `ledger_entries(account_id, created_at DESC)`
  - `transactions(external_ref)` (unique when not null)
  - `webhook_logs(external_event_id)`
  - `outbox_events(processed, next_retry_at)`
- Use `CREATE INDEX CONCURRENTLY` in production migrations for large tables.

---

# Operational guidelines

- **Always** insert `journals` + `ledger_entries` and update `wallets` in the same DB transaction.
- Use the outbox pattern for external calls: write `outbox_events` inside the same DB transaction; workers process them afterward.
- On webhook receipt: store raw payload in `webhook_logs` before business processing, verify signature, then process idempotently using `transactions.external_ref` or `webhook_logs.external_event_id`.
- Implement nightly reconciliation jobs that:
  1. Verify each `journal` balances to zero.
  2. Recompute `wallets` from ledger and insert `integrity_issues` for differences.
  3. Import provider settlement reports into `reconciliation_reports` and create `reconciliation_items`.

---

# Common recovery & admin actions

- **Missing funding (webhook lost):** Insert a manual `journal` + `ledger_entries` referencing a `transactions` row and mark the reconciliation item resolved. Record the admin user in `journal.metadata`.
- **Refund failed payout:** Create a reversal journal that moves funds from `pending_payouts` back to `user_wallet`. Update `payout_requests` and `transactions` statuses accordingly.
- **Replay webhook:** If `webhook_logs.processed = false` and signature verified, run the normal handler with idempotency checks.

---

# Glossary

- **Journal:** accounting grouping for a business event.
- **Ledger entry:** single debit/credit line; append-only.
- **Wallet:** cached view of user balance for fast reads.
- **Outbox:** durable mechanism to reliably call external services after DB commit.

---

# Appendix: quick readme snippets to include in repo

```
# Financial DB — Operational notes
- Money is stored in kobo (integer). Never use floats.
- Every business action must create a `journal` and balanced `ledger_entries`.
- Wallet cache must be updated within the same DB transaction as the ledger writes.
- Use idempotency keys and `external_ref` to prevent duplicates.
- Partition `ledger_entries` monthly and create partitions in advance.
```

---

If you'd like, I can:
- Export this document as `docs/FINANCIAL_DB_TABLES.md` in your repo (create PR),
- Create a shorter quick-reference cheat-sheet for the ops dashboard,
- Or generate an OpenAPI-like JSON describing table schemas for automated tooling.

Which one next?

