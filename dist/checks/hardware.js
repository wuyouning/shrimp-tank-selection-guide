"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getHardwareInfo = getHardwareInfo;
const node_fs_1 = __importDefault(require("node:fs"));
const node_os_1 = __importDefault(require("node:os"));
const node_child_process_1 = require("node:child_process");
function getDiskProbePath() {
    if (node_os_1.default.platform() === 'win32') {
        return process.cwd();
    }
    return '/';
}
function getDiskInfo() {
    const probePath = getDiskProbePath();
    try {
        if (node_os_1.default.platform() !== 'win32') {
            const output = (0, node_child_process_1.execSync)(`df -k ${probePath}`, { encoding: 'utf8' }).trim().split('\n');
            const line = output[output.length - 1]?.trim().split(/\s+/) ?? [];
            const totalKb = Number(line[1]);
            const availableKb = Number(line[3]);
            if (!Number.isNaN(totalKb) && !Number.isNaN(availableKb)) {
                return { total: totalKb * 1024, free: availableKb * 1024 };
            }
        }
    }
    catch { }
    try {
        const stat = node_fs_1.default.statfsSync(probePath);
        return {
            total: stat.bsize * stat.blocks,
            free: stat.bsize * stat.bavail,
        };
    }
    catch { }
    return {};
}
async function getHardwareInfo() {
    const cpus = node_os_1.default.cpus();
    const disk = getDiskInfo();
    return {
        cpuModel: cpus[0]?.model || 'Unknown CPU',
        cpuCores: cpus.length,
        totalMemoryBytes: node_os_1.default.totalmem(),
        freeMemoryBytes: node_os_1.default.freemem(),
        loadAverage: node_os_1.default.loadavg(),
        diskFreeBytes: disk.free,
        diskTotalBytes: disk.total,
    };
}
//# sourceMappingURL=hardware.js.map