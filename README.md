# openclaw-preflight

A local TypeScript/Node CLI that checks whether a machine is a good fit for OpenClaw before installation.

## What it does

- Collects host and hardware information
- Checks key dependencies such as Node, npm, git, python3, ffmpeg, uv, docker, and openclaw
- Runs basic DNS and outbound HTTPS checks
- Grades the machine for different OpenClaw usage profiles
- Detects macOS Homebrew and turns missing dependency checks into actionable install hints
- Carries a Windows readiness posture in the report, including elevation/admin guidance
- Produces both a human-readable terminal report and JSON output

## Profiles

- `light`: chat, docs, light automation
- `standard`: balanced default profile
- `media`: image/video/audio oriented workloads
- `multi-agent`: more concurrent agent-style usage

## Install

```bash
npm install
```

## Platform notes

- `macOS`: detects Homebrew, reports its version when present, and suggests `brew install ...` commands for missing dependencies when possible.
- `Windows`: the report includes a Windows posture section and admin/elevation guidance. If the CLI runs on Windows, it attempts a safe PowerShell-based elevation check.
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

## Build

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

## Current MVP scope

- macOS, Linux, and Windows-aware reporting posture
- rule-based scoring
- basic network validation
- dependency readiness checks
- OpenClaw workload fit recommendation

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

- Host summary now includes OS family, normalized OS label, and package-manager metadata
- Dependency rows can include platform-aware install hints
- The text report surfaces a Windows posture section even when running on a non-Windows machine
- JSON output carries the same richer host metadata for downstream tooling

## Remaining good next steps

- richer Linux distro and package-manager detection
- optional GPU/media acceleration detection
- more granular OpenClaw-specific gateway/node checks
- doctor mode that can optionally apply or print full fix scripts by platform
