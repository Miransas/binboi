# Binboi — Project Context

## What is Binboi?

Binboi is a **self-hosted ngrok alternative** that lets developers expose local ports to the internet via encrypted tunnels. A CLI client (`binboi http <port>`) connects to the control plane over raw TCP (yamux multiplexed), and the relay server proxies inbound HTTP traffic back through that connection. Think ngrok, but self-hosted and open source.

Company / org: **Miransas** — packages are `github.com/miransas/binboi`, `@miransas/binboi`, crate `miransas-binboi`.

---

## Tech Stack

| Layer | Technology |
|---|---|
| CLI client | Go (plain `flag`, no cobra), yamux for stream multiplexing |
| Control plane / relay | Go, Gin HTTP router, hashicorp/yamux, GORM (SQLite by default) |
| Frontend dashboard | Next.js (App Router), React 19, Tailwind v4, SWR, Framer Motion |
| Auth database | PostgreSQL (Drizzle ORM in Next.js, raw `database/sql` in Go) |
| Reverse proxy | Caddy with Cloudflare DNS plugin for wildcard TLS |
| Containerisation | Docker Compose |

---

## Architecture — How a Tunnel Works

```
Developer machine
  binboi http 3000
       │
       │  TCP :8081  (yamux multiplexed)
       ▼
  binboi-server (Go)
  ├── API server      :8080  (JSON REST, Gin)
  ├── Tunnel listener :8081  (raw TCP, yamux)
  └── Proxy server    :8000  (HTTP reverse proxy)
       │
       │  wildcard DNS  *.binboi.com
       ▼
  Caddy (TLS termination, HTTPS → HTTP proxy)
       │
  Public internet request
  https://my-app.binboi.com  →  core:8000  →  yamux stream  →  localhost:3000
```

Flow:
1. CLI connects TCP to `:8081`, sends a `HandshakePayload` (token, subdomain, local port).
2. Server validates the token via PostgreSQL auth DB, registers a `TunnelRecord`, replies with `HandshakeResponse{URL: "https://sub.binboi.com"}`.
3. A yamux session is created on the same TCP connection.
4. Inbound requests to `sub.binboi.com` hit the proxy server (`:8000`), which opens a new yamux stream to the CLI client.
5. The CLI client connects `localhost:<port>` and bridges the two connections.

---

## API URLs

| Service | URL |
|---|---|
| Go API (control plane) | `https://api.binboi.com` (prod) / `http://localhost:8080` (dev) |
| Next.js dashboard | `https://binboi.com` (prod) / `http://localhost:3000` (dev) |
| Tunnel relay (TCP) | `binboi.com:8081` (prod) / `localhost:8081` (dev) |
| HTTP proxy | `https://*.binboi.com` (prod) / `http://*.binboi.localhost:8000` (dev) |

The Next.js app proxies all `/api/controlplane/...` requests to the Go API — see
`web/app/api/controlplane/[...path]/route.ts`.

---

## Key Environment Variables

### Go control plane (`cmd/binboi-server`)
```
BINBOI_API_ADDR             :8080               API listen address
BINBOI_TUNNEL_ADDR          :8081               Raw TCP tunnel listener
BINBOI_PROXY_ADDR           :8000               HTTP proxy for tunneled traffic
BINBOI_PROXY_TLS_ADDR                           Optional TLS proxy address
BINBOI_BASE_DOMAIN          binboi.localhost    Subdomain base (prod: binboi.com)
BINBOI_PUBLIC_SCHEME        http                http or https
BINBOI_PUBLIC_PORT          8000                Public port in generated URLs
BINBOI_DATABASE_PATH        ./binboi.db         SQLite path for tunnels/requests/events
BINBOI_AUTH_DATABASE_URL                        PostgreSQL DSN for user/token tables
DATABASE_URL                                    Fallback for BINBOI_AUTH_DATABASE_URL
BINBOI_JWT_SECRET                               JWT signing secret (7-day TTL)
JWT_SECRET                                      Fallback for BINBOI_JWT_SECRET
BINBOI_INSTANCE_NAME        Binboi Self-Hosted  Display name
BINBOI_DEFAULT_REGION       local
BINBOI_ACME_EMAIL                               Let's Encrypt registration email
BINBOI_ACME_CACHE_DIR       /tmp/acme
```

### Next.js dashboard (`web/`)
```
BINBOI_GO_API_URL           http://localhost:8080   Server-side Go API URL (highest priority)
BINBOI_API_BASE                                     Alternative server-side URL
NEXT_PUBLIC_BINBOI_API_BASE                         Browser-side Go API URL
DATABASE_URL                                        PostgreSQL DSN (NextAuth / Drizzle)
AUTH_SECRET                                         NextAuth secret
AUTH_GITHUB_ID / AUTH_GITHUB_SECRET                 GitHub OAuth (optional)
```

### CLI (`cmd/binboi-client`)
```
BINBOI_API_URL              http://127.0.0.1:8080   Control plane API for login/whoami
BINBOI_SERVER_ADDR          binboi.com:8081          Relay TCP address (overrides config.json)
BINBOI_AUTH_TOKEN                                   Non-interactive auth token
BINBOI_TOKEN                                        Legacy alias for BINBOI_AUTH_TOKEN
BINBOI_DASHBOARD_URL        http://127.0.0.1:3000   Used in "create a token at ..." help text
```

