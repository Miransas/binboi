# Binboi Web App

This package contains the Next.js App Router application for Binboi.

## What lives here

- public product pages
- docs pages
- premium auth pages and auth APIs
- protected dashboard routes
- billing flows and Paddle webhook handling
- Drizzle schema and migrations for user-facing product data

## Key areas

- [`app/README.md`](./app/README.md): route groups and API surfaces
- [`components/README.md`](./components/README.md): shared UI and feature components
- [`db/README.md`](./db/README.md): schema bootstrap and Drizzle entrypoints
- [`drizzle/README.md`](./drizzle/README.md): migration files
- [`lib/README.md`](./lib/README.md): shared business logic for auth, billing, control plane integration, and pricing

## Local commands

```bash
npm install
npm run dev
npm run lint
```

## Core environment variables

- `DATABASE_URL`
- `AUTH_SECRET`
- `AUTH_GITHUB_ID`
- `AUTH_GITHUB_SECRET`
- `NEXT_PUBLIC_BINBOI_API_BASE`
- `NEXT_PUBLIC_BINBOI_WS_BASE`
- `OPENAI_API_KEY`
- `OPENAI_MODEL`
- `OPENAI_BASE_URL`
- `PADDLE_API_KEY`
- `PADDLE_API_BASE_URL`
- `PADDLE_CLIENT_TOKEN`
- `PADDLE_WEBHOOK_SECRET`
- `PADDLE_PRO_PRICE_ID`
- `PADDLE_PRO_PRODUCT_ID`
- `PADDLE_SCALE_PRICE_ID`
- `PADDLE_SCALE_PRODUCT_ID`

## Auth notes

- NextAuth remains the session layer.
- Credentials auth, email verification, password reset, and invite acceptance are implemented through `app/api/auth/*` plus helpers in `lib/auth-system.ts`.
- Preview mode is still supported when `DATABASE_URL` is absent.
- The assistant can still return fallback guidance when `OPENAI_API_KEY` is absent.

_Documentation maintained by Sardor Azimov._
