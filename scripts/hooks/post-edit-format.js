#!/usr/bin/env node
/**
 * PostToolUse Hook: Auto-format JS/TS files after edits
 *
 * Cross-platform (Windows, macOS, Linux)
 *
 * Runs after Edit tool use. If the edited file is a JS/TS file,
 * detects Biome or Prettier and formats accordingly.
 * Honors CLAUDE_PACKAGE_MANAGER env var for the exec runner.
 * Fails silently if no formatter is installed.
 */

const { execFileSync } = require("child_process");
const fs = require("fs");
const path = require("path");

const MAX_STDIN = 1024 * 1024; // 1MB limit
const JS_TS_EXT = /\.(ts|tsx|js|jsx)$/;
const BIOME_CONFIGS = ["biome.json", "biome.jsonc"];

// Use local-first runners (not dlx/download) since this hook runs on every edit
const RUNNERS = {
  npm: { bin: "npx", args: [] },
  pnpm: { bin: "pnpm", args: ["exec"] },
  yarn: { bin: "yarn", args: ["exec"] },
  bun: { bin: "bunx", args: [] },
};

function getRunner() {
  const pm = process.env.CLAUDE_PACKAGE_MANAGER;
  const runner = pm && RUNNERS[pm] ? RUNNERS[pm] : RUNNERS.npm;
  const bin =
    process.platform === "win32" && !runner.bin.endsWith(".cmd")
      ? `${runner.bin}.cmd`
      : runner.bin;
  return { bin, prefixArgs: runner.args };
}

let data = "";
process.stdin.setEncoding("utf8");

process.stdin.on("data", (chunk) => {
  if (data.length < MAX_STDIN) {
    const remaining = MAX_STDIN - data.length;
    data += chunk.substring(0, remaining);
  }
});

process.stdin.on("end", () => {
  try {
    const { tool_input } = JSON.parse(data);
    const filePath = tool_input?.file_path;

    if (filePath && JS_TS_EXT.test(filePath)) {
      const cwd = process.cwd();
      const hasBiome = BIOME_CONFIGS.some((f) =>
        fs.existsSync(path.join(cwd, f)),
      );

      try {
        const { bin, prefixArgs } = getRunner();
        const args = hasBiome
          ? [...prefixArgs, "@biomejs/biome", "check", "--write", filePath]
          : [...prefixArgs, "prettier", "--write", filePath];

        execFileSync(bin, args, {
          cwd,
          stdio: ["pipe", "pipe", "pipe"],
          timeout: 15000,
        });
      } catch {
        // Formatter not installed, file missing, or failed — non-blocking
      }
    }
  } catch {
    // Invalid input — pass through
  }

  process.stdout.write(data);
  process.exit(0);
});
