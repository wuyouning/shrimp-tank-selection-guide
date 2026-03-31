export type Profile = 'light' | 'standard' | 'media' | 'multi-agent';
export type OsFamily = 'macos' | 'linux' | 'windows' | 'unknown';
export type Language = 'en' | 'zh-CN';

export type SummaryStatus = 'PASS' | 'PASS_WITH_WARNINGS' | 'LIMITED' | 'FAIL';
export type FitLevel = 'good' | 'limited' | 'poor';
export type Importance = 'required' | 'recommended' | 'optional';
export type CheckCategory = 'system' | 'dependency' | 'network' | 'hardware';
export type PackageManagerName = 'homebrew' | 'apt' | 'dnf' | 'yum' | 'pacman' | 'winget';

export interface PackageManagerStatus {
  name: PackageManagerName;
  detected: boolean;
  version?: string;
  installUrl?: string;
  suggestions: string[];
}

export interface PrivilegeCheck {
  canEvaluate: boolean;
  isElevated?: boolean;
  method: string;
  details?: string;
}

export interface WindowsPosture {
  runningOnWindows: boolean;
  admin: PrivilegeCheck;
  recommendations: string[];
  notes: string[];
}

export interface DependencyResult {
  name: string;
  command: string;
  importance: Importance;
  installed: boolean;
  version?: string;
  error?: string;
  installHint?: string;
}

export interface NetworkCheckResult {
  name: string;
  target: string;
  ok: boolean;
  latencyMs?: number;
  statusCode?: number;
  details?: string;
  error?: string;
}

export interface HostInfo {
  hostname: string;
  platform: string;
  osFamily: OsFamily;
  osLabel: string;
  release: string;
  arch: string;
  shell?: string;
  nodeVersion: string;
  uptimeSec: number;
  user?: string;
  packageManagers: PackageManagerStatus[];
  windows: WindowsPosture;
}

export interface HardwareInfo {
  cpuModel: string;
  cpuCores: number;
  totalMemoryBytes: number;
  freeMemoryBytes: number;
  loadAverage?: number[];
  diskFreeBytes?: number;
  diskTotalBytes?: number;
}

export interface FitAssessment {
  chat: FitLevel;
  automation: FitLevel;
  multiAgent: FitLevel;
  media: FitLevel;
}

export interface ScoreBreakdownItem {
  key: string;
  label: string;
  points: number;
  maxPoints?: number;
  note?: string;
}

export interface ScoreBreakdown {
  standardMax: number;
  rawScore: number;
  cappedScore: number;
  bonusPoints: number;
  items: ScoreBreakdownItem[];
}

export interface ReportSummary {
  status: SummaryStatus;
  score: number;
  standardMax: number;
  bonusPoints: number;
}

export interface PreflightReport {
  tool: 'openclaw-preflight';
  version: string;
  timestamp: string;
  profile: Profile;
  language: Language;
  summary: ReportSummary;
  host: HostInfo;
  hardware: HardwareInfo;
  dependencies: DependencyResult[];
  network: {
    checks: NetworkCheckResult[];
  };
  fit: FitAssessment;
  scoreBreakdown: ScoreBreakdown;
  warnings: string[];
  recommendations: string[];
}

export interface RunOptions {
  json?: boolean;
  output?: string;
  verbose?: boolean;
  timeout: number;
  profile: Profile;
  lang: Language;
}
