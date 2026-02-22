#!/usr/bin/env bash
# install.sh – Quick installer for Elasiya CLI
# Usage: curl -fsSL https://raw.githubusercontent.com/sardorazimov/elasiyanetwork/main/install.sh | bash

set -e

REPO="sardorazimov/elasiyanetwork"
BINARY="elasiya"
INSTALL_DIR="/usr/local/bin"

OS="$(uname -s | tr '[:upper:]' '[:lower:]')"
ARCH="$(uname -m)"

case "$ARCH" in
  x86_64) ARCH="amd64" ;;
  aarch64|arm64) ARCH="arm64" ;;
  *) echo "Unsupported architecture: $ARCH"; exit 1 ;;
esac

case "$OS" in
  linux|darwin) ;;
  *) echo "Unsupported OS: $OS"; exit 1 ;;
esac

echo "Installing Elasiya CLI..."

# Build from source using go install
if command -v go &>/dev/null; then
  go install github.com/sardorazimov/elasiyanetwork/cmd/elasiya@latest
  echo "✅  Elasiya installed via go install"
  echo "Make sure \$GOPATH/bin is in your PATH"
  exit 0
fi

echo "Error: Go is required to install Elasiya from source."
echo "Install Go from https://go.dev/dl/ and re-run this script."
exit 1
