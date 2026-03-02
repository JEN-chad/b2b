# B2B Marketplace Platform

A production-grade, compliance-first digital asset marketplace platform designed for the Indian market.

## 🏗️ Architecture Overview (Up to Phase 3)

The project is structured as a **Turborepo** monorepo using **pnpm** as the package manager. It separates the frontend, backend, and shared packages to enforce clean architecture and strict typing across the stack.

### Tech Stack
*   **Frontend**: Next.js (App Router), React, Tailwind CSS, Framer Motion
*   **Backend**: Node.js, Express.js (RESTful APIs)
*   **Database**: Neon PostgreSQL, Drizzle ORM
*   **Language**: Strict TypeScript across all apps and packages

### Folder Structure
*   `apps/`
    *   `api/` - Express backend providing the REST APIs (Runs on port 8000).
    *   `web/` - Next.js frontend application (Runs on port 3000).
*   `packages/`
    *   `db/` - Drizzle ORM schema, migrations, and database connection logic.
    *   `config/` - Shared configuration and environment validation (Zod).
    *   `types/` - Shared TypeScript types and interfaces.

### Project Phases Completed

*   **Phase 1: Infrastructure Setup**
    *   Monorepo initialization with Turborepo and pnpm.
    *   Strict TypeScript configuration and ESLint + Prettier tooling.
    *   Centralized configuration management.

*   **Phase 2: Database & Identity Schema**
    *   Setup of `users`, `profiles`, `sessions`, `audit_logs`, and `otp_tokens` tables.
    *   Proper indexing, constraints, and foreign keys mapped using Drizzle ORM.

*   **Phase 3: Authentication System**
    *   Production-grade auth backend implemented in `apps/api`.
    *   Bcrypt password hashing and secure session management.
    *   Email OTP verification with expiration and rate limiting.
    *   JWT-based Access Tokens (short-lived) and rotating Refresh Tokens (DB-backed).
    *   HttpOnly Secure cookies and CSRF protection.
    *   Role-based and KYC-status authorization middlewares.

*   **Phase 4: KYC Engine (Pending Testing)**
    *   KYC records database schema implementation.
    *   Role and environment-based KYC enforcement (`STRICT` vs `BYPASS`).
    *   *Note: Phase 4 features are implemented but await final testing.*

---

## 🚀 Getting Started: Setup Instructions

Follow these step-by-step instructions to clone the repository, install dependencies, and run the project locally.

### 1. Prerequisites
Ensure you have the following installed on your machine:
*   [Node.js](https://nodejs.org/) (v18 or higher)
*   [pnpm](https://pnpm.io/installation) (v9)
*   A [Neon PostgreSQL](https://neon.tech/) database (or any PostgreSQL instance)

### 2. Clone the Repository
Clone the project to your local machine and navigate into the directory:
```bash
git clone <your-repository-url>
cd b2b
```

### 3. Install Dependencies
Since this is a monorepo, use `pnpm` from the root directory to install all dependencies for apps and packages simultaneously:
```bash
pnpm install
```

### 4. Environment Configuration
You need to set up the environment variables.
Copy the example environment file to create your own local `.env` file:
```bash
cp .env.example .env
```
Open the `.env` file and update the values:
*   `DATABASE_URL`: Add your Neon PostgreSQL connection string.
*   `JWT_SECRET` & `JWT_REFRESH_SECRET`: In production these must be cryptographically secure random strings. For local development, you can use any string.
*   `PORT`: Ensure it's set to `8000` (default for the API).

### 5. Database Setup
Push the Drizzle ORM schema to your PostgreSQL database to create the necessary tables:
```bash
pnpm --filter @b2b/db db:push
```
*(Optional)* If you want to view your database using Drizzle Studio, run:
```bash
pnpm --filter @b2b/db db:studio
```

### 6. Run the Application
Start both the Next.js frontend and the Express backend concurrently using Turborepo:
```bash
pnpm dev
```

*   **Frontend (Next.js)** will be available at: [http://localhost:3000](http://localhost:3000)
*   **Backend (Express API)** will be available at: [http://localhost:8000](http://localhost:8000)
