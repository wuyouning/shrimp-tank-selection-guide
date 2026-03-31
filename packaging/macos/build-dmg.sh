#!/bin/bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")/../.." && pwd)"
MAC_DIR="$ROOT_DIR/packaging/macos"
BUILD_DIR="$ROOT_DIR/build/macos-dmg"
STAGE_DIR="$BUILD_DIR/stage"
PAYLOAD_DIR="$STAGE_DIR/payload"
PKG_NAME="openclaw-preflight-$(node -p "require('$ROOT_DIR/package.json').version").tgz"
VOL_NAME="Shrimp Tank Installer"
DMG_NAME="shrimp-tank-macos-universal.dmg"
OUT_DMG="$BUILD_DIR/$DMG_NAME"

rm -rf "$BUILD_DIR"
mkdir -p "$PAYLOAD_DIR"

cd "$ROOT_DIR"
npm run release:check
cp "$ROOT_DIR/$PKG_NAME" "$PAYLOAD_DIR/"
cp "$MAC_DIR/Install Shrimp Tank.command" "$STAGE_DIR/"
cp "$MAC_DIR/Run Shrimp Tank.command" "$STAGE_DIR/"
cp "$MAC_DIR/README-macOS.txt" "$STAGE_DIR/"
chmod +x "$STAGE_DIR/Install Shrimp Tank.command" "$STAGE_DIR/Run Shrimp Tank.command"

hdiutil create \
  -volname "$VOL_NAME" \
  -srcfolder "$STAGE_DIR" \
  -ov -format UDZO \
  "$OUT_DMG"

echo "Built DMG: $OUT_DMG"
