/**
 * ECC Custom Tool: Git Summary
 *
 * Provides a comprehensive git status including branch info, status,
 * recent log, and diff against base branch.
 */

import { tool } from "@opencode-ai/plugin"
import { z } from "zod"

export default tool({
  name: "git-summary",
  description: "Get comprehensive git summary: branch, status, recent log, and diff against base branch.",
  parameters: z.object({
    depth: z.number().optional().describe("Number of recent commits to show (default: 5)"),
    includeDiff: z.boolean().optional().describe("Include diff against base branch (default: true)"),
    baseBranch: z.string().optional().describe("Base branch for comparison (default: main)"),
  }),
  execute: async ({ depth = 5, includeDiff = true, baseBranch = "main" }, { $ }) => {
    const results: Record<string, string> = {}

    try {
      results.branch = (await $`git branch --show-current`.text()).trim()
    } catch {
      results.branch = "unknown"
    }

    try {
      results.status = (await $`git status --short`.text()).trim()
    } catch {
      results.status = "unable to get status"
    }

    try {
      results.log = (await $`git log --oneline -${depth}`.text()).trim()
    } catch {
      results.log = "unable to get log"
    }

    if (includeDiff) {
      try {
        results.stagedDiff = (await $`git diff --cached --stat`.text()).trim()
      } catch {
        results.stagedDiff = ""
      }

      try {
        results.branchDiff = (await $`git diff ${baseBranch}...HEAD --stat`.text()).trim()
      } catch {
        results.branchDiff = `unable to diff against ${baseBranch}`
      }
    }

    return results
  },
})
