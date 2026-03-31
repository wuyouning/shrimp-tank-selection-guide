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
