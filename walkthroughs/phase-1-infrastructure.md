# Phase 1: Infrastructure Setup

This guide walks you through the foundation of the B2B marketplace project. 
This phase focuses only on the structural setup and tooling of our monorepo, without any business logic.

## Overview of the Architecture

We use a **Monorepo** structure powered by **Turborepo** and **pnpm workspaces**. This allows us to keep our frontend UI and backend API neatly separated, while sharing essential code (like database schemas and configurations).

### Key Technologies
* **Frontend:** Next.js (App Router) + TypeScript
* **Backend:** Node.js + Express + TypeScript
* **Database:** Neon PostgreSQL
* **ORM:** Drizzle ORM
* **Tooling:** pnpm, Turborepo, ESLint, Prettier

## Folder Structure Explained

```text
root/
  apps/
    web/              (Next.js frontend application)
    api/              (Express backend application)
  packages/
    db/               (Centralized Drizzle database schemas and connections)
    types/            (Shared TypeScript interfaces across apps)
    config/           (Environment variable validation using Zod)
  .env                (Environment variables)
  turbo.json          (Turborepo configuration for fast builds)
  pnpm-workspace.yaml (Tells pnpm this is a monorepo)
```

## How to Start the System

Because this is a Turborepo, you can easily start all apps at the same time using a single command from the root directory:

1. Open your terminal in the root folder (`j:\Zuntra\b2b\`).
2. Run the development server command:
   ```bash
   pnpm run dev
   ```

This will automatically pick up the `dev` scripts in both the Next.js `web` app and the Express `api` app and run them concurrently!

### Database Management (Drizzle Studio)
To easily view and edit your Neon PostgreSQL database tables, you can run Drizzle's visual studio:

1. Open a new terminal instance in the root folder.
2. Run:
   ```bash
   pnpm --filter @b2b/db db:studio
   ```
3. Open `https://local.drizzle.studio` in your browser.
