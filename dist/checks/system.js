"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getHostInfo = getHostInfo;
const node_os_1 = __importDefault(require("node:os"));
const platform_1 = require("../utils/platform");
function safeUptime() {
    try {
        return node_os_1.default.uptime();
    }
    catch {
        return 0;
    }
}
async function getHostInfo() {
    const platform = node_os_1.default.platform();
    const release = node_os_1.default.release();
    const osFamily = (0, platform_1.detectOsFamily)(platform);
    const [packageManagers, windows] = await Promise.all([(0, platform_1.detectPackageManagers)(osFamily), (0, platform_1.buildWindowsPosture)(osFamily)]);
    return {
        hostname: node_os_1.default.hostname(),
        platform,
        osFamily,
        osLabel: (0, platform_1.formatOsLabel)(platform, release),
        release,
        arch: node_os_1.default.arch(),
        shell: process.env.SHELL || process.env.ComSpec,
        nodeVersion: process.version,
        uptimeSec: safeUptime(),
        user: process.env.USER || process.env.LOGNAME || process.env.USERNAME,
        packageManagers,
        windows,
    };
}
//# sourceMappingURL=system.js.map