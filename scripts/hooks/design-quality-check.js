#!/usr/bin/env node
/**
 * PostToolUse Hook: Design quality check for frontend files
 *
 * Checks if the written/edited file is a frontend file (.vue, .tsx, .jsx,
 * .html, .css, .svelte). If not, exits immediately (no LLM call).
 * If it IS a frontend file, emits a warning reminding the developer to
 * check for generic/template-looking UI patterns.
 *
 * Converted from type: "prompt" to type: "command" to avoid firing an
 * LLM call on every Write/Edit/MultiEdit for non-frontend files.
 */

'use strict';

const FRONTEND_EXTENSIONS = /\.(vue|tsx|jsx|html|css|svelte)$/;

const DESIGN_CHECKLIST = [
  'visual hierarchy (3:1+ scale contrast between heading and body)',
  'intentional white space (asymmetric, not uniform padding)',
  'depth/layering (overlapping elements, shadows, z-index)',
  'hover/focus/active states with transitions',
  'color with purpose (semantic, not decorative)',
];

/**
 * Exportable run() for in-process execution via run-with-flags.js.
 */
function run(inputOrRaw, _options = {}) {
  let input;
  try {
    input = typeof inputOrRaw === 'string'
      ? (inputOrRaw.trim() ? JSON.parse(inputOrRaw) : {})
      : (inputOrRaw || {});
  } catch {
    return { exitCode: 0 };
  }

  const filePath = String(input?.tool_input?.file_path || '');

  if (!filePath || !FRONTEND_EXTENSIONS.test(filePath)) {
    // Not a frontend file — skip silently
    return { exitCode: 0 };
  }

  // Frontend file detected — emit design quality reminder
  const checklist = DESIGN_CHECKLIST.map(item => `  - ${item}`).join('\n');

  return {
    exitCode: 0,
    stderr:
      `[Hook] DESIGN CHECK: Frontend file modified → ${filePath}\n` +
      '[Hook] Verify this is not generic/template-looking UI. Check for:\n' +
      checklist + '\n' +
      '[Hook] If it looks like default AI-generated output, iterate on the design.',
  };
}

module.exports = { run };

// Stdin fallback for spawnSync execution
const MAX_STDIN = 1024 * 1024;
let data = '';

process.stdin.setEncoding('utf8');
process.stdin.on('data', c => {
  if (data.length < MAX_STDIN) {
    const remaining = MAX_STDIN - data.length;
    data += c.substring(0, remaining);
  }
});

process.stdin.on('end', () => {
  const result = run(data);

  if (result.stderr) {
    process.stderr.write(result.stderr + '\n');
  }

  process.stdout.write(data);
});
