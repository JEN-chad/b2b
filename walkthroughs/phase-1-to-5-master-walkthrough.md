# B2B Marketplace - Master Walkthrough (Phase 1 to Phase 5)

This document is an updated, comprehensive start-to-finish walkthrough combining the development stages configured according to `project-docs/intructions.md`.

## Prerequisites & Getting Started The Environment
1. Open a terminal in the root of the project: `j:\Zuntra\b2b`.
2. Ensure you have your `.env` configured inside `j:\Zuntra\b2b\.env` (e.g. `KYC_ENFORCEMENT=STRICT`).
3. Boot up the entire monorepo stack by running:
   ```bash
   pnpm run dev
   ```
4. This command concurrently starts your Next.js frontend (unused yet) and Express backend. The API will respond locally on `http://localhost:8000`.

---

## Phase 1 & Phase 2: Infrastructure & Database
The project utilizes a strict Turborepo architecture with `apps/web` for frontend, `apps/api` for backend, and `packages/db` for the database schema.
Data is modeled strictly using Drizzle ORM and Neon PostgreSQL to maintain robust financial audit logging constraints.

1. **Viewing Schema**: All Identity, OTP, KYC, Session, and Listing schemas have been enforced natively with strict constraints.
2. **Accessing Drizzle Studio**:
   Open a new terminal instance in the root folder and run:
   ```bash
   pnpm --filter @b2b/db db:studio
   ```
   Navigate to `https://local.drizzle.studio` to easily visually manage records.

---

## Phase 3: Identity & Authentication (+ Advanced Setup)
We rely on a robust OTP mechanism instead of basic passwords. Every authenticated request relies on standard `HttpOnly` JSON Web Tokens and strict session rotation logic enforced by the database.

### 1. Request an Account (Signup)
You must initialize an OTP sent back to a new email address.
```bash
curl -X POST http://localhost:8000/auth/signup \
-H "Content-Type: application/json" \
-d '{
  "email": "testuser@example.com",
  "password": "TestAdmin123"
}'
```
*Note: The generated OTP is printed inside your backend console during development.*

### 2. Verify the Email 
Prove ownership within 5 minutes.
```bash
curl -X POST http://localhost:8000/auth/verify-email \
-H "Content-Type: application/json" \
-d '{
  "email": "testuser@example.com",
  "code": "123456" # Replace with real numeric OTP
}'
```

### 3. Login & Obtain Secure Tokens
Exchange your login credentials for `HttpOnly` cookies (`accessToken`, `refreshToken`). 
```bash
curl -X POST http://localhost:8000/auth/login \
-H "Content-Type: application/json" \
-d '{
  "email": "testuser@example.com",
  "password": "TestAdmin123"
}'
```

### 4. Refresh & Rotate the Session
If your `accessToken` expires after 15 minutes, you can securely rotate it and invalidate the previous tracker without forcing the user to log back in.
```bash
curl -X POST http://localhost:8000/auth/refresh
```

### 5. Terminate Device Session (Logout)
Because we track session rows against active device hardware metrics dynamically, you must correctly destroy the session completely upon logout.
```bash
curl -X POST http://localhost:8000/auth/logout
```
*(All cookies clear entirely locally, and the session database entry gets formally dropped)*

---

## Phase 4: KYC Validation Engine
Before a user can list an asset, they **must** pass `STRICT` compliance checks.

### 1. Submit Sensitive Documents
Documents submitted over JSON are handled encrypted over the database by default.
```bash
curl -X POST http://localhost:8000/kyc/submit \
-H "Cookie: accessToken=<your_access_token>" \
-H "Content-Type: application/json" \
-d '{
  "panNumber": "ABCDE1234F",
  "gstNumber": "22AAAAA0000A1Z5"
}'
```
### 2. View Status
Check if you natively unlocked `APPROVED` privileges:
```bash
curl -X GET http://localhost:8000/kyc/status \
-H "Cookie: accessToken=<your_access_token>"
```

### 3. Admin Verification (`ADMIN` or `COMPLIANCE` ONLY)
Log into your `Drizzle Studio` (Step 2.2) and immediately upgrade your user `role` column to `ADMIN`.
```bash
curl -X PATCH http://localhost:8000/kyc/<target_user_id>/review \
-H "Cookie: accessToken=<admin_access_token>" \
-H "Content-Type: application/json" \
-d '{
  "status": "APPROVED"
}'
```

---

## Phase 5: Seller Listing System
Once officially approved in KYC, sellers are now able to draft listings around their assets to start seeking deals.

### 1. Initialize a Private Draft
```bash
curl -X POST http://localhost:8000/seller/listings \
-H "Cookie: accessToken=<your_access_token>" \
-H "Content-Type: application/json" \
-d '{
  "title": "Premium SaaS Analytics Platform",
  "assetType": "SAAS",
  "industry": "Software",
  "revenueMonthly": 5000,
  "profitMonthly": 4000,
  "askingPrice": 150000,
  "visibility": "PUBLIC",
  "ndaRequired": true
}'
```
*Creates asset in `DRAFT` status.*

### 2. Push Draft to Internal Moderation
Locks off metrics from the seller and pushes it into `UNDER_REVIEW`.
```bash
curl -X POST http://localhost:8000/seller/listings/<listing_uuid>/submit \
-H "Cookie: accessToken=<your_access_token>"
```

### 3. Admin Final Review
An admin user inspects the financials and flips the listing into `APPROVED` / `LIVE` explicitly allowing it to appear across public search arrays.
```bash
curl -X PATCH http://localhost:8000/admin/listings/<listing_uuid>/review \
-H "Cookie: accessToken=<admin_access_token>" \
-H "Content-Type: application/json" \
-d '{
  "status": "LIVE"
}'
```

### 4. Search Public Marketplace
Unauthenticated requests can now index your fully audited SaaS component!
```bash
curl -X GET http://localhost:8000/listings
```
