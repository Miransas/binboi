# Binboi Environments

This document explains how Binboi should be configured in local preview, local full-stack, development, and production-like setups.

## 1. Local preview mode

Use this when you want the ngrok-like tunnel loop without standing up Postgres, OAuth, or billing.

Required components:

- Go control plane
- SQLite
- CLI
- optional web app for preview UX

Required envs:

- `BINBOI_API_ADDR`
- `BINBOI_TUNNEL_ADDR`
- `BINBOI_PROXY_ADDR`
- `BINBOI_BASE_DOMAIN`
- `BINBOI_PUBLIC_SCHEME`
- `BINBOI_PUBLIC_PORT`
- `BINBOI_DATABASE_PATH`

Behavior:

- the control plane uses a single preview token in SQLite
- the CLI can authenticate with that preview token
- the web app can still render, but database-backed auth remains disabled without `DATABASE_URL`

## 2. Local full-stack mode

Use this when you want the complete Binboi product loop locally:

- Go control plane
- SQLite for relay state
- Postgres for accounts, access tokens, sessions, invites, and billing state
- Next.js web app
- CLI

Required additions:

- `BINBOI_AUTH_DATABASE_URL`
- `DATABASE_URL`
- `AUTH_SECRET`

Optional additions:

- `AUTH_GITHUB_ID`
- `AUTH_GITHUB_SECRET`
- `OPENAI_*`
- `PADDLE_*`

Recommended local addresses:

- API: `127.0.0.1:8080`
- tunnel listener: `127.0.0.1:8081`
- public proxy: `127.0.0.1:8000`
- web app: `127.0.0.1:3000`

## 3. Shared dev or staging

Use this when web and Go services run separately but still communicate over a private network.

Recommended setup:

- Go control plane runs with `BINBOI_AUTH_DATABASE_URL`
- Next.js uses `BINBOI_API_BASE` for server-side control plane calls
- browser-side code uses `NEXT_PUBLIC_BINBOI_API_BASE`
- dashboard client components talk through Next.js `/api/controlplane/*` proxy routes instead of hitting Go directly

This is the reason the stable control plane contract now lives under `/api/v1/*`.

## 4. Production-like deployment

Recommended split:

- Go control plane behind an internal network and public proxy exposure
- Next.js app as a separate service
- Postgres as the shared account database
- SQLite kept local to the Go service for relay runtime state unless you replace it

Production expectations:

- set `AUTH_SECRET`
- set `BINBOI_AUTH_DATABASE_URL`
- set `DATABASE_URL`
- terminate TLS at your ingress or edge
- keep Go API reachable from Next.js over a private address and set `BINBOI_API_BASE`
- do not rely on preview token mode

## Stable control plane contract

The Go service now exposes a stable product surface under `/api/v1/*`:

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

All `/api/v1/*` endpoints except `GET /api/v1/auth/me` return an envelope shaped like:

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

_Documentation maintained by Sardor Azimov._
