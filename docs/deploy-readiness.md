# Binboi Deploy Readiness

This document is the final operator-facing checklist for taking Binboi from local development to a production-minded deployment.

For the backend-first go/no-go view, see [launch-blockers.md](/Users/sardorazimov/binboi/docs/launch-blockers.md).

For real-domain rollout, use [production-domain-checklist.md](/Users/sardorazimov/binboi/docs/production-domain-checklist.md).

For request inspection and replay operations, use [request-archive-replay-runbook.md](/Users/sardorazimov/binboi/docs/request-archive-replay-runbook.md).

It is intentionally focused on the current shipping surface:

- Go control plane
- HTTP tunnel relay
- Next.js product app
- database-backed auth and access tokens
- request and webhook inspection

## 1. Preflight checklist

Before a serious deployment, confirm all of the following:

- the Go service can reach its SQLite runtime path
- the Go service can reach Postgres through `BINBOI_AUTH_DATABASE_URL`
- the Next.js app can reach Postgres through `DATABASE_URL`
- the Next.js app has a valid `AUTH_SECRET`
- preview mode is disabled with `BINBOI_ALLOW_PREVIEW_MODE=false` or left unset in production-like environments
- the Next.js app can reach the Go control plane through `BINBOI_API_BASE`
- browser traffic uses the Next.js `/api/controlplane/*` proxy instead of talking to Go directly
- your public base domain resolves to the Binboi proxy service
- TLS termination happens either at your ingress/edge or through Binboi ACME with `BINBOI_PROXY_TLS_ADDR`

Optional but recommended before launch:

- GitHub OAuth credentials for social sign-in
- a production email provider for verification, password reset, and invite delivery
- Paddle credentials if paid billing is enabled

## 2. Supported deployment modes

### Local preview

Use only for intentional local testing.

- `BINBOI_ALLOW_PREVIEW_MODE=true`
- SQLite is enough for the Go control plane
- dashboard auth runs in preview mode without Postgres
- good for tunnel-loop validation, not for real account-backed deployment

### Local full-stack

Use this for serious product validation before staging.

- Go control plane + SQLite
- Next.js app
- shared Postgres
- preview mode disabled
- dashboard access tokens created through the real auth flow

### Shared dev or staging

Recommended structure:

- Go control plane on a private service address
- Next.js app on a separate service
- shared Postgres
- proxy/ingress in front of the public Binboi URL
- `BINBOI_API_BASE` points from Next.js to the private Go API address

### Production-like

Expected posture:

- preview mode disabled
- Postgres-backed auth enabled
- DNS for the base domain and any custom domains points at the proxy
- either external edge TLS is configured or `BINBOI_PROXY_TLS_ADDR` + ACME storage is configured
- real email delivery configured
- OAuth configured if exposed in the UI
- billing configured if pricing/checkout is live

## 3. Build verification

Run these checks before every tagged release or serious staging push.

### Go

```bash
mkdir -p .gocache
GOCACHE=$(pwd)/.gocache go test ./...
go build -o /tmp/binboi-server ./cmd/binboi-server
go build -o /tmp/binboi ./cmd/binboi-client
```

### Web

```bash
cd web
npm run lint
npx tsc --noEmit
npm run build
```

## 4. Preview smoke test

This is the fastest end-to-end smoke path for the ngrok-style loop.

If you only need the short release-day checklist, use [smoke-test-checklist.md](/Users/sardorazimov/binboi/docs/smoke-test-checklist.md).

### Start a local upstream app

```bash
mkdir -p /tmp/binboi-smoke-app
printf '<!doctype html><html><body><h1>binboi smoke ok</h1></body></html>' > /tmp/binboi-smoke-app/index.html
python3 -m http.server 3000 --bind 127.0.0.1 --directory /tmp/binboi-smoke-app
```

### Start the Go control plane

```bash
env \
  BINBOI_API_ADDR=127.0.0.1:9080 \
  BINBOI_TUNNEL_ADDR=127.0.0.1:9081 \
  BINBOI_PROXY_ADDR=127.0.0.1:9082 \
  BINBOI_DATABASE_PATH=/tmp/binboi-preview.db \
  BINBOI_ALLOW_PREVIEW_MODE=true \
  /tmp/binboi-server
```

### Authenticate and open a tunnel

```bash
curl -s http://127.0.0.1:9080/api/tokens/current

BINBOI_API_URL=http://127.0.0.1:9080 \
  /tmp/binboi whoami --token <preview-token>

BINBOI_AUTH_TOKEN=<preview-token> \
BINBOI_API_URL=http://127.0.0.1:9080 \
BINBOI_SERVER_ADDR=127.0.0.1:9081 \
  /tmp/binboi http 3000 demo
```

### Validate traffic and persistence

```bash
curl -s http://127.0.0.1:9080/api/v1/health
curl -s http://127.0.0.1:9080/api/v1/tunnels
curl -s http://demo.binboi.localhost:9082
curl -s 'http://127.0.0.1:9080/api/v1/requests?limit=5&kind=REQUEST'
```

Pass criteria:

- `/api/v1/health` returns `status: ok`
- the tunnel list includes an active `demo` tunnel
- the public Binboi URL returns the upstream app content
- the request feed records the public request

## 5. Full-stack smoke test

Run this before calling a deployment release-ready.

1. Start Postgres.
2. Set `BINBOI_AUTH_DATABASE_URL`, `DATABASE_URL`, and `AUTH_SECRET`.
3. Start the Go control plane with preview mode disabled.
4. Start the Next.js app.
5. Open `/login` and `/register` to confirm database-backed auth is active instead of preview mode.
6. Sign in to the dashboard.
7. Create one access token in `/dashboard/access-tokens`.
8. Run `binboi login --token <dashboard-token>`.
9. Run `binboi whoami`.
10. Open a tunnel with `binboi http 3000 demo`.
11. Hit the public URL once.
12. Confirm the request appears in `/dashboard/requests`.

## 6. Verified local smoke result

The core preview smoke path was re-run successfully on `2026-04-06` with this result:

- `GET /api/v1/health` returned `status: ok`
- `GET /api/v1/tunnels` returned an active `demo` tunnel
- `binboi whoami --token <preview-token>` resolved `operator@binboi.local`
- `http://demo.binboi.localhost:9082` returned the expected upstream HTML
- `GET /api/v1/requests?limit=5&kind=REQUEST` recorded the forwarded request

## 7. Custom domain test pass

If you have multiple real domains available, run the same readiness pass for each one.

Recommended sequence:

1. Register the custom domain in Binboi.
2. Publish the requested TXT verification record.
3. Wait for the background verifier or call the verify endpoint.
4. Confirm `/api/v1/domains` returns:
   - `status: VERIFIED`
   - `tls_ready: true`
   - `tls_mode: acme` if Binboi terminates TLS itself
5. Confirm `/api/v1/events?action=domain.verify` shows an audit entry.
6. If ACME is enabled, hit `https://your-domain` and confirm certificate issuance and proxy routing.

If you have three domains, test all three before public launch so wildcard/base-domain assumptions do not mask per-domain DNS mistakes.

## 8. Known launch dependencies

These are still external deployment dependencies, not code blockers:

- `DATABASE_URL`
- `BINBOI_AUTH_DATABASE_URL`
- `AUTH_SECRET`
- `AUTH_GITHUB_ID`
- `AUTH_GITHUB_SECRET`
- `PADDLE_*`
- production email delivery provider

_Documentation maintained by Sardor Azimov, Miransas._
