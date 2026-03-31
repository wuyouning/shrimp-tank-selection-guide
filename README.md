# Shrimp Tank Selection Guide

[中文版](./README.zh-CN.md) | English

A local TypeScript/Node CLI for checking whether a host machine is a good fit for running OpenClaw.

If OpenClaw is the shrimp, this tool helps you judge whether the tank is ready.

## What it does

- Collects host and hardware information
- Checks key dependencies such as Node, npm, git, python3, ffmpeg, uv, docker, and openclaw
- Runs basic DNS and outbound HTTPS checks
- Grades the machine for different OpenClaw usage profiles
- Detects macOS Homebrew and turns missing dependency checks into actionable install hints
- Carries a Windows readiness posture in the report, including elevation and admin guidance
- Produces both a human-readable terminal report and structured JSON output

## Why this exists

Before installing OpenClaw on a machine, it helps to know:

- whether the system has the right runtime and tooling
- whether network access looks healthy enough
- whether the machine is a good fit for light, standard, media, or multi-agent workloads
- whether the environment is likely to need extra setup before OpenClaw will feel stable

This project is meant to be a practical preflight checker: something you can run quickly and get both a readable answer and machine-consumable output.

## Profiles

- `light`: chat, docs, light automation
- `standard`: balanced default profile
- `media`: image, video, and audio oriented workloads
- `multi-agent`: heavier concurrent agent-style usage

## Install

```bash
npm install
```

## Platform notes

- `macOS`: detects Homebrew, reports its version when present, and suggests `brew install ...` commands for missing dependencies when possible.
- `Windows`: includes a Windows posture section and admin/elevation guidance. If the CLI runs on Windows, it attempts a safe PowerShell-based elevation check.
- `Linux`: supported for the current core checks and scoring path, with generic dependency detection and networking checks.

## Run in dev mode

```bash
npm run dev
npm run dev -- --verbose
npm run dev -- --json
npm run dev -- --json --output examples/report.json
npm run dev -- --profile media
npm run dev -- --profile multi-agent --timeout 8
```

## Build and run

```bash
npm run build
npm start -- --profile standard
```

## Verify locally

```bash
npm run build
npm test
npm start -- --verbose
```

## Planned packaged command

```bash
openclaw-preflight
```

## CLI flags

```bash
--json                 output JSON
--output <path>        write output to file
--verbose              show more detail
--timeout <seconds>    network timeout in seconds
--profile <profile>    light | standard | media | multi-agent
```

## Exit codes

- `0`: PASS or PASS_WITH_WARNINGS
- `1`: LIMITED
- `2`: FAIL or runtime error

## Output categories

- `PASS`
- `PASS_WITH_WARNINGS`
- `LIMITED`
- `FAIL`

## Example output

See:
- `examples/sample-report.json`
- `examples/report.json` after a local run

## Project structure

```text
src/
  __tests__/
  checks/
  formatters/
  utils/
  cli.ts
```

## Reporting highlights

- Host summary includes OS family, normalized OS label, package-manager metadata, and Windows posture details
- Dependency rows can include platform-aware install hints
- The text report surfaces a Windows posture section even when running on a non-Windows machine
- JSON output carries the same richer host metadata for downstream tooling or future UI layers

## Current scope

The tool currently focuses on:

- macOS, Linux, and Windows-aware reporting posture
- rule-based readiness scoring
- dependency readiness checks
- basic network validation
- OpenClaw workload fit recommendation

## Good next steps

- richer Linux distro and package-manager detection
- optional GPU and media acceleration detection
- more granular OpenClaw-specific gateway and node checks
- a doctor mode that can optionally apply fixes or print full fix scripts by platform
