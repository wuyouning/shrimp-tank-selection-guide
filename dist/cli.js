#!/usr/bin/env node
"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const node_fs_1 = __importDefault(require("node:fs"));
const node_path_1 = __importDefault(require("node:path"));
const commander_1 = require("commander");
const dependencies_1 = require("./checks/dependencies");
const fit_1 = require("./checks/fit");
const hardware_1 = require("./checks/hardware");
const network_1 = require("./checks/network");
const system_1 = require("./checks/system");
const json_1 = require("./formatters/json");
const text_1 = require("./formatters/text");
const VERSION = '1.0.0';
const VALID_PROFILES = ['light', 'standard', 'media', 'multi-agent'];
async function buildReport(options) {
    const host = await (0, system_1.getHostInfo)();
    const [hardware, dependencies, networkChecks] = await Promise.all([
        (0, hardware_1.getHardwareInfo)(),
        (0, dependencies_1.checkDependencies)(host),
        (0, network_1.checkNetwork)(options.timeout),
    ]);
    const assessed = (0, fit_1.assessFit)(host, hardware, dependencies, networkChecks, options.profile);
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
function writeOutput(filePath, content) {
    node_fs_1.default.mkdirSync(node_path_1.default.dirname(filePath), { recursive: true });
    node_fs_1.default.writeFileSync(filePath, content, 'utf8');
}
function parseOptions() {
    const program = new commander_1.Command();
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
    const profile = opts.profile;
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
    const content = options.json ? (0, json_1.formatJson)(report) : (0, text_1.formatText)(report, options.verbose);
    if (options.output)
        writeOutput(options.output, content);
    console.log(content);
    if (report.summary.status === 'FAIL')
        process.exitCode = 2;
    else if (report.summary.status === 'LIMITED')
        process.exitCode = 1;
    else
        process.exitCode = 0;
}
main().catch((error) => {
    console.error(error instanceof Error ? error.message : String(error));
    process.exit(2);
});
//# sourceMappingURL=cli.js.map