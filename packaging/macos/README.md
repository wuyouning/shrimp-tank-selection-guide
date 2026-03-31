# macOS DMG Packaging

This folder contains the first macOS installer-style DMG flow for Shrimp Tank / OpenClaw Preflight.

## Goal

Ship a single DMG that works on:

- Intel Macs
- Apple Silicon (M-series) Macs

## Why one DMG can support both

The shipped CLI is JavaScript, not a single-architecture native binary.

That means:

- the same packaged CLI tarball can be installed on Intel and Apple Silicon Macs
- installation uses the target Mac's own Node.js runtime
- no architecture-specific binary bundling is required for this first DMG release

## Included in the DMG

- `Install Shrimp Tank.command`
- `Run Shrimp Tank.command`
- `payload/openclaw-preflight-<version>.tgz`
- `README-macOS.txt`

## Build

From the project root:

```bash
npm run build:dmg
```

Output:

```bash
build/macos-dmg/shrimp-tank-macos-universal.dmg
```

## Current scope

This is an installer-style DMG for a CLI product.

It is **not yet**:

- a signed `.pkg`
- a notarized Apple-distributed installer
- a native GUI app wrapper

## Good next steps

- add code signing for the DMG and scripts
- create a notarized `.pkg` installer path
- add a lightweight native macOS launcher app if a GUI entrypoint becomes desirable
