"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.formatText = formatText;
const picocolors_1 = __importDefault(require("picocolors"));
const format_1 = require("../utils/format");
function icon(ok) {
    return ok ? picocolors_1.default.green('✓') : picocolors_1.default.red('✗');
}
const FIT_LABELS = {
    en: { good: 'good', limited: 'limited', poor: 'poor' },
    'zh-CN': { good: '良好', limited: '受限', poor: '较差' },
};
const STATUS_LABELS = {
    en: { PASS: 'PASS', PASS_WITH_WARNINGS: 'PASS_WITH_WARNINGS', LIMITED: 'LIMITED', FAIL: 'FAIL' },
    'zh-CN': { PASS: '通过', PASS_WITH_WARNINGS: '通过（有警告）', LIMITED: '受限', FAIL: '失败' },
};
const COPY = {
    en: {
        title: 'OpenClaw Preflight Checker',
        status: 'Status',
        bonus: 'Bonus points',
        hostSummary: 'Host Summary',
        hostname: 'Hostname',
        user: 'User',
        platform: 'Platform',
        osFamily: 'OS family',
        node: 'Node',
        shell: 'Shell',
        homebrew: 'Homebrew',
        packageManagers: 'Package managers',
        hardware: 'Hardware',
        cpu: 'CPU',
        cores: 'Cores',
        memory: 'Memory',
        disk: 'Disk',
        loadAvg: 'Load avg',
        total: 'total',
        free: 'free',
        dependencies: 'Dependencies',
        install: 'install',
        network: 'Network',
        details: 'details',
        fit: 'OpenClaw Fit',
        chat: 'chat',
        automation: 'automation',
        multiAgent: 'multi-agent',
        media: 'media',
        scoreOverview: 'Score Overview',
        softwareScore: 'Software score',
        hardwareScore: 'Hardware score',
        realtimeScore: 'Real-time fluctuation score',
        scoreBreakdown: 'Score Breakdown',
        softwareBreakdown: 'Software Breakdown',
        hardwareBreakdown: 'Hardware Breakdown',
        realtimeBreakdown: 'Real-time Breakdown',
        bonusBreakdown: 'Bonus Breakdown',
        windowsPosture: 'Windows Posture',
        runningOnWindows: 'Running on Windows',
        yes: 'yes',
        no: 'no',
        adminCheck: 'Admin check',
        elevated: 'elevated',
        notElevated: 'not elevated',
        notEvaluated: 'not evaluated',
        note: 'Summary',
        recommendation: 'Recommendation',
        warnings: 'Warnings',
        recommendations: 'Recommendations',
        timestamp: 'Timestamp',
        profile: 'Profile',
        language: 'Language',
        rawPlatform: 'Raw platform',
        unknown: 'unknown',
        detected: 'detected',
        notDetected: 'not detected',
        scoreOverviewNote: '100 points is the standard baseline. The final score may exceed 100 when the host earns bonus headroom.',
    },
    'zh-CN': {
        title: 'OpenClaw 宿主机预检器',
        status: '状态',
        bonus: '奖励分',
        hostSummary: '宿主机概览',
        hostname: '主机名',
        user: '用户',
        platform: '平台',
        osFamily: '系统家族',
        node: 'Node',
        shell: 'Shell',
        homebrew: 'Homebrew',
        packageManagers: '包管理器',
        hardware: '硬件',
        cpu: 'CPU',
        cores: '核心数',
        memory: '内存',
        disk: '磁盘',
        loadAvg: '负载均值',
        total: '总计',
        free: '空闲',
        dependencies: '依赖检查',
        install: '安装建议',
        network: '网络检查',
        details: '详情',
        fit: 'OpenClaw 适配度',
        chat: '聊天',
        automation: '自动化',
        multiAgent: '多 Agent',
        media: '媒体',
        scoreOverview: '分数总览',
        softwareScore: '软件分',
        hardwareScore: '硬件分',
        realtimeScore: '实时波动分',
        scoreBreakdown: '评分拆解',
        softwareBreakdown: '软件分拆解',
        hardwareBreakdown: '硬件分拆解',
        realtimeBreakdown: '实时波动分拆解',
        bonusBreakdown: '奖励分拆解',
        windowsPosture: 'Windows 姿态',
        runningOnWindows: '当前是否运行在 Windows',
        yes: '是',
        no: '否',
        adminCheck: '管理员检查',
        elevated: '已提权',
        notElevated: '未提权',
        notEvaluated: '未评估',
        note: '总评',
        recommendation: '建议',
        warnings: '警告',
        recommendations: '建议项',
        timestamp: '时间戳',
        profile: '档位',
        language: '语言',
        rawPlatform: '原始平台值',
        unknown: '未知',
        detected: '已检测到',
        notDetected: '未检测到',
        scoreOverviewNote: '100 分是标准基线满分；当宿主机明显优于标准线时，最终得分可以超过 100 分。',
    },
};
const ITEM_LOCALIZATION = {
    'runtime-baseline': {
        en: { label: 'Runtime baseline', note: 'Node 24 is the recommended OpenClaw runtime; Node 22.14+ is the supported floor.' },
        'zh-CN': { label: '运行时基线', note: 'Node 24 是 OpenClaw 推荐运行时；Node 22.14+ 是当前支持的最低基线。' },
    },
    'tooling-baseline': {
        en: { label: 'Tooling baseline', note: 'Measures install-critical and day-to-day helper tooling such as git, python3, ffmpeg, uv, and docker.' },
        'zh-CN': { label: '工具链基线', note: '衡量安装关键依赖与日常辅助工具，例如 git、python3、ffmpeg、uv、docker。' },
    },
    'platform-readiness': {
        en: { label: 'Platform readiness', note: 'Rewards hosts where package management and platform-specific setup paths are clearly available.' },
        'zh-CN': { label: '平台准备度', note: '当平台的包管理器与系统级安装路径清晰可用时，会在这里加分。' },
    },
    'memory-capacity': {
        en: { label: 'Memory capacity', note: '4 GB is the usable floor, 8 GB is comfortable, and 16 GB is the standard target for heavier OpenClaw work.' },
        'zh-CN': { label: '内存容量', note: '4 GB 是可用下限，8 GB 较舒适，16 GB 是更重 OpenClaw 场景的标准目标。' },
    },
    'cpu-concurrency': {
        en: { label: 'CPU concurrency', note: 'Higher logical core counts improve concurrent tool use, automation, and multi-agent throughput.' },
        'zh-CN': { label: 'CPU 并发能力', note: '更高的逻辑核心数有助于并发工具调用、自动化任务和多 Agent 吞吐。' },
    },
    'disk-capacity': {
        en: { label: 'Disk headroom', note: 'Free disk matters for packages, caches, media outputs, logs, and sandbox images.' },
        'zh-CN': { label: '磁盘余量', note: '空闲磁盘会直接影响包安装、缓存、媒体产物、日志和沙箱镜像。' },
    },
    'network-readiness': {
        en: { label: 'Network readiness', note: 'Reflects current DNS and outbound HTTPS conditions for installs, updates, model APIs, and docs access.' },
        'zh-CN': { label: '网络准备度', note: '反映当前 DNS 与外网 HTTPS 状态，对安装、更新、模型 API 与文档访问都很重要。' },
    },
    'memory-availability': {
        en: { label: 'Current free memory', note: 'A live snapshot of how much headroom is currently free right now, separate from installed RAM capacity.' },
        'zh-CN': { label: '当前空闲内存', note: '这是实时快照，表示此刻还剩多少可用内存，与机器总内存容量分开计算。' },
    },
    'system-load': {
        en: { label: 'Current system load', note: 'Captures whether the machine is already under pressure at the moment this check runs.' },
        'zh-CN': { label: '当前系统负载', note: '用于反映本次检查运行时，这台机器是否已经处于明显压力状态。' },
    },
    'bonus-large-memory-pool': {
        en: { label: 'Bonus: large memory pool', note: '32 GB+ gives extra room for media-heavy and parallel workloads.' },
        'zh-CN': { label: '奖励：超大内存池', note: '32 GB+ 能为媒体工作流和并行任务提供更充裕空间。' },
    },
    'bonus-extra-memory-headroom': {
        en: { label: 'Bonus: extra memory headroom', note: '24 GB+ is meaningfully above the standard host baseline.' },
        'zh-CN': { label: '奖励：额外内存余量', note: '24 GB+ 已明显高于标准宿主机基线。' },
    },
    'bonus-high-core-count': {
        en: { label: 'Bonus: high core count', note: '12+ logical cores provide strong concurrency headroom for heavier agent use.' },
        'zh-CN': { label: '奖励：高核心数', note: '12+ 逻辑核心能为更重的 Agent 并发场景提供明显余量。' },
    },
    'bonus-healthy-core-count': {
        en: { label: 'Bonus: healthy core count', note: '8+ cores exceed the baseline target.' },
        'zh-CN': { label: '奖励：健康核心数', note: '8+ 核已经高于基础标准线。' },
    },
    'bonus-ample-free-disk': {
        en: { label: 'Bonus: ample free disk', note: 'Large free disk helps with sandboxes, media outputs, and longer-lived logs.' },
        'zh-CN': { label: '奖励：充足磁盘空间', note: '更大的空闲磁盘更利于沙箱、媒体产物和长期日志。' },
    },
    'bonus-clean-network-sweep': {
        en: { label: 'Bonus: clean network sweep', note: 'All configured network checks passed in the current run.' },
        'zh-CN': { label: '奖励：网络全绿', note: '本次运行中所有配置的网络检查均通过。' },
    },
    'bonus-docker-available': {
        en: { label: 'Bonus: Docker available', note: 'Useful for containerized deployments and sandbox workflows.' },
        'zh-CN': { label: '奖励：Docker 已可用', note: '对容器化部署与沙箱工作流都很有帮助。' },
    },
    'bonus-uv-available': {
        en: { label: 'Bonus: uv available', note: 'Useful for Python-oriented skills and tooling.' },
        'zh-CN': { label: '奖励：uv 已可用', note: '对偏 Python 的技能与工具链更友好。' },
    },
    'bonus-openclaw-installed': {
        en: { label: 'Bonus: OpenClaw already installed', note: 'Shows the host already cleared the basic CLI path once.' },
        'zh-CN': { label: '奖励：OpenClaw 已安装', note: '说明这台机器已经至少成功通过过一次基础 CLI 安装路径。' },
    },
    'bonus-media-ready-host': {
        en: { label: 'Bonus: media-ready host', note: 'Exceeds the standard media baseline with enough memory, CPU, and ffmpeg.' },
        'zh-CN': { label: '奖励：媒体型宿主机', note: '内存、CPU 与 ffmpeg 条件都已超过标准媒体基线。' },
    },
    'bonus-multi-agent-headroom': {
        en: { label: 'Bonus: multi-agent headroom', note: 'Clearly above the minimum concurrency profile target.' },
        'zh-CN': { label: '奖励：多 Agent 余量', note: '已明显高于多 Agent 档位的最低并发目标。' },
    },
};
const EXACT_TEXT = {
    en: {
        'Install the missing required dependencies before deploying OpenClaw.': 'Install the missing required dependencies before deploying OpenClaw.',
        'Add recommended tooling such as git, python3, and ffmpeg for a smoother setup.': 'Add recommended tooling such as git, python3, and ffmpeg for a smoother setup.',
        'Check DNS, proxy settings, outbound HTTPS access, and any corporate network controls.': 'Check DNS, proxy settings, outbound HTTPS access, and any corporate network controls.',
        'Use at least 4 GB RAM, and prefer 8 GB or more for stable day-to-day usage.': 'Use at least 4 GB RAM, and prefer 8 GB or more for stable day-to-day usage.',
        'Upgrade to 8 GB or more if you want steadier background usage or more concurrent work.': 'Upgrade to 8 GB or more if you want steadier background usage or more concurrent work.',
        'Close high-memory apps and rerun the check to avoid scoring against a transient spike.': 'Close high-memory apps and rerun the check to avoid scoring against a transient spike.',
        'Keep at least 5-10 GB of free disk space for packages, caches, and temp files.': 'Keep at least 5-10 GB of free disk space for packages, caches, and temp files.',
        'Use a stronger multi-core CPU if you plan to run concurrent tasks or media workloads.': 'Use a stronger multi-core CPU if you plan to run concurrent tasks or media workloads.',
        'Rerun preflight when the machine is idle to separate permanent limits from temporary pressure.': 'Rerun preflight when the machine is idle to separate permanent limits from temporary pressure.',
        'The media profile has limited memory headroom on this machine.': 'The media profile has limited memory headroom on this machine.',
        'Media workflows are more comfortable with 16 GB RAM or more and stronger compute/GPU support.': 'Media workflows are more comfortable with 16 GB RAM or more and stronger compute/GPU support.',
        'The multi-agent profile has limited concurrency headroom here.': 'The multi-agent profile has limited concurrency headroom here.',
        'For multi-agent usage, target at least 8 CPU cores and 8 GB RAM.': 'For multi-agent usage, target at least 8 CPU cores and 8 GB RAM.',
        'Homebrew is not installed on this macOS host.': 'Homebrew is not installed on this macOS host.',
        'Install Homebrew to streamline dependency setup on macOS.': 'Install Homebrew to streamline dependency setup on macOS.',
        'No supported Linux package manager was detected.': 'No supported Linux package manager was detected.',
        'Add distro-specific package manager detection or ensure the runtime PATH exposes apt, dnf, yum, or pacman.': 'Add distro-specific package manager detection or ensure the runtime PATH exposes apt, dnf, yum, or pacman.',
        'This Windows session is not elevated.': 'This Windows session is not elevated.',
        'Current session is not running on Windows.': 'Current session is not running on Windows.',
        'Windows-specific elevation checks are skipped when the CLI is not running on Windows.': 'Windows-specific elevation checks are skipped when the CLI is not running on Windows.',
        'For Windows installs, prefer an elevated PowerShell session for dependency setup.': 'For Windows installs, prefer an elevated PowerShell session for dependency setup.',
        'Use winget or official installers for Node.js LTS, Git, Python 3, and FFmpeg.': 'Use winget or official installers for Node.js LTS, Git, Python 3, and FFmpeg.',
    },
    'zh-CN': {
        'Install the missing required dependencies before deploying OpenClaw.': '请先补齐必需依赖，再部署 OpenClaw。',
        'Add recommended tooling such as git, python3, and ffmpeg for a smoother setup.': '建议补齐 git、python3、ffmpeg 等推荐工具，以获得更顺滑的使用体验。',
        'Check DNS, proxy settings, outbound HTTPS access, and any corporate network controls.': '请检查 DNS、代理设置、外网 HTTPS 出站访问，以及公司网络控制策略。',
        'Use at least 4 GB RAM, and prefer 8 GB or more for stable day-to-day usage.': '建议至少使用 4 GB 内存；若想稳定日常使用，最好达到 8 GB 或以上。',
        'Upgrade to 8 GB or more if you want steadier background usage or more concurrent work.': '如果希望后台运行更稳定或支持更多并发任务，建议升级到 8 GB 或以上。',
        'Close high-memory apps and rerun the check to avoid scoring against a transient spike.': '建议先关闭高内存占用应用后再重跑，避免瞬时占用拉低评分。',
        'Keep at least 5-10 GB of free disk space for packages, caches, and temp files.': '建议至少保留 5–10 GB 空闲磁盘空间，用于安装包、缓存和临时文件。',
        'Use a stronger multi-core CPU if you plan to run concurrent tasks or media workloads.': '如果打算跑并发任务或媒体型工作负载，建议使用更强的多核 CPU。',
        'Rerun preflight when the machine is idle to separate permanent limits from temporary pressure.': '建议在机器空闲时重新执行预检，以区分长期能力上限和瞬时压力。',
        'The media profile has limited memory headroom on this machine.': '这台机器在媒体档位下的内存余量有限。',
        'Media workflows are more comfortable with 16 GB RAM or more and stronger compute/GPU support.': '媒体型工作流更适合 16 GB 及以上内存，以及更强的算力 / GPU 支持。',
        'The multi-agent profile has limited concurrency headroom here.': '这台机器在多 Agent 档位下的并发余量有限。',
        'For multi-agent usage, target at least 8 CPU cores and 8 GB RAM.': '如果要跑多 Agent，建议至少具备 8 核 CPU 和 8 GB 内存。',
        'Homebrew is not installed on this macOS host.': '这台 macOS 宿主机尚未安装 Homebrew。',
        'Install Homebrew to streamline dependency setup on macOS.': '建议安装 Homebrew，以简化 macOS 下的依赖补齐流程。',
        'No supported Linux package manager was detected.': '未检测到受支持的 Linux 包管理器。',
        'Add distro-specific package manager detection or ensure the runtime PATH exposes apt, dnf, yum, or pacman.': '建议补充发行版级包管理器识别，或确认运行环境 PATH 中可见 apt、dnf、yum、pacman。',
        'This Windows session is not elevated.': '当前 Windows 会话未提权。',
        'Current session is not running on Windows.': '当前会话并未运行在 Windows 上。',
        'Windows-specific elevation checks are skipped when the CLI is not running on Windows.': '当前 CLI 并未运行在 Windows 上，因此跳过 Windows 提权检查。',
        'For Windows installs, prefer an elevated PowerShell session for dependency setup.': '在 Windows 上安装时，建议优先使用已提权的 PowerShell 会话来处理依赖。',
        'Use winget or official installers for Node.js LTS, Git, Python 3, and FFmpeg.': '建议使用 winget 或官方安装器来安装 Node.js LTS、Git、Python 3 和 FFmpeg。',
    },
};
const PREFIX_TEXT = {
    en: {
        'Missing required dependencies:': 'Missing required dependencies:',
        'Missing recommended dependencies:': 'Missing recommended dependencies:',
        'Network checks failed:': 'Network checks failed:',
        'Low memory:': 'Low memory:',
        'Limited memory headroom:': 'Limited memory headroom:',
        'Low free memory right now:': 'Low free memory right now:',
        'Low free disk space:': 'Low free disk space:',
        'Low CPU core count:': 'Low CPU core count:',
        'High current system load:': 'High current system load:',
    },
    'zh-CN': {
        'Missing required dependencies:': '缺少必需依赖：',
        'Missing recommended dependencies:': '缺少推荐依赖：',
        'Network checks failed:': '网络检查失败：',
        'Low memory:': '总内存偏低：',
        'Limited memory headroom:': '内存余量有限：',
        'Low free memory right now:': '当前空闲内存偏低：',
        'Low free disk space:': '空闲磁盘空间偏低：',
        'Low CPU core count:': 'CPU 核心数偏低：',
        'High current system load:': '当前系统负载偏高：',
    },
};
function fitColor(level, lang) {
    const label = FIT_LABELS[lang][level] || level;
    if (level === 'good')
        return picocolors_1.default.green(label);
    if (level === 'limited')
        return picocolors_1.default.yellow(label);
    return picocolors_1.default.red(label);
}
function statusColor(status, lang) {
    const label = STATUS_LABELS[lang][status] || status;
    if (status === 'PASS')
        return picocolors_1.default.green(label);
    if (status === 'PASS_WITH_WARNINGS')
        return picocolors_1.default.yellow(label);
    if (status === 'LIMITED')
        return picocolors_1.default.yellow(label);
    return picocolors_1.default.red(label);
}
function localizeItem(item, lang) {
    const localized = ITEM_LOCALIZATION[item.key]?.[lang];
    return {
        label: localized?.label || item.label,
        note: localized?.note || item.note,
    };
}
function localizeLine(text, lang) {
    const exact = EXACT_TEXT[lang];
    if (exact[text])
        return exact[text];
    const prefixes = PREFIX_TEXT[lang];
    for (const [source, target] of Object.entries(prefixes)) {
        if (text.startsWith(source)) {
            return target + text.slice(source.length);
        }
    }
    return text;
}
function renderBreakdownSection(lines, items, title, lang) {
    if (!items.length)
        return;
    lines.push(picocolors_1.default.bold(title));
    for (const item of items) {
        const localized = localizeItem(item, lang);
        const maxSuffix = item.maxPoints != null ? ` / ${item.maxPoints}` : '';
        lines.push(`- ${localized.label}: ${item.points}${maxSuffix}${localized.note ? ` — ${localized.note}` : ''}`);
    }
    lines.push('');
}
function formatText(report, verbose = false, lang = 'en') {
    const t = COPY[lang];
    const lines = [];
    const homebrew = report.host.packageManagers.find((manager) => manager.name === 'homebrew');
    const packageManagers = report.host.packageManagers.filter((manager) => manager.detected);
    lines.push(picocolors_1.default.bold(`${t.title} v${report.version}`));
    lines.push(`${picocolors_1.default.bold(`${t.status}:`)} ${statusColor(report.summary.status, lang)} (${report.summary.score}/${report.summary.standardMax}${report.summary.bonusPoints > 0 ? ` +${report.summary.bonusPoints} ${t.bonus}` : ''})`);
    lines.push('');
    lines.push(picocolors_1.default.bold(t.scoreOverview));
    lines.push(`- ${t.softwareScore}: ${report.summary.softwareScore}`);
    lines.push(`- ${t.hardwareScore}: ${report.summary.hardwareScore}`);
    lines.push(`- ${t.realtimeScore}: ${report.summary.realtimeScore}`);
    if (report.summary.bonusPoints > 0) {
        lines.push(`- ${t.bonus}: +${report.summary.bonusPoints}`);
    }
    lines.push(`- ${t.note}: ${t.scoreOverviewNote}`);
    lines.push('');
    lines.push(picocolors_1.default.bold(t.hostSummary));
    lines.push(`- ${t.hostname}: ${report.host.hostname}`);
    lines.push(`- ${t.user}: ${report.host.user || t.unknown}`);
    lines.push(`- ${t.platform}: ${report.host.osLabel} (${report.host.arch})`);
    lines.push(`- ${t.osFamily}: ${report.host.osFamily}`);
    lines.push(`- ${t.node}: ${report.host.nodeVersion}`);
    lines.push(`- ${t.shell}: ${report.host.shell || t.unknown}`);
    if (homebrew) {
        lines.push(`- ${t.homebrew}: ${homebrew.detected ? homebrew.version || t.detected : t.notDetected}${!homebrew.detected && homebrew.installUrl ? ` (${homebrew.installUrl})` : ''}`);
    }
    if (packageManagers.length) {
        lines.push(`- ${t.packageManagers}: ${packageManagers.map((manager) => `${manager.name}${manager.version ? ` (${manager.version})` : ''}`).join(', ')}`);
    }
    lines.push('');
    lines.push(picocolors_1.default.bold(t.hardware));
    lines.push(`- ${t.cpu}: ${report.hardware.cpuModel}`);
    lines.push(`- ${t.cores}: ${report.hardware.cpuCores}`);
    lines.push(`- ${t.memory}: ${(0, format_1.formatBytes)(report.hardware.totalMemoryBytes)} ${t.total} / ${(0, format_1.formatBytes)(report.hardware.freeMemoryBytes)} ${t.free}`);
    lines.push(`- ${t.disk}: ${(0, format_1.formatBytes)(report.hardware.diskFreeBytes)} ${t.free} / ${(0, format_1.formatBytes)(report.hardware.diskTotalBytes)} ${t.total}`);
    if (report.hardware.loadAverage?.length) {
        lines.push(`- ${t.loadAvg}: ${report.hardware.loadAverage.map((x) => x.toFixed(2)).join(' / ')}`);
    }
    lines.push('');
    lines.push(picocolors_1.default.bold(t.dependencies));
    for (const dep of report.dependencies) {
        lines.push(`- ${icon(dep.installed)} ${dep.name} [${dep.importance}]${dep.version ? ` - ${dep.version}` : ''}${!dep.installed && dep.error ? ` - ${dep.error}` : ''}`);
        if (!dep.installed && dep.installHint) {
            lines.push(`  ${t.install}: ${dep.installHint}`);
        }
    }
    lines.push('');
    lines.push(picocolors_1.default.bold(t.network));
    for (const net of report.network.checks) {
        lines.push(`- ${icon(net.ok)} ${net.name} -> ${net.target}${net.statusCode ? ` [HTTP ${net.statusCode}]` : ''}${net.latencyMs != null ? ` (${net.latencyMs} ms)` : ''}${!net.ok && net.error ? ` - ${net.error}` : ''}`);
        if (verbose && net.details)
            lines.push(picocolors_1.default.dim(`  ${t.details}: ${net.details}`));
    }
    lines.push('');
    lines.push(picocolors_1.default.bold(t.fit));
    lines.push(`- ${t.chat}: ${fitColor(report.fit.chat, lang)}`);
    lines.push(`- ${t.automation}: ${fitColor(report.fit.automation, lang)}`);
    lines.push(`- ${t.multiAgent}: ${fitColor(report.fit.multiAgent, lang)}`);
    lines.push(`- ${t.media}: ${fitColor(report.fit.media, lang)}`);
    lines.push('');
    const softwareItems = report.scoreBreakdown.items.filter((item) => item.section === 'software');
    const hardwareItems = report.scoreBreakdown.items.filter((item) => item.section === 'hardware');
    const realtimeItems = report.scoreBreakdown.items.filter((item) => item.section === 'realtime');
    const bonusItems = report.scoreBreakdown.items.filter((item) => item.section === 'bonus');
    lines.push(picocolors_1.default.bold(t.scoreBreakdown));
    lines.push('');
    renderBreakdownSection(lines, softwareItems, t.softwareBreakdown, lang);
    renderBreakdownSection(lines, hardwareItems, t.hardwareBreakdown, lang);
    renderBreakdownSection(lines, realtimeItems, t.realtimeBreakdown, lang);
    renderBreakdownSection(lines, bonusItems, t.bonusBreakdown, lang);
    lines.push(picocolors_1.default.bold(t.windowsPosture));
    lines.push(`- ${t.runningOnWindows}: ${report.host.windows.runningOnWindows ? t.yes : t.no}`);
    lines.push(`- ${t.adminCheck}: ${report.host.windows.admin.canEvaluate
        ? report.host.windows.admin.isElevated
            ? t.elevated
            : t.notElevated
        : `${t.notEvaluated} (${localizeLine(report.host.windows.admin.details || report.host.windows.admin.method, lang)})`}`);
    for (const note of report.host.windows.notes) {
        lines.push(`- ${t.note}: ${localizeLine(note, lang)}`);
    }
    if (report.host.windows.runningOnWindows && report.host.windows.recommendations.length) {
        for (const recommendation of report.host.windows.recommendations) {
            lines.push(`- ${t.recommendation}: ${localizeLine(recommendation, lang)}`);
        }
    }
    lines.push('');
    if (report.warnings.length) {
        lines.push(picocolors_1.default.bold(picocolors_1.default.yellow(t.warnings)));
        for (const warning of report.warnings)
            lines.push(`- ${localizeLine(warning, lang)}`);
        lines.push('');
    }
    if (report.recommendations.length) {
        lines.push(picocolors_1.default.bold(t.recommendations));
        for (const rec of report.recommendations)
            lines.push(`- ${localizeLine(rec, lang)}`);
        lines.push('');
    }
    if (verbose) {
        lines.push(picocolors_1.default.dim(`${t.timestamp}: ${report.timestamp}`));
        lines.push(picocolors_1.default.dim(`${t.profile}: ${report.profile}`));
        lines.push(picocolors_1.default.dim(`${t.language}: ${report.language}`));
        lines.push(picocolors_1.default.dim(`${t.rawPlatform}: ${report.host.platform}`));
    }
    return lines.join('\n');
}
//# sourceMappingURL=text.js.map