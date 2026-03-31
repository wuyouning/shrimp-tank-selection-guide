#!/bin/bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")/../.." && pwd)"
MAC_DIR="$ROOT_DIR/packaging/macos"
PKG_WORK="$ROOT_DIR/build/macos-pkg"
ROOT_PAYLOAD="$PKG_WORK/root"
SCRIPTS_DIR="$PKG_WORK/scripts"
PKG_ID="com.wuyouning.shrimptank"
VERSION="$(node -p "require('$ROOT_DIR/package.json').version")"
PKG_NAME="shrimp-tank-installer-${VERSION}.pkg"
OUT_PKG="$PKG_WORK/$PKG_NAME"
TGZ_NAME="openclaw-preflight-${VERSION}.tgz"

rm -rf "$PKG_WORK"
mkdir -p "$ROOT_PAYLOAD/Users/Shared/.shrimp-tank/payload" "$SCRIPTS_DIR"

cd "$ROOT_DIR"
npm run release:check
cp "$ROOT_DIR/$TGZ_NAME" "$ROOT_PAYLOAD/Users/Shared/.shrimp-tank/payload/"
cp "$MAC_DIR/pkg/postinstall" "$SCRIPTS_DIR/postinstall"
chmod +x "$SCRIPTS_DIR/postinstall"

pkgbuild \
  --root "$ROOT_PAYLOAD" \
  --scripts "$SCRIPTS_DIR" \
  --identifier "$PKG_ID" \
  --version "$VERSION" \
  --install-location "/" \
  "$OUT_PKG"

echo "Built PKG: $OUT_PKG"
