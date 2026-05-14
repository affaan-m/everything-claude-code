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
      let bodyInSingle = false;
      let bodyInDouble = false;
      i += 2;
      while (i < source.length && depth > 0) {
        const inner = source[i];
        const innerPrev = source[i - 1];
        if (inner === '\\' && !bodyInSingle) {
          body += inner;
          if (i + 1 < source.length) {
            body += source[i + 1];
            i += 2;
            continue;
          }
        }
        if (inner === "'" && !bodyInDouble && innerPrev !== '\\') {
          bodyInSingle = !bodyInSingle;
        } else if (inner === '"' && !bodyInSingle && innerPrev !== '\\') {
          bodyInDouble = !bodyInDouble;
        } else if (!bodyInSingle && !bodyInDouble) {
          if (inner === '(') {
            depth += 1;
          } else if (inner === ')') {
            depth -= 1;
            if (depth === 0) {
              break;
            }
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

/**
 * Extract bodies of plain `(...)` subshell groups.
 *
 * Bash treats `(npm run dev)` as a subshell that executes its contents, but
 * the regex-light segment splitters used by our PreToolUse hooks don't peer
 * inside those parens. This helper finds top-level `(...)` groups (skipping
 * `$(...)` command substitutions and backticks, which `extractCommandSubstitutions`
 * already covers) and returns each body, recursing for nested groups.
 *
 * Quote semantics:
 * - Single quotes are literal: `'( ... )'` is a string, not a subshell.
 * - Double quotes are literal *for parens*: `"( ... )"` is a string too —
 *   bash only honors `$( )` inside double quotes, not bare `( )`.
 *
 * @param {string} input
 * @returns {string[]}
 */
function extractSubshellGroups(input) {
  const source = String(input || '');
  const groups = [];
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

    if (inSingle || inDouble) {
      continue;
    }

    if (ch === '$' && source[i + 1] === '(') {
      let depth = 1;
      let skipInSingle = false;
      let skipInDouble = false;
      i += 2;
      while (i < source.length && depth > 0) {
        const inner = source[i];
        const innerPrev = source[i - 1];
        if (inner === '\\' && !skipInSingle) {
          i += 2;
          continue;
        }
        if (inner === "'" && !skipInDouble && innerPrev !== '\\') {
          skipInSingle = !skipInSingle;
        } else if (inner === '"' && !skipInSingle && innerPrev !== '\\') {
          skipInDouble = !skipInDouble;
        } else if (!skipInSingle && !skipInDouble) {
          if (inner === '(') depth += 1;
          else if (inner === ')') depth -= 1;
        }
        i += 1;
      }
      i -= 1;
      continue;
    }

    if (ch === '`') {
      i += 1;
      while (i < source.length && source[i] !== '`') {
        if (source[i] === '\\' && i + 1 < source.length) {
          i += 2;
          continue;
        }
        i += 1;
      }
      continue;
    }

    if (ch === '(') {
      let depth = 1;
      let body = '';
      let bodyInSingle = false;
      let bodyInDouble = false;
      i += 1;
      while (i < source.length && depth > 0) {
        const inner = source[i];
        const innerPrev = source[i - 1];
        if (inner === '\\' && !bodyInSingle) {
          body += inner;
          if (i + 1 < source.length) {
            body += source[i + 1];
            i += 2;
            continue;
          }
        }
        if (inner === "'" && !bodyInDouble && innerPrev !== '\\') {
          bodyInSingle = !bodyInSingle;
        } else if (inner === '"' && !bodyInSingle && innerPrev !== '\\') {
          bodyInDouble = !bodyInDouble;
        } else if (!bodyInSingle && !bodyInDouble) {
          if (inner === '(') {
            depth += 1;
          } else if (inner === ')') {
            depth -= 1;
            if (depth === 0) {
              break;
            }
          }
        }
        body += inner;
        i += 1;
      }
      if (body.trim()) {
        groups.push(body);
        groups.push(...extractSubshellGroups(body));
      }
    }
  }

  return groups;
}

module.exports = { extractCommandSubstitutions, extractSubshellGroups };
