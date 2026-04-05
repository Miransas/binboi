# Go control plane defaults
BINBOI_API_ADDR=:8080
BINBOI_TUNNEL_ADDR=:8081
BINBOI_PROXY_ADDR=:8000
BINBOI_BASE_DOMAIN=binboi.localhost
BINBOI_PUBLIC_SCHEME=http
BINBOI_PUBLIC_PORT=8000
BINBOI_DATABASE_PATH=./binboi.db

# Enable Postgres-backed personal access tokens and account ownership in the control plane.
BINBOI_AUTH_DATABASE_URL=postgresql://binboi:binboi@localhost:5432/binboi?sslmode=disable

# Optional: keep local preview mode available when Postgres auth is not configured.
# Defaults to enabled outside production and disabled in production.
BINBOI_ALLOW_PREVIEW_MODE=true

# CLI defaults
BINBOI_API_URL=http://127.0.0.1:8080
BINBOI_SERVER_ADDR=127.0.0.1:8081
BINBOI_DASHBOARD_URL=http://127.0.0.1:3000/dashboard/access-tokens
BINBOI_AUTH_TOKEN=
