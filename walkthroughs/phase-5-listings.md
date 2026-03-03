# Phase 5: Listing Management System Walkthrough

This guide details how to officially establish a Digital Asset up for sale inside our secure B2B platform.

It is critical that you are both authenticated, AND have an **"APPROVED"** KYC Status (detailed in Phase 4) to ensure your requests don't instantly bounce!

## Starting Development
1. Open a terminal in the root of the project: `j:\Zuntra\b2b`.
2. Ensure your `.env` is fully set up.
3. Start the API application:
   ```bash
   pnpm run dev
   ```
4. The API will respond locally on `http://localhost:8000`.

---

## The Listing Lifecycle

Creating a Marketplace listing runs through an incredibly secure multi-step workflow.

### Step 1: Initialize an Unpublished Draft
This triggers the `DRAFT` status and stores the metrics strictly privately.

**Using Postman or cURL (Requires Auth Cookie + Approved KYC):**
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

**What Happens If My KYC Is NOT Approved?**
If your environment uses `KYC_ENFORCEMENT=STRICT`, and your KYC was rejected or simply pending, the server correctly flags a strict Forbidden error and refuses to create the listing!
```json
{
  "error": "Forbidden",
  "message": "KYC approval restricted to perform this action. Your current KYC status is: PENDING"
}
```

**Expected Successful Response**:
```json
{
  "message": "Listing created successfully",
  "data": {
    "status": "DRAFT",
    "slug": "premium-saas-analytics-platform"
  }
}
```

### Step 2: Push the Draft to Moderation
Once you finalize your financial statistics, you push the item live for an internal review. The backend shifts it from `DRAFT` into `UNDER_REVIEW`.

**Using Postman or cURL:**
```bash
curl -X POST http://localhost:8000/seller/listings/<listing_uuid_from_step_1>/submit \
-H "Cookie: accessToken=<your_access_token>"
```

### Step 3: Admin Final Verification

Notice how the route paths dynamically switch to `/admin/`! As a highly monitored platform, an ADMIN or COMPLIANCE user must review your metrics, verify the integrity, and authorize the final publication. 

(Change your `role` to `ADMIN` inside Drizzle Studio `users` to test this.)

**Using Postman or cURL (`ADMIN` ONLY):**
```bash
curl -X PATCH http://localhost:8000/admin/listings/<listing_uuid_from_step_1>/review \
-H "Cookie: accessToken=<admin_access_token>" \
-H "Content-Type: application/json" \
-d '{
  "status": "APPROVED"
}'
```

*(You can also use values like "CHANGES_REQUESTED", "LIVE", "LOCKED", "SOLD")*

### Step 4: The Listing is LIVE!
Your digital asset officially drops onto the marketplace API. Unauthenticated users globally can now natively read your fully verified public metrics without being signed into the portal.

**Using Postman or cURL (No Auth Required):**
```bash
curl -X GET http://localhost:8000/listings
```
*Expected Response: An array of your beautifully verified financial listings!*
