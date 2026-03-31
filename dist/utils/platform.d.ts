import { OsFamily, PackageManagerStatus, WindowsPosture } from '../types';
export declare function detectOsFamily(platform?: string): OsFamily;
export declare function formatOsLabel(platform: string, release: string): string;
export declare function detectHomebrew(osFamily: OsFamily): Promise<PackageManagerStatus | undefined>;
export declare function buildWindowsPosture(osFamily: OsFamily): Promise<WindowsPosture>;
export declare function getDependencyInstallHint(dependencyName: string, osFamily: OsFamily, packageManagers: PackageManagerStatus[]): string | undefined;
//# sourceMappingURL=platform.d.ts.map