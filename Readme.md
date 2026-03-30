# Binboi

Binboi is a self-hosted HTTP tunneling MVP with three parts:

- A Go relay and control plane
- A CLI agent that opens tunnels from your local machine
- A Next.js dashboard for setup, reservation, domains, and visibility

The project is intentionally scoped to a coherent first release:

- HTTP tunnels over a single yamux connection
- One instance token for agent authentication
- SQLite-backed control-plane state by default
- Managed base domain plus optional custom domains with DNS TXT verification

It is not pretending to be a finished hosted ngrok replacement yet. Raw TCP, private CA management, deep traffic policy, and AI inspection remain future work.

## MVP data story

The repository now treats the Go backend as the source of truth for product data.

- Default storage: SQLite at `binboi.db`
- Default auth model: one instance token stored by the control plane
- Optional web auth: the Next.js app can layer GitHub auth on top when configured, but the dashboard can still run in local preview mode

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

4. Copy the instance token from the dashboard and save it locally:

```bash
./binboi auth <instance-token>
```

5. Start a tunnel to your local app:

```bash
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

CLI:

- `BINBOI_SERVER_ADDR`

Dashboard:

- `NEXT_PUBLIC_BINBOI_API_BASE`
- `NEXT_PUBLIC_BINBOI_WS_BASE`

## Docker

The included `Dockerfile` and `docker-compose.yml` reflect the SQLite-backed MVP. No external Postgres container is required to run the Go relay.

## Current product boundaries

Working:

- Tunnel reservation
- Agent handshake and tunnel activation
- Public URL generation from the managed domain
- Token rotation and session revocation
- Domain registration and DNS verification
- Event log streaming to the dashboard

Not finished:

- Raw TCP product surface
- In-core TLS certificate management
- Per-user machine identities
- Kubernetes operator
- AI inspection
