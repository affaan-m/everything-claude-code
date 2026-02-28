/**
 * ECC Custom Tool: Lint Check
 *
 * Multi-language linter that auto-detects the project's linting tool.
 * Supports: ESLint/Biome (JS/TS), Pylint/Ruff (Python), golangci-lint (Go)
 */

import { tool } from "@opencode-ai/plugin"
import { z } from "zod"

export default tool({
  name: "lint-check",
  description: "Run linter on files or directories. Auto-detects ESLint, Biome, Ruff, Pylint, or golangci-lint.",
  parameters: z.object({
    target: z.string().optional().describe("File or directory to lint (default: current directory)"),
    fix: z.boolean().optional().describe("Auto-fix issues if supported (default: false)"),
    linter: z.string().optional().describe("Override linter: eslint, biome, ruff, pylint, golangci-lint (default: auto-detect)"),
  }),
  execute: async ({ target = ".", fix = false, linter }, { $ }) => {
    // Auto-detect linter
    let detected = linter
    if (!detected) {
      try {
        await $`test -f biome.json || test -f biome.jsonc`
        detected = "biome"
      } catch {
        try {
          await $`test -f .eslintrc.json || test -f .eslintrc.js || test -f .eslintrc.cjs || test -f eslint.config.js || test -f eslint.config.mjs`
          detected = "eslint"
        } catch {
          try {
            await $`test -f pyproject.toml && grep -q "ruff" pyproject.toml`
            detected = "ruff"
          } catch {
            try {
              await $`test -f .golangci.yml || test -f .golangci.yaml`
              detected = "golangci-lint"
            } catch {
              // Fall back based on file extensions in target
              detected = "eslint"
            }
          }
        }
      }
    }

    const fixFlag = fix ? " --fix" : ""
    const commands: Record<string, string> = {
      biome: `npx @biomejs/biome lint${fix ? " --write" : ""} ${target}`,
      eslint: `npx eslint${fixFlag} ${target}`,
      ruff: `ruff check${fixFlag} ${target}`,
      pylint: `pylint ${target}`,
      "golangci-lint": `golangci-lint run${fixFlag} ${target}`,
    }

    const cmd = commands[detected]
    if (!cmd) {
      return { success: false, message: `Unknown linter: ${detected}` }
    }

    try {
      const result = await $`${cmd}`.text()
      return { success: true, linter: detected, output: result, issues: 0 }
    } catch (error: unknown) {
      const err = error as { stdout?: string; stderr?: string }
      return {
        success: false,
        linter: detected,
        output: err.stdout || "",
        errors: err.stderr || "",
      }
    }
  },
})
