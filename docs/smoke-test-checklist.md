# Binboi Smoke Test Checklist

This is the short operator checklist for validating the current shipping Binboi backend before a release, staging push, or public demo.

Use this when you want the fastest possible confidence pass.

For the full deployment runbook, see [deploy-readiness.md](/Users/sardorazimov/binboi/docs/deploy-readiness.md).

## 1. Pre-check

- build the Go binaries successfully
- confirm the upstream app is running on `127.0.0.1:3000`
- confirm the control plane can start with the intended env vars
- confirm you have a usable access token

## 2. Build Check

Run:

```bash
mkdir -p .gocache
GOCACHE=$(pwd)/.gocache go test ./...
go build -o /tmp/binboi-server ./cmd/binboi-server
go build -o /tmp/binboi ./cmd/binboi-client
```

Pass if:

- tests pass
- `binboi-server` builds
- `binboi` CLI builds

## 3. Start Preview Stack

### Upstream app

```bash
mkdir -p /tmp/binboi-smoke-app
printf '<!doctype html><html><body><h1>binboi smoke ok</h1></body></html>' > /tmp/binboi-smoke-app/index.html
python3 -m http.server 3000 --bind 127.0.0.1 --directory /tmp/binboi-smoke-app
```

### Control plane

```bash
env \
  BINBOI_API_ADDR=127.0.0.1:9080 \
  BINBOI_TUNNEL_ADDR=127.0.0.1:9081 \
  BINBOI_PROXY_ADDR=127.0.0.1:9082 \
  BINBOI_DATABASE_PATH=/tmp/binboi-preview.db \
  BINBOI_ALLOW_PREVIEW_MODE=true \
  /tmp/binboi-server
```

## 4. Authenticate And Open Tunnel

```bash
curl -s http://127.0.0.1:9080/api/tokens/current

BINBOI_API_URL=http://127.0.0.1:9080 \
  /tmp/binboi whoami --token <preview-token>

BINBOI_AUTH_TOKEN=<preview-token> \
BINBOI_API_URL=http://127.0.0.1:9080 \
BINBOI_SERVER_ADDR=127.0.0.1:9081 \
  /tmp/binboi http 3000 demo
```

Pass if:

- `whoami` resolves the expected account
- the CLI opens a `demo` tunnel without handshake failure

## 5. Validate API And Proxy

Run:

```bash
curl -i -s http://127.0.0.1:9080/api/v1/health
curl -s http://127.0.0.1:9080/api/v1/tunnels
curl -s http://demo.binboi.localhost:9082
curl -s 'http://127.0.0.1:9080/api/v1/requests?limit=5&kind=REQUEST'
```

Pass if:

- `/api/v1/health` returns `status: ok`
- the tunnel list contains an active `demo` tunnel
- the public URL returns the upstream HTML
- the request feed shows the forwarded request

If you want to inspect bodies, archive metadata, or replay the captured request, continue with [request-archive-replay-runbook.md](/Users/sardorazimov/binboi/docs/request-archive-replay-runbook.md).

## 6. Validate Observability

Run:

```bash
curl -i -s -H 'Authorization: Bearer <preview-token>' http://127.0.0.1:9080/api/v1/metrics
curl -s -H 'Authorization: Bearer <preview-token>' http://127.0.0.1:9080/metrics
```

Pass if:

- the response includes `X-Request-ID`
- `/api/v1/metrics` returns JSON with counters
- `/metrics` returns Prometheus text output
- `binboi_proxy_requests_total` increases after hitting the public URL
- `binboi_tunnel_connections_total` is at least `1`

## 7. Log Check

Pass if the control plane logs show:

- JSON log lines
- `request_id`
- `component`
- `status`
- `duration_ms`

This makes tomorrow's debugging much easier if any tunnel or proxy step fails.

## 8. Custom Domain And TLS Check

Use this if you have real domains pointed at the Binboi proxy.

Repeat the same flow for each domain you want to validate.

1. Create the domain in the dashboard or API.
2. Publish the TXT value returned in `expected_txt`.
3. Wait for the background verifier or call the verify endpoint manually.
4. Confirm the API returns:
   - `status: VERIFIED`
   - `tls_ready: true`
   - `tls_mode: acme` when `BINBOI_PROXY_TLS_ADDR` is enabled
5. If ACME is enabled, hit the public host over HTTPS and confirm the certificate is issued.

Quick API check:

```bash
curl -s -H 'Authorization: Bearer <token>' http://127.0.0.1:9080/api/v1/domains
curl -s -H 'Authorization: Bearer <token>' 'http://127.0.0.1:9080/api/v1/events?action=domain.verify&limit=20'
```

Pass if:

- all target domains become `VERIFIED`
- `last_verification_error` is empty after success
- the audit feed shows `domain.verify`
- HTTPS works for domains that should terminate TLS in Binboi

## 9. Release Decision

Green-light the backend if all of these are true:

- build passes
- tunnel opens successfully
- public URL forwards correctly
- request persistence works
- metrics respond
- request IDs appear in responses and logs

Block release if any of these fail:

- handshake rejects valid tokens
- tunnel stays offline after CLI connect
- proxy returns repeated `502` or `503`
- request feed stays empty after confirmed traffic
- metrics endpoints fail or return empty counters

_Documentation maintained by Sardor Azimov, Miransas._
