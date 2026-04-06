#!/usr/bin/env bash

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
TMP_DIR="$(mktemp -d)"

cleanup() {
  rm -rf "$TMP_DIR"
}
trap cleanup EXIT

echo "Verifying npm wrapper manifest..."
NPM_CONFIG_CACHE="$TMP_DIR/npm-cache" npm pack --json "$ROOT_DIR/packaging/npm" --pack-destination "$TMP_DIR" >/dev/null

echo "Verifying Cargo wrapper crate..."
cargo package --manifest-path "$ROOT_DIR/rust/Cargo.toml" --allow-dirty --list >/dev/null

echo "Verifying Python wrapper package..."
python3 -m py_compile "$ROOT_DIR/packaging/python/binboi_wrapper/cli.py"

echo "Verifying Debian maintainer scripts..."
bash -n "$ROOT_DIR/packaging/debian/DEBIAN/postinst"

echo "Distribution manifests verified."
