import path from "node:path";
import { runCommand } from "./shell.js";

function sanitizeBranchSegment(value: string): string {
  return value.replace(/[^a-zA-Z0-9/_-]+/g, "-");
}

export class WorktreeManager {
  constructor(private readonly repoRoot: string) {}

  async getCurrentBranch(): Promise<string> {
    const result = await runCommand("git", ["rev-parse", "--abbrev-ref", "HEAD"], this.repoRoot);
    if (result.exitCode !== 0) {
      throw new Error(`Failed to detect current branch: ${result.stderr}`);
    }
    return result.stdout.trim() || "main";
  }

  async createForTicket(jiraKey: string, baseBranch?: string): Promise<{ branch: string; worktreePath: string }> {
    const branch = `agent/${sanitizeBranchSegment(jiraKey)}`;
    const worktreePath = path.resolve(this.repoRoot, "..", "agent-runs", jiraKey);
    const branchBase = baseBranch || (await this.getCurrentBranch());

    const branchCheck = await runCommand(
      "git",
      ["show-ref", "--verify", "--quiet", `refs/heads/${branch}`],
      this.repoRoot
    );

    const args =
      branchCheck.exitCode === 0
        ? ["worktree", "add", worktreePath, branch]
        : ["worktree", "add", "-b", branch, worktreePath, branchBase];

    const result = await runCommand("git", args, this.repoRoot);
    if (result.exitCode !== 0 && !result.stderr.includes("already exists")) {
      throw new Error(`Failed to create worktree: ${result.stderr}`);
    }

    return { branch, worktreePath };
  }
}
