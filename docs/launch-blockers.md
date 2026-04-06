# Binboi Launch Blockers

This document separates true release blockers from important follow-up work.

It is intentionally backend-first and operationally focused.

Use this together with:

- [smoke-test-checklist.md](/Users/sardorazimov/binboi/docs/smoke-test-checklist.md)
- [deploy-readiness.md](/Users/sardorazimov/binboi/docs/deploy-readiness.md)

## 1. Must Fix Before Public Launch

These are launch blockers for a real public release.

### 1. Real production auth configuration

Binboi should not be launched publicly without:

- `DATABASE_URL`
- `BINBOI_AUTH_DATABASE_URL`
- `AUTH_SECRET`

Why this blocks launch:

- the serious account-backed path depends on Postgres
- preview mode is only for intentional local testing
- auth/session failures here affect dashboard access, token creation, and billing ownership

### 2. Preview mode must stay disabled in public environments

Required posture:

- `BINBOI_ALLOW_PREVIEW_MODE=false` or unset in production-like deployments

Why this blocks launch:

- preview mode is a developer fallback
- it uses the local instance-token path
- it is not the intended public multi-user behavior

### 3. Public base domain and ingress must be correct

Required:

- the base domain resolves to the Binboi proxy
- ingress or reverse proxy forwards correctly
- public traffic reaches the Go proxy service

Why this blocks launch:

- if the public URL cannot resolve or route, the core product fails

### 4. TLS termination must exist at the edge

Required:

- terminate TLS in Caddy, Nginx, Traefik, a cloud load balancer, or similar ingress

Why this blocks launch:

- current shipping Binboi does not provide a full managed ACME/TLS lifecycle inside the Go control plane
- without correct edge TLS, public usage is not production-ready

### 5. Smoke path must pass end to end

Required:

- CLI login works
- CLI whoami works
- tunnel creation works
- public URL forwards correctly
- requests are persisted
- `/api/v1/metrics` and `/metrics` respond
- `X-Request-ID` is visible in responses/logs

Why this blocks launch:

- this validates the actual shipped product loop, not just unit tests

## 2. Strongly Recommended Before Launch

These are not hard code blockers if your deployment is controlled, but they should be in place before a serious public announcement.

### 1. Production email delivery

Needed for:

- verification email
- password reset
- invite flow

Why it matters:

- auth feels incomplete or fragile without real delivery

### 2. OAuth credentials if GitHub sign-in is exposed

Needed:

- `AUTH_GITHUB_ID`
- `AUTH_GITHUB_SECRET`

Why it matters:

- the UI path should not expose a social login that is not operational

### 3. Billing credentials if paid plans are live

Needed:

- `PADDLE_*`

Why it matters:

- pricing/billing cannot be treated as launch-ready without real checkout behavior

### 4. Basic operational monitoring

Already improved:

- request IDs
- JSON logs
- metrics endpoints

Still recommended around deployment:

- log collection
- dashboard/host monitoring
- alerting on crash loops or repeated proxy errors

## 3. Important But Not Launch Blockers For The Current HTTP MVP

These are meaningful gaps, but they do not need to block the first serious HTTP-focused release.

### 1. Built-in rate limiting and abuse protection

Why it matters:

- public tunnel products eventually need stronger protection

Why it does not block the current release:

- it can be partly enforced at the edge or ingress layer first

### 2. Domain verification background retry

Current state:

- verify is explicit and operator-triggered

Why it does not block the current release:

- manual verify is acceptable for an early controlled launch

### 3. Richer observability stack

Still missing:

- tracing
- dashboards
- long-term metrics aggregation
- audit/event exports

Why it does not block the current release:

- basic counters and structured logs now exist

### 4. Multi-node control plane

Current state:

- single-node HTTP relay MVP

Why it does not block the current release:

- acceptable for early self-hosted and controlled deployments

## 4. Not In Scope For This Launch

These should not block the current HTTP release unless the product promise changes.

- full managed TLS lifecycle inside Binboi
- full TCP tunnel product
- full raw TLS tunnel product
- Kubernetes-native product layer
- advanced Rust rewrite or Rust core migration

## 5. Launch Decision Rule

Green-light release when all of these are true:

- production auth env is configured
- preview mode is disabled
- ingress/domain routing works
- edge TLS works
- smoke-test checklist passes end to end
- logs and metrics are visible during the smoke pass

Do not launch publicly if any of these are true:

- preview mode is the only auth path still working
- tunnel open succeeds but public forwarding fails
- request persistence is empty after confirmed traffic
- metrics or request IDs are missing during smoke validation
- public domain/TLS is not ready

_Documentation maintained by Sardor Azimov._
