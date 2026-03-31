import test from 'node:test';
import assert from 'node:assert/strict';
import { assessFit } from '../checks/fit';
import { DependencyResult, HardwareInfo, HostInfo, NetworkCheckResult } from '../types';
import { buildWindowsPosture, detectOsFamily, getDependencyInstallHint } from '../utils/platform';

function createHost(overrides: Partial<HostInfo> = {}): HostInfo {
  return {
    hostname: 'test-host',
    platform: 'darwin',
    osFamily: 'macos',
    osLabel: 'macOS 14.0',
    release: '14.0',
    arch: 'arm64',
    shell: '/bin/zsh',
    nodeVersion: 'v24.0.0',
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

function createHardware(overrides: Partial<HardwareInfo> = {}): HardwareInfo {
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

function createDependency(overrides: Partial<DependencyResult>): DependencyResult {
  return {
    name: 'git',
    command: 'git',
    importance: 'recommended',
    installed: true,
    ...overrides,
  };
}

test('detectOsFamily maps Node platforms to report families', () => {
  assert.equal(detectOsFamily('darwin'), 'macos');
  assert.equal(detectOsFamily('linux'), 'linux');
  assert.equal(detectOsFamily('win32'), 'windows');
  assert.equal(detectOsFamily('freebsd'), 'unknown');
});

test('getDependencyInstallHint returns brew commands for supported macOS dependencies', () => {
  const hint = getDependencyInstallHint('ffmpeg', 'macos', [{ name: 'homebrew', detected: true, suggestions: [] }]);
  assert.equal(hint, 'brew install ffmpeg');
});

test('getDependencyInstallHint returns apt guidance on Linux when apt is present', () => {
  const hint = getDependencyInstallHint('python3', 'linux', [{ name: 'apt', detected: true, suggestions: [] }]);
  assert.equal(hint, 'sudo apt-get install -y python3');
});

test('getDependencyInstallHint falls back to Homebrew installation guidance on macOS', () => {
  const hint = getDependencyInstallHint('python3', 'macos', [{ name: 'homebrew', detected: false, installUrl: 'https://brew.sh', suggestions: [] }]);
  assert.match(hint || '', /Install Homebrew/);
  assert.match(hint || '', /brew install python/);
});

test('buildWindowsPosture produces safe non-Windows posture details', async () => {
  const posture = await buildWindowsPosture('linux');
  assert.equal(posture.runningOnWindows, false);
  assert.equal(posture.admin.canEvaluate, false);
  assert.match(posture.notes[0] || '', /skipped/i);
});

test('assessFit warns when Homebrew is missing on macOS', () => {
  const host = createHost({
    packageManagers: [{ name: 'homebrew', detected: false, installUrl: 'https://brew.sh', suggestions: ['Install Homebrew from https://brew.sh.'] }],
  });
  const hardware = createHardware();
  const dependencies: DependencyResult[] = [
    createDependency({ name: 'node', command: 'node', importance: 'required' }),
    createDependency({ name: 'npm', command: 'npm', importance: 'required' }),
  ];
  const network: NetworkCheckResult[] = [];

  const result = assessFit(host, hardware, dependencies, network, 'standard');

  assert.ok(result.warnings.some((warning) => warning.includes('Homebrew')));
  assert.ok(result.recommendations.some((recommendation) => recommendation.includes('Homebrew')));
});

test('assessFit can score above the 100-point standard with bonuses', () => {
  const host = createHost({
    packageManagers: [{ name: 'homebrew', detected: true, version: 'Homebrew 5.0.0', suggestions: [] }],
  });
  const hardware = createHardware({
    cpuCores: 12,
    totalMemoryBytes: 32 * 1024 * 1024 * 1024,
    freeMemoryBytes: 20 * 1024 * 1024 * 1024,
    diskFreeBytes: 200 * 1024 * 1024 * 1024,
  });
  const dependencies: DependencyResult[] = [
    createDependency({ name: 'node', command: 'node', importance: 'required' }),
    createDependency({ name: 'npm', command: 'npm', importance: 'required' }),
    createDependency({ name: 'git', command: 'git', importance: 'recommended' }),
    createDependency({ name: 'python3', command: 'python3', importance: 'recommended' }),
    createDependency({ name: 'ffmpeg', command: 'ffmpeg', importance: 'recommended' }),
    createDependency({ name: 'uv', command: 'uv', importance: 'optional' }),
    createDependency({ name: 'docker', command: 'docker', importance: 'optional' }),
    createDependency({ name: 'openclaw', command: 'openclaw', importance: 'optional' }),
  ];
  const network: NetworkCheckResult[] = [
    { name: 'dns-openclaw-ai', target: 'openclaw.ai', ok: true, latencyMs: 10 },
    { name: 'dns-github-com', target: 'github.com', ok: true, latencyMs: 10 },
    { name: 'https-github-com', target: 'https://github.com', ok: true, latencyMs: 100, statusCode: 200 },
    { name: 'https-openclaw-ai', target: 'https://openclaw.ai', ok: true, latencyMs: 100, statusCode: 200 },
    { name: 'https-www-google-com', target: 'https://www.google.com', ok: true, latencyMs: 100, statusCode: 200 },
  ];

  const result = assessFit(host, hardware, dependencies, network, 'media');

  assert.equal(result.standardMax, 100);
  assert.equal(result.softwareScore + result.hardwareScore + result.realtimeScore, result.rawScore);
  assert.ok(result.score > 100);
  assert.ok(result.bonusPoints > 0);
});
