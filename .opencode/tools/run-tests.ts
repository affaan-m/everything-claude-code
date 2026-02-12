/**
 * Run Tests Tool
 *
 * Custom OpenCode tool to run test suites with various options.
 * Automatically detects the package manager and test framework.
 */

import { tool } from "@opencode-ai/plugin/tool"
import * as path from "path"
import * as fs from "fs"

export default tool({
  description:
    "Run the test suite with optional coverage, watch mode, or specific test patterns. Automatically detects package manager (npm, pnpm, yarn, bun) and test framework.",
  args: {
    pattern: tool.schema
      .string()
      .optional()
      .describe("Test file pattern or specific test name to run"),
    coverage: tool.schema
      .boolean()
      .optional()
      .describe("Run with coverage reporting (default: false)"),
    watch: tool.schema
      .boolean()
      .optional()
      .describe("Run in watch mode for continuous testing (default: false)"),
    updateSnapshots: tool.schema
      .boolean()
      .optional()
      .describe("Update Jest/Vitest snapshots (default: false)"),
  },
  async execute(args, context) {
    const { pattern, coverage, watch, updateSnapshots } = args
    const cwd = context.worktree || context.directory

    // Detect if this is a Python project
    const isPython = await detectPythonProject(cwd)

    if (isPython) {
      return buildPythonTestCommand(cwd, { pattern, coverage, watch })
    }

    // Detect package manager
    const packageManager = await detectPackageManager(cwd)

    // Detect test framework
    const testFramework = await detectTestFramework(cwd)

    // Build command
    let cmd: string[] = [packageManager]

    if (packageManager === "npm") {
      cmd.push("run", "test")
    } else {
      cmd.push("test")
    }

    // Add options based on framework
    const testArgs: string[] = []

    if (coverage) {
      testArgs.push("--coverage")
    }

    if (watch) {
      testArgs.push("--watch")
    }

    if (updateSnapshots) {
      testArgs.push("-u")
    }

    if (pattern) {
      if (testFramework === "jest" || testFramework === "vitest") {
        testArgs.push("--testPathPattern", pattern)
      } else {
        testArgs.push(pattern)
      }
    }

    // Add -- separator for npm
    if (testArgs.length > 0) {
      if (packageManager === "npm") {
        cmd.push("--")
      }
      cmd.push(...testArgs)
    }

    const command = cmd.join(" ")

    return JSON.stringify({
      command,
      packageManager,
      testFramework,
      options: {
        pattern: pattern || "all tests",
        coverage: coverage || false,
        watch: watch || false,
        updateSnapshots: updateSnapshots || false,
      },
      instructions: `Run this command to execute tests:\n\n${command}`,
    })
  },
})

async function detectPackageManager(cwd: string): Promise<string> {
  const lockFiles: Record<string, string> = {
    "bun.lockb": "bun",
    "pnpm-lock.yaml": "pnpm",
    "yarn.lock": "yarn",
    "package-lock.json": "npm",
  }

  for (const [lockFile, pm] of Object.entries(lockFiles)) {
    if (fs.existsSync(path.join(cwd, lockFile))) {
      return pm
    }
  }

  return "npm"
}

async function detectTestFramework(cwd: string): Promise<string> {
  const packageJsonPath = path.join(cwd, "package.json")

  if (fs.existsSync(packageJsonPath)) {
    try {
      const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, "utf-8"))
      const deps = {
        ...packageJson.dependencies,
        ...packageJson.devDependencies,
      }

      if (deps.vitest) return "vitest"
      if (deps.jest) return "jest"
      if (deps.mocha) return "mocha"
      if (deps.ava) return "ava"
      if (deps.tap) return "tap"
    } catch {
      // Ignore parse errors
    }
  }

  return "unknown"
}

/**
 * 
 * @param cwd 
 * @returns 
 */
async function detectPythonProject(cwd: string): Promise<boolean> {
  // Check for common Python project indicators
  const pythonIndicators = [
    "pyproject.toml",
    "setup.py",
    "requirements.txt",
    "Pipfile",
    "pytest.ini",
    "setup.cfg",
    "tox.ini",
  ]

  for (const indicator of pythonIndicators) {
    if (fs.existsSync(path.join(cwd, indicator))) {
      return true
    }
  }

  // Check for tests directory with Python files
  const testsDir = path.join(cwd, "tests")
  if (fs.existsSync(testsDir)) {
    try {
      const files = fs.readdirSync(testsDir)
      if (files.some((f) => f.endsWith(".py"))) {
        return true
      }
    } catch {
      // Ignore errors
    }
  }

  return false
}

/**
 * 
 * @param cwd 
 * @param options 
 * @returns 
 */
async function buildPythonTestCommand(
  cwd: string,
  options: { pattern?: string; coverage?: boolean; watch?: boolean }
): Promise<string> {
  const { pattern, coverage, watch } = options

  // Detect Python runner (uv, poetry, or direct pytest)
  const runner = await detectPythonRunner(cwd)

  let cmd: string[] = []

  if (runner === "uv") {
    cmd.push("uv", "run", "pytest")
  } else if (runner === "poetry") {
    cmd.push("poetry", "run", "pytest")
  } else {
    cmd.push("pytest")
  }

  // Add verbose flag for better output
  cmd.push("-v")

  if (coverage) {
    cmd.push("--cov", "--cov-report=term-missing")
  }

  if (watch) {
    // pytest-watch or pytest-xdist with --looponfail
    cmd.push("--looponfail")
  }

  if (pattern) {
    // Support both file patterns and -k expression
    if (pattern.includes("/") || pattern.endsWith(".py")) {
      cmd.push(pattern)
    } else {
      cmd.push("-k", pattern)
    }
  }

  const command = cmd.join(" ")

  return JSON.stringify({
    command,
    packageManager: runner,
    testFramework: "pytest",
    options: {
      pattern: pattern || "all tests",
      coverage: coverage || false,
      watch: watch || false,
      updateSnapshots: false,
    },
    instructions: `Run this command to execute tests:\n\n${command}`,
  })
}

async function detectPythonRunner(cwd: string): Promise<string> {
  // Check for uv
  if (fs.existsSync(path.join(cwd, "uv.lock"))) {
    return "uv"
  }

  // Check for poetry
  if (fs.existsSync(path.join(cwd, "poetry.lock"))) {
    return "poetry"
  }

  // Check pyproject.toml for build system hints
  const pyprojectPath = path.join(cwd, "pyproject.toml")
  if (fs.existsSync(pyprojectPath)) {
    try {
      const content = fs.readFileSync(pyprojectPath, "utf-8")
      if (content.includes("[tool.poetry]")) {
        return "poetry"
      }
      if (content.includes("[tool.uv]") || content.includes("uv")) {
        return "uv"
      }
    } catch {
      // Ignore errors
    }
  }

  return "direct"
}
