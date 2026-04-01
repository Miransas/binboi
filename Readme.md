# Binboi

Binboi is a self-hosted tunneling platform with three connected products in one repository:

- a Go control plane and public relay
- a CLI agent that opens tunnels from local machines
- a Next.js web app for auth, billing, onboarding, and dashboard workflows

The canonical repository URL is [https://github.com/Miransas/binboi](https://github.com/Miransas/binboi).

## What Binboi currently does

- Creates and manages HTTP tunnels over a single yamux-backed control connection
- Issues user-scoped access tokens for the CLI
- Supports custom auth pages, NextAuth sessions, and GitHub OAuth when configured
- Stores relay state in SQLite by default
- Stores product users, sessions, billing state, invites, and auth tokens in Postgres
- Exposes a premium marketing site, docs area, auth flow, and dashboard in the Next.js app
- Syncs paid plans through Paddle checkout and webhook events

## Product boundaries

Stable enough to iterate on:

- Tunnel reservation and lifecycle
- CLI login and relay handshake
- Dashboard onboarding and access token management
- Email verification, password reset, invite acceptance, and session-backed auth
- Billing plan upgrades, cancelation, and webhook reconciliation
- Domain registration and verification flows

Still intentionally incomplete:

- raw TCP as a finished product surface
- fully managed TLS/CA lifecycle
- production email delivery wiring
- advanced AI inspection policies
- richer org/team account management

## Repository map

- [`cmd/`](./cmd/README.md): CLI and server entrypoints
- [`internal/`](./internal/README.md): Go application internals for auth, relay, proxy, and storage
- [`web/`](./web/README.md): Next.js App Router frontend, auth APIs, database schema, and billing UI
- [`configs/`](./configs/README.md): local YAML configuration examples
- [`packaging/`](./packaging/README.md): release packaging assets including Homebrew
- [`docs/`](./docs/README.md): extra project documentation, architecture notes, and release docs
- [`scripts/`](./scripts/README.md): helper automation space

## Architecture at a glance

1. The Go server in [`cmd/binboi-server`](./cmd/binboi-server/README.md) starts the control plane API, the tunnel listener, and the public proxy.
2. The CLI in [`cmd/binboi-client`](./cmd/binboi-client/README.md) authenticates with an access token and opens a relay session.
3. The Next.js app in [`web/`](./web/README.md) handles auth UI, auth APIs, protected dashboard pages, pricing, billing, and docs.
4. SQLite stores relay runtime state by default, while Postgres stores user-facing SaaS data such as users, sessions, invites, verification tokens, access tokens, and subscriptions.

For a longer subsystem breakdown, see [`docs/architecture-overview.md`](./docs/architecture-overview.md).

## Quick start

### 1. Start the relay

```bash
go run ./cmd/binboi-server
```

### 2. Start the web app

```bash
cd web
npm install
npm run dev
```

### 3. Build the CLI

```bash
go build -o binboi ./cmd/binboi-client
```

### 4. Authenticate and open a tunnel

```bash
./binboi login --token <access-token>
./binboi whoami
./binboi start 3000 my-app
```

The default managed development domain is `binboi.localhost`, so a local tunnel will look like:

```text
http://my-app.binboi.localhost:8000
```

## Runtime dependencies

### Core services

- Go 1.25+ for the relay and CLI
- Node.js 20+ for the web app
- SQLite for relay state via `BINBOI_DATABASE_PATH`
- Postgres for product auth and billing via `DATABASE_URL` and `BINBOI_AUTH_DATABASE_URL`

### Optional external integrations

- GitHub OAuth via `AUTH_GITHUB_ID` and `AUTH_GITHUB_SECRET`
- Paddle via `PADDLE_API_KEY`, `PADDLE_CLIENT_TOKEN`, `PADDLE_WEBHOOK_SECRET`, `PADDLE_PRO_PRICE_ID`, and `PADDLE_SCALE_PRICE_ID`
- Email delivery provider for production verification, reset, and invite links

See [`docs/api-requirements.md`](./docs/api-requirements.md) for a more explicit dependency list and endpoint map.

## Important environment variables

### Relay

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

### Web

- `NEXT_PUBLIC_BINBOI_API_BASE`
- `NEXT_PUBLIC_BINBOI_WS_BASE`
- `DATABASE_URL`
- `AUTH_SECRET`
- `AUTH_GITHUB_ID`
- `AUTH_GITHUB_SECRET`
- `PADDLE_API_KEY`
- `PADDLE_CLIENT_TOKEN`
- `PADDLE_WEBHOOK_SECRET`
- `PADDLE_PRO_PRICE_ID`
- `PADDLE_SCALE_PRICE_ID`

## Local development notes

- Without `DATABASE_URL`, the web app can still run in preview mode, but database-backed auth is intentionally disabled.
- Without Paddle credentials, pricing UI can render, but paid plan checkout and subscription sync will stay unavailable.
- Without a production email provider, auth flows can still expose preview links for verification and password reset during development.

## Release workflow

- Build a local CLI binary: `make build-cli`
- Build release archives: `make release-cli VERSION=0.4.0`
- Homebrew formula template: [`packaging/homebrew/binboi.rb`](./packaging/homebrew/binboi.rb)
- Release guide: [`docs/releasing-cli.md`](./docs/releasing-cli.md)

## Documentation index

- [`CONTRIBUTING.md`](./CONTRIBUTING.md)
- [`SECURITY.md`](./SECURITY.md)
- [`LICENSE`](./LICENSE)
- [`docs/architecture-overview.md`](./docs/architecture-overview.md)
- [`docs/api-requirements.md`](./docs/api-requirements.md)

_Documentation maintained by Sardor Azimov._