CLI config is persisted to `~/.binboi/config.json` on `binboi login`:
```json
{ "token": "binboi_xxx", "server_addr": "binboi.com:8081" }
```
Resolution order for each value: explicit flag → env var → `~/.binboi/config.json` → built-in default.

---

## Database Schema

### SQLite (`binboi.db`) — GORM, auto-migrated at startup

**tunnels** (`TunnelRecord`)
```
id                   TEXT PRIMARY KEY
subdomain            TEXT UNIQUE
owner_user_id        TEXT
owner_email          TEXT
auth_mode            TEXT
target               TEXT    (e.g. localhost:3000)
target_port          INTEGER
status               TEXT    (ACTIVE | INACTIVE | ERROR)
region               TEXT
last_error           TEXT
request_count        INTEGER
bytes_transferred    INTEGER   (exposed as bytes_out in JSON API)
last_connected_at    DATETIME
last_disconnected_at DATETIME
created_at / updated_at DATETIME
```

**requests** (`RequestRecord`) — per-tunnel HTTP request log (method, path, status, duration)

**events** (`EventRecord`) — audit / observability events

**domains** (`DomainRecord`) — custom domain verification state

### PostgreSQL — `database/sql`, migrated at startup

**user**
```
id                TEXT PRIMARY KEY
name              TEXT
email             TEXT UNIQUE NOT NULL
password_hash     TEXT    (Argon2id)
plan              TEXT    (FREE | PRO | ...)
paddle_customer_id TEXT
created_at / updated_at TIMESTAMP
```

**access_token**
```
id           TEXT PRIMARY KEY
user_id      TEXT REFERENCES user(id)
name         TEXT
prefix       TEXT    (first 8 chars, shown in dashboard)
token_hash   TEXT    (SHA-256 of full token)
status       TEXT    (ACTIVE | REVOKED)
last_used_at TIMESTAMP
created_at   TIMESTAMP
```

---

## Important File Locations

```
cmd/binboi-client/main.go                    CLI entry point (login, http, whoami commands)
cmd/binboi-server/main.go                    Server entry point (starts API + tunnel + proxy)

internal/cli/config.go                       ~/.binboi/config.json read/write; ResolveServerAddr
internal/cli/http.go                         StartHttpTunnel — connects to relay, yamux session
internal/cli/proxy.go                        proxyHTTP — bridges relay ↔ local; measurePing
internal/cli/stats.go                        TunnelStats — atomic counters, p50/p90 percentiles
internal/cli/ui.go                           RunLiveUI — in-place terminal dashboard (ngrok-style)
internal/cli/api.go                          WhoAmI, APIBaseURL helpers

internal/controlplane/service.go             Config struct, RegisterRoutes, TunnelResponse type
internal/controlplane/auth_provider.go       PostgreSQL auth: register, login, token CRUD
internal/controlplane/auth_handlers.go       Gin handlers for /api/auth/*
internal/controlplane/token_handlers.go      Gin handlers for /api/v1/tokens

internal/protocol/message.go                 HandshakePayload / HandshakeResponse wire types

web/app/dashboard/tunnels/page.tsx           Dashboard tunnels list — polling, stat cards, table
web/app/dashboard/tunnel/page.tsx            Single tunnel management (create / delete)
web/app/api/controlplane/[...path]/route.ts  Next.js → Go API proxy (handles auth cookie)
web/lib/controlplane.ts                      TypeScript types + fetchControlPlane helper
web/lib/binboi.ts                            BINBOI_API_BASE resolution

docker-compose.yml                           Services: core (Go), caddy, postgres
Caddyfile                                    Wildcard TLS routing rules
```

---

## Tunnel API Response Shape

```json
{
  "id": "tun_abc123",
  "subdomain": "my-app",
  "target": "localhost:3000",
  "status": "ACTIVE",
  "region": "us",
  "request_count": 142,
  "bytes_out": 204800,
  "created_at": "2026-04-17T10:00:00Z",
  "last_connected_at": "2026-04-17T11:30:00Z",
  "public_url": "https://my-app.binboi.com"
}
```

`bytes_out` = response bytes sent from local service → relay.
Note: the Go struct field is `BytesTransferred` but the JSON key is `bytes_out`.

---

## Known Issues / TODOs

- `BytesTransferred` in Go vs `bytes_out` in JSON — naming mismatch in `TunnelRecord` vs `TunnelResponse`.
- `ParseStartArgs` in `cmd/binboi-client/main.go` indexes into the full `os.Args` slice (`args[2]`/`args[3]`) — any refactor needs to keep this in mind.
- `APIBaseURL()` in the CLI defaults to `127.0.0.1:8080` (loopback only). Override with `BINBOI_API_URL` for non-local use.
- Dashboard has no WebSocket push — stats are polled every 5 s via SWR.
- Free-plan users get a random subdomain; custom subdomains require a paid plan.
- Caddy wildcard TLS requires a Cloudflare API token (`CLOUDFLARE_API_TOKEN`) — not applicable for local dev.
