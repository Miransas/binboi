#!/usr/bin/env bash
# install.sh - Quick installer for the Binboi CLI
# Usage: curl -fsSL https://raw.githubusercontent.com/Miransas/binboi/main/install.sh | bash

set -e

REPO="Miransas/binboi"
BINARY="binboi"
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

echo "Installing Binboi CLI..."

if ! command -v curl &>/dev/null; then
  echo "Error: curl is required to download the Binboi release archive."
  exit 1
fi

TAG="$(curl -fsSL "https://api.github.com/repos/${REPO}/releases/latest" | awk -F '\"' '/tag_name/ {print $4; exit}')"
if [ -z "$TAG" ]; then
  echo "Error: could not resolve the latest Binboi release tag."
  exit 1
fi

VERSION="${TAG#v}"
ARCHIVE="${BINARY}_${VERSION}_${OS}_${ARCH}.tar.gz"
URL="https://github.com/${REPO}/releases/download/${TAG}/${ARCHIVE}"
TMP_DIR="$(mktemp -d)"

cleanup() {
  rm -rf "$TMP_DIR"
}
trap cleanup EXIT

echo "Downloading ${URL}"
curl -fsSL "$URL" -o "$TMP_DIR/${ARCHIVE}"
tar -xzf "$TMP_DIR/${ARCHIVE}" -C "$TMP_DIR"

if [ ! -f "$TMP_DIR/${BINARY}_${VERSION}_${OS}_${ARCH}/${BINARY}" ]; then
  echo "Error: downloaded archive did not contain the expected binary."
  exit 1
fi

install -m 0755 "$TMP_DIR/${BINARY}_${VERSION}_${OS}_${ARCH}/${BINARY}" "${INSTALL_DIR}/${BINARY}"
echo "✅ Binboi installed to ${INSTALL_DIR}/${BINARY}"
