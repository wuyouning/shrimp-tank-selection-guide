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
function fitColor(level, lang) {
    const labels = lang === 'zh-CN'
        ? { good: '良好', limited: '受限', poor: '较差' }
        : { good: 'good', limited: 'limited', poor: 'poor' };
    const label = labels[level] || level;
    if (level === 'good')
        return picocolors_1.default.green(label);
    if (level === 'limited')
        return picocolors_1.default.yellow(label);
    return picocolors_1.default.red(label);
}
function statusColor(status, lang) {
    const labels = lang === 'zh-CN'
        ? { PASS: '通过', PASS_WITH_WARNINGS: '通过（有警告）', LIMITED: '受限', FAIL: '失败' }
        : { PASS: 'PASS', PASS_WITH_WARNINGS: 'PASS_WITH_WARNINGS', LIMITED: 'LIMITED', FAIL: 'FAIL' };
    const label = labels[status] || status;
    if (status === 'PASS')
        return picocolors_1.default.green(label);
    if (status === 'PASS_WITH_WARNINGS')
        return picocolors_1.default.yellow(label);
    if (status === 'LIMITED')
        return picocolors_1.default.yellow(label);
    return picocolors_1.default.red(label);
}
const COPY = {
    en: {
        title: 'OpenClaw Preflight Checker',
        status: 'Status',
        bonus: 'bonus',
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
        scoreBreakdown: 'Score Breakdown',
        windowsPosture: 'Windows Posture',
        runningOnWindows: 'Running on Windows',
        yes: 'yes',
        no: 'no',
        adminCheck: 'Admin check',
        elevated: 'elevated',
        notElevated: 'not elevated',
        notEvaluated: 'not evaluated',
        note: 'Note',
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
        scoreBreakdown: '评分拆解',
        windowsPosture: 'Windows 姿态',
        runningOnWindows: '当前是否运行在 Windows',
        yes: '是',
        no: '否',
        adminCheck: '管理员检查',
        elevated: '已提权',
        notElevated: '未提权',
        notEvaluated: '未评估',
        note: '说明',
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
    },
};
function formatText(report, verbose = false, lang = 'en') {
    const t = COPY[lang];
    const lines = [];
    const homebrew = report.host.packageManagers.find((manager) => manager.name === 'homebrew');
    const packageManagers = report.host.packageManagers.filter((manager) => manager.detected);
    lines.push(picocolors_1.default.bold(`${t.title} v${report.version}`));
    lines.push(`${picocolors_1.default.bold(`${t.status}:`)} ${statusColor(report.summary.status, lang)} (${report.summary.score}/${report.summary.standardMax}${report.summary.bonusPoints > 0 ? ` +${report.summary.bonusPoints} ${t.bonus}` : ''})`);
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
    lines.push(picocolors_1.default.bold(t.scoreBreakdown));
    for (const item of report.scoreBreakdown.items) {
        const maxSuffix = item.maxPoints != null ? ` / ${item.maxPoints}` : '';
        lines.push(`- ${item.label}: ${item.points}${maxSuffix}${item.note ? ` — ${item.note}` : ''}`);
    }
    lines.push('');
    lines.push(picocolors_1.default.bold(t.windowsPosture));
    lines.push(`- ${t.runningOnWindows}: ${report.host.windows.runningOnWindows ? t.yes : t.no}`);
    lines.push(`- ${t.adminCheck}: ${report.host.windows.admin.canEvaluate
        ? report.host.windows.admin.isElevated
            ? t.elevated
            : t.notElevated
        : `${t.notEvaluated} (${report.host.windows.admin.details || report.host.windows.admin.method})`}`);
    for (const note of report.host.windows.notes) {
        lines.push(`- ${t.note}: ${note}`);
    }
    if (report.host.windows.runningOnWindows && report.host.windows.recommendations.length) {
        for (const recommendation of report.host.windows.recommendations) {
            lines.push(`- ${t.recommendation}: ${recommendation}`);
        }
    }
    lines.push('');
    if (report.warnings.length) {
        lines.push(picocolors_1.default.bold(picocolors_1.default.yellow(t.warnings)));
        for (const warning of report.warnings)
            lines.push(`- ${warning}`);
        lines.push('');
    }
    if (report.recommendations.length) {
        lines.push(picocolors_1.default.bold(t.recommendations));
        for (const rec of report.recommendations)
            lines.push(`- ${rec}`);
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