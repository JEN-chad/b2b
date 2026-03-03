# Phase 4 KYC Engine Testing Walkthrough 

This guide provides extremely clear, step-by-step instructions on how to comfortably test the B2B marketplace's KYC engine locally, perfect for beginners!

## Before Starting
1. Open a terminal in the root of the project: `j:\Zuntra\b2b`.
2. Ensure you have the `.env` settings updated in `j:\Zuntra\b2b\.env`, specifically the `KYC_ENFORCEMENT=STRICT` value.
3. Start the API application by running the following command:
   ```bash
   pnpm run dev
   ```

The system requires you to be authenticated first! Please make sure you have successfully generated an `accessToken` cookie from Phase 3 before attempting any Phase 4 routes.

---

## 1. Submitting KYC Securely

Now that you are logged in, you must provide your government identification to open a Digital Asset Listing. Because the data is highly sensitive, Drizzle automatically stores it with AES-256 encryption.

**Using Postman or cURL (Requires Auth Cookie):**
```bash
curl -X POST http://localhost:8000/kyc/submit \
-H "Cookie: accessToken=<place-the-value-from-login-response-here>" \
-H "Content-Type: application/json" \
-d '{
  "panNumber": "ABCDE1234F",
  "gstNumber": "22AAAAA0000A1Z5"
}'
```

**Expected Successful Response**:
Your status officially becomes a "Pending" record.
```json
{
  "message": "KYC submitted successfully",
  "data": {
    "status": "PENDING"
  }
}
```

## 2. Checking Your KYC Status

You can constantly poll the backend to check if the Admin has approved your verification documents.

**Using Postman or cURL:**
```bash
curl -X GET http://localhost:8000/kyc/status \
-H "Cookie: accessToken=<place-the-value-from-login-response-here>"
```

**Expected Response**:
```json
{
  "status": "PENDING",
  "submittedAt": "2026-03-03T10:00:00.000Z"
}
```

---

## 3. Admin Review & Verification Process

The most critical part of the system is the Admin Review. 

**Important Permission Warning:** 
Standard "Buyer" accounts are mathematically forbidden from hitting this route. To successfully test it:
1. Open up Drizzle Studio `pnpm db:studio`.
2. Locate your specific testing account in the `users` table.
3. Manually change your `role` column from `"BUYER"` to `"ADMIN"`.
4. Log back in if necessary to refresh the cookie token.

### The Flexible "Review" Route
Because of our recent system enhancements, you can patch a KYC Record using **EITHER**:
* The automatically generated UUID of the `kyc_record` table.
* The original User ID (`user_id`) from your own `users` table!

### A) Example: Rejecting the KYC Document 
If an admin spots a blurry PAN card upload, they can hard reject the submission by passing `status: "REJECTED"` and explaining the failure in `rejectionReason`.

**Route:** `PATCH http://localhost:8000/kyc/<your_user_id_here>/review`
```bash
curl -X PATCH http://localhost:8000/kyc/<your_user_id_here>/review \
-H "Cookie: accessToken=<admin_token_here>" \
-H "Content-Type: application/json" \
-d '{
  "status": "REJECTED",
  "rejectionReason": "The PAN card image is too blurry to securely read. Please provide another snapshot."
}'
```

**Expected Backend Output:**
```json
{
  "message": "KYC record updated to REJECTED"
}
```

### B) Example: Approving the KYC Document
Once the admin verifies the documents, they must approve it!

**Route:** `PATCH http://localhost:8000/kyc/<your_user_id_here>/review`
```bash
curl -X PATCH http://localhost:8000/kyc/<your_user_id_here>/review \
-H "Cookie: accessToken=<admin_token_here>" \
-H "Content-Type: application/json" \
-d '{
  "status": "APPROVED"
}'
```

**Expected Backend Output:**
```json
{
  "message": "KYC record updated to APPROVED"
}
```

Your user is effectively given the green light! They are now free to build a Marketplace Listing in Phase 5 without triggering the strict backend access errors.
