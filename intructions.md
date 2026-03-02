
--------------------------------------------------
PHASE 1 PROMPT
--------------------------------------------------
Initialize a production-grade monorepo for a compliance-heavy marketplace platform.

Tech stack:
- Frontend: Next.js (App Router) + TypeScript strict mode
- Backend: Node.js + Express + TypeScript
- Database: Neon PostgreSQL
- ORM: Drizzle
- Package manager: pnpm
- Monorepo tooling: Turborepo

Create this folder structure:

root/
  apps/
    web/              (Next.js app router)
    api/              (Express backend)
  packages/
    db/               (Drizzle schema & migrations)
    types/            (Shared TypeScript types)
    config/           (Env validation & shared config)
  .env.example
  turbo.json
  pnpm-workspace.yaml
  tsconfig.base.json

Requirements:
- Strict TypeScript
- ESLint + Prettier
- Environment variable validation using Zod
- Centralized config system
- Proper tsconfig references

Do not create business logic yet.
Do not create UI pages yet.
Only infrastructure setup.

--------------------------------------------------
PHASE 2 PROMPT
--------------------------------------------------

Using Drizzle ORM, design the core authentication and identity schema for a financial marketplace.

Database: Neon PostgreSQL

Create the following tables with proper indexes, constraints and foreign keys:

1. users
   - id (uuid, pk)
   - email (unique, indexed)
   - password_hash
   - role (enum: BUYER, SELLER, ADMIN, COMPLIANCE)
   - email_verified (boolean)
   - phone_verified (boolean)
   - kyc_status (enum: NOT_STARTED, PENDING, UNDER_REVIEW, APPROVED, REJECTED)
   - created_at
   - updated_at

2. profiles
   - id
   - user_id (fk users.id, cascade delete)
   - full_name
   - phone_number
   - country
   - state
   - entity_type (enum: INDIVIDUAL, COMPANY)

3. sessions
   - id
   - user_id (fk)
   - refresh_token_hash
   - expires_at
   - created_at
   - revoked (boolean)

4. audit_logs
   - id
   - user_id (nullable)
   - action
   - entity_type
   - entity_id
   - metadata (jsonb)
   - ip_address
   - created_at

5. otp_tokens
   - id
   - email_or_phone
   - code_hash
   - type (EMAIL_VERIFY, LOGIN, PHONE_VERIFY)
   - expires_at
   - attempts

All sensitive fields must be indexed properly.
All relations must use foreign key constraints.

Generate migration files.
Do not create APIs yet.

--------------------------------------------------
PHASE 3 PROMPT
--------------------------------------------------

Implement production-grade authentication system in Express.

Requirements:

- Password hashing using bcrypt
- Email OTP verification (expires in 5 minutes)
- Rate limit OTP attempts
- JWT access token (15 min expiry)
- Refresh token stored in DB (rotating)
- HttpOnly Secure cookies
- CSRF protection
- Role-based middleware
- KYC-status middleware

Create folder structure inside apps/api:

src/
  modules/
    auth/
      auth.controller.ts
      auth.service.ts
      auth.routes.ts
      auth.middleware.ts
  utils/
  middleware/
  config/
  server.ts

Implement:

POST /auth/signup
POST /auth/verify-email
POST /auth/login
POST /auth/refresh
POST /auth/logout

All routes must:
- Validate input with Zod
- Log audit event
- Never expose internal errors


--------------------------------------------------
PHASE 4 PROMPT
--------------------------------------------------

Extend database schema to implement KYC engine.

Create table:

kyc_records

id

user_id (fk)

pan_number (encrypted)

aadhaar_masked

company_pan

cin_or_llpin

gst_number

status (PENDING, UNDER_REVIEW, APPROVED, REJECTED)

reviewer_id (fk users.id)

rejection_reason

submitted_at

reviewed_at

Rules:

Documents must be stored encrypted

No raw file access from frontend

KYC enforcement must depend on environment variable:

KYC_ENFORCEMENT=STRICT | BYPASS
Behavior:

