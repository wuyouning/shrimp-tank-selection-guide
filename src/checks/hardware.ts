import fs from 'node:fs';
import os from 'node:os';
import { execSync } from 'node:child_process';
import { HardwareInfo } from '../types';

function getDiskProbePath(): string {
  if (os.platform() === 'win32') {
    return process.cwd();
  }

  return '/';
}

function getDiskInfo(): { free?: number; total?: number } {
  const probePath = getDiskProbePath();

  try {
    if (os.platform() !== 'win32') {
      const output = execSync(`df -k ${probePath}`, { encoding: 'utf8' }).trim().split('\n');
      const line = output[output.length - 1]?.trim().split(/\s+/) ?? [];
      const totalKb = Number(line[1]);
      const availableKb = Number(line[3]);
      if (!Number.isNaN(totalKb) && !Number.isNaN(availableKb)) {
        return { total: totalKb * 1024, free: availableKb * 1024 };
      }
    }
  } catch {}

  try {
    const stat = fs.statfsSync(probePath);
    return {
      total: stat.bsize * stat.blocks,
      free: stat.bsize * stat.bavail,
    };
  } catch {}

  return {};
}

export async function getHardwareInfo(): Promise<HardwareInfo> {
  const cpus = os.cpus();
  const disk = getDiskInfo();

  return {
    cpuModel: cpus[0]?.model || 'Unknown CPU',
    cpuCores: cpus.length,
    totalMemoryBytes: os.totalmem(),
    freeMemoryBytes: os.freemem(),
    loadAverage: os.loadavg(),
    diskFreeBytes: disk.free,
    diskTotalBytes: disk.total,
  };
}
