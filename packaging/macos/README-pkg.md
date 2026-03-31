# macOS PKG Installer

This folder now includes a `.pkg` installer build flow for Shrimp Tank / OpenClaw Preflight.

## Goal

Provide a more standard macOS installer path than double-clicking `.command` files, while still shipping a CLI product.

## Build

From the project root:

```bash
npm run build:pkg
```

Output:

```bash
build/macos-pkg/shrimp-tank-installer-<version>.pkg
```

## Current installer behavior

The package currently:

- stages the packaged CLI tarball under `/Users/Shared/.shrimp-tank/payload`
- runs a postinstall script
- installs the npm package globally if Node.js is already present
- creates a helper command at `/usr/local/bin/shrimp-tank`

## Intel + Apple Silicon support

The `.pkg` flow supports both Intel Macs and Apple Silicon Macs for the same reason as the DMG flow:

- the shipped CLI is JavaScript
- the target Mac uses its own Node.js runtime
- no single-architecture native binary is embedded in this first PKG release

## Current scope

This is a working installer flow, but it is not yet:

- signed with a Developer ID Installer certificate
- notarized by Apple
- converted into a more advanced GUI installer experience

## Good next steps

- add Developer ID Installer signing for the `.pkg`
- add notarization for the installer package
- harden the postinstall flow and better detect per-user npm/global-bin environments
