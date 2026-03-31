# Shrimp Tank Selection Guide

[中文版](./README.zh-CN.md) | English

A release-ready CLI for checking whether a machine is a good host for OpenClaw.

If OpenClaw is the shrimp, this tool helps you judge whether the tank is ready.

## Why this exists

Before installing OpenClaw on a machine, it helps to know:

- whether the runtime and core tooling are ready
- whether the host has enough hardware headroom
- whether the current machine state is healthy enough right now
- whether the system is better suited for light, standard, media, or multi-agent workloads

This project turns those questions into a single CLI with a readable terminal report and structured JSON output.

## What it checks

- Runtime readiness: Node, package managers, install-critical dependencies
- Host hardware: RAM, CPU concurrency, disk headroom
- Real-time conditions: current network reachability, free memory, current load
- Platform-specific readiness: macOS Homebrew, Linux package managers, Windows posture/admin hints
- OpenClaw fit: chat, automation, media, and multi-agent usage profiles

## Scoring model

This project treats **100 points as the standard host baseline** for OpenClaw.

The baseline is split into:

- **Software score** — runtime, dependencies, platform readiness
- **Hardware score** — RAM capacity, CPU concurrency, disk headroom
- **Real-time fluctuation score** — current network condition, free memory, current load

Strong hosts can earn **bonus points**, so the final score may go above 100.

That makes the result easier to interpret:

- high hardware + weak real-time score → good machine, but currently busy or network-constrained
- weak software score → capable machine, but environment not ready yet
- bonus points → distinguishes acceptable hosts from excellent ones

## Install

```bash
npm install -g openclaw-preflight
```

Then run:

```bash
openclaw-preflight --lang en
# or
shrimp-tank --lang zh-CN
```

## Easier local development use

From the project folder:

```bash
npm run install:global-local
```

To remove the local global install later:

```bash
npm run uninstall:global-local
```

## CLI examples

```bash
openclaw-preflight --lang en
openclaw-preflight --lang zh-CN --profile media
openclaw-preflight --json --lang en
openclaw-preflight --json --output report.json --lang zh-CN
shrimp-tank --lang zh-CN --profile multi-agent
```

## Language selection

```bash
openclaw-preflight --lang en
openclaw-preflight --lang zh-CN
```

- Text output follows the selected language.
- JSON output includes a `language` field so downstream tooling can stay in sync.

## Profiles

- `light`: chat, docs, light automation
- `standard`: balanced default profile
- `media`: image, video, and audio oriented workloads
- `multi-agent`: heavier concurrent agent-style usage

## Platform notes

- `macOS`: detects Homebrew, reports its version when present, and suggests `brew install ...` commands for missing dependencies when possible.
- `Windows`: includes a Windows posture section and admin/elevation guidance. If the CLI runs on Windows, it attempts a safe PowerShell-based elevation check.
- `Linux`: supports generic core checks plus package-manager-aware install hints for apt, dnf, yum, and pacman environments.

## JSON output

```bash
openclaw-preflight --json
```

The JSON report includes:

- summary status and score
- software / hardware / real-time score split
- bonus points
- dependency and network results
- score breakdown for downstream tooling or future UI layers

## Release-ready packaging

```bash
npm run release:check
```

That command will:

1. clean old build artifacts
2. run tests
3. build a lean production `dist/`
4. generate a release tarball with `npm pack`

The release tarball keeps only the runtime assets needed by end users:
- compiled CLI code in `dist/`
- README files
- LICENSE

## Publish path

When you're ready to publish for real:

```bash
npm login
npm publish --access public
```

## macOS DMG build

This project also includes a macOS installer-style DMG flow for both Intel and Apple Silicon Macs.

Build it with:

```bash
npm run build:dmg
```

The generated DMG contains:

- `Installer Shrimp Tank.command`
- `Install Shrimp Tank.command`
- `Run Shrimp Tank.command`
- the packaged CLI tarball in `payload/`
- a short macOS usage note

Optional follow-up for code signing / notarization:

```bash
npm run sign:dmg
```

Why one DMG works for both Intel and Apple Silicon:

- the shipped CLI is JavaScript, not a single-architecture native binary
- installation happens through the local Node.js runtime on the target Mac
- as long as that Mac has a supported Node.js installed, the same DMG can be used on Intel and M-series machines

## Project strength today

This tool is already good at:

- host readiness scoring
- dependency and package-manager hints
- bilingual terminal output
- human-readable plus machine-readable reporting
- local install and release-style packaging

## Good next steps

- richer Linux distro detection
- GPU / media acceleration detection
- more granular OpenClaw gateway and node checks
- a doctor mode that can print or apply fix scripts by platform
