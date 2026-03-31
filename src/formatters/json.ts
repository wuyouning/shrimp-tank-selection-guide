import { PreflightReport } from '../types';

export function formatJson(report: PreflightReport): string {
  return JSON.stringify(report, null, 2);
}
