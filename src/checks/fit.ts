import { DependencyResult, FitAssessment, HardwareInfo, HostInfo, NetworkCheckResult, Profile, SummaryStatus } from '../types';
import { bytesToGb, uniq } from '../utils/format';

function describeMissingDependencies(dependencies: DependencyResult[]): string {
  return dependencies.map((entry) => entry.name).join(', ');
}

function collectInstallHints(dependencies: DependencyResult[]): string[] {
  return dependencies
    .filter((dependency) => !dependency.installed && dependency.installHint)
    .map((dependency) => `${dependency.name}: ${dependency.installHint!}`);
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
  status: SummaryStatus;
} {
  const warnings: string[] = [];
  const recommendations: string[] = [];
  let score = 100;

  const requiredMissing = dependencies.filter((d) => d.importance === 'required' && !d.installed);
  const recommendedMissing = dependencies.filter((d) => d.importance === 'recommended' && !d.installed);
  const failedNetwork = networkChecks.filter((c) => !c.ok);
  const missingInstallHints = collectInstallHints([...requiredMissing, ...recommendedMissing]);

  const totalMemGb = bytesToGb(hardware.totalMemoryBytes);
  const freeMemGb = bytesToGb(hardware.freeMemoryBytes);
  const freeDiskGb = bytesToGb(hardware.diskFreeBytes);
  const cores = hardware.cpuCores;

  if (requiredMissing.length) {
    score -= 35;
    warnings.push(`Missing required dependencies: ${describeMissingDependencies(requiredMissing)}`);
    recommendations.push('Install the missing required dependencies before deploying OpenClaw.');
  }

  if (recommendedMissing.length) {
    score -= 10;
    warnings.push(`Missing recommended dependencies: ${describeMissingDependencies(recommendedMissing)}`);
    recommendations.push('Add recommended tooling such as git, python3, and ffmpeg for a smoother setup.');
  }

  if (failedNetwork.length) {
    score -= Math.min(20, failedNetwork.length * 8);
    warnings.push(`Network checks failed: ${failedNetwork.map((x) => x.name).join(', ')}`);
    recommendations.push('Check DNS, proxy settings, outbound HTTPS access, and any corporate network controls.');
  }

  if (totalMemGb < 4) {
    score -= 25;
    warnings.push(`Low memory: about ${totalMemGb.toFixed(1)} GB total`);
    recommendations.push('Use at least 4 GB RAM, and prefer 8 GB or more for stable day-to-day usage.');
  } else if (totalMemGb < 8) {
    score -= 10;
    warnings.push(`Limited memory headroom: about ${totalMemGb.toFixed(1)} GB total`);
    recommendations.push('Upgrade to 8 GB or more if you want steadier background usage or more concurrent work.');
  }

  if (freeMemGb > 0 && freeMemGb < 1) {
    score -= 10;
    warnings.push(`Low free memory right now: about ${freeMemGb.toFixed(1)} GB`);
    recommendations.push('Close high-memory apps and rerun the check to avoid scoring against a transient spike.');
  }

  if (freeDiskGb > 0 && freeDiskGb < 5) {
    score -= 20;
    warnings.push(`Low free disk space: about ${freeDiskGb.toFixed(1)} GB`);
    recommendations.push('Keep at least 5-10 GB of free disk space for packages, caches, and temp files.');
  }

  if (cores < 4) {
    score -= 10;
    warnings.push(`Low CPU core count: ${cores}`);
    recommendations.push('Use a stronger multi-core CPU if you plan to run concurrent tasks or media workloads.');
  }

  if (profile === 'media' && totalMemGb < 16) {
    score -= 10;
    warnings.push('The media profile has limited memory headroom on this machine.');
    recommendations.push('Media workflows are more comfortable with 16 GB RAM or more and stronger compute/GPU support.');
  }

  if (profile === 'multi-agent' && (totalMemGb < 8 || cores < 8)) {
    score -= 10;
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

  if (host.osFamily === 'windows') {
    recommendations.push(...host.windows.recommendations);
    if (host.windows.admin.canEvaluate && host.windows.admin.isElevated === false) {
      warnings.push('This Windows session is not elevated.');
    }
  }

  if (missingInstallHints.length) {
    recommendations.push(...missingInstallHints);
  }

  score = Math.max(0, Math.min(100, score));

  let status: SummaryStatus = 'PASS';
  if (requiredMissing.length || score < 45) status = 'FAIL';
  else if (score < 60) status = 'LIMITED';
  else if (warnings.length) status = 'PASS_WITH_WARNINGS';

  const hasFfmpeg = !dependencies.find((d) => d.name === 'ffmpeg' && !d.installed);
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
    status,
  };
}
