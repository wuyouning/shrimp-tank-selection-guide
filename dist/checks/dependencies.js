"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkDependencies = checkDependencies;
const exec_1 = require("../utils/exec");
const platform_1 = require("../utils/platform");
const DEPENDENCIES = [
    { name: 'node', command: 'node', versionArgs: ['--version'], importance: 'required' },
    { name: 'npm', command: 'npm', versionArgs: ['--version'], importance: 'required' },
    { name: 'git', command: 'git', versionArgs: ['--version'], importance: 'recommended' },
    { name: 'python3', command: 'python3', versionArgs: ['--version'], importance: 'recommended' },
    { name: 'ffmpeg', command: 'ffmpeg', versionArgs: ['-version'], importance: 'recommended' },
    { name: 'uv', command: 'uv', versionArgs: ['--version'], importance: 'optional' },
    { name: 'docker', command: 'docker', versionArgs: ['--version'], importance: 'optional' },
    { name: 'openclaw', command: 'openclaw', versionArgs: ['--version'], importance: 'optional' },
];
function firstVersionLine(output) {
    const line = output.split('\n').map((x) => x.trim()).find(Boolean);
    return line || undefined;
}
async function checkDependencies(host) {
    const results = await Promise.all(DEPENDENCIES.map(async (dep) => {
        const result = await (0, exec_1.runCommand)(dep.command, dep.versionArgs, 4000);
        const installed = result.ok;
        return {
            name: dep.name,
            command: dep.command,
            importance: dep.importance,
            installed,
            version: installed ? firstVersionLine(result.stdout || result.stderr) : undefined,
            error: installed ? undefined : firstVersionLine(result.stderr || result.stdout || 'Command not available'),
            installHint: installed ? undefined : (0, platform_1.getDependencyInstallHint)(dep.name, host.osFamily, host.packageManagers),
        };
    }));
    return results;
}
//# sourceMappingURL=dependencies.js.map