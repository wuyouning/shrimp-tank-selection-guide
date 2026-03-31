# 虾缸挑选指南

中文版 | [English](./README.md)

一个本地 TypeScript / Node CLI，用来判断一台宿主机是否适合运行 OpenClaw。

如果把 OpenClaw 理解成“虾”，那这个工具做的事，就是帮你判断这个“缸”适不适合养它。

## 它能做什么

- 收集宿主机与硬件基础信息
- 检查关键依赖，例如 Node、npm、git、python3、ffmpeg、uv、docker、openclaw
- 执行基础 DNS 和外网 HTTPS 连通性检查
- 按不同 OpenClaw 使用场景给出适配度评分
- 在 macOS 上识别 Homebrew，并为缺失依赖给出可执行的安装提示
- 在报告中提供 Windows 权限 / 管理员姿态信息
- 同时输出适合人看的终端报告，以及适合程序读取的 JSON 结果

## 为什么要做这个

在把 OpenClaw 装到一台机器之前，通常会先想清楚几件事：

- 这台机器的运行时和基础工具是否齐全
- 网络环境是不是足够健康
- 它更适合轻量聊天，还是更适合媒体处理、多 agent 之类的重负载场景
- 是否还需要补一轮环境配置，OpenClaw 才能稳定运行

这个项目的目标，就是做一个真正能落地的 preflight 检查器：
既能快速告诉你“这台机器行不行”，也能把结果结构化输出，方便后续接 UI、Doctor 模式或其他自动化流程。

## 适配档位（Profiles）

- `light`：聊天、文档、轻量自动化
- `standard`：默认均衡档
- `media`：偏图片、视频、音频处理场景
- `multi-agent`：偏多 agent 并发运行场景

## 安装

```bash
npm install
```

## 平台说明

- `macOS`：会检测 Homebrew；如果存在，会显示版本；若缺依赖，会尽量给出 `brew install ...` 的明确提示。
- `Windows`：报告会带出 Windows posture 和管理员 / 提权建议；若工具运行在 Windows 上，还会尝试进行安全的 PowerShell 提权状态检查。
- `Linux`：当前已支持核心检查与评分流程，包含通用依赖检查和网络检查。

## 开发模式运行

```bash
npm run dev
npm run dev -- --verbose
npm run dev -- --json
npm run dev -- --json --output examples/report.json
npm run dev -- --profile media
npm run dev -- --profile multi-agent --timeout 8
```

## 构建与运行

```bash
npm run build
npm start -- --profile standard
```

## 本地验证

```bash
npm run build
npm test
npm start -- --verbose
```

## 计划中的打包命令

```bash
openclaw-preflight
```

## CLI 参数

```bash
--json                 输出 JSON
--output <path>        将结果写入文件
--verbose              显示更多细节
--timeout <seconds>    网络检查超时秒数
--profile <profile>    light | standard | media | multi-agent
```

## 退出码

- `0`：PASS 或 PASS_WITH_WARNINGS
- `1`：LIMITED
- `2`：FAIL 或运行时错误

## 输出状态

- `PASS`
- `PASS_WITH_WARNINGS`
- `LIMITED`
- `FAIL`

## 示例输出

见：
- `examples/sample-report.json`
- 本地运行后生成的 `examples/report.json`

## 项目结构

```text
src/
  __tests__/
  checks/
  formatters/
  utils/
  cli.ts
```

## 当前报告亮点

- Host 摘要中包含 OS family、标准化 OS label、包管理器元数据，以及 Windows posture 信息
- 依赖项可以带平台感知的安装提示
- 即使当前运行环境不是 Windows，文本报告里也会提前展示 Windows 姿态信息
- JSON 输出携带同样完整的结构，方便后续接入 UI 或自动化能力

## 当前范围

这个工具当前聚焦在：

- macOS / Linux / Windows 感知式报告结构
- 基于规则的 readiness 评分
- 依赖准备度检查
- 基础网络验证
- OpenClaw 工作负载适配建议

## 接下来值得继续补的方向

- 更细的 Linux 发行版和包管理器识别
- 可选的 GPU / 媒体加速能力检测
- 更细粒度的 OpenClaw gateway / node 检查
- 更完整的 Doctor 模式：不仅提示问题，还能按平台输出修复脚本，甚至进一步支持修复建议执行
