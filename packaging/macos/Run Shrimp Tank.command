#!/bin/bash
set -euo pipefail

if ! command -v shrimp-tank >/dev/null 2>&1; then
  osascript -e 'display alert "Shrimp Tank" message "shrimp-tank is not installed yet. Please run Install Shrimp Tank.command first." as critical'
  exit 1
fi

exec shrimp-tank --lang zh-CN
