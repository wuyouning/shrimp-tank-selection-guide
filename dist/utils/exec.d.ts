export interface CommandResult {
    ok: boolean;
    stdout: string;
    stderr: string;
    code?: number;
}
export declare function runCommand(command: string, args?: string[], timeoutMs?: number): Promise<CommandResult>;
//# sourceMappingURL=exec.d.ts.map