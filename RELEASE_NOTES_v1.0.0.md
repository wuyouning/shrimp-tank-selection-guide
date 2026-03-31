# Release Notes - v1.0.0

## English

### Title
v1.0.0 - First public release of Shrimp Tank Selection Guide / OpenClaw Preflight CLI

### Summary
This is the first public release of `openclaw-preflight`, a CLI that helps judge whether a machine is a good host for OpenClaw.

It turns host readiness into a practical terminal workflow:

- checks runtime and install-critical dependencies
- scores software readiness, hardware capacity, and real-time fluctuation separately
- supports bilingual output (`en` / `zh-CN`)
- provides both human-readable output and structured JSON
- supports package-manager-aware hints for macOS, Linux, and Windows-oriented environments

### What's included in v1.0.0

- 100-point baseline scoring model
- bonus points for hosts that exceed the baseline
- software / hardware / real-time score split
- OpenClaw fit assessment for chat, automation, media, and multi-agent usage
- macOS Homebrew detection and install hints
- Linux package-manager-aware hints (`apt`, `dnf`, `yum`, `pacman`)
- Windows posture / elevation guidance
- bilingual CLI output
- release-ready npm packaging flow
- first macOS installer-style DMG flow for both Intel and Apple Silicon Macs

### Install

```bash
npm install -g openclaw-preflight
```

### Run

```bash
openclaw-preflight --lang en
openclaw-preflight --lang zh-CN
shrimp-tank --lang zh-CN
```

### Positioning

If OpenClaw is the shrimp, this project helps you decide whether the tank is ready.

It is designed for:

- people evaluating a new host before installing OpenClaw
- developers preparing machines for heavier agent workflows
- users who want a fast and readable preflight check instead of piecing together manual diagnostics

---

## 中文

### 标题
v1.0.0 - 虾缸挑选指南 / OpenClaw 预检 CLI 首个公开版本

### 简介
这是 `openclaw-preflight` 的首个公开版本。

它是一个用来判断“某台机器是否适合成为 OpenClaw 宿主机”的 CLI 工具，主要解决的是宿主机准备度问题。

这个版本已经把宿主机检查整理成一个真正可用的终端工作流：

- 检查运行时与安装关键依赖
- 将软件准备度、硬件能力、实时波动状态拆开评分
- 支持中英文输出（`en` / `zh-CN`）
- 同时提供人类可读终端报告和结构化 JSON 输出
- 能针对 macOS / Linux / Windows 相关环境给出更贴近平台的提示

### v1.0.0 包含内容

- 100 分标准基线评分模型
- 高于标准线时可获得奖励分
- 软件分 / 硬件分 / 实时波动分三段式评分
- 面向聊天、自动化、媒体、多 Agent 的 OpenClaw 适配度判断
- macOS Homebrew 检测与安装提示
- Linux 包管理器感知提示（`apt` / `dnf` / `yum` / `pacman`）
- Windows 姿态 / 提权建议
- 中英双语 CLI 输出
- 面向发布的 npm CLI 打包流程

### 安装命令

```bash
npm install -g openclaw-preflight
```

### 运行命令

```bash
openclaw-preflight --lang zh-CN
openclaw-preflight --lang en
shrimp-tank --lang zh-CN
```

### macOS DMG

项目里已经补上了首版 macOS 安装器型 DMG 流程，支持：

- Intel Mac
- Apple Silicon（M 系列）Mac

构建命令：

```bash
npm run build:dmg
```

### 项目定位

如果把 OpenClaw 理解成“虾”，这个项目就是帮你判断“缸”是不是已经准备好。

它适合这些场景：

- 在安装 OpenClaw 之前先评估一台新机器
- 为更重的 Agent 工作流挑选合适宿主机
- 希望快速得到可读、可复用的预检结果，而不是自己手工拼诊断结论
