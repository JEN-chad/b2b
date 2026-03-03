# Phase 2: Core Database Schema

This guide covers the database structure initialized in Phase 2 using Drizzle ORM and Neon PostgreSQL.

## Core Identity System

The database architecture is built as a strongly typed, fully relational PostgreSQL schema, optimized for scale and data integrity.

### 1. The `users` Table
This is the root table for application accounts.
*   **Default Role:** Every user registers as a `BUYER`. Options include `BUYER`, `SELLER`, `ADMIN`, `COMPLIANCE`.
*   **KYC Status:** Tracks verification state: `NOT_STARTED` -> `PENDING` -> `UNDER_REVIEW` -> `APPROVED` (or `REJECTED`).

### 2. The `profiles` Table
Stores extra public or personal metrics on the user.
*   Uses a `userId` foreign key pointing to the `users(id)`.
*   **Cascading Deletes:** Deleting a user automatically deletes the profile.
*   Tracks whether they are an `INDIVIDUAL` or a `COMPANY`.

### 3. The `sessions` Table
Handles persistent login tracking.
*   **Refresh Tokens:** Stores hashed tokens with strict `expiresAt` timestamps.
*   Security: Individual sessions can be `revoked` in the event of compromised credentials without logging out all devices.

### 4. The `otp_tokens` Table
Powers all one-time password flows.
*   **Types:** Used for `EMAIL_VERIFY`, `LOGIN`, or `PHONE_VERIFY`.
*   **Rate Limiting:** Contains an `attempts` integer to prevent brute force attacks up to the backend threshold.

### 5. The `audit_logs` Table (Compliance Hub)
Because this is a secure financial application, absolutely **critical reads or writes** map directly to the `audit_logs` table.
*   **Action Tracking:** Who updated what entity at what time from which IP address.
*   Admins use this log to maintain strict records on escrow, listings, and KYC status changes.

---

### Modifying the Database
Never change the database directly using raw SQL.

If you ever need to adjust these tables:
1.  Open `packages/db/src/schema.ts` and update the code.
2.  Run `pnpm db:push` in your terminal to synchronize the change to your active Neon PostgreSQL cloud instance!
