# Binboi API and Integration Requirements

This file documents the APIs and external services Binboi expects around the current product.

## Internal API surfaces

### Go control plane

Primary responsibilities:

- tunnel control and lifecycle
- relay handshake and session flow
- runtime token validation for the CLI
- public proxy integration

Representative endpoints and channels:

- `/ws/logs`
- `/api/tokens/current`
- `/api/tokens/generate`
- `/api/tokens/revoke`
- `/api/domains`
- `/api/domains/verify`
- `/api/tunnels`

### Next.js application API

Current route groups include:

- `app/api/auth/*`
- `app/api/billing/*`
- `app/api/paddle/webhook`
- `app/api/assistant`
- `app/api/ai/assist`
- `app/api/stats`
- `app/api/v1/tokens`

## Required services

### Required for full product behavior

- Postgres for website auth and billing state
- SQLite for relay state unless you replace that storage layer

### Required for specific features

- GitHub OAuth for social sign-in
- Paddle for paid plans and webhook sync
- Email provider for production verification, password reset, and invite delivery

## Environment variables by integration

### Relay and control plane

- `BINBOI_API_ADDR`
- `BINBOI_TUNNEL_ADDR`
- `BINBOI_PROXY_ADDR`
- `BINBOI_BASE_DOMAIN`
- `BINBOI_PUBLIC_SCHEME`
- `BINBOI_PUBLIC_PORT`
- `BINBOI_DATABASE_PATH`
- `BINBOI_AUTH_DATABASE_URL`

### CLI

- `BINBOI_API_URL`
- `BINBOI_SERVER_ADDR`
- `BINBOI_AUTH_TOKEN`
- `BINBOI_DASHBOARD_URL`

### Web app and auth

- `NEXT_PUBLIC_BINBOI_API_BASE`
- `NEXT_PUBLIC_BINBOI_WS_BASE`
- `DATABASE_URL`
- `AUTH_SECRET`
- `AUTH_GITHUB_ID`
- `AUTH_GITHUB_SECRET`

### Billing

- `PADDLE_API_KEY`
- `PADDLE_CLIENT_TOKEN`
- `PADDLE_WEBHOOK_SECRET`
- `PADDLE_PRO_PRICE_ID`
- `PADDLE_SCALE_PRICE_ID`

## Production readiness notes

- Without `DATABASE_URL`, database-backed auth stays disabled and the web app falls back to preview behavior.
- Without email delivery, auth flows rely on preview links and are not production-complete.
- Without Paddle configuration, pricing remains informational and billing actions should be treated as incomplete.

_Documentation maintained by Sardor Azimov._
