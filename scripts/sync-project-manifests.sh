#!/usr/bin/env bash

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
WEB_PACKAGE_JSON="$ROOT_DIR/web/package.json"

extract_package_value() {
  local key="$1"
  sed -n "s/.*\"${key}\": \"\\([^\"]*\\)\".*/\\1/p" "$WEB_PACKAGE_JSON" | head -n 1
}

normalize_addr() {
  local addr="$1"
  if [[ "$addr" == :* ]]; then
    printf "127.0.0.1%s" "$addr"
    return
  fi
  printf "%s" "$addr"
}

build_base_url() {
  local scheme="$1"
  local addr="$2"
  local normalized
  normalized="$(normalize_addr "$addr")"
  printf "%s://%s" "$scheme" "$normalized"
}

build_public_proxy_url() {
  local scheme="$1"
  local base_domain="$2"
  local port="$3"
  if [[ "$port" == "80" && "$scheme" == "http" ]]; then
    printf "%s://%s" "$scheme" "$base_domain"
    return
  fi
  if [[ "$port" == "443" && "$scheme" == "https" ]]; then
    printf "%s://%s" "$scheme" "$base_domain"
    return
  fi
  printf "%s://%s:%s" "$scheme" "$base_domain" "$port"
}

CLI_VERSION="$(awk '/^VERSION[[:space:]]/{print $3; exit}' "$ROOT_DIR/Makefile")"
GO_VERSION="$(awk '/^go[[:space:]]+/{print $2; exit}' "$ROOT_DIR/go.mod")"
WEB_VERSION="$(extract_package_value version)"
NEXT_VERSION="$(extract_package_value next)"
REACT_VERSION="$(extract_package_value react)"
BUILD_TARGETS_RAW="$(awk '/^CLI_PLATFORMS[[:space:]]*:=[[:space:]]*/{for(i=3;i<=NF;i++) printf "%s ", $i; exit}' "$ROOT_DIR/Makefile")"
PROJECT_ID="miransas.binboi"
RELEASE_CHANNEL="candidate"
API_VERSION="v1"
DEFAULT_DEPLOY_MODE="local-full-stack"
RELEASE_DATE="$(date -u +"%Y-%m-%d")"
SUPPORT_TIER="community-supported"
MINIMUM_CLI_VERSION="$CLI_VERSION"
RELEASE_NOTES_URL="https://github.com/Miransas/binboi/releases"
PUBLIC_SCHEME="${BINBOI_PUBLIC_SCHEME:-http}"
PUBLIC_PORT="${BINBOI_PUBLIC_PORT:-8000}"
BASE_DOMAIN="${BINBOI_BASE_DOMAIN:-binboi.localhost}"
API_ADDR="${BINBOI_API_ADDR:-:8080}"
PROXY_ADDR="${BINBOI_PROXY_ADDR:-:8000}"
WEB_BASE_URL="${BINBOI_WEB_BASE_URL:-http://127.0.0.1:3000}"
API_BASE_URL="${BINBOI_API_BASE_URL:-${BINBOI_API_BASE:-${NEXT_PUBLIC_BINBOI_API_BASE:-$(build_base_url "$PUBLIC_SCHEME" "$API_ADDR")}}}"
PROXY_BASE_URL="${BINBOI_PROXY_BASE_URL:-$(build_public_proxy_url "$PUBLIC_SCHEME" "$BASE_DOMAIN" "$PUBLIC_PORT")}"
DASHBOARD_URL="${WEB_BASE_URL%/}/dashboard"
HEALTH_ENDPOINT="/api/${API_VERSION}/health"
METRICS_ENDPOINT="/metrics"

read -r -a BUILD_TARGETS <<< "$BUILD_TARGETS_RAW"
BUILD_TARGETS_JSON=""
for target in "${BUILD_TARGETS[@]}"; do
  [[ -n "$BUILD_TARGETS_JSON" ]] && BUILD_TARGETS_JSON+=", "
  BUILD_TARGETS_JSON+="\"$target\""
done

if [[ -z "$CLI_VERSION" || -z "$GO_VERSION" || -z "$WEB_VERSION" || -z "$NEXT_VERSION" || -z "$REACT_VERSION" || -z "$PROJECT_ID" || -z "$RELEASE_CHANNEL" || -z "$API_VERSION" || -z "$DEFAULT_DEPLOY_MODE" || -z "$RELEASE_DATE" || -z "$SUPPORT_TIER" || -z "$MINIMUM_CLI_VERSION" || -z "$BUILD_TARGETS_JSON" || -z "$RELEASE_NOTES_URL" || -z "$WEB_BASE_URL" || -z "$API_BASE_URL" || -z "$PROXY_BASE_URL" || -z "$DASHBOARD_URL" || -z "$HEALTH_ENDPOINT" || -z "$METRICS_ENDPOINT" ]]; then
  echo "Failed to resolve one or more manifest version fields." >&2
  exit 1
fi

