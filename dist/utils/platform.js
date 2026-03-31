"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.detectOsFamily = detectOsFamily;
exports.formatOsLabel = formatOsLabel;
exports.detectHomebrew = detectHomebrew;
exports.buildWindowsPosture = buildWindowsPosture;
exports.getDependencyInstallHint = getDependencyInstallHint;
const node_os_1 = __importDefault(require("node:os"));
const exec_1 = require("./exec");
const HOMEBREW_INSTALL_URL = 'https://brew.sh';
function firstLine(value) {
    const line = value
        .split('\n')
        .map((entry) => entry.trim())
        .find(Boolean);
    return line || undefined;
}
function detectOsFamily(platform = node_os_1.default.platform()) {
    if (platform === 'darwin')
        return 'macos';
    if (platform === 'linux')
        return 'linux';
    if (platform === 'win32')
        return 'windows';
    return 'unknown';
}
function formatOsLabel(platform, release) {
    const family = detectOsFamily(platform);
    if (family === 'macos')
        return `macOS ${release}`;
    if (family === 'windows')
        return `Windows ${release}`;
    if (family === 'linux')
        return `Linux ${release}`;
    return `${platform} ${release}`.trim();
}
async function detectHomebrew(osFamily) {
    if (osFamily !== 'macos')
        return undefined;
    const result = await (0, exec_1.runCommand)('brew', ['--version'], 4000);
    if (result.ok) {
        return {
            name: 'homebrew',
            detected: true,
            version: firstLine(result.stdout || result.stderr),
            suggestions: [],
        };
    }
    return {
        name: 'homebrew',
        detected: false,
        installUrl: HOMEBREW_INSTALL_URL,
        suggestions: [
            `Install Homebrew from ${HOMEBREW_INSTALL_URL}.`,
            'After Homebrew is installed, rerun this tool to unlock brew-based install suggestions.',
        ],
    };
}
async function detectWindowsAdmin() {
    const command = [
        '-NoProfile',
        '-NonInteractive',
        '-Command',
        '[Security.Principal.WindowsPrincipal][Security.Principal.WindowsIdentity]::GetCurrent() | ForEach-Object { $_.IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator) }',
    ];
    const result = await (0, exec_1.runCommand)('powershell', command, 4000);
    if (result.ok) {
        const value = (result.stdout || result.stderr).trim().toLowerCase();
        if (value === 'true' || value === 'false') {
            return {
                canEvaluate: true,
                isElevated: value === 'true',
                method: 'powershell',
            };
        }
    }
    return {
        canEvaluate: false,
        method: 'powershell',
        details: firstLine(result.stderr || result.stdout || 'Unable to evaluate Windows elevation'),
    };
}
async function buildWindowsPosture(osFamily) {
    if (osFamily !== 'windows') {
        return {
            runningOnWindows: false,
            admin: {
                canEvaluate: false,
                method: 'not-applicable',
                details: 'Current session is not running on Windows.',
            },
            recommendations: [
                'For Windows installs, prefer an elevated PowerShell session for dependency setup.',
                'Use winget or official installers for Node.js LTS, Git, Python 3, and FFmpeg.',
            ],
            notes: ['Windows-specific elevation checks are skipped when the CLI is not running on Windows.'],
        };
    }
    const admin = await detectWindowsAdmin();
    const recommendations = [];
    const notes = [];
    if (!admin.canEvaluate) {
        notes.push('Could not determine whether this Windows session is elevated.');
        recommendations.push('Open an elevated PowerShell session before installing system-level dependencies.');
    }
    else if (!admin.isElevated) {
        notes.push('Current Windows session is not elevated.');
        recommendations.push('Rerun in an elevated PowerShell session if installs require administrator privileges.');
    }
    else {
        notes.push('Current Windows session appears to be elevated.');
    }
    recommendations.push('Prefer winget install commands or official installers for missing Windows dependencies.');
    return {
        runningOnWindows: true,
        admin,
        recommendations,
        notes,
    };
}
function getDependencyInstallHint(dependencyName, osFamily, packageManagers) {
    const brew = packageManagers.find((manager) => manager.name === 'homebrew');
    const macBrewPackages = {
        git: 'git',
        python3: 'python',
        ffmpeg: 'ffmpeg',
        uv: 'uv',
        docker: '--cask docker',
    };
    const windowsWingetPackages = {
        node: 'OpenJS.NodeJS.LTS',
        npm: 'OpenJS.NodeJS.LTS',
        git: 'Git.Git',
        python3: 'Python.Python.3.12',
        ffmpeg: 'Gyan.FFmpeg',
        docker: 'Docker.DockerDesktop',
    };
    if (osFamily === 'macos') {
        if (dependencyName === 'openclaw')
            return 'Follow the OpenClaw install instructions after the host passes preflight.';
        const brewPackage = macBrewPackages[dependencyName];
        if (!brewPackage)
            return undefined;
        if (brew?.detected) {
            return `brew install ${brewPackage}`;
        }
        return `Install Homebrew from ${HOMEBREW_INSTALL_URL}, then run: brew install ${brewPackage}`;
    }
    if (osFamily === 'windows') {
        if (dependencyName === 'openclaw')
            return 'Install OpenClaw after the required Windows prerequisites are present.';
        const wingetPackage = windowsWingetPackages[dependencyName];
        if (wingetPackage) {
            return `winget install --id ${wingetPackage}`;
        }
    }
    return undefined;
}
//# sourceMappingURL=platform.js.map