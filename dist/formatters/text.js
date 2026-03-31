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
function fitColor(level) {
    if (level === 'good')
        return picocolors_1.default.green(level);
    if (level === 'limited')
        return picocolors_1.default.yellow(level);
    return picocolors_1.default.red(level);
}
function statusColor(status) {
    if (status === 'PASS')
        return picocolors_1.default.green(status);
    if (status === 'PASS_WITH_WARNINGS')
        return picocolors_1.default.yellow(status);
    if (status === 'LIMITED')
        return picocolors_1.default.yellow(status);
    return picocolors_1.default.red(status);
}
function formatText(report, verbose = false) {
    const lines = [];
    const homebrew = report.host.packageManagers.find((manager) => manager.name === 'homebrew');
    lines.push(picocolors_1.default.bold(`OpenClaw Preflight Checker v${report.version}`));
    lines.push(`${picocolors_1.default.bold('Status:')} ${statusColor(report.summary.status)} (${report.summary.score}/100)`);
    lines.push('');
    lines.push(picocolors_1.default.bold('Host Summary'));
    lines.push(`- Hostname: ${report.host.hostname}`);
    lines.push(`- User: ${report.host.user || 'unknown'}`);
    lines.push(`- Platform: ${report.host.osLabel} (${report.host.arch})`);
    lines.push(`- OS family: ${report.host.osFamily}`);
    lines.push(`- Node: ${report.host.nodeVersion}`);
    lines.push(`- Shell: ${report.host.shell || 'unknown'}`);
    if (homebrew) {
        lines.push(`- Homebrew: ${homebrew.detected ? homebrew.version || 'detected' : 'not detected'}${!homebrew.detected && homebrew.installUrl ? ` (${homebrew.installUrl})` : ''}`);
    }
    lines.push('');
    lines.push(picocolors_1.default.bold('Hardware'));
    lines.push(`- CPU: ${report.hardware.cpuModel}`);
    lines.push(`- Cores: ${report.hardware.cpuCores}`);
    lines.push(`- Memory: ${(0, format_1.formatBytes)(report.hardware.totalMemoryBytes)} total / ${(0, format_1.formatBytes)(report.hardware.freeMemoryBytes)} free`);
    lines.push(`- Disk: ${(0, format_1.formatBytes)(report.hardware.diskFreeBytes)} free / ${(0, format_1.formatBytes)(report.hardware.diskTotalBytes)} total`);
    if (report.hardware.loadAverage?.length) {
        lines.push(`- Load avg: ${report.hardware.loadAverage.map((x) => x.toFixed(2)).join(' / ')}`);
    }
    lines.push('');
    lines.push(picocolors_1.default.bold('Dependencies'));
    for (const dep of report.dependencies) {
        lines.push(`- ${icon(dep.installed)} ${dep.name} [${dep.importance}]${dep.version ? ` - ${dep.version}` : ''}${!dep.installed && dep.error ? ` - ${dep.error}` : ''}`);
        if (!dep.installed && dep.installHint) {
            lines.push(`  install: ${dep.installHint}`);
        }
    }
    lines.push('');
    lines.push(picocolors_1.default.bold('Network'));
    for (const net of report.network.checks) {
        lines.push(`- ${icon(net.ok)} ${net.name} -> ${net.target}${net.statusCode ? ` [HTTP ${net.statusCode}]` : ''}${net.latencyMs != null ? ` (${net.latencyMs} ms)` : ''}${!net.ok && net.error ? ` - ${net.error}` : ''}`);
        if (verbose && net.details)
            lines.push(picocolors_1.default.dim(`  details: ${net.details}`));
    }
    lines.push('');
    lines.push(picocolors_1.default.bold('OpenClaw Fit'));
    lines.push(`- chat: ${fitColor(report.fit.chat)}`);
    lines.push(`- automation: ${fitColor(report.fit.automation)}`);
    lines.push(`- multi-agent: ${fitColor(report.fit.multiAgent)}`);
    lines.push(`- media: ${fitColor(report.fit.media)}`);
    lines.push('');
    lines.push(picocolors_1.default.bold('Windows Posture'));
    lines.push(`- Running on Windows: ${report.host.windows.runningOnWindows ? 'yes' : 'no'}`);
    lines.push(`- Admin check: ${report.host.windows.admin.canEvaluate
        ? report.host.windows.admin.isElevated
            ? 'elevated'
            : 'not elevated'
        : `not evaluated (${report.host.windows.admin.details || report.host.windows.admin.method})`}`);
    for (const note of report.host.windows.notes) {
        lines.push(`- Note: ${note}`);
    }
    if (report.host.windows.runningOnWindows && report.host.windows.recommendations.length) {
        for (const recommendation of report.host.windows.recommendations) {
            lines.push(`- Recommendation: ${recommendation}`);
        }
    }
    lines.push('');
    if (report.warnings.length) {
        lines.push(picocolors_1.default.bold(picocolors_1.default.yellow('Warnings')));
        for (const warning of report.warnings)
            lines.push(`- ${warning}`);
        lines.push('');
    }
    if (report.recommendations.length) {
        lines.push(picocolors_1.default.bold('Recommendations'));
        for (const rec of report.recommendations)
            lines.push(`- ${rec}`);
        lines.push('');
    }
    if (verbose) {
        lines.push(picocolors_1.default.dim(`Timestamp: ${report.timestamp}`));
        lines.push(picocolors_1.default.dim(`Profile: ${report.profile}`));
        lines.push(picocolors_1.default.dim(`Raw platform: ${report.host.platform}`));
    }
    return lines.join('\n');
}
//# sourceMappingURL=text.js.map