# 虾缸挑选指南

中文版 | [English](./README.md)

一个面向发布的 CLI 工具，用来判断一台机器是否适合成为 OpenClaw 的宿主机。

如果把 OpenClaw 理解成“虾”，那这个工具做的事，就是帮你判断这个“缸”适不适合养它。

## 为什么要做这个

在把 OpenClaw 装到一台机器之前，通常会先想清楚几件事：

- 运行时和核心依赖是否准备好了
- 宿主机硬件余量够不够
- 当前机器状态是否健康，适不适合现在就上
- 这台机器更适合轻量、标准、媒体型，还是多 Agent 场景

这个项目把这些问题收束成一个 CLI：
既能给人看得懂的终端报告，也能输出结构化 JSON 给后续 UI / Doctor / 自动化流程使用。

## 它会检查什么

- 运行时准备度：Node、包管理器、安装关键依赖
- 宿主机硬件：内存容量、CPU 并发能力、磁盘余量
- 实时状态：当前网络连通性、当前空闲内存、当前系统负载
- 平台准备度：macOS Homebrew、Linux 包管理器、Windows 姿态 / 管理员提示
- OpenClaw 适配度：聊天、自动化、媒体、多 Agent 档位

## 评分模型

这个项目把 **100 分** 定义为 OpenClaw 宿主机的**标准基线满分**。

这 100 分会被拆成：

- **软件分**：运行时、依赖、平台准备度
- **硬件分**：内存容量、CPU 并发能力、磁盘余量
- **实时波动分**：当前网络状态、当前空闲内存、当前系统负载

在这三部分之上，如果宿主机明显优于标准线，还会获得**奖励分**，所以最终得分可以超过 100 分。

这样做的好处是：

- 硬件分高但实时波动分低，通常说明机器本身不差，只是当前占用或网络状态不好
- 软件分低，通常说明机器物理条件还可以，但运行环境没准备好
- 奖励分可以区分“够用”和“明显优秀”的宿主机

## 安装

```bash
npm install -g openclaw-preflight
```

安装完成后可以直接运行：

```bash
openclaw-preflight --lang zh-CN
# 或者
shrimp-tank --lang en
```

## 更省事的本地开发用法

如果你在项目目录里直接开发和测试，可以执行：

```bash
npm run install:global-local
```

如果之后想卸载这个本地全局 CLI：

```bash
npm run uninstall:global-local
```

## CLI 示例

```bash
openclaw-preflight --lang zh-CN
openclaw-preflight --lang en --profile media
openclaw-preflight --json --lang zh-CN
openclaw-preflight --json --output report.json --lang en
shrimp-tank --lang zh-CN --profile multi-agent
```

## 语言选择

```bash
openclaw-preflight --lang en
openclaw-preflight --lang zh-CN
```

- 终端文本输出会跟随所选语言。
- JSON 输出里也会带上 `language` 字段，方便后续链路保持一致。

## 档位（Profiles）

- `light`：聊天、文档、轻量自动化
- `standard`：默认均衡档
- `media`：图片、视频、音频等媒体型场景
- `multi-agent`：更重的并发 Agent 场景

## 平台说明

- `macOS`：会检测 Homebrew；如果存在，会显示版本；若缺依赖，会尽量给出 `brew install ...` 的明确提示。
- `Windows`：报告会带出 Windows posture 和管理员 / 提权建议；如果工具运行在 Windows 上，还会尝试安全的 PowerShell 提权状态检查。
- `Linux`：支持核心检查，并对 apt、dnf、yum、pacman 这类环境提供更贴近包管理器的安装建议。

## JSON 输出

```bash
openclaw-preflight --json
```

JSON 报告里会包含：

- summary 状态和总分
- 软件分 / 硬件分 / 实时波动分
- 奖励分
- 依赖与网络检查结果
- 详细评分拆解，方便接后续 UI 或自动化流程

## 面向发布的打包方式

```bash
npm run release:check
```

这条命令会自动：

1. 清理旧构建产物
2. 跑测试
3. 构建精简版生产 `dist/`
4. 用 `npm pack` 生成发布压缩包

最终产物会尽量只保留终端用户真正需要的内容：
- `dist/` 里的 CLI 运行代码
- README 文档
- LICENSE

## 正式发布路径

等你准备正式发布时，标准流程就是：

```bash
npm login
npm publish --access public
```

## macOS DMG 打包

这个项目现在也带了一套 macOS 安装器型 DMG 构建流程，适用于 Intel 和 Apple Silicon 两类 Mac。

构建命令：

```bash
npm run build:dmg
```

生成的 DMG 里会包含：

- `Installer Shrimp Tank.command`
- `Install Shrimp Tank.command`
- `Run Shrimp Tank.command`
- `payload/` 里的 CLI 安装包
- 一份简短的 macOS 使用说明

如果后面要继续走更正式的签名 / 公证流程，还可以执行：

```bash
npm run sign:dmg
```

为什么一份 DMG 可以同时支持 Intel 和 M 系列：

- CLI 本体是 JavaScript，不是单一架构原生二进制
- 安装动作依赖目标机器本地的 Node.js 运行时
- 只要目标 Mac 上安装了支持版本的 Node.js，同一份 DMG 就能在 Intel 与 Apple Silicon 上工作

## 当前这个项目最强的地方

现在它已经比较擅长：

- 宿主机准备度评分
- 依赖和包管理器安装提示
- 中英双语终端输出
- 人类可读 + 机器可读两套报告
- 本地安装与发布式打包流程

## 接下来值得继续补的方向

- 更细的 Linux 发行版识别
- GPU / 媒体加速检测
- 更细粒度的 OpenClaw gateway / node 检查
- 更完整的 doctor / repair 模式
