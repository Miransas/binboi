#!/usr/bin/env bash

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
VERSION="${VERSION:-$(node -p "require('${ROOT_DIR}/binboi.json').version")}"
GOARCH="${GOARCH:-amd64}"
GOOS="${GOOS:-linux}"
OUT_DIR="${OUT_DIR:-$ROOT_DIR/dist/debian}"
PACKAGE_NAME="binboi"

case "$GOARCH" in
  amd64) DEB_ARCH="amd64" ;;
  arm64) DEB_ARCH="arm64" ;;
  *)
    echo "Unsupported GOARCH for Debian packaging: $GOARCH" >&2
    exit 1
    ;;
esac

WORK_DIR="$(mktemp -d)"
cleanup() {
  rm -rf "$WORK_DIR"
}
trap cleanup EXIT

PACKAGE_ROOT="$WORK_DIR/${PACKAGE_NAME}_${VERSION}_${DEB_ARCH}"
BIN_DIR="$PACKAGE_ROOT/usr/bin"
DEBIAN_DIR="$PACKAGE_ROOT/DEBIAN"
ETC_DIR="$PACKAGE_ROOT/etc/binboi"

mkdir -p "$BIN_DIR" "$DEBIAN_DIR" "$ETC_DIR"

CGO_ENABLED=0 GOOS="$GOOS" GOARCH="$GOARCH" go build -trimpath -ldflags "-s -w -X github.com/miransas/binboi/internal/cli.Version=${VERSION}" -o "$BIN_DIR/binboi" ./cmd/binboi-client

cp "$ROOT_DIR/packaging/debian/DEBIAN/control" "$DEBIAN_DIR/control"
cp "$ROOT_DIR/packaging/debian/DEBIAN/postinst" "$DEBIAN_DIR/postinst"
chmod 0755 "$DEBIAN_DIR/postinst" "$BIN_DIR/binboi"

sed -i.bak \
  -e "s/^Architecture: .*/Architecture: ${DEB_ARCH}/" \
  -e "s/^Version: .*/Version: ${VERSION}/" \
  "$DEBIAN_DIR/control"
rm -f "$DEBIAN_DIR/control.bak"

cp "$ROOT_DIR/binboi.json" "$ETC_DIR/distribution-defaults.json"

mkdir -p "$OUT_DIR"
dpkg-deb --build "$PACKAGE_ROOT" "$OUT_DIR/${PACKAGE_NAME}_${VERSION}_${DEB_ARCH}.deb"
echo "Built Debian package: $OUT_DIR/${PACKAGE_NAME}_${VERSION}_${DEB_ARCH}.deb"
