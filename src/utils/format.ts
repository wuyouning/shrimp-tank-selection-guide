export function bytesToGb(bytes?: number): number {
  return bytes ? bytes / 1024 / 1024 / 1024 : 0;
}

export function formatBytes(bytes?: number): string {
  if (!bytes) return 'unknown';
  const gb = bytesToGb(bytes);
  if (gb >= 1) return `${gb.toFixed(1)} GB`;
  return `${(bytes / 1024 / 1024).toFixed(0)} MB`;
}

export function uniq(values: string[]): string[] {
  return [...new Set(values.filter(Boolean))];
}
