"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.assessFit = assessFit;
const format_1 = require("../utils/format");
function describeMissingDependencies(dependencies) {
    return dependencies.map((entry) => entry.name).join(', ');
}
function collectInstallHints(dependencies) {
    return dependencies
        .filter((dependency) => !dependency.installed && dependency.installHint)
        .map((dependency) => `${dependency.name}: ${dependency.installHint}`);
}
function addScore(items, label, points, maxPoints, note) {
    items.push({ key: label.toLowerCase().replace(/[^a-z0-9]+/g, '-'), label, points, maxPoints, note });
}
function addBonus(items, label, points, note) {
    if (!points)
        return;
    items.push({ key: label.toLowerCase().replace(/[^a-z0-9]+/g, '-'), label, points, note });
}
function assessFit(host, hardware, dependencies, networkChecks, profile) {
    const warnings = [];
    const recommendations = [];
    const scoreBreakdown = [];
    const standardMax = 100;
    const requiredMissing = dependencies.filter((d) => d.importance === 'required' && !d.installed);
    const recommendedMissing = dependencies.filter((d) => d.importance === 'recommended' && !d.installed);
    const failedNetwork = networkChecks.filter((c) => !c.ok);
    const missingInstallHints = collectInstallHints([...requiredMissing, ...recommendedMissing]);
    const totalMemGb = (0, format_1.bytesToGb)(hardware.totalMemoryBytes);
    const freeMemGb = (0, format_1.bytesToGb)(hardware.freeMemoryBytes);
    const freeDiskGb = (0, format_1.bytesToGb)(hardware.diskFreeBytes);
    const cores = hardware.cpuCores;
    const hasFfmpeg = !dependencies.find((d) => d.name === 'ffmpeg' && !d.installed);
    const hasDocker = !dependencies.find((d) => d.name === 'docker' && !d.installed);
    const hasUv = !dependencies.find((d) => d.name === 'uv' && !d.installed);
    const hasOpenClaw = !dependencies.find((d) => d.name === 'openclaw' && !d.installed);
    const networkSuccessCount = networkChecks.filter((check) => check.ok).length;
    const load1 = hardware.loadAverage?.[0] ?? 0;
    const docsBackedBaseline = {
        runtime: 20,
        dependencies: 20,
        network: 15,
        memory: 20,
        cpu: 10,
        disk: 10,
        osReadiness: 5,
    };
    const runtimeScore = requiredMissing.length === 0 ? docsBackedBaseline.runtime : 0;
    addScore(scoreBreakdown, 'Runtime baseline', runtimeScore, docsBackedBaseline.runtime, 'Node 24 is recommended by OpenClaw docs; Node 22.14+ is the minimum supported floor.');
    let dependencyScore = docsBackedBaseline.dependencies;
    if (recommendedMissing.length)
        dependencyScore -= Math.min(12, recommendedMissing.length * 4);
    if (!hasFfmpeg)
        dependencyScore -= 5;
    if (!hasUv)
        dependencyScore -= 2;
    if (requiredMissing.length)
        dependencyScore = Math.max(0, dependencyScore - 10);
    dependencyScore = Math.max(0, dependencyScore);
    addScore(scoreBreakdown, 'Tooling baseline', dependencyScore, docsBackedBaseline.dependencies, 'Covers git/python/ffmpeg plus optional helper tooling that improves real-world OpenClaw use.');
    let networkScore = docsBackedBaseline.network;
    networkScore -= failedNetwork.length * 4;
    networkScore = Math.max(0, networkScore);
    addScore(scoreBreakdown, 'Network readiness', networkScore, docsBackedBaseline.network, 'Healthy DNS and outbound HTTPS are required for installs, updates, model APIs, and docs access.');
    let memoryScore = 0;
    if (totalMemGb >= 16)
        memoryScore = docsBackedBaseline.memory;
    else if (totalMemGb >= 8)
        memoryScore = 16;
    else if (totalMemGb >= 4)
        memoryScore = 10;
    else
        memoryScore = 2;
    if (freeMemGb > 0 && freeMemGb < 1)
        memoryScore -= 3;
    memoryScore = Math.max(0, memoryScore);
    addScore(scoreBreakdown, 'Memory headroom', memoryScore, docsBackedBaseline.memory, '4 GB is a usable floor; 8 GB is comfortable; 16 GB is the recommended standard for heavier media work.');
    let cpuScore = 0;
    if (cores >= 8)
        cpuScore = docsBackedBaseline.cpu;
    else if (cores >= 4)
        cpuScore = 7;
    else
        cpuScore = 3;
    addScore(scoreBreakdown, 'CPU concurrency', cpuScore, docsBackedBaseline.cpu, 'OpenClaw scales better with more CPU headroom, especially for concurrent tools and multi-agent work.');
    let diskScore = 0;
    if (freeDiskGb >= 20)
        diskScore = docsBackedBaseline.disk;
    else if (freeDiskGb >= 10)
        diskScore = 8;
    else if (freeDiskGb >= 5)
        diskScore = 5;
    else
        diskScore = 1;
    addScore(scoreBreakdown, 'Disk headroom', diskScore, docsBackedBaseline.disk, '10–20 GB free keeps room for packages, logs, media artifacts, caches, and sandbox images.');
    let osReadinessScore = 2;
    if (host.osFamily === 'macos' || host.osFamily === 'windows' || host.osFamily === 'linux')
        osReadinessScore = 4;
    if (host.osFamily === 'macos' && host.packageManagers.find((x) => x.name === 'homebrew')?.detected)
        osReadinessScore = 5;
    if (host.osFamily === 'linux' && host.packageManagers.some((x) => ['apt', 'dnf', 'yum', 'pacman'].includes(x.name) && x.detected))
        osReadinessScore = 5;
    if (host.osFamily === 'windows' && host.windows.admin.canEvaluate)
        osReadinessScore = 5;
    addScore(scoreBreakdown, 'Platform readiness', osReadinessScore, docsBackedBaseline.osReadiness, 'Rewards hosts where package management and platform-specific readiness signals are clear.');
    const rawScore = scoreBreakdown.reduce((sum, item) => sum + item.points, 0);
    let bonusPoints = 0;
    if (totalMemGb >= 32) {
        bonusPoints += 8;
        addBonus(scoreBreakdown, 'Bonus: large memory pool', 8, '32 GB+ gives extra breathing room for media and parallel workloads.');
    }
    else if (totalMemGb >= 24) {
        bonusPoints += 4;
        addBonus(scoreBreakdown, 'Bonus: extra memory headroom', 4, '24 GB+ is comfortably above the recommended standard.');
    }
    if (cores >= 12) {
        bonusPoints += 6;
        addBonus(scoreBreakdown, 'Bonus: high core count', 6, '12+ logical cores provide strong concurrency for heavier agent use.');
    }
    else if (cores >= 8) {
        bonusPoints += 2;
        addBonus(scoreBreakdown, 'Bonus: healthy core count', 2, '8+ cores exceed the baseline standard.');
    }
    if (freeDiskGb >= 100) {
        bonusPoints += 3;
        addBonus(scoreBreakdown, 'Bonus: ample free disk', 3, 'Large free disk helps with sandboxes, media outputs, and long-lived logs.');
    }
    if (networkSuccessCount === networkChecks.length && networkChecks.length > 0) {
        bonusPoints += 3;
        addBonus(scoreBreakdown, 'Bonus: clean network sweep', 3, 'All configured network checks passed.');
    }
    if (hasDocker) {
        bonusPoints += 2;
        addBonus(scoreBreakdown, 'Bonus: Docker available', 2, 'Useful for containerized deployments and sandbox workflows.');
    }
    if (hasUv) {
        bonusPoints += 1;
        addBonus(scoreBreakdown, 'Bonus: uv available', 1, 'Useful for Python-related skills and tooling installs.');
    }
    if (hasOpenClaw) {
        bonusPoints += 2;
        addBonus(scoreBreakdown, 'Bonus: OpenClaw already installed', 2, 'Shows the host already cleared the basic CLI path once.');
    }
    if (profile === 'media' && totalMemGb >= 16 && cores >= 8 && hasFfmpeg) {
        bonusPoints += 4;
        addBonus(scoreBreakdown, 'Bonus: media-ready host', 4, 'Exceeds the standard media baseline with enough memory, CPU, and ffmpeg.');
    }
    if (profile === 'multi-agent' && totalMemGb >= 16 && cores >= 12) {
        bonusPoints += 4;
        addBonus(scoreBreakdown, 'Bonus: multi-agent headroom', 4, 'Clearly above the minimum concurrency profile target.');
    }
    const score = rawScore + bonusPoints;
    if (requiredMissing.length) {
        warnings.push(`Missing required dependencies: ${describeMissingDependencies(requiredMissing)}`);
        recommendations.push('Install the missing required dependencies before deploying OpenClaw.');
    }
    if (recommendedMissing.length) {
        warnings.push(`Missing recommended dependencies: ${describeMissingDependencies(recommendedMissing)}`);
        recommendations.push('Add recommended tooling such as git, python3, and ffmpeg for a smoother setup.');
    }
    if (failedNetwork.length) {
        warnings.push(`Network checks failed: ${failedNetwork.map((x) => x.name).join(', ')}`);
        recommendations.push('Check DNS, proxy settings, outbound HTTPS access, and any corporate network controls.');
    }
    if (totalMemGb < 4) {
        warnings.push(`Low memory: about ${totalMemGb.toFixed(1)} GB total`);
        recommendations.push('Use at least 4 GB RAM, and prefer 8 GB or more for stable day-to-day usage.');
    }
    else if (totalMemGb < 8) {
        warnings.push(`Limited memory headroom: about ${totalMemGb.toFixed(1)} GB total`);
        recommendations.push('Upgrade to 8 GB or more if you want steadier background usage or more concurrent work.');
    }
    if (freeMemGb > 0 && freeMemGb < 1) {
        warnings.push(`Low free memory right now: about ${freeMemGb.toFixed(1)} GB`);
        recommendations.push('Close high-memory apps and rerun the check to avoid scoring against a transient spike.');
    }
    if (freeDiskGb > 0 && freeDiskGb < 5) {
        warnings.push(`Low free disk space: about ${freeDiskGb.toFixed(1)} GB`);
        recommendations.push('Keep at least 5-10 GB of free disk space for packages, caches, and temp files.');
    }
    if (cores < 4) {
        warnings.push(`Low CPU core count: ${cores}`);
        recommendations.push('Use a stronger multi-core CPU if you plan to run concurrent tasks or media workloads.');
    }
    if (load1 > Math.max(cores, 1) * 1.2) {
        warnings.push(`High current system load: 1m load is ${load1.toFixed(2)} on ${cores} cores`);
        recommendations.push('Rerun preflight when the machine is idle to separate permanent limits from temporary pressure.');
    }
    if (profile === 'media' && totalMemGb < 16) {
        warnings.push('The media profile has limited memory headroom on this machine.');
        recommendations.push('Media workflows are more comfortable with 16 GB RAM or more and stronger compute/GPU support.');
    }
    if (profile === 'multi-agent' && (totalMemGb < 8 || cores < 8)) {
        warnings.push('The multi-agent profile has limited concurrency headroom here.');
        recommendations.push('For multi-agent usage, target at least 8 CPU cores and 8 GB RAM.');
    }
    if (host.osFamily === 'macos') {
        const brew = host.packageManagers.find((manager) => manager.name === 'homebrew');
        if (!brew?.detected) {
            warnings.push('Homebrew is not installed on this macOS host.');
            recommendations.push(...(brew?.suggestions || ['Install Homebrew to streamline dependency setup on macOS.']));
        }
    }
    if (host.osFamily === 'linux' && !host.packageManagers.some((manager) => ['apt', 'dnf', 'yum', 'pacman'].includes(manager.name) && manager.detected)) {
        warnings.push('No supported Linux package manager was detected.');
        recommendations.push('Add distro-specific package manager detection or ensure the runtime PATH exposes apt, dnf, yum, or pacman.');
    }
    if (host.osFamily === 'windows') {
        recommendations.push(...host.windows.recommendations);
        if (host.windows.admin.canEvaluate && host.windows.admin.isElevated === false) {
            warnings.push('This Windows session is not elevated.');
        }
    }
    if (missingInstallHints.length) {
        recommendations.push(...missingInstallHints);
    }
    let status = 'PASS';
    if (requiredMissing.length || rawScore < 45)
        status = 'FAIL';
    else if (rawScore < 60)
        status = 'LIMITED';
    else if (warnings.length)
        status = 'PASS_WITH_WARNINGS';
    const fit = {
        chat: totalMemGb >= 4 && requiredMissing.length === 0 && failedNetwork.length <= 1 ? 'good' : totalMemGb >= 4 ? 'limited' : 'poor',
        automation: totalMemGb >= 4 && recommendedMissing.length < 2 ? 'good' : totalMemGb >= 4 ? 'limited' : 'poor',
        multiAgent: totalMemGb >= 8 && cores >= 8 ? 'good' : totalMemGb >= 4 ? 'limited' : 'poor',
        media: totalMemGb >= 16 && cores >= 8 && hasFfmpeg ? 'good' : totalMemGb >= 8 && hasFfmpeg ? 'limited' : 'poor',
    };
    return {
        fit,
        warnings: (0, format_1.uniq)(warnings),
        recommendations: (0, format_1.uniq)(recommendations),
        score,
        rawScore,
        bonusPoints,
        standardMax,
        scoreBreakdown,
        status,
    };
}
//# sourceMappingURL=fit.js.map