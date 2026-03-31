#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { Command } from 'commander';
import { checkDependencies } from './checks/dependencies';
import { assessFit } from './checks/fit';
import { getHardwareInfo } from './checks/hardware';
import { checkNetwork } from './checks/network';
import { getHostInfo } from './checks/system';
import { formatJson } from './formatters/json';
import { formatText } from './formatters/text';
import { PreflightReport, Profile, RunOptions } from './types';

const VERSION = '1.0.0';
const VALID_PROFILES: Profile[] = ['light', 'standard', 'media', 'multi-agent'];

async function buildReport(options: RunOptions): Promise<PreflightReport> {
  const host = await getHostInfo();
  const [hardware, dependencies, networkChecks] = await Promise.all([
    getHardwareInfo(),
    checkDependencies(host),
    checkNetwork(options.timeout),
  ]);

  const assessed = assessFit(host, hardware, dependencies, networkChecks, options.profile);

  return {
    tool: 'openclaw-preflight',
    version: VERSION,
    timestamp: new Date().toISOString(),
    profile: options.profile,
    summary: {
      status: assessed.status,
      score: assessed.score,
    },
    host,
    hardware,
    dependencies,
    network: {
      checks: networkChecks,
    },
    fit: assessed.fit,
    warnings: assessed.warnings,
    recommendations: assessed.recommendations,
  };
}

function writeOutput(filePath: string, content: string) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, content, 'utf8');
}

function parseOptions(): RunOptions {
  const program = new Command();
  program
    .name('openclaw-preflight')
    .version(VERSION)
    .description('Preflight checker for OpenClaw host readiness')
    .option('--json', 'output JSON')
    .option('--output <path>', 'write output to file')
    .option('--verbose', 'show more detail')
    .option('--timeout <seconds>', 'network timeout in seconds', '5')
    .option('--profile <profile>', 'light | standard | media | multi-agent', 'standard');

  program.parse(process.argv);
  const opts = program.opts();
  const profile = opts.profile as Profile;

  if (!VALID_PROFILES.includes(profile)) {
    throw new Error(`Invalid profile: ${opts.profile}. Use one of: ${VALID_PROFILES.join(', ')}`);
  }

  const timeout = Number(opts.timeout);
  if (!Number.isFinite(timeout) || timeout <= 0) {
    throw new Error(`Invalid timeout: ${opts.timeout}`);
  }

  return {
    json: Boolean(opts.json),
    output: opts.output,
    verbose: Boolean(opts.verbose),
    timeout,
    profile,
  };
}

async function main() {
  const options = parseOptions();
  const report = await buildReport(options);
  const content = options.json ? formatJson(report) : formatText(report, options.verbose);

  if (options.output) writeOutput(options.output, content);
  console.log(content);

  if (report.summary.status === 'FAIL') process.exitCode = 2;
  else if (report.summary.status === 'LIMITED') process.exitCode = 1;
  else process.exitCode = 0;
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exit(2);
});
