/**
 * Everything Claude Code (ECC) Plugin for OpenCode
 *
 * This package provides a complete OpenCode plugin with:
 * - 12 specialized agents (planner, architect, code-reviewer, etc.)
 * - 24 commands (/plan, /tdd, /code-review, etc.)
 * - Plugin hooks (auto-format, TypeScript check, console.log warning, etc.)
 * - Custom tools (run-tests, check-coverage, security-audit)
 * - 16 skills (coding-standards, security-review, tdd-workflow, etc.)
 *
 * Usage:
 *
 * Option 1: Install via npm
 * ```bash
 * npm install opencode-ecc
 * ```
 *
 * Then add to your opencode.json:
 * ```json
 * {
 *   "plugin": ["opencode-ecc"]
 * }
 * ```
 *
 * Option 2: Clone and use directly
 * ```bash
 * git clone https://github.com/affaan-m/everything-claude-code
 * cd everything-claude-code
 * opencode
 * ```
 *
 * @packageDocumentation
 */

// Export the main plugin
export { ECCHooksPlugin, default } from "./plugins/index.js"

// Export individual components for selective use
export * from "./plugins/index.js"

// Version export
export const VERSION = "1.0.0"

// Plugin metadata
export const metadata = {
  name: "opencode-ecc",
  version: VERSION,
  description: "Everything Claude Code plugin for OpenCode",
  author: "affaan-m",
  features: {
    agents: 12,
    commands: 24,
    skills: 16,
    hookEvents: [
      "file.edited",
      "tool.execute.before",
      "tool.execute.after",
      "session.created",
      "session.idle",
      "session.deleted",
      "file.watcher.updated",
      "permission.asked",
      "todo.updated",
    ],
    customTools: [
      "run-tests",
      "check-coverage",
      "security-audit",
    ],
  },
}
