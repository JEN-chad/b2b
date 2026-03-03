# Phase 3: Identity & Authentication System Setup

This step-by-step walkthrough explains how to test the foundational secure authentication flow in our Express.js backend API using tools like Postman or cURL. 

## Prerequisites
1. Open a terminal in the root of the project: `j:\Zuntra\b2b`
2. Ensure you have the `.env` configured inside `j:\Zuntra\b2b\.env`.
3. Start the API application:
   ```bash
   pnpm run dev
   ```
4. The API will run locally on `http://localhost:8000`.

---

## The Safe Login Flow

The B2B application uses a strict OTP (One Time Password) approach combined with secure JWT access tokens. There are no traditional insecure passwords used.

### Step 1: Request an Account (Signup)
You must initialize an OTP sent to a new email address. This creates an unverified account.

**Using cURL:**
```bash
curl -X POST http://localhost:8000/auth/signup \
-H "Content-Type: application/json" \
-d '{
  "email": "testuser@example.com",
  "fullName": "Test Admin"
}'
```

**What Happens?**
Check your API server's terminal! Since we aren't using an email provider like SendGrid for development yet, the backend automatically logs your randomly generated numeric OTP directly to your command line console. Find it and save it.

### Step 2: Verify the Email
You must prove you own the email by passing the OTP back to the backend within 5 minutes.

**Using cURL:**
```bash
curl -X POST http://localhost:8000/auth/verify-email \
-H "Content-Type: application/json" \
-d '{
  "email": "testuser@example.com",
  "token": "123456"   # Replace with the real OTP from Step 1 terminal
}'
```

### Step 3: Secure Login Request
Your email is now verified! Now you must request a fresh login session. This triggers another OTP generation for security.

**Using cURL:**
```bash
curl -X POST http://localhost:8000/auth/login-request \
-H "Content-Type: application/json" \
-d '{
  "email": "testuser@example.com"
}'
```
*Again, check your API server terminal for the newly generated OTP.*

### Step 4: Finalize Login (Obtain Tokens!)

Finally, submit the new login OTP. 

**Using cURL:**
```bash
curl -X POST http://localhost:8000/auth/login \
-H "Content-Type: application/json" \
-d '{
  "email": "testuser@example.com",
  "token": "654321"   # Replace with the second terminal OTP
}'
```

If successful, the backend will return two extremely important pieces of information:
1.  **A secure `accessToken` cookie:** Because our backend utilizes `HttpOnly Secure`, Postman and browsers will automatically save this cookie for subsequent requests!
2.  **A JSON response:** Containing your fresh user details, showing a default `role` of `"BUYER"`.

You are now authenticated and ready for Phase 4.
