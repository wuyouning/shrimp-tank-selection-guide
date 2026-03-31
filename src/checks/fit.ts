import {
  DependencyResult,
  FitAssessment,
  HardwareInfo,
  HostInfo,
  NetworkCheckResult,
  Profile,
  ScoreBreakdownItem,
  ScoreSection,
  SummaryStatus,
} from '../types';
import { bytesToGb, uniq } from '../utils/format';

function describeMissingDependencies(dependencies: DependencyResult[]): string {
  return dependencies.map((entry) => entry.name).join(', ');
}

function collectInstallHints(dependencies: DependencyResult[]): string[] {
  return dependencies
    .filter((dependency) => !dependency.installed && dependency.installHint)
    .map((dependency) => `${dependency.name}: ${dependency.installHint!}`);
}

function addScore(
  items: ScoreBreakdownItem[],
  section: ScoreSection,
  key: string,
  label: string,
  points: number,
  maxPoints?: number,
  note?: string,
) {
  items.push({ key, label, points, maxPoints, note, section });
}

export function assessFit(
  host: HostInfo,
  hardware: HardwareInfo,
  dependencies: DependencyResult[],
  networkChecks: NetworkCheckResult[],
  profile: Profile,
): {
  fit: FitAssessment;
  warnings: string[];
  recommendations: string[];
  score: number;
  rawScore: number;
  bonusPoints: number;
  standardMax: number;
  softwareScore: number;
  hardwareScore: number;
  realtimeScore: number;
  scoreBreakdown: ScoreBreakdownItem[];
  status: SummaryStatus;
} {
  const warnings: string[] = [];
  const recommendations: string[] = [];
  const scoreBreakdown: ScoreBreakdownItem[] = [];
  const standardMax = 100;

  const requiredMissing = dependencies.filter((d) => d.importance === 'required' && !d.installed);
  const recommendedMissing = dependencies.filter((d) => d.importance === 'recommended' && !d.installed);
  const failedNetwork = networkChecks.filter((c) => !c.ok);
  const missingInstallHints = collectInstallHints([...requiredMissing, ...recommendedMissing]);

  const totalMemGb = bytesToGb(hardware.totalMemoryBytes);
  const freeMemGb = bytesToGb(hardware.freeMemoryBytes);
  const freeDiskGb = bytesToGb(hardware.diskFreeBytes);
  const cores = hardware.cpuCores;
  const hasFfmpeg = !dependencies.find((d) => d.name === 'ffmpeg' && !d.installed);
  const hasDocker = !dependencies.find((d) => d.name === 'docker' && !d.installed);
  const hasUv = !dependencies.find((d) => d.name === 'uv' && !d.installed);
  const hasOpenClaw = !dependencies.find((d) => d.name === 'openclaw' && !d.installed);
  const networkSuccessCount = networkChecks.filter((check) => check.ok).length;
  const load1 = hardware.loadAverage?.[0] ?? 0;

  let softwareScore = 0;
  let hardwareScore = 0;
  let realtimeScore = 0;
  let bonusPoints = 0;

  const runtimeScore = requiredMissing.length === 0 ? 20 : 0;
  softwareScore += runtimeScore;
  addScore(
    scoreBreakdown,
    'software',
    'runtime-baseline',
    'Runtime baseline',
    runtimeScore,
    20,
    'Node 24 is the recommended OpenClaw runtime; Node 22.14+ is the supported floor.',
  );

  let dependencyScore = 20;
  if (recommendedMissing.length) dependencyScore -= Math.min(12, recommendedMissing.length * 4);
  if (!hasFfmpeg) dependencyScore -= 5;
  if (!hasUv) dependencyScore -= 2;
  if (requiredMissing.length) dependencyScore = Math.max(0, dependencyScore - 10);
  dependencyScore = Math.max(0, dependencyScore);
  softwareScore += dependencyScore;
  addScore(
    scoreBreakdown,
    'software',
    'tooling-baseline',
    'Tooling baseline',
    dependencyScore,
    20,
    'Measures install-critical and day-to-day helper tooling such as git, python3, ffmpeg, uv, and docker.',
  );

  let platformScore = 2;
  if (host.osFamily === 'macos' || host.osFamily === 'windows' || host.osFamily === 'linux') platformScore = 4;
  if (host.osFamily === 'macos' && host.packageManagers.find((x) => x.name === 'homebrew')?.detected) platformScore = 5;
  if (host.osFamily === 'linux' && host.packageManagers.some((x) => ['apt', 'dnf', 'yum', 'pacman'].includes(x.name) && x.detected)) platformScore = 5;
  if (host.osFamily === 'windows' && host.windows.admin.canEvaluate) platformScore = 5;
  softwareScore += platformScore;
  addScore(
    scoreBreakdown,
    'software',
    'platform-readiness',
    'Platform readiness',
    platformScore,
    5,
    'Rewards hosts where package management and platform-specific setup paths are clearly available.',
  );

  let memoryCapacityScore = 0;
  if (totalMemGb >= 16) memoryCapacityScore = 20;
  else if (totalMemGb >= 8) memoryCapacityScore = 16;
  else if (totalMemGb >= 4) memoryCapacityScore = 10;
  else memoryCapacityScore = 2;
  hardwareScore += memoryCapacityScore;
  addScore(
    scoreBreakdown,
    'hardware',
    'memory-capacity',
    'Memory capacity',
    memoryCapacityScore,
    20,
    '4 GB is the usable floor, 8 GB is comfortable, and 16 GB is the standard target for heavier OpenClaw work.',
  );

  let cpuScore = 0;
  if (cores >= 8) cpuScore = 15;
  else if (cores >= 4) cpuScore = 10;
  else cpuScore = 4;
  hardwareScore += cpuScore;
  addScore(
    scoreBreakdown,
    'hardware',
    'cpu-concurrency',
    'CPU concurrency',
    cpuScore,
    15,
    'Higher logical core counts improve concurrent tool use, automation, and multi-agent throughput.',
  );

  let diskCapacityScore = 0;
  if (freeDiskGb >= 20) diskCapacityScore = 10;
  else if (freeDiskGb >= 10) diskCapacityScore = 8;
  else if (freeDiskGb >= 5) diskCapacityScore = 5;
  else diskCapacityScore = 1;
  hardwareScore += diskCapacityScore;
  addScore(
    scoreBreakdown,
    'hardware',
    'disk-capacity',
    'Disk headroom',
    diskCapacityScore,
    10,
    'Free disk matters for packages, caches, media outputs, logs, and sandbox images.',
  );

  let networkScore = 15;
  networkScore -= failedNetwork.length * 4;
  networkScore = Math.max(0, networkScore);
  realtimeScore += networkScore;
  addScore(
    scoreBreakdown,
    'realtime',
    'network-readiness',
    'Network readiness',
    networkScore,
    15,
    'Reflects current DNS and outbound HTTPS conditions for installs, updates, model APIs, and docs access.',
  );

  let memoryAvailabilityScore = 10;
  if (freeMemGb < 1) memoryAvailabilityScore = 5;
  if (freeMemGb < 0.5) memoryAvailabilityScore = 2;
  if (freeMemGb <= 0) memoryAvailabilityScore = 0;
  realtimeScore += memoryAvailabilityScore;
  addScore(
    scoreBreakdown,
    'realtime',
    'memory-availability',
    'Current free memory',
    memoryAvailabilityScore,
    10,
    'A live snapshot of how much headroom is currently free right now, separate from installed RAM capacity.',
  );

  let loadScore = 5;
  if (load1 > Math.max(cores, 1) * 1.2) loadScore = 1;
  else if (load1 > Math.max(cores, 1) * 0.8) loadScore = 3;
  realtimeScore += loadScore;
  addScore(
    scoreBreakdown,
    'realtime',
    'system-load',
    'Current system load',
    loadScore,
    5,
    'Captures whether the machine is already under pressure at the moment this check runs.',
  );

  if (totalMemGb >= 32) {
    bonusPoints += 8;
    addScore(scoreBreakdown, 'bonus', 'bonus-large-memory-pool', 'Bonus: large memory pool', 8, undefined, '32 GB+ gives extra room for media-heavy and parallel workloads.');
  } else if (totalMemGb >= 24) {
    bonusPoints += 4;
    addScore(scoreBreakdown, 'bonus', 'bonus-extra-memory-headroom', 'Bonus: extra memory headroom', 4, undefined, '24 GB+ is meaningfully above the standard host baseline.');
  }

  if (cores >= 12) {
    bonusPoints += 6;
    addScore(scoreBreakdown, 'bonus', 'bonus-high-core-count', 'Bonus: high core count', 6, undefined, '12+ logical cores provide strong concurrency headroom for heavier agent use.');
  } else if (cores >= 8) {
    bonusPoints += 2;
    addScore(scoreBreakdown, 'bonus', 'bonus-healthy-core-count', 'Bonus: healthy core count', 2, undefined, '8+ cores exceed the baseline target.');
  }

  if (freeDiskGb >= 100) {
    bonusPoints += 3;
    addScore(scoreBreakdown, 'bonus', 'bonus-ample-free-disk', 'Bonus: ample free disk', 3, undefined, 'Large free disk helps with sandboxes, media outputs, and longer-lived logs.');
  }

  if (networkSuccessCount === networkChecks.length && networkChecks.length > 0) {
    bonusPoints += 3;
    addScore(scoreBreakdown, 'bonus', 'bonus-clean-network-sweep', 'Bonus: clean network sweep', 3, undefined, 'All configured network checks passed in the current run.');
  }

  if (hasDocker) {
    bonusPoints += 2;
    addScore(scoreBreakdown, 'bonus', 'bonus-docker-available', 'Bonus: Docker available', 2, undefined, 'Useful for containerized deployments and sandbox workflows.');
  }

  if (hasUv) {
    bonusPoints += 1;
    addScore(scoreBreakdown, 'bonus', 'bonus-uv-available', 'Bonus: uv available', 1, undefined, 'Useful for Python-oriented skills and tooling.');
  }

  if (hasOpenClaw) {
    bonusPoints += 2;
    addScore(scoreBreakdown, 'bonus', 'bonus-openclaw-installed', 'Bonus: OpenClaw already installed', 2, undefined, 'Shows the host already cleared the basic CLI path once.');
  }

  if (profile === 'media' && totalMemGb >= 16 && cores >= 8 && hasFfmpeg) {
    bonusPoints += 4;
    addScore(scoreBreakdown, 'bonus', 'bonus-media-ready-host', 'Bonus: media-ready host', 4, undefined, 'Exceeds the standard media baseline with enough memory, CPU, and ffmpeg.');
  }

  if (profile === 'multi-agent' && totalMemGb >= 16 && cores >= 12) {
    bonusPoints += 4;
    addScore(scoreBreakdown, 'bonus', 'bonus-multi-agent-headroom', 'Bonus: multi-agent headroom', 4, undefined, 'Clearly above the minimum concurrency profile target.');
  }

  const rawScore = softwareScore + hardwareScore + realtimeScore;
  const score = rawScore + bonusPoints;

  if (requiredMissing.length) {
    warnings.push(`Missing required dependencies: ${describeMissingDependencies(requiredMissing)}`);
    recommendations.push('Install the missing required dependencies before deploying OpenClaw.');
  }

  if (recommendedMissing.length) {
    warnings.push(`Missing recommended dependencies: ${describeMissingDependencies(recommendedMissing)}`);
    recommendations.push('Add recommended tooling such as git, python3, and ffmpeg for a smoother setup.');
  }

  if (failedNetwork.length) {
    warnings.push(`Network checks failed: ${failedNetwork.map((x) => x.name).join(', ')}`);
    recommendations.push('Check DNS, proxy settings, outbound HTTPS access, and any corporate network controls.');
  }

  if (totalMemGb < 4) {
    warnings.push(`Low memory: about ${totalMemGb.toFixed(1)} GB total`);
    recommendations.push('Use at least 4 GB RAM, and prefer 8 GB or more for stable day-to-day usage.');
  } else if (totalMemGb < 8) {
    warnings.push(`Limited memory headroom: about ${totalMemGb.toFixed(1)} GB total`);
    recommendations.push('Upgrade to 8 GB or more if you want steadier background usage or more concurrent work.');
  }

  if (freeMemGb > 0 && freeMemGb < 1) {
    warnings.push(`Low free memory right now: about ${freeMemGb.toFixed(1)} GB`);
    recommendations.push('Close high-memory apps and rerun the check to avoid scoring against a transient spike.');
  }

  if (freeDiskGb > 0 && freeDiskGb < 5) {
    warnings.push(`Low free disk space: about ${freeDiskGb.toFixed(1)} GB`);
    recommendations.push('Keep at least 5-10 GB of free disk space for packages, caches, and temp files.');
  }

  if (cores < 4) {
    warnings.push(`Low CPU core count: ${cores}`);
    recommendations.push('Use a stronger multi-core CPU if you plan to run concurrent tasks or media workloads.');
  }

  if (load1 > Math.max(cores, 1) * 1.2) {
    warnings.push(`High current system load: 1m load is ${load1.toFixed(2)} on ${cores} cores`);
    recommendations.push('Rerun preflight when the machine is idle to separate permanent limits from temporary pressure.');
  }

  if (profile === 'media' && totalMemGb < 16) {
    warnings.push('The media profile has limited memory headroom on this machine.');
    recommendations.push('Media workflows are more comfortable with 16 GB RAM or more and stronger compute/GPU support.');
  }

  if (profile === 'multi-agent' && (totalMemGb < 8 || cores < 8)) {
    warnings.push('The multi-agent profile has limited concurrency headroom here.');
    recommendations.push('For multi-agent usage, target at least 8 CPU cores and 8 GB RAM.');
  }

  if (host.osFamily === 'macos') {
    const brew = host.packageManagers.find((manager) => manager.name === 'homebrew');
    if (!brew?.detected) {
      warnings.push('Homebrew is not installed on this macOS host.');
      recommendations.push(...(brew?.suggestions || ['Install Homebrew to streamline dependency setup on macOS.']));
    }
  }

  if (host.osFamily === 'linux' && !host.packageManagers.some((manager) => ['apt', 'dnf', 'yum', 'pacman'].includes(manager.name) && manager.detected)) {
    warnings.push('No supported Linux package manager was detected.');
    recommendations.push('Add distro-specific package manager detection or ensure the runtime PATH exposes apt, dnf, yum, or pacman.');
  }

  if (host.osFamily === 'windows') {
    recommendations.push(...host.windows.recommendations);
    if (host.windows.admin.canEvaluate && host.windows.admin.isElevated === false) {
      warnings.push('This Windows session is not elevated.');
    }
  }

  if (missingInstallHints.length) {
    recommendations.push(...missingInstallHints);
  }

  let status: SummaryStatus = 'PASS';
  if (requiredMissing.length || rawScore < 45) status = 'FAIL';
  else if (rawScore < 60) status = 'LIMITED';
  else if (warnings.length) status = 'PASS_WITH_WARNINGS';

  const fit: FitAssessment = {
    chat: totalMemGb >= 4 && requiredMissing.length === 0 && failedNetwork.length <= 1 ? 'good' : totalMemGb >= 4 ? 'limited' : 'poor',
    automation: totalMemGb >= 4 && recommendedMissing.length < 2 ? 'good' : totalMemGb >= 4 ? 'limited' : 'poor',
    multiAgent: totalMemGb >= 8 && cores >= 8 ? 'good' : totalMemGb >= 4 ? 'limited' : 'poor',
    media: totalMemGb >= 16 && cores >= 8 && hasFfmpeg ? 'good' : totalMemGb >= 8 && hasFfmpeg ? 'limited' : 'poor',
  };

  return {
    fit,
    warnings: uniq(warnings),
    recommendations: uniq(recommendations),
    score,
    rawScore,
    bonusPoints,
    standardMax,
    softwareScore,
    hardwareScore,
    realtimeScore,
    scoreBreakdown,
    status,
  };
}
