#!/usr/bin/env node
/**
 * NanoClaw — Barebones Agent REPL for Everything Claude Code
 *
 * A persistent, session-aware AI agent loop that delegates to `claude -p`.
 * Zero external dependencies. Markdown-as-database. Synchronous REPL.
 *
 * Usage:
 *   node scripts/claw.js
 *   CLAW_SESSION=my-project node scripts/claw.js
 *   CLAW_SKILLS=tdd-workflow,security-review node scripts/claw.js
 */

'use strict';

const fs = require('fs');
const path = require('path');
const os = require('os');
const { spawnSync } = require('child_process');
const readline = require('readline');

// ─── Session name validation ────────────────────────────────────────────────

const SESSION_NAME_RE = /^[a-zA-Z0-9][-a-zA-Z0-9]*$/;

function isValidSessionName(name) {
  return typeof name === 'string' && name.length > 0 && SESSION_NAME_RE.test(name);
}

// ─── Storage Adapter (Markdown-as-Database) ─────────────────────────────────

function getClawDir() {
  return path.join(os.homedir(), '.claude', 'claw');
}

function getSessionPath(name) {
  return path.join(getClawDir(), name + '.md');
}

function listSessions(dir) {
  const clawDir = dir || getClawDir();
  if (!fs.existsSync(clawDir)) {
    return [];
  }
  return fs.readdirSync(clawDir)
    .filter(f => f.endsWith('.md'))
    .map(f => f.replace(/\.md$/, ''));
}

function loadHistory(filePath) {
  try {
    return fs.readFileSync(filePath, 'utf8');
  } catch (_err) {
    return '';
  }
}

function appendTurn(filePath, role, content, timestamp) {
  const ts = timestamp || new Date().toISOString();
  const entry = `### [${ts}] ${role}\n${content}\n---\n`;
  const dir = path.dirname(filePath);
  fs.mkdirSync(dir, { recursive: true });
  fs.appendFileSync(filePath, entry, 'utf8');
}

// ─── Context & Delegation Pipeline ──────────────────────────────────────────

function loadECCContext(skillList) {
  const raw = skillList !== undefined ? skillList : (process.env.CLAW_SKILLS || '');
  if (!raw.trim()) {
    return '';
  }

  const names = raw.split(',').map(s => s.trim()).filter(Boolean);
  const chunks = [];

  for (const name of names) {
    const skillPath = path.join(process.cwd(), 'skills', name, 'SKILL.md');
    try {
      const content = fs.readFileSync(skillPath, 'utf8');
      chunks.push(content);
    } catch (_err) {
      // Gracefully skip missing skills
    }
  }

  return chunks.join('\n\n');
}

function buildPrompt(systemPrompt, history, userMessage) {
  const parts = [];
  if (systemPrompt) {
    parts.push('=== SYSTEM CONTEXT ===\n' + systemPrompt + '\n');
  }
  if (history) {
    parts.push('=== CONVERSATION HISTORY ===\n' + history + '\n');
  }
  parts.push('=== USER MESSAGE ===\n' + userMessage);
  return parts.join('\n');
}

function askClaude(systemPrompt, history, userMessage) {
  const fullPrompt = buildPrompt(systemPrompt, history, userMessage);

  const result = spawnSync('claude', ['-p', fullPrompt], {
    encoding: 'utf8',
    stdio: ['pipe', 'pipe', 'pipe'],
    env: { ...process.env, CLAUDECODE: '' },
    timeout: 300000 // 5 minute timeout
  });

  if (result.error) {
    return '[Error: ' + result.error.message + ']';
  }

  if (result.status !== 0 && result.stderr) {
    return '[Error: claude exited with code ' + result.status + ': ' + result.stderr.trim() + ']';
  }

  return (result.stdout || '').trim();
}

// ─── REPL Commands ──────────────────────────────────────────────────────────

function handleClear(sessionPath) {
  fs.mkdirSync(path.dirname(sessionPath), { recursive: true });
  fs.writeFileSync(sessionPath, '', 'utf8');
  console.log('Session cleared.');
}

function handleHistory(sessionPath) {
  const history = loadHistory(sessionPath);
  if (!history) {
    console.log('(no history)');
  } else {
    console.log(history);
  }
}

function handleSessions(dir) {
  const sessions = listSessions(dir);
  if (sessions.length === 0) {
    console.log('(no sessions)');
  } else {
    console.log('Sessions:');
    for (const s of sessions) {
      console.log('  - ' + s);
    }
  }
}

function handleHelp() {
  console.log('NanoClaw REPL Commands:');
  console.log('  /clear      Clear current session history');
  console.log('  /history    Print full conversation history');
  console.log('  /sessions   List all saved sessions');
  console.log('  /help       Show this help message');
  console.log('  exit        Quit the REPL');
}

// ─── Main REPL ──────────────────────────────────────────────────────────────

function main() {
  const sessionName = process.env.CLAW_SESSION || 'default';

  if (!isValidSessionName(sessionName)) {
    console.error('Error: Invalid session name "' + sessionName + '". Use alphanumeric characters and hyphens only.');
    process.exit(1);
  }

  const clawDir = getClawDir();
  fs.mkdirSync(clawDir, { recursive: true });

  const sessionPath = getSessionPath(sessionName);
  const eccContext = loadECCContext();

  const requestedSkills = (process.env.CLAW_SKILLS || '').split(',').map(s => s.trim()).filter(Boolean);
  const loadedCount = requestedSkills.filter(name =>
    fs.existsSync(path.join(process.cwd(), 'skills', name, 'SKILL.md'))
  ).length;

  console.log('NanoClaw v1.0 — Session: ' + sessionName);
  if (loadedCount > 0) {
    console.log('Loaded ' + loadedCount + ' skill(s) as context.');
  }
  console.log('Type /help for commands, exit to quit.\n');

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  const prompt = () => {
    rl.question('claw> ', (input) => {
      const line = input.trim();

      if (!line) {
        prompt();
        return;
      }

      if (line === 'exit') {
        console.log('Goodbye.');
        rl.close();
        return;
      }

      if (line === '/clear') {
        handleClear(sessionPath);
        prompt();
        return;
      }

      if (line === '/history') {
        handleHistory(sessionPath);
        prompt();
        return;
      }

      if (line === '/sessions') {
        handleSessions();
        prompt();
        return;
      }

      if (line === '/help') {
        handleHelp();
        prompt();
        return;
      }

      // Regular message — send to Claude
      const history = loadHistory(sessionPath);
      appendTurn(sessionPath, 'User', line);
      const response = askClaude(eccContext, history, line);
      console.log('\n' + response + '\n');
      appendTurn(sessionPath, 'Assistant', response);

      prompt();
    });
  };

  prompt();
}

// ─── Exports & CLI Entry ────────────────────────────────────────────────────

module.exports = {
  getClawDir,
  getSessionPath,
  listSessions,
  loadHistory,
  appendTurn,
  loadECCContext,
  askClaude,
  buildPrompt,
  isValidSessionName,
  handleClear,
  handleHistory,
  handleSessions,
  handleHelp,
  main
};

if (require.main === module) {
  main();
}
