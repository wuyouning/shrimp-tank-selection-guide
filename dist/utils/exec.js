"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.runCommand = runCommand;
const node_child_process_1 = require("node:child_process");
const node_util_1 = require("node:util");
const execFileAsync = (0, node_util_1.promisify)(node_child_process_1.execFile);
async function runCommand(command, args = [], timeoutMs = 4000) {
    try {
        const { stdout, stderr } = await execFileAsync(command, args, { timeout: timeoutMs, encoding: 'utf8' });
        return {
            ok: true,
            stdout: String(stdout ?? '').trim(),
            stderr: String(stderr ?? '').trim(),
            code: 0,
        };
    }
    catch (error) {
        return {
            ok: false,
            stdout: String(error?.stdout ?? '').trim(),
            stderr: String(error?.stderr ?? error?.message ?? 'Unknown error').trim(),
            code: typeof error?.code === 'number' ? error.code : undefined,
        };
    }
}
//# sourceMappingURL=exec.js.map