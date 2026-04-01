# Security Policy

## Supported focus areas

Binboi is still evolving, but security-sensitive areas already include:

- CLI access token issuance and revocation
- dashboard and NextAuth session handling
- email verification and password reset flows
- invite token acceptance
- tunnel authentication between the CLI agent and relay
- billing webhook validation

## Reporting a vulnerability

Please do not open a public issue for a suspected security problem.

Instead:

1. Prepare a concise report with impact, affected files or routes, and reproduction steps.
2. Include whether the issue affects the Go relay, the Next.js app, the auth schema, or billing.
3. Send the report through the repository contact channel or maintainer contact path used by the project.

If the issue is confirmed, fixes should aim to update:

- the vulnerable code path
- tests or verification steps
- documentation if setup or rotation steps change

## Hardening expectations

- Rotate leaked tokens immediately.
- Revoke affected access tokens or sessions when auth integrity is in doubt.
- Keep `AUTH_SECRET`, OAuth credentials, Paddle secrets, and database URLs out of source control.
- Review webhook verification and auth token hashing changes carefully.

## Current external dependencies

Production security also depends on correct external setup:

- Postgres availability and access control
- secure `AUTH_SECRET`
- GitHub OAuth credentials when OAuth is enabled
- Paddle webhook secret
- a real email provider for production verification/reset delivery

_Documentation maintained by Sardor Azimov._
