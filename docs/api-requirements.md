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

## Which APIs and services do you actually need?

### No third-party API required for basic local tunneling

- Binboi can run locally with the Go relay, the CLI, and SQLite only.
- For this mode, the `BINBOI_*` relay variables plus `BINBOI_DATABASE_PATH` are enough.

### Required for the hosted web experience

- Postgres is required for database-backed auth, invites, access tokens, billing state, and domain ownership records.
- Relevant envs: `DATABASE_URL`, `BINBOI_AUTH_DATABASE_URL`

### Optional integrations by feature

- GitHub OAuth: only needed for GitHub social sign-in.
- Relevant envs: `AUTH_GITHUB_ID`, `AUTH_GITHUB_SECRET`
- OpenAI: only needed for the assistant and AI help routes in the web app.
- Relevant envs: `OPENAI_API_KEY`, `OPENAI_MODEL`, `OPENAI_BASE_URL`
- Paddle: only needed for paid plans, checkout, subscription changes, and webhook reconciliation.
- Relevant envs: `PADDLE_API_KEY`, `PADDLE_CLIENT_TOKEN`, `PADDLE_WEBHOOK_SECRET`, `PADDLE_PRO_PRICE_ID`, `PADDLE_PRO_PRODUCT_ID`, `PADDLE_SCALE_PRICE_ID`, `PADDLE_SCALE_PRODUCT_ID`, `PADDLE_API_BASE_URL`
- Email provider: recommended in production for verification, password reset, and invite delivery. Development preview links can still work without it.

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
- `PADDLE_API_BASE_URL`
- `PADDLE_CLIENT_TOKEN`
- `PADDLE_WEBHOOK_SECRET`
- `PADDLE_PRO_PRICE_ID`
- `PADDLE_PRO_PRODUCT_ID`
- `PADDLE_SCALE_PRICE_ID`
- `PADDLE_SCALE_PRODUCT_ID`

### AI assistant

- `OPENAI_API_KEY`
- `OPENAI_MODEL`
- `OPENAI_BASE_URL`

## Production readiness notes

- Without `DATABASE_URL`, database-backed auth stays disabled and the web app falls back to preview behavior.
- Without `OPENAI_API_KEY`, assistant routes can still answer with fallback guidance, but no live model response is attempted.
- Without email delivery, auth flows rely on preview links and are not production-complete.
- Without Paddle configuration, pricing remains informational and billing actions should be treated as incomplete.

_Documentation maintained by Sardor Azimov._
