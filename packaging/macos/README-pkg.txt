Shrimp Tank Selection Guide - macOS PKG Installer

This PKG is intended for both Intel Macs and Apple Silicon Macs.

What it does:
- installs the packaged CLI payload under /Users/Shared/.shrimp-tank/payload
- runs npm install -g on the packaged tarball if Node.js is available
- creates a helper command at /usr/local/bin/shrimp-tank

Requirements:
- Node.js 22.14 or newer should already be installed
- installer may ask for permission when writing helper commands

After install, you can run:
- openclaw-preflight --lang zh-CN
- shrimp-tank --lang en
