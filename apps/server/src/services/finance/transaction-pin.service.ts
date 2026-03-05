import bcrypt from "bcryptjs";
import { db } from "@/db";
import { transaction_pins } from "@/db/schema/transaction-pins";
import { eq } from "drizzle-orm";

/**
 * TransactionPinService
 * - manages setting, verifying, locking, resetting transaction PINs.
 */
export class TransactionPinService {
  private readonly maxAttempts: number;
  private readonly lockDurationMs: number;
  private readonly bcryptRounds: number;

  constructor(opts?: {
    maxAttempts?: number;
    lockMinutes?: number;
    bcryptRounds?: number;
  }) {
    this.maxAttempts = opts?.maxAttempts ?? 5;
    this.lockDurationMs = (opts?.lockMinutes ?? 15) * 60 * 1000;
    this.bcryptRounds = opts?.bcryptRounds ?? 12;
  }

  /** Check if a user has a PIN set (status active and hash exists). */
  async hasPin(userId: string): Promise<boolean> {
    const row = await db.query.transaction_pins.findFirst({
      where: eq(transaction_pins.user_id, userId),
      columns: {
        pin_hash: true,
        status: true,
      },
    });
    return !!row?.pin_hash;
  }

  /** Create or update a user's PIN (hashes it). Throws if PIN already exists unless force=true. */
  async setPin(userId: string, plainPin: string, force = false): Promise<void> {
    this.validatePinFormat(plainPin);

    const alreadyHasPin = await this.hasPin(userId);
    if (alreadyHasPin && !force) {
      throw new Error("PIN already exists - use changePin to update it");
    }

    const hash = await bcrypt.hash(plainPin, this.bcryptRounds);

    await db.transaction(async (tx) => {
      // If there's an existing row, update; else insert.
      const existing = await tx
        .select()
        .from(transaction_pins)
        .where(eq(transaction_pins.user_id, userId))
        .limit(1);

      if (existing.length) {
        await tx
          .update(transaction_pins)
          .set({
            pin_hash: hash,
            failed_attempts: 0,
            locked_until: null,
            status: "active",
            updated_at: new Date(),
          })
          .where(eq(transaction_pins.user_id, userId));
      } else {
        await tx.insert(transaction_pins).values({
          user_id: userId,
          pin_hash: hash,
          failed_attempts: 0,
          locked_until: null,
          status: "active",
          created_at: new Date(),
          updated_at: new Date(),
        });
      }
    });
  }

  /** Verify a user's PIN.
   * - Returns true if correct.
   * - On wrong PIN increments failed_attempts and may set locked_until.
   * - Throws when PIN not set, status not active, or locked (with remaining ms).
   */
  async verifyPin(userId: string, plainPin: string): Promise<boolean> {
    const row = await db.query.transaction_pins.findFirst({
      where: eq(transaction_pins.user_id, userId),
    });

    if (!row || !row.pin_hash) throw new Error("No PIN set for user");

    if (row.status !== "active")
      throw new Error(`PIN status is not active: ${row.status}`);

    if (row.locked_until) {
      const lockedUntilTs = new Date(row.locked_until).getTime();
      const now = Date.now();
      if (lockedUntilTs > now) {
        const remainingMs = lockedUntilTs - now;
        const remainingMins = Math.ceil(remainingMs / 60000);
        throw new Error(`PIN locked for another ${remainingMins} minute(s)`);
      }
    }

    const ok = await bcrypt.compare(plainPin, row.pin_hash);

    if (ok) {
      // reset failed attempts + clear lock
      await db
        .update(transaction_pins)
        .set({
          failed_attempts: 0,
          locked_until: null,
          updated_at: new Date(),
        })
        .where(eq(transaction_pins.user_id, userId));
      return true;
    }

    // wrong pin -> increment attempts (and possibly lock)
    const attempts = (row.failed_attempts ?? 0) + 1;
    const update: Partial<typeof transaction_pins.$inferSelect> = {
      failed_attempts: attempts,
      updated_at: new Date(),
    };

    if (attempts >= this.maxAttempts) {
      update.locked_until = new Date(Date.now() + this.lockDurationMs);
    }

    await db
      .update(transaction_pins)
      .set(update)
      .where(eq(transaction_pins.user_id, userId));

    return false;
  }

