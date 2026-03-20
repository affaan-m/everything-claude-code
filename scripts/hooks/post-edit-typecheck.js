#!/usr/bin/env node
/**
 * PostToolUse Hook: TypeScript check after editing .ts/.tsx files
 *
 * Cross-platform (Windows, macOS, Linux)
 *
 * Runs after Edit tool use on TypeScript files. Walks up from the file's
 * directory to find the nearest tsconfig.json, then runs tsc --noEmit
 * and reports only errors related to the edited file.
 *
 * To avoid CPU spikes during bursty edit sessions, checks are coalesced per
 * tsconfig root: overlapping runs are skipped and recent runs are cooled down.
 */

"use strict";

const { execFileSync } = require("child_process");
const crypto = require("crypto");
const fs = require("fs");
const os = require("os");
const path = require("path");

const MAX_STDIN = 1024 * 1024; // 1MB limit
const DEFAULT_COOLDOWN_MS = 10000;
const DEFAULT_LOCK_TTL_MS = 120000;

function parseNonNegativeInt(value, fallback) {
  const parsed = Number.parseInt(String(value || ""), 10);
  if (!Number.isFinite(parsed) || parsed < 0) {
    return fallback;
  }
  return parsed;
}

function getStateDir() {
  const configuredDir = String(process.env.ECC_TYPECHECK_STATE_DIR || "").trim();
  if (configuredDir) {
    return path.resolve(configuredDir);
  }
  return path.join(os.tmpdir(), "ecc-typecheck-hook");
}

function getStatePaths(tsconfigDir) {
  const key = crypto
    .createHash("sha1")
    .update(path.resolve(tsconfigDir))
    .digest("hex");
  const stateDir = getStateDir();

  return {
    stateDir,
    lockPath: path.join(stateDir, `${key}.lock`),
    stampPath: path.join(stateDir, `${key}.json`),
  };
}

function ensureDirectory(dirPath) {
  try {
    fs.mkdirSync(dirPath, { recursive: true });
    return true;
  } catch {
    return false;
  }
}

function readJsonFile(filePath) {
  try {
    return JSON.parse(fs.readFileSync(filePath, "utf8"));
  } catch {
    return null;
  }
}

function isCooldownActive(stampPath, cooldownMs) {
  if (cooldownMs <= 0) {
    return false;
  }

  const stamp = readJsonFile(stampPath);
  const finishedAt = Number(stamp?.finishedAt || 0);
  if (finishedAt <= 0) {
    return false;
  }

  return Date.now() - finishedAt < cooldownMs;
}

function acquireTypecheckLock(lockPath, lockTtlMs) {
  const payload = JSON.stringify({
    pid: process.pid,
    startedAt: Date.now(),
  });

  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      const fd = fs.openSync(lockPath, "wx");
      fs.writeFileSync(fd, payload);
      fs.closeSync(fd);

      return () => {
        try {
          fs.unlinkSync(lockPath);
        } catch {
          // Best-effort cleanup only.
        }
      };
    } catch (error) {
      if (!error || error.code !== "EEXIST") {
        return null;
      }

      let stats = null;
      try {
        stats = fs.statSync(lockPath);
      } catch {
        continue;
      }

      if (Date.now() - stats.mtimeMs < lockTtlMs) {
        return null;
      }

      try {
        fs.unlinkSync(lockPath);
      } catch {
        return null;
      }
    }
  }

  return null;
}

function writeCooldownStamp(stampPath) {
  try {
    fs.writeFileSync(
      stampPath,
      JSON.stringify({
        finishedAt: Date.now(),
        pid: process.pid,
      }),
    );
  } catch {
    // Best-effort cache only.
  }
}

function findNearestTsconfig(resolvedPath) {
  let dir = path.dirname(resolvedPath);
  const root = path.parse(dir).root;
  let depth = 0;

  while (dir !== root && depth < 20) {
    if (fs.existsSync(path.join(dir, "tsconfig.json"))) {
      return dir;
    }
    dir = path.dirname(dir);
    depth++;
  }

  return null;
}

function reportRelevantTypecheckErrors(tsconfigDir, filePath, resolvedPath, error) {
  const output = (error.stdout || "") + (error.stderr || "");
  const relPath = path.relative(tsconfigDir, resolvedPath);
  const candidates = new Set([filePath, resolvedPath, relPath]);
  const relevantLines = output
    .split("\n")
    .filter((line) => {
      for (const candidate of candidates) {
        if (line.includes(candidate)) return true;
      }
      return false;
    })
    .slice(0, 10);

  if (relevantLines.length > 0) {
    console.error("[Hook] TypeScript errors in " + path.basename(filePath) + ":");
    relevantLines.forEach((line) => console.error(line));
  }
}

function runTypecheck(tsconfigDir, filePath, resolvedPath) {
  try {
    // Use npx.cmd on Windows to avoid shell: true which enables command injection
    const npxBin = process.platform === "win32" ? "npx.cmd" : "npx";
    execFileSync(npxBin, ["tsc", "--noEmit", "--pretty", "false"], {
      cwd: tsconfigDir,
      encoding: "utf8",
      stdio: ["pipe", "pipe", "pipe"],
      timeout: 30000,
    });
  } catch (error) {
    reportRelevantTypecheckErrors(tsconfigDir, filePath, resolvedPath, error);
  }
}

function maybeRunTypecheck(filePath) {
  if (!filePath || !/\.(ts|tsx)$/.test(filePath)) {
    return;
  }

  const resolvedPath = path.resolve(filePath);
  if (!fs.existsSync(resolvedPath)) {
    return;
  }

  const tsconfigDir = findNearestTsconfig(resolvedPath);
  if (!tsconfigDir) {
    return;
  }

  const cooldownMs = parseNonNegativeInt(
    process.env.ECC_TYPECHECK_COOLDOWN_MS,
    DEFAULT_COOLDOWN_MS,
  );
  const lockTtlMs = parseNonNegativeInt(
    process.env.ECC_TYPECHECK_LOCK_TTL_MS,
    DEFAULT_LOCK_TTL_MS,
  );
  const { stateDir, lockPath, stampPath } = getStatePaths(tsconfigDir);

  if (!ensureDirectory(stateDir)) {
    runTypecheck(tsconfigDir, filePath, resolvedPath);
    return;
  }

  if (isCooldownActive(stampPath, cooldownMs)) {
    return;
  }

  const releaseLock = acquireTypecheckLock(lockPath, lockTtlMs);
  if (!releaseLock) {
    return;
  }

  if (isCooldownActive(stampPath, cooldownMs)) {
    releaseLock();
    return;
  }

  try {
    runTypecheck(tsconfigDir, filePath, resolvedPath);
    writeCooldownStamp(stampPath);
  } finally {
    releaseLock();
  }
}

function run(rawInput) {
  try {
    const input = JSON.parse(rawInput);
    maybeRunTypecheck(input.tool_input?.file_path);
  } catch {
    // Invalid input — pass through.
  }

  return rawInput;
}

if (require.main === module) {
  let data = "";
  process.stdin.setEncoding("utf8");

  process.stdin.on("data", (chunk) => {
    if (data.length < MAX_STDIN) {
      const remaining = MAX_STDIN - data.length;
      data += chunk.substring(0, remaining);
    }
  });

  process.stdin.on("end", () => {
    run(data);
    process.stdout.write(data);
    process.exit(0);
  });
}

module.exports = {
  run,
};
