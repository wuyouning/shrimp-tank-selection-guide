import { DependencyResult, FitAssessment, HardwareInfo, HostInfo, NetworkCheckResult, Profile, ScoreBreakdownItem, SummaryStatus } from '../types';
export declare function assessFit(host: HostInfo, hardware: HardwareInfo, dependencies: DependencyResult[], networkChecks: NetworkCheckResult[], profile: Profile): {
    fit: FitAssessment;
    warnings: string[];
    recommendations: string[];
    score: number;
    rawScore: number;
    bonusPoints: number;
    standardMax: number;
    scoreBreakdown: ScoreBreakdownItem[];
    status: SummaryStatus;
};
//# sourceMappingURL=fit.d.ts.map