  /** Reset PIN without verifying old PIN (admin or token flow). */
  async resetPin(userId: string, newPin: string): Promise<void> {
    this.validatePinFormat(newPin);
    const hash = await bcrypt.hash(newPin, this.bcryptRounds);

    // Upsert-like behaviour
    await db.transaction(async (tx) => {
      const existing = await tx
        .select()
        .from(transaction_pins)
        .where(eq(transaction_pins.user_id, userId))
        .limit(1);
      if (existing.length) {
        await tx
          .update(transaction_pins)
          .set({
            pin_hash: hash,
            failed_attempts: 0,
            locked_until: null,
            status: "active",
            updated_at: new Date(),
          })
          .where(eq(transaction_pins.user_id, userId));
      } else {
        await tx.insert(transaction_pins).values({
          user_id: userId,
          pin_hash: hash,
          failed_attempts: 0,
          locked_until: null,
          status: "active",
          created_at: new Date(),
          updated_at: new Date(),
        });
      }
    });
  }

  /** Change PIN by verifying old PIN before setting new one.
   * - Verifies old PIN using verifyPin (handles locking/attempts).
   * - If old PIN is correct, sets the new PIN.
   * - Throws if old PIN is incorrect or other PIN issues.
   */
  async changePin(
    userId: string,
    oldPin: string,
    newPin: string
  ): Promise<void> {
    this.validatePinFormat(newPin);

    // Verify the old PIN first - this will throw if PIN not set, locked, etc.
    const isOldPinValid = await this.verifyPin(userId, oldPin);
    if (!isOldPinValid) {
      throw new Error("Old PIN is incorrect");
    }

    // If old PIN is valid, set the new PIN (force=true to bypass existence check)
    await this.setPin(userId, newPin, true);
  }

  /** Soft-remove a user's PIN (clears hash and marks status). */
  async removePin(userId: string): Promise<void> {
    await db
      .update(transaction_pins)
      .set({
        pin_hash: null,
        failed_attempts: 0,
        locked_until: null,
        status: "deleted",
        updated_at: new Date(),
      })
      .where(eq(transaction_pins.user_id, userId));
  }

  /** Disable PIN (admin action). */
  async disablePin(userId: string): Promise<void> {
    await db
      .update(transaction_pins)
      .set({ status: "blocked", updated_at: new Date() })
      .where(eq(transaction_pins.user_id, userId));
  }

  /** Enable PIN (admin action). */
  async enablePin(userId: string): Promise<void> {
    await db
      .update(transaction_pins)
      .set({ status: "active", updated_at: new Date() })
      .where(eq(transaction_pins.user_id, userId));
  }

  /** Admin unlock: clear failed attempts and lock. */
  async adminUnlock(userId: string): Promise<void> {
    await db
      .update(transaction_pins)
      .set({
        failed_attempts: 0,
        locked_until: null,
        status: "active",
        updated_at: new Date(),
      })
      .where(eq(transaction_pins.user_id, userId));
  }

  /** Get PIN status and metadata (for UI/admin use). */
  async getStatus(userId: string) {
    const row = await db.query.transaction_pins.findFirst({
      where: eq(transaction_pins.user_id, userId),
      columns: {
        failed_attempts: true,
        locked_until: true,
        status: true,
        created_at: true,
        updated_at: true,
      },
    });

    return row ?? null;
  }

  // ---------- helpers ----------
  private validatePinFormat(pin: string) {
    // Example policy: 4-6 digits numeric. Adjust as needed.
    if (!/^\d{4,6}$/.test(pin)) throw new Error("PIN must be 4 to 6 digits");
  }
}