If KYC_ENFORCEMENT=STRICT:

Only APPROVED users can:

create listings

unlock listings

make offers

If KYC_ENFORCEMENT=BYPASS:

requireApprovedKYC middleware must auto-allow access

KYC records still stored normally

KYC status still updated normally

No logic removed

Only enforcement skipped

Implement API:

POST /kyc/submit
GET /kyc/status
ADMIN: PATCH /kyc/:id/review

Add middleware:

requireApprovedKYC

Middleware must:

if (config.KYC_ENFORCEMENT === "BYPASS") {
  return next()
}

Otherwise enforce strict validation.

--------------------------------------------------
PHASE 5 PROMPT
--------------------------------------------------

Implement Seller Listing Engine.

Database tables:

listings
- id
- seller_id (fk users.id)
- title
- slug (unique)
- asset_type (SAAS, ECOMMERCE, BLOG, APP, DOMAIN)
- industry
- revenue_monthly
- profit_monthly
- asking_price
- status (DRAFT, UNDER_REVIEW, CHANGES_REQUESTED, APPROVED, LIVE, LOCKED, SOLD)
- visibility (PUBLIC, PRIVATE)
- nda_required (boolean)
- created_at
- updated_at

listing_documents
- id
- listing_id (fk)
- type (FINANCIAL_PROOF, ANALYTICS_PROOF, OWNERSHIP_PROOF)
- storage_key
- verified (boolean)

Implement:

POST /seller/listings
PATCH /seller/listings/:id
POST /seller/listings/:id/submit
ADMIN: PATCH /admin/listings/:id/review

Rules:
- Seller must pass requireApprovedKYC middleware (environment controlled)
- Submitting moves DRAFT → UNDER_REVIEW
- Admin approval required before LIVE
- All status changes logged in audit_logs
- All critical updates inside DB transaction


--------------------------------------------------
PHASE 6 PROMPT
--------------------------------------------------

Implement Buyer interaction system.

Tables:

ndas
- id
- buyer_id
- listing_id
- signed_at

offers
- id
- listing_id
- buyer_id
- price
- terms
- status (PENDING, COUNTERED, ACCEPTED, REJECTED, EXPIRED)
- expires_at

unlock_records
- id
- buyer_id
- listing_id
- unlocked_at

Rules:
- Buyer must pass requireApprovedKYC middleware (environment controlled)   
- NDA required before unlock
- Unlock logs audit
- Accepted offer auto-creates deal room

Implement routes:
POST /buyer/listings/:id/unlock
POST /buyer/listings/:id/offer
PATCH /seller/offers/:id/respond

--------------------------------------------------
PHASE 7 PROMPT
--------------------------------------------------

Implement Deal Room Engine.

Tables:

deal_rooms
- id
- listing_id
- buyer_id
- seller_id
- status (INITIATED, ESCROW_PENDING, ESCROW_FUNDED, DUE_DILIGENCE, AGREEMENT_SIGNED, TRANSFER_IN_PROGRESS, COMPLETED, CANCELLED)

deal_tasks
- id
- deal_room_id
- title
- assigned_to (BUYER/SELLER)
- completed

escrow_transactions
- id
- deal_room_id
- provider
- external_id
- amount
- status
- created_at

Rules:
- Deal room auto-created when offer ACCEPTED
- Escrow confirmation via webhook only
- Listing locked after ESCROW_FUNDED
- Escrow release requires dual approval
- All actions logged

--------------------------------------------------
PHASE 8 PROMPT
--------------------------------------------------

Add secure chat inside deal room.


--------------------------------------------------
PHASE 9 PROMPT
--------------------------------------------------

Build Next.js frontend using App Router.

Pages:

/auth/*
/seller/dashboard
/buyer/dashboard
/listings
/listings/[slug]
/deal-room/[id]

Use:
- Server components
- React Query only when needed
- Zod validation
- Role-based route protection

Do not embed business logic in frontend.
All sensitive logic server-side only.