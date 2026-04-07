#!/usr/bin/env node
/**
 * gemini-adapt-agents.js
 *
 * Converts Claude Code agent files (.gemini/agents/*.md) to Gemini CLI format.
 * Run this after copying ECC agents into a project's .gemini/agents/ directory.
 *
 * Only processes .md files directly inside agents-dir (non-recursive).
 * Gemini CLI expects a flat .gemini/agents/ directory with no subdirectories.
 *
 * Usage:
 *   node gemini-adapt-agents.js [agents-dir]
 *   # defaults to ./.gemini/agents
 */

const fs = require('fs');
const path = require('path');

const TOOL_MAP = {
  Read: 'read_file',
  read: 'read_file',
  Write: 'write_file',
  write: 'write_file',
  Edit: 'replace',
  edit: 'replace',
  Bash: 'run_shell_command',
  bash: 'run_shell_command',
  Grep: 'grep_search',
  grep: 'grep_search',
  Glob: 'glob',
  glob: 'glob',
  WebSearch: 'google_web_search',
  WebFetch: 'web_fetch',
};

// Gemini CLI does not support these frontmatter keys
// Note: 'model' is valid in Gemini CLI schema — do NOT strip it
const UNSUPPORTED_KEYS = ['color'];

function adaptContent(content) {
  let result = content;

  // Rewrite only the frontmatter block (first --- ... --- section)
  result = result.replace(/^---\r?\n([\s\S]*?\r?\n)---/m, (block) => {
    let fm = block;

    // Convert tools array (quoted or unquoted)
    fm = fm.replace(/^tools:\s*\[([^\]]+)\]/m, (_, inner) => {
      const tools = inner.split(',').map(t => {
        let name = t.trim().replace(/^"|"$/g, '');
        // Convert Claude Code MCP format (mcp__server__tool) to Gemini CLI (mcp_server_tool)
        if (name.startsWith('mcp__')) {
          name = 'mcp_' + name.slice(5).replace(/__/g, '_');
        }
        return '"' + (TOOL_MAP[name] || name) + '"';
      });
      return 'tools: [' + tools.join(', ') + ']';
    });

    // Remove unsupported frontmatter keys
    for (const key of UNSUPPORTED_KEYS) {
      fm = fm.replace(new RegExp(`^${key}:.*(?:\\r?\\n|$)`, 'm'), '');
    }

    return fm;
  });

  return result;
}

module.exports = { adaptContent };

if (require.main === module) {
  const agentsDir = process.argv[2] || path.join(process.cwd(), '.gemini', 'agents');

  if (!fs.existsSync(agentsDir)) {
    console.error('Directory not found:', agentsDir);
    process.exit(1);
  }

  const files = fs.readdirSync(agentsDir).filter(f => f.endsWith('.md'));
  let changed = 0;

  for (const f of files) {
    const fp = path.join(agentsDir, f);
    const original = fs.readFileSync(fp, 'utf8');
    const adapted = adaptContent(original);
    if (adapted !== original) {
      fs.writeFileSync(fp, adapted);
      changed++;
    }
  }

  console.log(`gemini-adapt-agents: fixed ${changed}/${files.length} files in ${agentsDir}`);
}
