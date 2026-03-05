import {
  pgTable,
  bigserial,
  bigint,
  text,
  jsonb,
  timestamp,
  integer,
} from "drizzle-orm/pg-core";
import { providers } from "./providers";

const providerRequestStatus = [
  "completed",
  "failed",
  "pending",
] as const;

export const provider_requests = pgTable("provider_requests", {
  id: bigserial("id", { mode: "number" }).primaryKey(),
  provider_id: bigint("provider_id", { mode: "number" }).references(
    () => providers.id
  ),
  txn_id: text("txn_id"),
  request_payload: jsonb("request_payload"),
  response_payload: jsonb("response_payload"),
  external_ref: text("external_ref"),
  status: text("status")
    .notNull()
    .default("pending")
    .$type<(typeof providerRequestStatus)[number]>(),
  attempts: integer("attempts").notNull().default(0),
  created_at: timestamp("created_at").notNull().defaultNow(),
  updated_at: timestamp("updated_at").notNull().defaultNow(),
});
