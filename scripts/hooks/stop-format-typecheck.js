#!/usr/bin/env node
/**
 * Stop Hook: Batch format and typecheck all JS/TS files edited this response
 *
 * Cross-platform (Windows, macOS, Linux)
 *
 * Reads the session accumulator written by post-edit-accumulator.js and
 * processes all edited files in one pass instead of once per Edit call:
 *
 *   Format   – groups files by project root, runs the formatter once per
 *              root on all files in that batch (one biome/prettier invocation
 *              instead of N sequential ones).
 *
 *   Typecheck – groups .ts/.tsx files by their nearest tsconfig.json directory,
 *               runs `tsc --noEmit` once per tsconfig and filters output to
 *               errors that touch the edited files.
 *
 * For a 10-file refactor this reduces ~7.5 minutes of per-edit hook overhead
 * (10 × 15s format + 10 × 30s typecheck) to a single batched pass that
 * typically completes in 5-30 seconds total.
 *
 * The accumulator file is cleared at the start of processing so that
 * repeated Stop calls within the same session do not double-process files.
 */

'use strict';

const { execFileSync, spawnSync } = require('child_process');
const fs = require('fs');
const os = require('os');
const path = require('path');

const { findProjectRoot, detectFormatter, resolveFormatterBin } = require('../lib/resolve-formatter');

const MAX_STDIN = 1024 * 1024;

// Shell metacharacters that cmd.exe interprets as command separators/operators
const UNSAFE_PATH_CHARS = /[&|<>^%!]/;

function getAccumFile() {
  const sessionId = process.env.CLAUDE_SESSION_ID || 'default';
  return path.join(os.tmpdir(), `ecc-edited-${sessionId}.json`);
}

/**
 * Run the formatter once on a batch of files that share the same project root.
 *
 * @param {string} projectRoot - Absolute path to the project root
 * @param {string[]} files - Absolute paths of files to format (all under projectRoot)
 */
function formatBatch(projectRoot, files) {
  const formatter = detectFormatter(projectRoot);
  if (!formatter) return;

  const resolved = resolveFormatterBin(projectRoot, formatter);
  if (!resolved) return;

  const existingFiles = files.filter(f => fs.existsSync(f));
  if (existingFiles.length === 0) return;

  // Biome: `check --write file1 file2 ...`
  // Prettier: `--write file1 file2 ...`
  const fileArgs =
    formatter === 'biome'
      ? [...resolved.prefix, 'check', '--write', ...existingFiles]
      : [...resolved.prefix, '--write', ...existingFiles];

  try {
    if (process.platform === 'win32' && resolved.bin.endsWith('.cmd')) {
      // Windows: .cmd files require shell. Reject paths with shell metacharacters.
      if (existingFiles.some(f => UNSAFE_PATH_CHARS.test(f))) {
        process.stderr.write('[Hook] stop-format-typecheck: skipping batch — unsafe path chars\n');
        return;
      }
      const result = spawnSync(resolved.bin, fileArgs, {
        cwd: projectRoot,
        shell: true,
        stdio: 'pipe',
        timeout: 60000
      });
      if (result.error) throw result.error;
    } else {
      execFileSync(resolved.bin, fileArgs, {
        cwd: projectRoot,
        stdio: ['pipe', 'pipe', 'pipe'],
        timeout: 60000
      });
    }
  } catch {
    // Formatter not installed or failed — non-blocking
  }
}

/**
 * Find the nearest tsconfig.json by walking up from a file's directory.
 *
 * @param {string} filePath - Absolute path to a TypeScript file
 * @returns {string|null} Directory containing tsconfig.json, or null
 */
function findTsConfigDir(filePath) {
  let dir = path.dirname(filePath);
  const fsRoot = path.parse(dir).root;
  let depth = 0;

  while (dir !== fsRoot && depth < 20) {
    if (fs.existsSync(path.join(dir, 'tsconfig.json'))) {
      return dir;
    }
    dir = path.dirname(dir);
    depth++;
  }
  return null;
}

