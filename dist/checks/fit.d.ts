import { DependencyResult, FitAssessment, HardwareInfo, HostInfo, NetworkCheckResult, Profile, SummaryStatus } from '../types';
export declare function assessFit(host: HostInfo, hardware: HardwareInfo, dependencies: DependencyResult[], networkChecks: NetworkCheckResult[], profile: Profile): {
    fit: FitAssessment;
    warnings: string[];
    recommendations: string[];
    score: number;
    status: SummaryStatus;
};
//# sourceMappingURL=fit.d.ts.map