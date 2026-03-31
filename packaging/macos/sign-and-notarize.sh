#!/bin/bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")/../.." && pwd)"
BUILD_DIR="$ROOT_DIR/build/macos-dmg"
DMG_PATH="$BUILD_DIR/shrimp-tank-macos-universal.dmg"

if [ ! -f "$DMG_PATH" ]; then
  echo "DMG not found: $DMG_PATH"
  echo "Run npm run build:dmg first."
  exit 1
fi

if [ -z "${APPLE_CODESIGN_IDENTITY:-}" ]; then
  echo "APPLE_CODESIGN_IDENTITY is not set."
  echo "Skipping codesign/notarization."
  echo "Example: export APPLE_CODESIGN_IDENTITY='Developer ID Application: Your Name (TEAMID)'"
  exit 0
fi

if ! security find-identity -v -p codesigning | grep -F "$APPLE_CODESIGN_IDENTITY" >/dev/null 2>&1; then
  echo "Codesign identity not found in keychain: $APPLE_CODESIGN_IDENTITY"
  exit 1
fi

echo "Signing DMG with: $APPLE_CODESIGN_IDENTITY"
codesign --force --sign "$APPLE_CODESIGN_IDENTITY" "$DMG_PATH"

if [ -n "${APPLE_NOTARY_PROFILE:-}" ]; then
  echo "Submitting DMG for notarization with profile: $APPLE_NOTARY_PROFILE"
  xcrun notarytool submit "$DMG_PATH" --keychain-profile "$APPLE_NOTARY_PROFILE" --wait
  echo "Stapling notarization ticket"
  xcrun stapler staple "$DMG_PATH"
else
  echo "APPLE_NOTARY_PROFILE is not set. Skipping notarization submit."
  echo "Example: export APPLE_NOTARY_PROFILE='AC_PASSWORD_PROFILE_NAME'"
fi

echo "Done: $DMG_PATH"
