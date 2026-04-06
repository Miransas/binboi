# Binboi Staging Runbook

This is the shortest serious runbook for bringing Binboi up in a staging environment before production.

Use it together with:

- [deploy-readiness.md](/Users/sardorazimov/binboi/docs/deploy-readiness.md)
- [production-domain-checklist.md](/Users/sardorazimov/binboi/docs/production-domain-checklist.md)
- [smoke-test-checklist.md](/Users/sardorazimov/binboi/docs/smoke-test-checklist.md)

## 1. Files To Start From

- Go control plane env:
  - [binboi.production.env.example](/Users/sardorazimov/binboi/configs/binboi.production.env.example)
- Next.js app env:
  - [web/.env.production.example](/Users/sardorazimov/binboi/web/.env.production.example)

## 2. Minimum Staging Topology

- one Go control plane service
- one Next.js web app service
- one Postgres database
- one public DNS base domain
- one public ingress or load balancer

Recommended host split:

- `app.binboi.example.com` -> Next.js app
- `api.binboi.example.com` -> Go control plane API
- `*.binboi.example.com` -> public Binboi proxy

## 3. Required Environment

### Go control plane

- `BINBOI_AUTH_DATABASE_URL`
- `BINBOI_BASE_DOMAIN`
- `BINBOI_PUBLIC_SCHEME=https`
- `BINBOI_ALLOW_PREVIEW_MODE=false`

If Binboi terminates TLS itself:

- `BINBOI_PROXY_TLS_ADDR`
- `BINBOI_ACME_CACHE_DIR`
- `BINBOI_ACME_EMAIL`

### Web app

- `DATABASE_URL`
- `AUTH_SECRET`
- `BINBOI_API_BASE`
- `NEXT_PUBLIC_BINBOI_API_BASE`

Optional but common:

- `AUTH_GITHUB_ID`
- `AUTH_GITHUB_SECRET`
- `OPENAI_*`
- `PADDLE_*`

## 4. Order Of Operations

1. start Postgres
2. start the Go control plane
3. start the Next.js app
4. verify `/api/v1/health`
5. verify `/api/v1/instance`
6. verify login and dashboard access
7. create an access token
8. run CLI `whoami`
9. open one tunnel
10. hit the public URL
11. confirm request persistence
12. confirm event/audit visibility

## 5. Staging Verification Commands

### Go API

```bash
curl -s https://api.binboi.example.com/api/v1/health
curl -s https://api.binboi.example.com/api/v1/instance
```

### CLI

```bash
BINBOI_API_URL=https://api.binboi.example.com \
  binboi whoami --token <token>

BINBOI_AUTH_TOKEN=<token> \
BINBOI_API_URL=https://api.binboi.example.com \
BINBOI_SERVER_ADDR=binboi.example.com:8081 \
  binboi http 3000 demo
```

### Audit and requests

```bash
curl -s -H 'Authorization: Bearer <token>' 'https://api.binboi.example.com/api/v1/events?limit=20'
curl -s -H 'Authorization: Bearer <token>' 'https://api.binboi.example.com/api/v1/requests?limit=20&kind=REQUEST'
curl -s -H 'Authorization: Bearer <token>' 'https://api.binboi.example.com/api/v1/events/export?format=ndjson&limit=200'
```

## 6. Domain Pass

If staging uses real domains, run:

1. add the custom domain
2. publish the TXT record
3. wait for verification
4. confirm:
   - `status: VERIFIED`
   - `tls_ready: true`
   - expected `tls_mode`

Use:

```bash
curl -s -H 'Authorization: Bearer <token>' 'https://api.binboi.example.com/api/v1/domains'
```

## 7. Go / No-Go Rules

Green-light staging when all are true:

- auth works
- access token creation works
- `whoami` works
- tunnel handshake works
- public forwarding works
- requests are persisted
- events are persisted
- domain verification works for intended hosts
- HTTPS behaves as expected for the chosen TLS mode

Stop and fix before production if any are false:

- preview mode is still required
- dashboard cannot issue usable tokens
- public requests do not reach the local target
- event or request feeds stay empty after known traffic
- custom domains never leave `PENDING`
- HTTPS is inconsistent across your test domains

_Documentation maintained by Sardor Azimov, Miransas._
