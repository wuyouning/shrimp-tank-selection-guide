"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkNetwork = checkNetwork;
const promises_1 = __importDefault(require("node:dns/promises"));
async function withTimeout(promise, timeoutSec) {
    const timeoutMs = timeoutSec * 1000;
    return await Promise.race([
        promise,
        new Promise((_, reject) => setTimeout(() => reject(new Error(`Timed out after ${timeoutSec}s`)), timeoutMs)),
    ]);
}
async function timed(fn) {
    const start = Date.now();
    try {
        const value = await fn();
        return { ok: true, latencyMs: Date.now() - start, value };
    }
    catch (error) {
        return { ok: false, latencyMs: Date.now() - start, error: error?.message || 'Unknown error' };
    }
}
async function httpHead(url, timeoutSec) {
    return await timed(async () => {
        const response = await withTimeout(fetch(url, { method: 'HEAD', redirect: 'follow' }), timeoutSec);
        if (!response.ok)
            throw new Error(`HTTP ${response.status}`);
        return response;
    });
}
async function checkNetwork(timeoutSec) {
    const checks = [];
    const dnsTargets = ['openclaw.ai', 'github.com'];
    for (const target of dnsTargets) {
        const result = await timed(() => withTimeout(promises_1.default.lookup(target), timeoutSec));
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
//# sourceMappingURL=network.js.map