#!/usr/bin/env node
/**
 * PostToolUse Hook: TypeScript check after editing .ts/.tsx files
 *
 * Cross-platform (Windows, macOS, Linux)
 *
 * Runs after Edit tool use on TypeScript files. Walks up from the file's
 * directory to find the nearest tsconfig.json, then runs tsc --noEmit
 * and reports only errors related to the edited file.
 */

const { execFileSync } = require("child_process");
const fs = require("fs");
const path = require("path");

const MAX_STDIN = 1024 * 1024; // 1MB limit
let data = "";
process.stdin.setEncoding("utf8");

process.stdin.on("data", (chunk) => {
  if (data.length < MAX_STDIN) {
    data += chunk;
  }
});

process.stdin.on("end", () => {
  try {
    const input = JSON.parse(data);
    const filePath = input.tool_input?.file_path;

    if (filePath && /\.(ts|tsx)$/.test(filePath)) {
      const resolvedPath = path.resolve(filePath);
      if (!fs.existsSync(resolvedPath)) {
        console.log(data);
        return;
      }
      // Find nearest tsconfig.json by walking up (max 20 levels to prevent infinite loop)
      let dir = path.dirname(resolvedPath);
      const root = path.parse(dir).root;
      let depth = 0;

      while (dir !== root && depth < 20) {
        if (fs.existsSync(path.join(dir, "tsconfig.json"))) {
          break;
        }
        dir = path.dirname(dir);
        depth++;
      }

      if (fs.existsSync(path.join(dir, "tsconfig.json"))) {
        try {
          execFileSync("npx", ["tsc", "--noEmit", "--pretty", "false"], {
            cwd: dir,
            encoding: "utf8",
            stdio: ["pipe", "pipe", "pipe"],
            timeout: 30000,
            shell: process.platform === "win32",
          });
        } catch (err) {
          // tsc exits non-zero when there are errors — filter to edited file
          const output = (err.stdout || "") + (err.stderr || "");
          const relevantLines = output
            .split("\n")
            .filter(
              (line) =>
                line.includes(filePath) ||
                line.includes(path.basename(filePath)),
            )
            .slice(0, 10);

          if (relevantLines.length > 0) {
            console.error(
              "[Hook] TypeScript errors in " + path.basename(filePath) + ":",
            );
            relevantLines.forEach((line) => console.error(line));
          }
        }
      }
    }
  } catch {
    // Invalid input — pass through
  }

  console.log(data);
});
