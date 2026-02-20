/**
 * Everything Claude Code (ECC) Plugin Hooks for OpenCode
 *
 * This plugin translates Claude Code hooks to OpenCode's plugin system.
 * OpenCode's plugin system is MORE sophisticated than Claude Code with 20+ events
 * compared to Claude Code's 3 phases (PreToolUse, PostToolUse, Stop).
 *
 * Hook Event Mapping:
 * - PreToolUse → tool.execute.before
 * - PostToolUse → tool.execute.after
 * - Stop → session.idle / session.status
 * - SessionStart → session.created
 * - SessionEnd → session.deleted
 */

import type { PluginInput } from "@opencode-ai/plugin"

export const ECCHooksPlugin = async ({
  client,
  $,
  directory,
  worktree,
}: PluginInput) => {
  // Track files edited in current session for console.log audit
  const editedFiles = new Set<string>()

  // Helper to call the SDK's log API with correct signature
  const log = (level: "debug" | "info" | "warn" | "error", message: string) =>
    client.app.log({ body: { service: "ecc", level, message } })

  return {
    /**
     * Prettier Auto-Format Hook
     * Equivalent to Claude Code PostToolUse hook for prettier
     *
     * Triggers: After any JS/TS/JSX/TSX file is edited
     * Action: Runs prettier --write on the file
     */
    "file.edited": async (event: { path: string }) => {
      // Track edited files for console.log audit
      editedFiles.add(event.path)

      // Auto-format JS/TS files
      if (event.path.match(/\.(ts|tsx|js|jsx)$/)) {
        try {
          await $`prettier --write ${event.path} 2>/dev/null`
          log("info", `[ECC] Formatted: ${event.path}`)
        } catch {
          // Prettier not installed or failed - silently continue
        }
      }

      // Console.log warning check
      if (event.path.match(/\.(ts|tsx|js|jsx)$/)) {
        try {
          const result = await $`grep -n "console\\.log" ${event.path} 2>/dev/null`.text()
          if (result.trim()) {
            const lines = result.trim().split("\n").length
            log(
              "warn",
              `[ECC] console.log found in ${event.path} (${lines} occurrence${lines > 1 ? "s" : ""})`
            )
          }
        } catch {
          // No console.log found (grep returns non-zero) - this is good
        }
      }
    },

    /**
     * TypeScript Check Hook
     * Equivalent to Claude Code PostToolUse hook for tsc
     *
     * Triggers: After edit tool completes on .ts/.tsx files
     * Action: Runs tsc --noEmit to check for type errors
     */
    "tool.execute.after": async (
      input: { tool: string; args?: { filePath?: string } },
      output: unknown
    ) => {
      // Check if a TypeScript file was edited
      if (
        input.tool === "edit" &&
        input.args?.filePath?.match(/\.tsx?$/)
      ) {
        try {
          await $`npx tsc --noEmit 2>&1`
          log("info", "[ECC] TypeScript check passed")
        } catch (error: unknown) {
          const err = error as { stdout?: string }
          log("warn", "[ECC] TypeScript errors detected:")
          if (err.stdout) {
            // Log first few errors
            const errors = err.stdout.split("\n").slice(0, 5)
            errors.forEach((line: string) => log("warn", `  ${line}`))
          }
        }
      }

      // PR creation logging
      if (input.tool === "bash" && input.args?.toString().includes("gh pr create")) {
        log("info", "[ECC] PR created - check GitHub Actions status")
      }
    },

    /**
     * Pre-Tool Security Check
     * Equivalent to Claude Code PreToolUse hook
     *
     * Triggers: Before tool execution
     * Action: Warns about potential security issues
     */
    "tool.execute.before": async (
      input: { tool: string; args?: Record<string, unknown> }
    ) => {
      // Git push review reminder
      if (
        input.tool === "bash" &&
        input.args?.toString().includes("git push")
      ) {
        log(
          "info",
          "[ECC] Remember to review changes before pushing: git diff origin/main...HEAD"
        )
      }

      // Block creation of unnecessary documentation files
      if (
        input.tool === "write" &&
        input.args?.filePath &&
        typeof input.args.filePath === "string"
      ) {
        const filePath = input.args.filePath
        if (
          filePath.match(/\.(md|txt)$/i) &&
          !filePath.includes("README") &&
          !filePath.includes("CHANGELOG") &&
          !filePath.includes("LICENSE") &&
          !filePath.includes("CONTRIBUTING")
        ) {
          log(
            "warn",
            `[ECC] Creating ${filePath} - consider if this documentation is necessary`
          )
        }
      }

      // Long-running command reminder
      if (input.tool === "bash") {
        const cmd = String(input.args?.command || input.args || "")
        if (
          cmd.match(/^(npm|pnpm|yarn|bun)\s+(install|build|test|run)/) ||
          cmd.match(/^cargo\s+(build|test|run)/) ||
          cmd.match(/^go\s+(build|test|run)/)
        ) {
          log(
            "info",
            "[ECC] Long-running command detected - consider using background execution"
          )
        }
      }
    },

    /**
     * Session Created Hook
     * Equivalent to Claude Code SessionStart hook
     *
     * Triggers: When a new session starts
     * Action: Loads context and displays welcome message
     */
    "session.created": async () => {
      log("info", "[ECC] Session started - Everything Claude Code hooks active")

      // Check for project-specific context files
      try {
        const hasClaudeMd = await $`test -f ${worktree}/CLAUDE.md && echo "yes"`.text()
        if (hasClaudeMd.trim() === "yes") {
          log("info", "[ECC] Found CLAUDE.md - loading project context")
        }
      } catch {
        // No CLAUDE.md found
      }
    },

    /**
     * Session Idle Hook
     * Equivalent to Claude Code Stop hook
     *
     * Triggers: When session becomes idle (task completed)
     * Action: Runs console.log audit on all edited files
     */
    "session.idle": async () => {
      if (editedFiles.size === 0) return

      log("info", "[ECC] Session idle - running console.log audit")

      let totalConsoleLogCount = 0
      const filesWithConsoleLogs: string[] = []

      for (const file of editedFiles) {
        if (!file.match(/\.(ts|tsx|js|jsx)$/)) continue

        try {
          const result = await $`grep -c "console\\.log" ${file} 2>/dev/null`.text()
          const count = parseInt(result.trim(), 10)
          if (count > 0) {
            totalConsoleLogCount += count
            filesWithConsoleLogs.push(file)
          }
        } catch {
          // No console.log found
        }
      }

      if (totalConsoleLogCount > 0) {
        log(
          "warn",
          `[ECC] Audit: ${totalConsoleLogCount} console.log statement(s) in ${filesWithConsoleLogs.length} file(s)`
        )
        filesWithConsoleLogs.forEach((f) =>
          log("warn", `  - ${f}`)
        )
        log("warn", "[ECC] Remove console.log statements before committing")
      } else {
        log("info", "[ECC] Audit passed: No console.log statements found")
      }

      // Desktop notification (macOS)
      try {
        await $`osascript -e 'display notification "Task completed!" with title "OpenCode ECC"' 2>/dev/null`
      } catch {
        // Notification not supported or failed
      }

      // Clear tracked files for next task
      editedFiles.clear()
    },

    /**
     * Session Deleted Hook
     * Equivalent to Claude Code SessionEnd hook
     *
     * Triggers: When session ends
     * Action: Final cleanup and state saving
     */
    "session.deleted": async () => {
      log("info", "[ECC] Session ended - cleaning up")
      editedFiles.clear()
    },

    /**
     * File Watcher Hook
     * OpenCode-only feature
     *
     * Triggers: When file system changes are detected
     * Action: Updates tracking
     */
    "file.watcher.updated": async (event: { path: string; type: string }) => {
      if (event.type === "change" && event.path.match(/\.(ts|tsx|js|jsx)$/)) {
        editedFiles.add(event.path)
      }
    },

    /**
     * Permission Asked Hook
     * OpenCode-only feature
     *
     * Triggers: When permission is requested
     * Action: Logs for audit trail
     */
    "permission.asked": async (event: { tool: string; args: unknown }) => {
      log("info", `[ECC] Permission requested for: ${event.tool}`)
    },

    /**
     * Todo Updated Hook
     * OpenCode-only feature
     *
     * Triggers: When todo list is updated
     * Action: Logs progress
     */
    "todo.updated": async (event: { todos: Array<{ text: string; done: boolean }> }) => {
      const completed = event.todos.filter((t) => t.done).length
      const total = event.todos.length
      if (total > 0) {
        log("info", `[ECC] Progress: ${completed}/${total} tasks completed`)
      }
    },
  }
}

export default ECCHooksPlugin