cat > "$ROOT_DIR/miransas.json" <<EOF
{
  "schemaVersion": 2,
  "organization": "Miransas",
  "project": {
    "name": "Binboi",
    "slug": "binboi",
    "projectId": "$PROJECT_ID",
    "status": "release-candidate",
    "maintainer": "Sardor Azimov",
    "license": "MIT",
    "repository": "https://github.com/Miransas/binboi"
  },
  "release": {
    "channel": "$RELEASE_CHANNEL",
    "apiVersion": "$API_VERSION",
    "releaseDate": "$RELEASE_DATE",
    "minimumCliVersion": "$MINIMUM_CLI_VERSION",
    "supportTier": "$SUPPORT_TIER"
  },
  "buildTarget": {
    "type": "multi-platform-cli",
    "platforms": [$BUILD_TARGETS_JSON]
  },
  "versions": {
    "cli": "$CLI_VERSION",
    "web": "$WEB_VERSION",
    "go": "$GO_VERSION",
    "next": "$NEXT_VERSION",
    "react": "$REACT_VERSION",
    "nodeRequirement": "20+"
  },
  "runtime": {
    "deployMode": {
      "default": "$DEFAULT_DEPLOY_MODE",
      "supported": ["local-preview", "local-full-stack", "staging", "production-like"]
    },
    "defaultPorts": {
      "api": 8080,
      "tunnel": 8081,
      "proxy": 8000,
      "web": 3000
    },
    "commands": {
      "server": "go run ./cmd/binboi-server",
      "cli": "go build -o binboi ./cmd/binboi-client",
      "web": "cd web && npm run dev"
    }
  },
  "distribution": {
    "recommended": ["homebrew", "direct-binary", "install-script", "go-source"],
    "planned": ["npm", "bun", "cargo", "apt", "pip"]
  },
  "stack": {
    "backend": ["Go", "Gin", "Yamux"],
    "frontend": ["Next.js", "React", "TypeScript"],
    "storage": ["SQLite", "Postgres"],
    "integrations": ["GitHub OAuth", "OpenAI", "Paddle"]
  },
  "docs": {
    "root": "./README",
    "web": "./web/README.md",
    "docs": "./docs/README.md",
    "installMatrix": "./docs/install-channel-matrix.md",
    "deployReadiness": "./docs/deploy-readiness.md",
    "launchBlockers": "./docs/launch-blockers.md",
    "releaseNotesUrl": "$RELEASE_NOTES_URL"
  },
  "endpoints": {
    "dashboardUrl": "$DASHBOARD_URL",
    "publicDashboardUrl": "$DASHBOARD_URL",
    "apiBaseUrl": "$API_BASE_URL",
    "proxyBaseUrl": "$PROXY_BASE_URL",
    "health": "$HEALTH_ENDPOINT",
    "metrics": "$METRICS_ENDPOINT"
  }
}
EOF

cat > "$ROOT_DIR/binboi.json" <<EOF
{
  "schemaVersion": 2,
  "name": "binboi",
  "displayName": "Binboi",
  "projectId": "$PROJECT_ID",
  "version": "$CLI_VERSION",
  "webVersion": "$WEB_VERSION",
  "releaseChannel": "$RELEASE_CHANNEL",
  "apiVersion": "$API_VERSION",
  "releaseDate": "$RELEASE_DATE",
  "repository": "https://github.com/Miransas/binboi",
  "license": "MIT",
  "owner": "Miransas",
  "maintainer": "Sardor Azimov",
  "description": "Self-hosted tunneling platform with a Go control plane, CLI agent, and Next.js product app.",
  "deployMode": {
    "default": "$DEFAULT_DEPLOY_MODE",
    "supported": ["local-preview", "local-full-stack", "staging", "production-like"]
  },
  "buildTarget": {
    "type": "multi-platform-cli",
    "platforms": [$BUILD_TARGETS_JSON]
  },
  "versions": {
    "go": "$GO_VERSION",
    "next": "$NEXT_VERSION",
    "react": "$REACT_VERSION"
  },
  "minimumCliVersion": "$MINIMUM_CLI_VERSION",
  "supportTier": "$SUPPORT_TIER",
  "components": {
    "server": {
      "language": "Go",
      "entrypoint": "./cmd/binboi-server",
      "defaultPort": 8080
    },
    "cli": {
      "language": "Go",
      "entrypoint": "./cmd/binboi-client",
      "binaryName": "binboi"
    },
    "web": {
      "language": "TypeScript",
      "framework": "Next.js",
      "path": "./web",
      "defaultPort": 3000
    }
  },
  "defaultPorts": {
    "api": 8080,
    "tunnel": 8081,
    "proxy": 8000,
    "web": 3000
  },
  "distribution": {
    "supported": ["homebrew", "direct-binary", "install-script", "go-source"],
    "planned": ["npm", "bun", "cargo", "apt", "pip"]
  },
  "storage": ["SQLite", "Postgres"],
  "optionalIntegrations": ["GitHub OAuth", "OpenAI", "Paddle"],
  "docs": {
    "readme": "./README",
    "architecture": "./docs/architecture-overview.md",
    "apiRequirements": "./docs/api-requirements.md",
    "releaseGuide": "./docs/releasing-cli.md",
    "installMatrix": "./docs/install-channel-matrix.md",
    "releaseNotesUrl": "$RELEASE_NOTES_URL"
  },
  "endpoints": {
    "dashboardUrl": "$DASHBOARD_URL",
    "publicDashboardUrl": "$DASHBOARD_URL",
    "apiBaseUrl": "$API_BASE_URL",
    "proxyBaseUrl": "$PROXY_BASE_URL",
    "health": "$HEALTH_ENDPOINT",
    "metrics": "$METRICS_ENDPOINT"
  }
}
EOF

echo "Synced project manifests:"
echo "  - $ROOT_DIR/miransas.json"
echo "  - $ROOT_DIR/binboi.json"
