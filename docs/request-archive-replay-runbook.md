# Binboi Request Archive And Replay Runbook

This runbook covers the current operator flow for inspecting captured traffic, exporting request history, and replaying archived webhook or HTTP requests through the Binboi control plane.

Use this after tunnel health is already confirmed.

For full environment bring-up, see [deploy-readiness.md](/Users/sardorazimov/binboi/docs/deploy-readiness.md).

For the short release-day pass, see [smoke-test-checklist.md](/Users/sardorazimov/binboi/docs/smoke-test-checklist.md).

## 1. What Exists Today

Binboi now supports:

- request history listing
- full request archive fetch
- request export in `json`, `ndjson`, and `csv`
- manual replay of archived requests
- replay policy metadata for webhook providers
- replay audit trails

Current endpoints:

- `GET /api/v1/requests`
- `GET /api/v1/requests/:id/archive`
- `GET /api/v1/requests/export`
- `POST /api/v1/requests/:id/replay`
- `GET /api/v1/events?action=request.replay`
- `GET /api/v1/events?action=request.replay.blocked`
- `GET /api/v1/events?action=request.replay.failed`

## 2. Quick Operator Flow

1. Open a tunnel and send one real request through the public Binboi URL.
2. Confirm the request appears in `GET /api/v1/requests`.
3. Fetch the archive for the target request ID.
4. Check the replay policy and metadata.
5. Replay the request.
6. Confirm a new request record appears with `replay_of_request_id`.
7. Confirm the audit feed shows the replay outcome.

## 3. List Request History

```bash
curl -s -H 'Authorization: Bearer <token>' \
  'http://127.0.0.1:9080/api/v1/requests?limit=20&kind=WEBHOOK'
```

Useful filters:

- `kind=REQUEST|WEBHOOK`
- `provider=stripe|github|clerk|supabase|linear|neon`
- `status=success|client_error|server_error|error`
- `error_only=true`
- `tunnel=<subdomain>`
- `q=<search text>`

Look for:

- `id`
- `replay_of_request_id`
- `delivery_id`
- `provider`
- `event_type`
- `metadata`

## 4. Fetch Full Archive

```bash
curl -s -H 'Authorization: Bearer <token>' \
  "http://127.0.0.1:9080/api/v1/requests/<request-id>/archive"
```

The archive response includes:

- request/response headers
- request/response body text when UTF-8
- request/response body base64
- truncated flags
- provider/event metadata
- replay policy

Important fields:

- `metadata.delivery_id`
- `metadata.signature_present`
- `replay_policy.mode`
- `replay_policy.dedupe_key`
- `replay_policy.verification_hint`

## 5. Replay A Captured Request

```bash
curl -s -X POST -H 'Authorization: Bearer <token>' \
  "http://127.0.0.1:9080/api/v1/requests/<request-id>/replay"
```

Expected success response:

- `original_request_id`
- `replayed_request_id`
- `replay_attempt`
- `replay_policy`
- `proxy_status`

Replay behavior:

- replayed requests cannot be replayed again
- replay count is capped by `BINBOI_REQUEST_REPLAY_LIMIT`
- requests with truncated archived bodies are blocked from replay
- replayed traffic is written back into request history

Replay headers sent upstream:

- `X-Binboi-Redelivery: true`
- `X-Binboi-Redelivery-Attempt`
- `X-Binboi-Redelivery-Mode`
- `X-Binboi-Redelivery-Key`
- `X-Binboi-Signature-Present`
- `X-Binboi-Original-Provider`
- `X-Binboi-Original-Event-Type`
- `X-Binboi-Original-Delivery-ID`

## 6. Provider-Aware Policy Notes

### GitHub

- dedupe around `X-GitHub-Delivery`
- re-check `X-GitHub-Event`
- verify upstream safely handles manual redelivery

### Stripe

- dedupe around the original event id
- replay is a manual redelivery, not a Stripe-native retry
- if the upstream expects a fresh signature window, replay may be intentionally rejected

### Clerk / Svix

- dedupe around `Svix-Id`
- verify upstream signature logic before expecting success

### Generic webhook source

- Binboi falls back to delivery-like IDs from captured metadata or request headers
- if no native provider signal exists, the dedupe key becomes `binboi-request:<request-id>`

## 7. Audit Checks

Query the audit trail:

```bash
curl -s -H 'Authorization: Bearer <token>' \
  'http://127.0.0.1:9080/api/v1/events?action=request.replay&limit=20'

curl -s -H 'Authorization: Bearer <token>' \
  'http://127.0.0.1:9080/api/v1/events?action=request.replay.blocked&limit=20'

curl -s -H 'Authorization: Bearer <token>' \
  'http://127.0.0.1:9080/api/v1/events?action=request.replay.failed&limit=20'
```

Expected details now include:

- `provider`
- `event_type`
- `delivery_id`
- `replay_attempt`
- `replay_mode`
- `dedupe_key`
- `signature_present`
- `verification_hint`

## 8. Export Request History

```bash
curl -s -H 'Authorization: Bearer <token>' \
  'http://127.0.0.1:9080/api/v1/requests/export?format=json&kind=WEBHOOK&limit=100'
```

Supported formats:

- `format=json`
- `format=ndjson`
- `format=csv`

Storage and transport behavior:

- archived request/response bodies stay stored raw in SQLite for replay correctness
- Binboi does not gzip request archive blobs before saving them
- export responses can be gzip-compressed when the client sends `Accept-Encoding: gzip`
- export payload size is guarded by `BINBOI_EXPORT_MAX_BYTES`
- if the export is too large, narrow filters or lower `limit`

Use export when:

- you need an incident snapshot
- you want offline replay review
- you need to compare provider deliveries over time

## 9. Common Failure Modes

### `409 REQUEST_REPLAY_FAILED`

Usually means one of:

- request body was truncated and is not replayable
- the request is already a replay
- the replay cap for the original request was reached

### `502` or `503` on replay

Usually means:

- tunnel is offline
- tunnel stream cannot be opened
- upstream target rejected or closed the replayed request

### replay succeeds but upstream rejects it

This is often valid behavior for providers or apps that enforce:

- signature freshness
- delivery dedupe
- timestamp windows

In that case, use the replay as a debugging tool rather than expecting the provider workflow to fully accept it.

## 10. Recommended Release-Day Checks

- capture one real webhook from each major provider you support
- verify `delivery_id` and `event_type` are populated
- fetch the archive and confirm `replay_policy` is present
- replay once and confirm `replay_attempt = 1`
- confirm a second replay is either allowed within policy or intentionally blocked
- confirm audit events appear for success and blocked/failure cases

_Documentation maintained by Sardor Azimov, Miransas._
