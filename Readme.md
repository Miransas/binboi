# Binboi

Binboi is a self-hosted tunneling stack built around one clear ngrok-like loop:

1. reserve or attach a public URL
2. authenticate a local machine with a token
3. open a relay session from the CLI
4. forward public HTTP traffic into a local service

The repository combines:

- a Go control plane, tunnel listener, and public proxy
- a CLI agent for `login`, `whoami`, and `http`
- a Next.js web app for auth, billing, docs, setup, and dashboard workflows

The canonical repository URL is [https://github.com/Miransas/binboi](https://github.com/Miransas/binboi).

## Current status

Working now:

- HTTP tunnel reservation and forwarding
- CLI authentication with personal access tokens or preview tokens
- control plane state for tunnels, requests, events, domains, and instance metadata
- dashboard access token management
- custom auth flows, NextAuth sessions, and GitHub OAuth when configured
- billing integration through Paddle
- browser-safe control plane access through the Next.js proxy layer

Still not the focus of this release:

- raw TCP as a finished product
- full managed TLS lifecycle
- team/org multi-tenancy
- production email provider integration out of the box
- advanced AI inspection as a shipping feature

## Repository map

- [`cmd/`](./cmd/README.md): CLI and server entrypoints
- [`internal/`](./internal/README.md): Go runtime internals
- [`web/`](./web/README.md): Next.js product app
- [`configs/`](./configs/README.md): sample config files and env examples
- [`docs/`](./docs/README.md): architecture, API, release, and environment docs
- [`packaging/`](./packaging/README.md): release packaging and Homebrew files

## Stable API contract

The Go control plane now exposes a stable product contract under `/api/v1/*`.

Core endpoints:

- `GET /api/v1/health`
- `GET /api/v1/instance`
- `GET /api/v1/nodes`
- `GET /api/v1/tunnels?scope=all|active|inactive`
- `POST /api/v1/tunnels`
- `DELETE /api/v1/tunnels/:id`
- `GET /api/v1/events?limit=50`
- `GET /api/v1/requests?limit=200`
- `GET /api/v1/domains`
- `POST /api/v1/domains`
- `POST /api/v1/domains/verify`
- `GET /api/v1/auth/me`

All `/api/v1/*` endpoints except `GET /api/v1/auth/me` return an envelope:

```json
{
  "data": {},
  "meta": {
    "instance_name": "Binboi Self-Hosted",
    "auth_mode": "personal-access-token",
    "access_scope": "trusted-local",
    "generated_at": "2026-04-05T20:00:00Z"
  }
}
```

This keeps the contract stable while still preserving the older `/api/*` routes for compatibility and operational tooling.

## Quick start

### Option A: local preview mode

This is the fastest path to a working ngrok-style tunnel loop.

1. Start the Go control plane:

```bash
go run ./cmd/binboi-server
```

2. Build the CLI:

```bash
go build -o binboi ./cmd/binboi-client
```

3. Get the preview token:

```bash
curl http://127.0.0.1:8080/api/tokens/current
```

4. Log in and open a tunnel:

```bash
./binboi login --token <preview-token>
./binboi whoami
./binboi http 3000 my-app
```

5. Visit the public URL:

```text
http://my-app.binboi.localhost:8000
```

### Option B: local full-stack mode

Use this when you want the real product loop with accounts, access tokens, dashboard auth, and billing state.

1. Start Postgres.
2. Set `BINBOI_AUTH_DATABASE_URL` for the Go service.
3. Set `DATABASE_URL` and `AUTH_SECRET` for the web app.
4. Start the Go control plane.
5. Start the web app:

```bash
cd web
npm install
npm run dev
```

6. Open the dashboard at `http://127.0.0.1:3000/dashboard`, create an access token, then authenticate the CLI.

## Environment model

### Go control plane

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

### Web app

- `DATABASE_URL`
- `AUTH_SECRET`
- `NEXT_PUBLIC_BINBOI_API_BASE`
- `NEXT_PUBLIC_BINBOI_WS_BASE`
- `BINBOI_API_BASE`
- `BINBOI_WS_BASE`
- `AUTH_GITHUB_ID`
- `AUTH_GITHUB_SECRET`
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

Detailed setup guidance:

- [`docs/environments.md`](./docs/environments.md)
- [`docs/api-requirements.md`](./docs/api-requirements.md)
- [`docs/architecture-overview.md`](./docs/architecture-overview.md)

## Deployment notes

### Local

- preview mode can run with SQLite only
- full-stack local needs both SQLite and Postgres

### Shared dev or staging

- run Go and Next.js as separate services
- set `BINBOI_API_BASE` in the Next.js environment to the private Go API address
- keep browser-facing code on the Next.js `/api/controlplane/*` proxy routes

### Production-like

- terminate TLS at your ingress or reverse proxy
- keep the Go API reachable from Next.js over a private network
- do not rely on preview token mode
- use Postgres-backed auth

## Docker

[`docker-compose.yml`](./docker-compose.yml) now reflects the Go control plane plus Postgres split and uses the correct health endpoint: `GET /api/health`.

## Installation helpers

- local source install: `go build -o binboi ./cmd/binboi-client`
- quick installer: [`install.sh`](./install.sh)
- Homebrew formula: [`packaging/homebrew/binboi.rb`](./packaging/homebrew/binboi.rb)
- release notes: [`docs/releasing-cli.md`](./docs/releasing-cli.md)

## Extra docs

- [`CONTRIBUTING.md`](./CONTRIBUTING.md)
- [`SECURITY.md`](./SECURITY.md)
- [`LICENSE`](./LICENSE)

_Documentation maintained by Sardor Azimov._
