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

## Recommended reading order

1. [`../README.md`](../README.md)
2. [`api-requirements.md`](./api-requirements.md)
3. [`releasing-cli.md`](./releasing-cli.md)
4. folder-level READMEs in `cmd/`, `internal/`, and `web/`

_Documentation maintained by Sardor Azimov._
