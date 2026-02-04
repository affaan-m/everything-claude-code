#!/usr/bin/env node
/**
 * Continuous Learning v2 - Observation Hook
 *
 * Cross-platform (Windows, macOS, Linux)
 *
 * Captures tool use events for pattern analysis.
 * Claude Code passes hook data via stdin as JSON.
 *
 * Usage in hooks.json:
 * {
 *   "PreToolUse": [{
 *     "matcher": "*",
 *     "hooks": [{ "type": "command", "command": "node \"${CLAUDE_PLUGIN_ROOT}/skills/continuous-learning-v2/hooks/observe.js\" pre" }]
 *   }],
 *   "PostToolUse": [{
 *     "matcher": "*",
 *     "hooks": [{ "type": "command", "command": "node \"${CLAUDE_PLUGIN_ROOT}/skills/continuous-learning-v2/hooks/observe.js\" post" }]
 *   }]
 * }
 */

const fs = require('fs');
const path = require('path');
const os = require('os');

const CONFIG_DIR = path.join(os.homedir(), '.claude', 'homunculus');
const OBSERVATIONS_FILE = path.join(CONFIG_DIR, 'observations.jsonl');
const MAX_FILE_SIZE_MB = 10;
const MAX_CONTENT_LENGTH = 5000;

function ensureDir(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

function getFileSizeMB(filePath) {
  try {
    const stats = fs.statSync(filePath);
    return stats.size / (1024 * 1024);
  } catch {
    return 0;
  }
}

function archiveIfNeeded() {
  if (!fs.existsSync(OBSERVATIONS_FILE)) return;

  const sizeMB = getFileSizeMB(OBSERVATIONS_FILE);
  if (sizeMB >= MAX_FILE_SIZE_MB) {
    const archiveDir = path.join(CONFIG_DIR, 'observations.archive');
    ensureDir(archiveDir);

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
    const archivePath = path.join(archiveDir, `observations-${timestamp}.jsonl`);
    fs.renameSync(OBSERVATIONS_FILE, archivePath);
  }
}

function truncate(str, maxLen) {
  if (!str) return null;
  const s = typeof str === 'string' ? str : JSON.stringify(str);
  return s.length > maxLen ? s.slice(0, maxLen) + '...' : s;
}

function parseHookData(data, hookPhase) {
  try {
    // Extract fields - Claude Code hook format
    const hookType = data.hook_type || hookPhase || 'unknown';
    const toolName = data.tool_name || data.tool || 'unknown';
    const toolInput = data.tool_input || data.input || {};
    const toolOutput = data.tool_output || data.output || '';
    const sessionId = data.session_id || 'unknown';

    // Determine event type based on hook phase argument or hook_type
    const isPre = hookPhase === 'pre' || (hookType && hookType.toLowerCase().includes('pre'));
    const event = isPre ? 'tool_start' : 'tool_complete';

    return {
      parsed: true,
      event,
      tool: toolName,
      input: isPre ? truncate(toolInput, MAX_CONTENT_LENGTH) : null,
      output: !isPre ? truncate(toolOutput, MAX_CONTENT_LENGTH) : null,
      session: sessionId
    };
  } catch (e) {
    return { parsed: false, error: e.message };
  }
}

function writeObservation(parsed) {
  const timestamp = new Date().toISOString();

  const observation = {
    timestamp,
    event: parsed.event,
    tool: parsed.tool,
    session: parsed.session
  };

  if (parsed.input) observation.input = parsed.input;
  if (parsed.output) observation.output = parsed.output;

  fs.appendFileSync(OBSERVATIONS_FILE, JSON.stringify(observation) + '\n');
}

function writeParseError(rawInput) {
  const timestamp = new Date().toISOString();
  const truncatedRaw = typeof rawInput === 'string'
    ? rawInput.slice(0, 1000)
    : JSON.stringify(rawInput).slice(0, 1000);

  const errorEntry = {
    timestamp,
    event: 'parse_error',
    raw: truncatedRaw
  };

  fs.appendFileSync(OBSERVATIONS_FILE, JSON.stringify(errorEntry) + '\n');
}

async function main() {
  // Get hook phase from command line argument
  const hookPhase = process.argv[2]; // 'pre' or 'post'

  // Ensure config directory exists
  ensureDir(CONFIG_DIR);

  // Check if disabled
  const disabledFile = path.join(CONFIG_DIR, 'disabled');
  if (fs.existsSync(disabledFile)) {
    process.exit(0);
  }

  // Read JSON from stdin
  let inputData = '';

  await new Promise((resolve) => {
    process.stdin.setEncoding('utf8');
    process.stdin.on('data', chunk => { inputData += chunk; });
    process.stdin.on('end', resolve);

    // Timeout after 5 seconds
    setTimeout(resolve, 5000);
  });

  // Exit if no input
  if (!inputData.trim()) {
    process.exit(0);
  }

  // Parse JSON
  let data;
  try {
    data = JSON.parse(inputData);
  } catch (e) {
    writeParseError(inputData);
    process.exit(0);
  }

  // Parse hook data
  const parsed = parseHookData(data, hookPhase);

  if (!parsed.parsed) {
    writeParseError(inputData);
    process.exit(0);
  }

  // Archive if file too large
  archiveIfNeeded();

  // Write observation
  writeObservation(parsed);

  process.exit(0);
}

main().catch(err => {
  console.error('[observe.js] Error:', err.message);
  process.exit(0);
});
