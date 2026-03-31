import os from 'node:os';
import { OsFamily, PackageManagerStatus, PrivilegeCheck, WindowsPosture } from '../types';
import { runCommand } from './exec';

const HOMEBREW_INSTALL_URL = 'https://brew.sh';

function firstLine(value: string): string | undefined {
  const line = value
    .split('\n')
    .map((entry) => entry.trim())
    .find(Boolean);
  return line || undefined;
}

export function detectOsFamily(platform: string = os.platform()): OsFamily {
  if (platform === 'darwin') return 'macos';
  if (platform === 'linux') return 'linux';
  if (platform === 'win32') return 'windows';
  return 'unknown';
}

export function formatOsLabel(platform: string, release: string): string {
  const family = detectOsFamily(platform);
  if (family === 'macos') return `macOS ${release}`;
  if (family === 'windows') return `Windows ${release}`;
  if (family === 'linux') return `Linux ${release}`;
  return `${platform} ${release}`.trim();
}

export async function detectHomebrew(osFamily: OsFamily): Promise<PackageManagerStatus | undefined> {
  if (osFamily !== 'macos') return undefined;

  const result = await runCommand('brew', ['--version'], 4000);
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

async function detectLinuxPackageManagers(osFamily: OsFamily): Promise<PackageManagerStatus[]> {
  if (osFamily !== 'linux') return [];

  const specs: Array<{ name: PackageManagerStatus['name']; command: string; args: string[]; suggestion: string }> = [
    { name: 'apt', command: 'apt', args: ['--version'], suggestion: 'APT detected; prefer apt-based install guidance on this host.' },
    { name: 'dnf', command: 'dnf', args: ['--version'], suggestion: 'DNF detected; prefer dnf-based install guidance on this host.' },
    { name: 'yum', command: 'yum', args: ['--version'], suggestion: 'YUM detected; prefer yum-based install guidance on this host.' },
    { name: 'pacman', command: 'pacman', args: ['--version'], suggestion: 'Pacman detected; prefer pacman-based install guidance on this host.' },
  ];

  const results = await Promise.all(
    specs.map(async (spec) => {
      const result = await runCommand(spec.command, spec.args, 3000);
      return {
        name: spec.name,
        detected: result.ok,
        version: result.ok ? firstLine(result.stdout || result.stderr) : undefined,
        suggestions: result.ok ? [spec.suggestion] : [],
      } satisfies PackageManagerStatus;
    }),
  );

  return results.filter((entry) => entry.detected);
}

async function detectWindowsPackageManagers(osFamily: OsFamily): Promise<PackageManagerStatus[]> {
  if (osFamily !== 'windows') return [];

  const winget = await runCommand('winget', ['--version'], 3000);
  return [
    {
      name: 'winget',
      detected: winget.ok,
      version: winget.ok ? firstLine(winget.stdout || winget.stderr) : undefined,
      suggestions: winget.ok ? ['winget detected; prefer winget-based install guidance on this host.'] : [],
    },
  ];
}

export async function detectPackageManagers(osFamily: OsFamily): Promise<PackageManagerStatus[]> {
  const [homebrew, linuxManagers, windowsManagers] = await Promise.all([
    detectHomebrew(osFamily),
    detectLinuxPackageManagers(osFamily),
    detectWindowsPackageManagers(osFamily),
  ]);

  return [homebrew, ...linuxManagers, ...windowsManagers].filter(Boolean) as PackageManagerStatus[];
}

async function detectWindowsAdmin(): Promise<PrivilegeCheck> {
  const command = [
    '-NoProfile',
    '-NonInteractive',
    '-Command',
    '[Security.Principal.WindowsPrincipal][Security.Principal.WindowsIdentity]::GetCurrent() | ForEach-Object { $_.IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator) }',
  ];

  const result = await runCommand('powershell', command, 4000);
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

export async function buildWindowsPosture(osFamily: OsFamily): Promise<WindowsPosture> {
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
  const recommendations: string[] = [];
  const notes: string[] = [];

  if (!admin.canEvaluate) {
    notes.push('Could not determine whether this Windows session is elevated.');
    recommendations.push('Open an elevated PowerShell session before installing system-level dependencies.');
  } else if (!admin.isElevated) {
    notes.push('Current Windows session is not elevated.');
    recommendations.push('Rerun in an elevated PowerShell session if installs require administrator privileges.');
  } else {
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

export function getDependencyInstallHint(
  dependencyName: string,
  osFamily: OsFamily,
  packageManagers: PackageManagerStatus[],
): string | undefined {
  const brew = packageManagers.find((manager) => manager.name === 'homebrew');
  const apt = packageManagers.find((manager) => manager.name === 'apt');
  const dnf = packageManagers.find((manager) => manager.name === 'dnf');
  const yum = packageManagers.find((manager) => manager.name === 'yum');
  const pacman = packageManagers.find((manager) => manager.name === 'pacman');

  const macBrewPackages: Partial<Record<string, string>> = {
    git: 'git',
    python3: 'python',
    ffmpeg: 'ffmpeg',
    uv: 'uv',
    docker: '--cask docker',
  };

  const linuxPackages: Partial<Record<string, { apt?: string; dnf?: string; yum?: string; pacman?: string }>> = {
    git: { apt: 'git', dnf: 'git', yum: 'git', pacman: 'git' },
    python3: { apt: 'python3', dnf: 'python3', yum: 'python3', pacman: 'python' },
    ffmpeg: { apt: 'ffmpeg', dnf: 'ffmpeg', yum: 'ffmpeg', pacman: 'ffmpeg' },
    uv: { apt: 'uv', dnf: 'uv', yum: 'uv', pacman: 'uv' },
    docker: { apt: 'docker.io', dnf: 'docker', yum: 'docker', pacman: 'docker' },
  };

  const windowsWingetPackages: Partial<Record<string, string>> = {
    node: 'OpenJS.NodeJS.LTS',
    npm: 'OpenJS.NodeJS.LTS',
    git: 'Git.Git',
    python3: 'Python.Python.3.12',
    ffmpeg: 'Gyan.FFmpeg',
    docker: 'Docker.DockerDesktop',
  };

  if (osFamily === 'macos') {
    if (dependencyName === 'openclaw') return 'Follow the OpenClaw install instructions after the host passes preflight.';

    const brewPackage = macBrewPackages[dependencyName];
    if (!brewPackage) return undefined;

    if (brew?.detected) {
      return `brew install ${brewPackage}`;
    }

    return `Install Homebrew from ${HOMEBREW_INSTALL_URL}, then run: brew install ${brewPackage}`;
  }

  if (osFamily === 'linux') {
    if (dependencyName === 'openclaw') return 'Install OpenClaw after the required Linux prerequisites are present.';
    const linuxPackage = linuxPackages[dependencyName];
    if (!linuxPackage) return undefined;

    if (apt?.detected && linuxPackage.apt) return `sudo apt-get install -y ${linuxPackage.apt}`;
    if (dnf?.detected && linuxPackage.dnf) return `sudo dnf install -y ${linuxPackage.dnf}`;
    if (yum?.detected && linuxPackage.yum) return `sudo yum install -y ${linuxPackage.yum}`;
    if (pacman?.detected && linuxPackage.pacman) return `sudo pacman -S --needed ${linuxPackage.pacman}`;

    return 'Install the missing dependency with your distro package manager and rerun preflight.';
  }

  if (osFamily === 'windows') {
    if (dependencyName === 'openclaw') return 'Install OpenClaw after the required Windows prerequisites are present.';

    const wingetPackage = windowsWingetPackages[dependencyName];
    if (wingetPackage) {
      return `winget install --id ${wingetPackage}`;
    }
  }

  return undefined;
}
