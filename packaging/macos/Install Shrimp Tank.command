#!/bin/bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PKG_DIR="$SCRIPT_DIR/payload"
PKG_TGZ="$(ls "$PKG_DIR"/openclaw-preflight-*.tgz 2>/dev/null | head -n 1 || true)"

if [ -z "$PKG_TGZ" ]; then
  osascript -e 'display alert "Shrimp Tank Installer" message "Package tarball not found in payload/." as critical'
  exit 1
fi

if ! command -v node >/dev/null 2>&1; then
  osascript -e 'display dialog "Node.js 22.14+ is required before installing Shrimp Tank.\n\nOpen the Node.js download page now?" buttons {"Cancel", "Open Download Page"} default button "Open Download Page"'
  open "https://nodejs.org/"
  exit 1
fi

NODE_VERSION_RAW="$(node -v 2>/dev/null || true)"
NODE_VERSION="${NODE_VERSION_RAW#v}"
NODE_MAJOR="${NODE_VERSION%%.*}"
NODE_MINOR_TMP="${NODE_VERSION#*.}"
NODE_MINOR="${NODE_MINOR_TMP%%.*}"
if [ -z "$NODE_MAJOR" ] || [ -z "$NODE_MINOR" ]; then
  osascript -e 'display alert "Shrimp Tank Installer" message "Unable to determine Node.js version." as critical'
  exit 1
fi

if [ "$NODE_MAJOR" -lt 22 ] || { [ "$NODE_MAJOR" -eq 22 ] && [ "$NODE_MINOR" -lt 14 ]; }; then
  osascript -e "display alert \"Shrimp Tank Installer\" message \"Detected Node.js ${NODE_VERSION_RAW}. This installer needs Node.js 22.14 or newer.\" as critical"
  exit 1
fi

npm install -g "$PKG_TGZ"

cat <<'EOF' >/tmp/shrimp-tank-install-success.txt
Shrimp Tank CLI installed successfully.

You can now run:
- shrimp-tank --lang zh-CN
- openclaw-preflight --lang en
EOF

osascript -e 'display dialog (read POSIX file "/tmp/shrimp-tank-install-success.txt") buttons {"OK"} default button "OK" with title "Shrimp Tank Installer"'
