/**
 * ECC Custom Tool: Git Summary
 *
 * Returns branch/status/log/diff details for the active repository.
 */

import { tool, type ToolDefinition } from "@opencode-ai/plugin/tool"
import { execSync } from "child_process"

const gitSummaryTool: ToolDefinition = tool({
  description:
    "Generate git summary with branch, status, recent commits, and optional diff stats.",
  args: {
    depth: tool.schema
      .number()
      .optional()
      .describe("Number of recent commits to include (default: 5)"),
    includeDiff: tool.schema
      .boolean()
      .optional()
      .describe("Include diff stats against base branch (default: true)"),
    baseBranch: tool.schema
      .string()
      .optional()
      .describe("Base branch for diff comparison (default: main)"),
  },
  async execute(args, context) {
    const cwd = context.worktree || context.directory
    const depth = args.depth ?? 5
    const includeDiff = args.includeDiff ?? true
    const baseBranch = args.baseBranch ?? "main"

    const result: Record<string, string> = {
      branch: run("git branch --show-current", cwd) || "unknown",
      status: run("git status --short", cwd) || "clean",
      log: run(`git log --oneline -${depth}`, cwd) || "no commits found",
    }

    if (includeDiff) {
      result.stagedDiff = run("git diff --cached --stat", cwd) || ""
      result.branchDiff = run(`git diff ${baseBranch}...HEAD --stat`, cwd) || `unable to diff against ${baseBranch}`
    }

    return JSON.stringify(result)
  },
})

export default gitSummaryTool

function run(command: string, cwd: string): string {
  try {
    return execSync(command, { cwd, encoding: "utf-8", stdio: ["ignore", "pipe", "pipe"] }).trim()
  } catch {
    return ""
  }
}