/**
 * Run tsc once for a tsconfig dir and report errors for any of the edited files.
 *
 * @param {string} tsConfigDir - Directory containing tsconfig.json
 * @param {string[]} editedFiles - Absolute paths of TS files that were edited
 */
function typecheckBatch(tsConfigDir, editedFiles) {
  try {
    const npxBin = process.platform === 'win32' ? 'npx.cmd' : 'npx';
    execFileSync(npxBin, ['tsc', '--noEmit', '--pretty', 'false'], {
      cwd: tsConfigDir,
      encoding: 'utf8',
      stdio: ['pipe', 'pipe', 'pipe'],
      timeout: 60000
    });
  } catch (err) {
    const output = (err.stdout || '') + (err.stderr || '');
    const lines = output.split('\n');

    for (const filePath of editedFiles) {
      // tsc output uses paths relative to its cwd (the tsconfig dir).
      // Check for relative path, absolute path, and original path to avoid
      // false positives when multiple files share the same basename.
      const relPath = path.relative(tsConfigDir, filePath);
      const candidates = new Set([filePath, relPath]);

      const relevantLines = lines
        .filter(line => {
          for (const candidate of candidates) {
            if (line.includes(candidate)) return true;
          }
          return false;
        })
        .slice(0, 10);

      if (relevantLines.length > 0) {
        process.stderr.write(`[Hook] TypeScript errors in ${path.basename(filePath)}:\n`);
        relevantLines.forEach(line => process.stderr.write(line + '\n'));
      }
    }
  }
}

function main() {
  const accumFile = getAccumFile();

  let files;
  try {
    files = JSON.parse(fs.readFileSync(accumFile, 'utf8'));
  } catch {
    // No accumulator — nothing was edited this response, nothing to do
    return;
  }

  // Clear immediately so repeated Stop calls don't double-process
  try {
    fs.unlinkSync(accumFile);
  } catch {
    // Best-effort
  }

  if (!Array.isArray(files) || files.length === 0) return;

  // ── Format: group by project root ──────────────────────────────
  const byProjectRoot = new Map();
  for (const filePath of files) {
    if (!/\.(ts|tsx|js|jsx)$/.test(filePath)) continue;
    const resolved = path.resolve(filePath);
    if (!fs.existsSync(resolved)) continue;
    const root = findProjectRoot(path.dirname(resolved));
    if (!byProjectRoot.has(root)) byProjectRoot.set(root, []);
    byProjectRoot.get(root).push(resolved);
  }

  for (const [root, batch] of byProjectRoot) {
    formatBatch(root, batch);
  }

  // ── Typecheck: group by tsconfig dir ───────────────────────────
  const byTsConfigDir = new Map();
  for (const filePath of files) {
    if (!/\.(ts|tsx)$/.test(filePath)) continue;
    const resolved = path.resolve(filePath);
    if (!fs.existsSync(resolved)) continue;
    const tsDir = findTsConfigDir(resolved);
    if (!tsDir) continue;
    if (!byTsConfigDir.has(tsDir)) byTsConfigDir.set(tsDir, []);
    byTsConfigDir.get(tsDir).push(resolved);
  }

  for (const [tsDir, batch] of byTsConfigDir) {
    typecheckBatch(tsDir, batch);
  }
}

// ── stdin entry point ────────────────────────────────────────────
let stdinData = '';
process.stdin.setEncoding('utf8');

process.stdin.on('data', chunk => {
  if (stdinData.length < MAX_STDIN) {
    stdinData += chunk.substring(0, MAX_STDIN - stdinData.length);
  }
});

process.stdin.on('end', () => {
  try {
    main();
  } catch (err) {
    process.stderr.write(`[Hook] stop-format-typecheck error: ${err.message}\n`);
  }
  process.stdout.write(stdinData);
  process.exit(0);
});
