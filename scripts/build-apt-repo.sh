#!/usr/bin/env bash

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
DEB_DIR="${DEB_DIR:-$ROOT_DIR/dist/debian}"
OUT_DIR="${OUT_DIR:-$ROOT_DIR/dist/apt}"
POOL_DIR="$OUT_DIR/pool/main/b/binboi"
DISTS_DIR="$OUT_DIR/dists/stable/main"

if ! command -v dpkg-scanpackages >/dev/null 2>&1; then
  echo "dpkg-scanpackages is required to build the APT repository bundle." >&2
  exit 1
fi

mkdir -p "$POOL_DIR"
find "$DEB_DIR" -maxdepth 1 -type f -name '*.deb' -exec cp {} "$POOL_DIR/" \;

if ! find "$POOL_DIR" -maxdepth 1 -type f -name '*.deb' | grep -q .; then
  echo "No .deb files found in $DEB_DIR" >&2
  exit 1
fi

for arch in amd64 arm64; do
  BINARY_DIR="$DISTS_DIR/binary-$arch"
  mkdir -p "$BINARY_DIR"
  dpkg-scanpackages --arch "$arch" "$POOL_DIR" /dev/null > "$BINARY_DIR/Packages"
  gzip -9c "$BINARY_DIR/Packages" > "$BINARY_DIR/Packages.gz"
done

cat > "$OUT_DIR/dists/stable/Release" <<EOF
Origin: Miransas
Label: Binboi
Suite: stable
Codename: stable
Architectures: amd64 arm64
Components: main
Description: Binboi APT repository bundle
Date: $(LC_ALL=C date -u "+%a, %d %b %Y %H:%M:%S UTC")
EOF

tar -C "$OUT_DIR" -czf "$ROOT_DIR/dist/binboi-apt-repo.tar.gz" .
echo "Built APT repository bundle: $ROOT_DIR/dist/binboi-apt-repo.tar.gz"
