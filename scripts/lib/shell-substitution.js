'use strict';

/**
 * Extract executable command-substitution bodies from a shell line.
 *
 * Single quotes are literal, so substitutions inside them are ignored;
 * double quotes still permit substitutions, so those bodies are scanned
 * before quoted text is stripped. Returns each substitution body plus
 * any nested substitutions discovered recursively.
 *
 * Originally introduced in scripts/hooks/gateguard-fact-force.js
 * (PR #1853 round 2). Extracted to a shared lib so other PreToolUse
 * hooks that need the same "scan inside `$(...)` and backticks"
 * behavior can reuse it without duplicating the parser.
 *
 * @param {string} input
 * @returns {string[]}
 */
function extractCommandSubstitutions(input) {
  const source = String(input || '');
  const substitutions = [];
  let inSingle = false;
  let inDouble = false;

  for (let i = 0; i < source.length; i++) {
    const ch = source[i];
    const prev = source[i - 1];

    if (ch === '\\' && !inSingle) {
      i += 1;
      continue;
    }

    if (ch === "'" && !inDouble && prev !== '\\') {
      inSingle = !inSingle;
      continue;
    }

    if (ch === '"' && !inSingle && prev !== '\\') {
      inDouble = !inDouble;
      continue;
    }

    if (inSingle) {
      continue;
    }

    if (ch === '`') {
      let body = '';
      i += 1;
      while (i < source.length) {
        const inner = source[i];
        if (inner === '\\') {
          body += inner;
          if (i + 1 < source.length) {
            body += source[i + 1];
            i += 2;
            continue;
          }
        }
        if (inner === '`') {
          break;
        }
        body += inner;
        i += 1;
      }
      if (body.trim()) {
        substitutions.push(body);
        substitutions.push(...extractCommandSubstitutions(body));
      }
      continue;
    }

    if (ch === '$' && source[i + 1] === '(') {
      let depth = 1;
      let body = '';
      i += 2;
      while (i < source.length && depth > 0) {
        const inner = source[i];
        if (inner === '\\') {
          body += inner;
          if (i + 1 < source.length) {
            body += source[i + 1];
            i += 2;
            continue;
          }
        }
        if (inner === '(') {
          depth += 1;
        } else if (inner === ')') {
          depth -= 1;
          if (depth === 0) {
            break;
          }
        }
        body += inner;
        i += 1;
      }
      if (body.trim()) {
        substitutions.push(body);
        substitutions.push(...extractCommandSubstitutions(body));
      }
    }
  }

  return substitutions;
}

module.exports = { extractCommandSubstitutions };
