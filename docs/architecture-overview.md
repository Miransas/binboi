# Binboi Architecture Overview

Binboi is split across a Go runtime plane and a Next.js product surface.

## Primary runtime pieces

- `cmd/binboi-server`: boots the control plane API, the tunnel listener, and the public proxy
- `cmd/binboi-client`: the CLI used to authenticate locally and open tunnels
- `web/`: the product site, auth flows, pricing, docs, billing routes, and dashboard

## Data model split

### SQLite

SQLite backs relay-oriented runtime data by default:

- tunnel lifecycle
- relay visibility state
- low-friction local development

### Postgres

Postgres backs account-oriented SaaS data:

- users
- sessions
- OAuth accounts
- access tokens
- email verification requests
- password reset requests
- invites
- billing subscriptions

## Auth architecture

- Auth.js / NextAuth owns session creation and provider integration.
- Custom auth APIs own register, login, verify-email, forgot-password, reset-password, resend-verification, and invite flows.
- `web/lib/auth-system.ts` is the shared server-side auth logic layer.

## Billing architecture

- Paddle is the current billing provider.
- The web app creates checkout sessions and processes webhook updates.
- Billing ownership is linked to the same `users.id` used by auth and access tokens.

## Relay architecture

- The control plane validates CLI auth and manages tunnel metadata.
- The tunnel listener accepts agent connections.
- The public proxy routes incoming requests to active tunnels.
- The stable external control plane surface is versioned under `/api/v1/*`.
- The Next.js app proxies browser-safe control plane reads and writes through `app/api/controlplane/*`.

## TLS and ingress architecture

TLS termination happens outside the Go process. Two supported approaches:

### External edge TLS (recommended)

Caddy (or Nginx / Traefik / cloud LB) sits in front of the Go server and terminates TLS.

- `{BASE_DOMAIN}` → Go API on `:8080`
- `*.{BASE_DOMAIN}` → Go proxy on `:8000`
- CLI tunnel connections reach `:8081` directly (raw TCP, not proxied through Caddy)
- `BINBOI_PUBLIC_SCHEME=https` and `BINBOI_PUBLIC_PORT=443` tell the control plane what public URLs to emit

The project `Caddyfile` is the reference configuration. For local dev it uses `local_certs` (self-signed). For production, wildcard certs require a DNS-01 challenge module.

### Binboi ACME TLS

The Go server can terminate TLS itself using ACME (Let's Encrypt):

- set `BINBOI_PROXY_TLS_ADDR` (e.g. `:443`) to activate the TLS listener
- set `BINBOI_ACME_CACHE_DIR` to a persistent directory for certificate storage
- set `BINBOI_ACME_EMAIL` for Let's Encrypt account registration
- HTTP-01 challenge requires the proxy to be reachable on port 80

## Recommended reading order

1. [`../README.md`](../README.md)
2. [`api-requirements.md`](./api-requirements.md)
3. [`environments.md`](./environments.md)
4. [`releasing-cli.md`](./releasing-cli.md)
5. folder-level READMEs in `cmd/`, `internal/`, and `web/`

_Documentation maintained by Sardor Azimov._
