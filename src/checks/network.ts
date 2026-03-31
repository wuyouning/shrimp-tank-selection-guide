import dns from 'node:dns/promises';
import { NetworkCheckResult } from '../types';

async function withTimeout<T>(promise: Promise<T>, timeoutSec: number): Promise<T> {
  const timeoutMs = timeoutSec * 1000;
  return await Promise.race([
    promise,
    new Promise<T>((_, reject) => setTimeout(() => reject(new Error(`Timed out after ${timeoutSec}s`)), timeoutMs)),
  ]);
}

async function timed<T>(fn: () => Promise<T>): Promise<{ ok: boolean; latencyMs: number; value?: T; error?: string }> {
  const start = Date.now();
  try {
    const value = await fn();
    return { ok: true, latencyMs: Date.now() - start, value };
  } catch (error: any) {
    return { ok: false, latencyMs: Date.now() - start, error: error?.message || 'Unknown error' };
  }
}

async function httpHead(url: string, timeoutSec: number) {
  return await timed(async () => {
    const response = await withTimeout(fetch(url, { method: 'HEAD', redirect: 'follow' }), timeoutSec);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return response;
  });
}

export async function checkNetwork(timeoutSec: number): Promise<NetworkCheckResult[]> {
  const checks: NetworkCheckResult[] = [];

  const dnsTargets = ['openclaw.ai', 'github.com'];
  for (const target of dnsTargets) {
    const result = await timed(() => withTimeout(dns.lookup(target), timeoutSec));
    checks.push({
      name: `dns-${target.replace(/\./g, '-')}`,
      target,
      ok: result.ok,
      latencyMs: result.latencyMs,
      details: result.ok && result.value ? JSON.stringify(result.value) : undefined,
      error: result.error,
    });
  }

  const urls = ['https://github.com', 'https://openclaw.ai', 'https://www.google.com'];
  for (const url of urls) {
    const result = await httpHead(url, timeoutSec);
    checks.push({
      name: `https-${new URL(url).hostname.replace(/\./g, '-')}`,
      target: url,
      ok: result.ok,
      latencyMs: result.latencyMs,
      statusCode: result.value?.status,
      error: result.error,
    });
  }

  return checks;
}
