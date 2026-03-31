import os from 'node:os';
import { HostInfo } from '../types';
import { buildWindowsPosture, detectHomebrew, detectOsFamily, formatOsLabel } from '../utils/platform';

function safeUptime(): number {
  try {
    return os.uptime();
  } catch {
    return 0;
  }
}

export async function getHostInfo(): Promise<HostInfo> {
  const platform = os.platform();
  const release = os.release();
  const osFamily = detectOsFamily(platform);
  const [homebrew, windows] = await Promise.all([detectHomebrew(osFamily), buildWindowsPosture(osFamily)]);

  return {
    hostname: os.hostname(),
    platform,
    osFamily,
    osLabel: formatOsLabel(platform, release),
    release,
    arch: os.arch(),
    shell: process.env.SHELL || process.env.ComSpec,
    nodeVersion: process.version,
    uptimeSec: safeUptime(),
    user: process.env.USER || process.env.LOGNAME || process.env.USERNAME,
    packageManagers: homebrew ? [homebrew] : [],
    windows,
  };
}
