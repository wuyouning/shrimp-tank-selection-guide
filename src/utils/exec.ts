import { execFile } from 'node:child_process';
import { promisify } from 'node:util';

const execFileAsync = promisify(execFile);

export interface CommandResult {
  ok: boolean;
  stdout: string;
  stderr: string;
  code?: number;
}

export async function runCommand(command: string, args: string[] = [], timeoutMs = 4000): Promise<CommandResult> {
  try {
    const { stdout, stderr } = await execFileAsync(command, args, { timeout: timeoutMs, encoding: 'utf8' });
    return {
      ok: true,
      stdout: String(stdout ?? '').trim(),
      stderr: String(stderr ?? '').trim(),
      code: 0,
    };
  } catch (error: any) {
    return {
      ok: false,
      stdout: String(error?.stdout ?? '').trim(),
      stderr: String(error?.stderr ?? error?.message ?? 'Unknown error').trim(),
      code: typeof error?.code === 'number' ? error.code : undefined,
    };
  }
}
