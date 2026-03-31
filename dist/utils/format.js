"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.bytesToGb = bytesToGb;
exports.formatBytes = formatBytes;
exports.uniq = uniq;
function bytesToGb(bytes) {
    return bytes ? bytes / 1024 / 1024 / 1024 : 0;
}
function formatBytes(bytes) {
    if (!bytes)
        return 'unknown';
    const gb = bytesToGb(bytes);
    if (gb >= 1)
        return `${gb.toFixed(1)} GB`;
    return `${(bytes / 1024 / 1024).toFixed(0)} MB`;
}
function uniq(values) {
    return [...new Set(values.filter(Boolean))];
}
//# sourceMappingURL=format.js.map