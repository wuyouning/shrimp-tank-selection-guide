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

- `Installer Shrimp Tank.command`
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

## Signing and notarization

A follow-up script is included:

```bash
npm run sign:dmg
```

Environment variables:

- `APPLE_CODESIGN_IDENTITY` — Developer ID Application identity name from Keychain
- `APPLE_NOTARY_PROFILE` — optional `notarytool` keychain profile name

Behavior:

- if no signing identity is configured, the script exits cleanly and explains what is missing
- if a signing identity is configured, it signs the DMG
- if a notary profile is also configured, it submits the DMG and staples the result

## Good next steps

- move from installer-style DMG to signed/notarized `.pkg` when needed
- add branded icons/background layout for the DMG window
- add a lightweight native macOS launcher app if a GUI entrypoint becomes desirable
