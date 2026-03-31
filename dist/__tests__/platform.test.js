"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const node_test_1 = __importDefault(require("node:test"));
const strict_1 = __importDefault(require("node:assert/strict"));
const fit_1 = require("../checks/fit");
const platform_1 = require("../utils/platform");
function createHost(overrides = {}) {
    return {
        hostname: 'test-host',
        platform: 'darwin',
        osFamily: 'macos',
        osLabel: 'macOS 14.0',
        release: '14.0',
        arch: 'arm64',
        shell: '/bin/zsh',
        nodeVersion: 'v22.0.0',
        uptimeSec: 123,
        user: 'tester',
        packageManagers: [],
        windows: {
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
        },
        ...overrides,
    };
}
function createHardware(overrides = {}) {
    return {
        cpuModel: 'Test CPU',
        cpuCores: 8,
        totalMemoryBytes: 16 * 1024 * 1024 * 1024,
        freeMemoryBytes: 8 * 1024 * 1024 * 1024,
        loadAverage: [0.1, 0.2, 0.3],
        diskFreeBytes: 100 * 1024 * 1024 * 1024,
        diskTotalBytes: 200 * 1024 * 1024 * 1024,
        ...overrides,
    };
}
function createDependency(overrides) {
    return {
        name: 'git',
        command: 'git',
        importance: 'recommended',
        installed: true,
        ...overrides,
    };
}
(0, node_test_1.default)('detectOsFamily maps Node platforms to report families', () => {
    strict_1.default.equal((0, platform_1.detectOsFamily)('darwin'), 'macos');
    strict_1.default.equal((0, platform_1.detectOsFamily)('linux'), 'linux');
    strict_1.default.equal((0, platform_1.detectOsFamily)('win32'), 'windows');
    strict_1.default.equal((0, platform_1.detectOsFamily)('freebsd'), 'unknown');
});
(0, node_test_1.default)('getDependencyInstallHint returns brew commands for supported macOS dependencies', () => {
    const hint = (0, platform_1.getDependencyInstallHint)('ffmpeg', 'macos', [{ name: 'homebrew', detected: true, suggestions: [] }]);
    strict_1.default.equal(hint, 'brew install ffmpeg');
});
(0, node_test_1.default)('getDependencyInstallHint falls back to Homebrew installation guidance on macOS', () => {
    const hint = (0, platform_1.getDependencyInstallHint)('python3', 'macos', [{ name: 'homebrew', detected: false, installUrl: 'https://brew.sh', suggestions: [] }]);
    strict_1.default.match(hint || '', /Install Homebrew/);
    strict_1.default.match(hint || '', /brew install python/);
});
(0, node_test_1.default)('buildWindowsPosture produces safe non-Windows posture details', async () => {
    const posture = await (0, platform_1.buildWindowsPosture)('linux');
    strict_1.default.equal(posture.runningOnWindows, false);
    strict_1.default.equal(posture.admin.canEvaluate, false);
    strict_1.default.match(posture.notes[0] || '', /skipped/i);
});
(0, node_test_1.default)('assessFit warns when Homebrew is missing on macOS', () => {
    const host = createHost({
        packageManagers: [{ name: 'homebrew', detected: false, installUrl: 'https://brew.sh', suggestions: ['Install Homebrew from https://brew.sh.'] }],
    });
    const hardware = createHardware();
    const dependencies = [
        createDependency({ name: 'node', command: 'node', importance: 'required' }),
        createDependency({ name: 'npm', command: 'npm', importance: 'required' }),
    ];
    const network = [];
    const result = (0, fit_1.assessFit)(host, hardware, dependencies, network, 'standard');
    strict_1.default.ok(result.warnings.some((warning) => warning.includes('Homebrew')));
    strict_1.default.ok(result.recommendations.some((recommendation) => recommendation.includes('Homebrew')));
});
//# sourceMappingURL=platform.test.js.map