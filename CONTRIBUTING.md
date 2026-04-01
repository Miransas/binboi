# Contributing to Binboi

Thanks for contributing to Binboi.

## Before you open a change

- read the root [`README.md`](./README.md) for the current product shape
- check the folder-level `README.md` files before making broad refactors
- keep dashboard, docs, auth, relay, and billing changes scoped when possible
- prefer root-cause fixes over CSS or flow band-aids

## Local setup

1. Install Go 1.25+ and Node.js 20+.
2. Start the relay with `go run ./cmd/binboi-server`.
3. Start the web app with `cd web && npm install && npm run dev`.
4. Build the CLI with `go build -o binboi ./cmd/binboi-client`.

## Development expectations

- Preserve existing route structure unless a change really requires it.
- Keep dashboard-only styling inside dashboard code.
- Keep auth changes coherent across UI, API routes, session helpers, and schema assumptions.
- Do not break preview mode when database-backed auth is unavailable.
- When changing docs or product copy, update the relevant markdown files in the repo too.

## Verification

- Go changes: run the relevant Go tests or at minimum compile the affected packages.
- Web changes: run `npm run lint` in `web/` and type-check when the change touches shared types or auth flows.
- Schema changes: keep Drizzle schema, migrations, and runtime bootstrap logic aligned.

## Pull request notes

- explain the user-facing impact
- list any new environment variables or migrations
- mention whether external setup is still required
- include screenshots for UI changes when they materially affect auth, billing, dashboard, or marketing pages

## Code style

- Prefer small, explicit modules over large mixed-responsibility files.
- Keep comments brief and useful.
- Avoid dead placeholders, boilerplate leftovers, and stale example URLs.

_Documentation maintained by Sardor Azimov._
