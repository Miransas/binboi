# Binboi Production Domain Checklist

Use this when you are preparing real domains for a production or staging launch.

This checklist is focused on:

- managed base-domain routing
- custom-domain verification
- optional ACME-backed TLS in Binboi
- per-domain smoke validation

Use it together with:

- [deploy-readiness.md](/Users/sardorazimov/binboi/docs/deploy-readiness.md)
- [smoke-test-checklist.md](/Users/sardorazimov/binboi/docs/smoke-test-checklist.md)

## 1. Preflight

Before touching DNS, confirm all of these:

- the Go control plane builds and starts cleanly
- `BINBOI_BASE_DOMAIN` is final
- `BINBOI_PROXY_ADDR` is reachable from your ingress or edge
- if Binboi will terminate TLS itself, `BINBOI_PROXY_TLS_ADDR` is set
- if ACME is enabled, `BINBOI_ACME_CACHE_DIR` points to persistent storage
- if ACME is enabled, `BINBOI_ACME_EMAIL` is set
- preview mode is disabled in production-like environments

## 2. Decide TLS Mode

Pick one mode and stay consistent during rollout.

### External edge TLS

Use this when TLS terminates in:

- Caddy
- Nginx
- Traefik
- cloud load balancer

Expected API result:

- `tls_mode: external-edge`

### Binboi ACME TLS

Use this when Binboi itself should issue certificates.

Required:

- `BINBOI_PROXY_TLS_ADDR=:443` or another public TLS listener
- `BINBOI_ACME_CACHE_DIR` on persistent disk
- HTTP reachability for ACME challenge flow
- the requested host resolves to the Binboi proxy

Expected API result:

- `tls_mode: acme`

## 3. DNS Records

### Base domain

Point your base domain or wildcard entry to the public Binboi proxy.

Typical examples:

- `A binboi.example.com -> <public-ip>`
- `CNAME *.binboi.example.com -> binboi.example.com`

### Custom domains

For each custom domain:

1. point the host to the same public proxy target
2. create the TXT record returned by Binboi in `expected_txt`

## 4. Per-Domain Rollout Sheet

Track each domain explicitly.

| Domain | Type | DNS pointed | TXT published | Verified | TLS ready | HTTPS checked |
| --- | --- | --- | --- | --- | --- | --- |
| `domain-1` | managed/custom |  |  |  |  |  |
| `domain-2` | managed/custom |  |  |  |  |  |
| `domain-3` | managed/custom |  |  |  |  |  |

## 5. API Verification

After DNS is live, check:

```bash
curl -s -H 'Authorization: Bearer <token>' http://127.0.0.1:8080/api/v1/domains
curl -s -H 'Authorization: Bearer <token>' 'http://127.0.0.1:8080/api/v1/events?action=domain.verify&limit=50'
```

For every domain, you want:

- `status: VERIFIED`
- `tls_ready: true`
- empty `last_verification_error`
- recent `last_verification_check_at`

If Binboi ACME is enabled, you also want:

- `tls_mode: acme`

## 6. Public HTTPS Check

Run this for each verified domain:

```bash
curl -I https://your-domain.example.com
```

Pass if:

- TLS handshake succeeds
- certificate matches the requested host
- the response comes from Binboi or the forwarded upstream path you expect

If you already have an active tunnel for the domain target, also verify:

```bash
curl -s https://your-domain.example.com
```

## 7. Audit Check

Make sure domain actions appear in audit export and event feeds:

```bash
curl -s -H 'Authorization: Bearer <token>' 'http://127.0.0.1:8080/api/v1/events?action=domain.verify&limit=50'
curl -s -H 'Authorization: Bearer <token>' 'http://127.0.0.1:8080/api/v1/events/export?format=ndjson&action=domain.verify&limit=200'
```

Pass if:

- every domain verification appears in the event feed
- the export contains the right host names
- auto-verification entries show up when background verification succeeds

## 8. Common Failure Signals

### `status` stays `PENDING`

Check:

- TXT record value matches exactly
- TXT record is published on the correct hostname
- DNS propagation has completed

### `last_verification_error` is not empty

Check:

- authoritative DNS result
- spelling of the domain in Binboi
- whether the domain is pointed to the right public proxy

### HTTPS fails but domain is verified

Check:

- `tls_mode`
- whether ACME is enabled or TLS is expected at the edge
- whether port `80` and `443` are reachable for the selected mode
- whether ACME cache storage is writable

## 9. Rollback Rule

If one of the three domains fails while the others are healthy:

- do not block the healthy domains from launching
- remove the failing domain from customer-facing docs or routing
- keep verifying through the API until it is stable

If the base domain fails:

- stop launch
- fix ingress/DNS/TLS first

## 10. Final Launch Decision

Green-light domains only when:

- all intended production domains resolve correctly
- every required domain is `VERIFIED`
- TLS behavior matches the chosen mode
- audit events exist for domain verification
- at least one real HTTPS request succeeds per domain

_Documentation maintained by Sardor Azimov, Miransas._
