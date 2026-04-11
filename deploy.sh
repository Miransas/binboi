#!/usr/bin/env bash
# deploy.sh — push binboi to production and start Docker Compose
# Usage: ./deploy.sh
# Requires: ssh key access to sardor_stack@34.40.95.17
set -euo pipefail

SERVER="sardor_stack@34.40.95.17"
REMOTE_DIR="/home/sardor_stack/binboi"
DOMAIN="binboi.miransas.com"
ACME_EMAIL="${ACME_EMAIL:-admin@miransas.com}"

echo "==> Syncing project to $SERVER:$REMOTE_DIR …"
rsync -az --delete \
  --exclude='.git' \
  --exclude='rust/target' \
  --exclude='web/node_modules' \
  --exclude='web/.next' \
  --exclude='.gocache' \
  --exclude='*.db' \
  --exclude='.DS_Store' \
  . "$SERVER:$REMOTE_DIR"

echo "==> Patching production .env (preserving existing secrets) …"
# set_env KEY VALUE — writes the key only if it is not already present in .env
ssh "$SERVER" bash <<REMOTE
set -euo pipefail
ENV_FILE="$REMOTE_DIR/.env"
touch "\$ENV_FILE"

set_env() {
  local key=\$1 value=\$2
  if grep -qE "^\s*\${key}\s*=" "\$ENV_FILE" 2>/dev/null; then
    echo "    [keep]  \$key"
  else
    echo "\${key}=\${value}" >> "\$ENV_FILE"
    echo "    [set]   \$key"
  fi
}

set_env BINBOI_BASE_DOMAIN      "$DOMAIN"
set_env ACME_EMAIL              "$ACME_EMAIL"
set_env BINBOI_PUBLIC_SCHEME    "https"
set_env BINBOI_PUBLIC_PORT      "443"
set_env BINBOI_ALLOW_PREVIEW_MODE "false"
REMOTE

echo "==> Ensuring Docker is installed …"
ssh "$SERVER" bash <<'REMOTE'
set -euo pipefail
if ! command -v docker &>/dev/null; then
  echo "Installing Docker …"
  curl -fsSL https://get.docker.com | sh
  sudo usermod -aG docker "$USER"
  echo "Docker installed. You may need to log out and back in for group changes."
fi
docker --version
docker-compose --version
REMOTE

echo "==> Building and starting services …"
ssh "$SERVER" "cd $REMOTE_DIR && docker-compose pull --ignore-buildable && docker-compose up -d --build 2>&1"

echo "==> Waiting for core to become healthy …"
for i in $(seq 1 24); do
  STATUS=$(ssh "$SERVER" "curl -s -o /dev/null -w '%{http_code}' http://localhost:8080/api/health 2>/dev/null || true")
  if [ "$STATUS" = "200" ]; then
    echo "    core is healthy (attempt $i)"
    break
  fi
  echo "    attempt $i — status=${STATUS:-timeout}, retrying in 5s …"
  sleep 5
done

if [ "$STATUS" != "200" ]; then
  echo ""
  echo "ERROR: core did not become healthy after 2 minutes."
  echo "       Run: ssh $SERVER 'cd $REMOTE_DIR && docker-compose logs core'"
  exit 1
fi

echo ""
echo "==> Deployment complete."
echo "    API:     https://$DOMAIN"
echo "    Tunnel:  <id>.$DOMAIN"
echo "    Verify:  curl -s https://$DOMAIN/api/health"
echo ""
echo "    DNS required (if not already set):"
echo "      A  $DOMAIN          -> 34.40.95.17"
echo "      A  *.$DOMAIN        -> 34.40.95.17"
