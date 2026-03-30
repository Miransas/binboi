# Binboi

Binboi is a self-hosted HTTP tunneling MVP with three parts:

- A Go relay and control plane
- A CLI agent that opens tunnels from your local machine
- A Next.js dashboard for setup, reservation, domains, and visibility

The project is intentionally scoped to a coherent first release:

- HTTP tunnels over a single yamux connection
- Account-backed access tokens for CLI authentication
- SQLite-backed relay state by default
- Managed base domain plus optional custom domains with DNS TXT verification

It is not pretending to be a finished hosted ngrok replacement yet. Raw TCP, private CA management, deep traffic policy, and AI inspection remain future work.

## MVP data story

The repository now uses two clear storage layers:

- SQLite at `binboi.db` for relay state, tunnel lifecycle, domains, and events
- Postgres via `DATABASE_URL` for website users and hashed access tokens

If `DATABASE_URL` is missing, the dashboard falls back to a local preview mode and the relay can still use a single preview token from SQLite. That keeps local development unblocked without pretending the preview flow is the full SaaS auth model.

## Default ports

- API: `:8080`
- Tunnel listener: `:8081`
- Public HTTP proxy: `:8000`

The default managed domain is `binboi.localhost`, which makes local subdomains easy to test:

- `http://my-app.binboi.localhost:8000`

## Quick start

1. Start the relay:

```bash
go run ./cmd/binboi-server
```

2. Open the dashboard:

```bash
cd web
npm install
npm run dev
```

3. Build the CLI:

```bash
go build -o binboi ./cmd/binboi-client
```

4. Create an access token in the dashboard and save it locally:

```bash
./binboi login --token <access-token>
```

5. Verify the account and start a tunnel to your local app:

```bash
./binboi whoami
./binboi start 3000 my-app
```

## Important environment variables

Relay:

- `BINBOI_API_ADDR`
- `BINBOI_TUNNEL_ADDR`
- `BINBOI_PROXY_ADDR`
- `BINBOI_BASE_DOMAIN`
- `BINBOI_PUBLIC_SCHEME`
- `BINBOI_PUBLIC_PORT`
- `BINBOI_DATABASE_PATH`
- `BINBOI_AUTH_DATABASE_URL`

CLI:

- `BINBOI_API_URL`
- `BINBOI_SERVER_ADDR`
- `BINBOI_AUTH_TOKEN`
- `BINBOI_DASHBOARD_URL`

Dashboard:

- `NEXT_PUBLIC_BINBOI_API_BASE`
- `NEXT_PUBLIC_BINBOI_WS_BASE`

## Docker

The included `Dockerfile` and `docker-compose.yml` reflect the SQLite-backed relay MVP. Add Postgres separately when you want real website accounts and hashed access tokens instead of local preview auth.

## CLI releases

Use `make build-cli` for a local binary and `make release-cli VERSION=0.4.0` for release archives.

- Release naming: `binboi_<version>_<os>_<arch>.tar.gz`
- Homebrew formula template: `packaging/homebrew/binboi.rb`
- Release notes and artifact expectations: `docs/releasing-cli.md`

## CLI releases

Use `make build-cli` for a local binary and `make release-cli VERSION=0.4.0` for release archives.

- Release naming: `binboi_<version>_<os>_<arch>.tar.gz`
- Homebrew formula template: `packaging/homebrew/binboi.rb`
- Release notes and artifact expectations: `docs/releasing-cli.md`

## Current product boundaries

Working:

- Tunnel reservation
- Access token validation for the CLI and relay
- Agent handshake and tunnel activation
- Public URL generation from the managed domain
- Access token creation, listing, and revocation
- Domain registration and DNS verification
- Event log streaming to the dashboard

Not finished:

- Raw TCP product surface
- In-core TLS certificate management
- Per-user machine identities
- Kubernetes operator
- AI inspection
