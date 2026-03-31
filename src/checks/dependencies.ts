import { DependencyResult, HostInfo, Importance } from '../types';
import { runCommand } from '../utils/exec';
import { getDependencyInstallHint } from '../utils/platform';

interface DependencySpec {
  name: string;
  command: string;
  versionArgs: string[];
  importance: Importance;
}

const DEPENDENCIES: DependencySpec[] = [
  { name: 'node', command: 'node', versionArgs: ['--version'], importance: 'required' },
  { name: 'npm', command: 'npm', versionArgs: ['--version'], importance: 'required' },
  { name: 'git', command: 'git', versionArgs: ['--version'], importance: 'recommended' },
  { name: 'python3', command: 'python3', versionArgs: ['--version'], importance: 'recommended' },
  { name: 'ffmpeg', command: 'ffmpeg', versionArgs: ['-version'], importance: 'recommended' },
  { name: 'uv', command: 'uv', versionArgs: ['--version'], importance: 'optional' },
  { name: 'docker', command: 'docker', versionArgs: ['--version'], importance: 'optional' },
  { name: 'openclaw', command: 'openclaw', versionArgs: ['--version'], importance: 'optional' },
];

function firstVersionLine(output: string): string | undefined {
  const line = output.split('\n').map((x) => x.trim()).find(Boolean);
  return line || undefined;
}

export async function checkDependencies(host: HostInfo): Promise<DependencyResult[]> {
  const results = await Promise.all(
    DEPENDENCIES.map(async (dep) => {
      const result = await runCommand(dep.command, dep.versionArgs, 4000);
      const installed = result.ok;
      return {
        name: dep.name,
        command: dep.command,
        importance: dep.importance,
        installed,
        version: installed ? firstVersionLine(result.stdout || result.stderr) : undefined,
        error: installed ? undefined : firstVersionLine(result.stderr || result.stdout || 'Command not available'),
        installHint: installed ? undefined : getDependencyInstallHint(dep.name, host.osFamily, host.packageManagers),
      } satisfies DependencyResult;
    }),
  );

  return results;
}
