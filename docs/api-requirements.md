# Binboi API and Integration Requirements

This file documents the APIs and external services Binboi expects around the current product.

## Internal API surfaces

### Go control plane

Primary responsibilities:

- tunnel control and lifecycle
- relay handshake and session flow
- runtime token validation for the CLI
- public proxy integration

Stable versioned product endpoints:

- `GET /api/v1/health` — liveness (no auth)
- `GET /api/v1/ready` — readiness (no auth)
- `GET /api/v1/instance` — instance metadata (no auth)
- `GET /api/v1/nodes` — node list (no auth)
- `GET /api/v1/metrics` — JSON operational counters (auth required)
- `GET /api/v1/limits` — quota and rate limit config (auth required)
- `GET /api/v1/snapshot` — combined health, readiness, metrics, and limits (auth required)
- `GET /api/v1/tunnels?scope=all|active|inactive` (auth required)
- `POST /api/v1/tunnels` (auth required)
- `DELETE /api/v1/tunnels/:id` (auth required)
- `GET /api/v1/events?limit=50&action=<action>` (auth required)
- `GET /api/v1/events/export?format=ndjson&limit=200` (auth required)
- `GET /api/v1/requests?limit=200&kind=REQUEST|WEBHOOK` (auth required)
- `GET /api/v1/requests/export?format=ndjson&limit=200` (auth required)
- `GET /api/v1/requests/:id/archive` (auth required)
- `POST /api/v1/requests/:id/replay` (auth required)
- `GET /api/v1/domains` (auth required)
- `POST /api/v1/domains` (auth required)
- `DELETE /api/v1/domains/:name` (auth required)
- `POST /api/v1/domains/verify` (auth required)
- `GET /api/v1/auth/me`

Prometheus metrics endpoint at root level:

- `GET /metrics` (auth required)

Legacy or operational endpoints still used internally or for preview administration:

- `/ws/logs`
- `/api/tokens/current`
- `/api/tokens/generate`
- `/api/tokens/revoke`

### Next.js application API

Current route groups include:

- `app/api/auth/*`
- `app/api/billing/*`
- `app/api/paddle/webhook`
- `app/api/assistant`
- `app/api/ai/assist`
- `app/api/stats`
- `app/api/controlplane/*`
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
- For split deployments, set `BINBOI_API_BASE` in the Next.js environment so server-side routes can reach the Go control plane over the correct private address.

See [`environments.md`](./environments.md) for local, dev, and production setup guidance.

_Documentation maintained by Sardor Azimov._
