#!/usr/bin/env node
'use strict';

/**
 * Merge ECC-recommended MCP servers into a Codex config.toml.
 *
 * Strategy: ADD-ONLY by default.
 *   - Parse the TOML to detect which mcp_servers.* sections exist.
 *   - Append raw TOML text for any missing servers (preserves existing file byte-for-byte).
 *   - Log warnings when an existing server's config differs from the ECC recommendation.
 *   - With --update-mcp, also replace existing ECC-managed servers.
 *
 * Usage:
 *   node merge-mcp-config.js <config.toml> [--dry-run] [--update-mcp]
 */

const fs = require('fs');

let TOML;
try {
  TOML = require('@iarna/toml');
} catch {
  console.error('[ecc-mcp] Missing dependency: @iarna/toml');
  console.error('[ecc-mcp] Run: npm install   (from the ECC repo root)');
  process.exit(1);
}

// ---------------------------------------------------------------------------
// ECC-recommended MCP servers
// ---------------------------------------------------------------------------

const GH_BOOTSTRAP = 'token=$(gh auth token 2>/dev/null || true); if [ -n "$token" ]; then export GITHUB_PERSONAL_ACCESS_TOKEN="$token"; fi; exec pnpm dlx @modelcontextprotocol/server-github';

/** Each entry: key = section name under mcp_servers, value = { toml, fields }
 *  - toml:   raw TOML text appended to the file (preserves formatting)
 *  - fields: parsed object used for drift detection
 */
const ECC_SERVERS = {
  supabase: {
    fields: {
      command: 'pnpm',
      args: ['dlx', '@supabase/mcp-server-supabase@latest', '--features=account,docs,database,debugging,development,functions,storage,branching'],
      startup_timeout_sec: 20.0,
      tool_timeout_sec: 120.0
    },
    toml: `[mcp_servers.supabase]
command = "pnpm"
args = ["dlx", "@supabase/mcp-server-supabase@latest", "--features=account,docs,database,debugging,development,functions,storage,branching"]
startup_timeout_sec = 20.0
tool_timeout_sec = 120.0`
  },
  playwright: {
    fields: {
      command: 'pnpm',
      args: ['dlx', '@playwright/mcp@latest']
    },
    toml: `[mcp_servers.playwright]
command = "pnpm"
args = ["dlx", "@playwright/mcp@latest"]`
  },
  'context7-mcp': {
    fields: {
      command: 'pnpm',
      args: ['dlx', '@upstash/context7-mcp']
    },
    toml: `[mcp_servers.context7-mcp]
command = "pnpm"
args = ["dlx", "@upstash/context7-mcp"]`
  },
  github: {
    fields: {
      command: 'bash',
      args: ['-lc', GH_BOOTSTRAP]
    },
    toml: `[mcp_servers.github]
command = "bash"
args = ["-lc", ${JSON.stringify(GH_BOOTSTRAP)}]`
  },
  memory: {
    fields: {
      command: 'pnpm',
      args: ['dlx', '@modelcontextprotocol/server-memory']
    },
    toml: `[mcp_servers.memory]
command = "pnpm"
args = ["dlx", "@modelcontextprotocol/server-memory"]`
  },
  'sequential-thinking': {
    fields: {
      command: 'pnpm',
      args: ['dlx', '@modelcontextprotocol/server-sequential-thinking']
    },
    toml: `[mcp_servers.sequential-thinking]
command = "pnpm"
args = ["dlx", "@modelcontextprotocol/server-sequential-thinking"]`
  }
};

// Legacy section names that should be treated as an existing ECC server.
// e.g. old configs shipped [mcp_servers.context7] instead of [mcp_servers.context7-mcp].
const LEGACY_ALIASES = {
  'context7-mcp': ['context7']
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function log(msg) {
  console.log(`[ecc-mcp] ${msg}`);
}

function warn(msg) {
  console.warn(`[ecc-mcp] WARNING: ${msg}`);
}

/** Shallow-compare two objects (one level deep, arrays by JSON). */
function configDiffers(existing, recommended) {
  for (const key of Object.keys(recommended)) {
    const a = existing[key];
    const b = recommended[key];
    if (Array.isArray(b)) {
      if (JSON.stringify(a) !== JSON.stringify(b)) return true;
    } else if (a !== b) {
      return true;
    }
  }
  return false;
}

/**
 * Remove a TOML section and its key-value pairs from raw text.
 * Returns the text with the section removed.
 */
function removeSectionFromText(text, sectionHeader) {
  const lines = text.split('\n');
  const result = [];
  let skipping = false;
  for (const line of lines) {
    const trimmed = line.replace(/\r$/, '');
    if (trimmed === sectionHeader) {
      skipping = true;
      continue;
    }
    if (skipping && /^\[/.test(trimmed)) {
      skipping = false;
    }
    if (!skipping) {
      result.push(line);
    }
  }
  return result.join('\n');
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

function main() {
  const args = process.argv.slice(2);
  const configPath = args.find(a => !a.startsWith('-'));
  const dryRun = args.includes('--dry-run');
  const updateMcp = args.includes('--update-mcp');

  if (!configPath) {
    console.error('Usage: merge-mcp-config.js <config.toml> [--dry-run] [--update-mcp]');
    process.exit(1);
  }

  if (!fs.existsSync(configPath)) {
    console.error(`[ecc-mcp] Config file not found: ${configPath}`);
    process.exit(1);
  }

  let raw = fs.readFileSync(configPath, 'utf8');
  let parsed;
  try {
    parsed = TOML.parse(raw);
  } catch (err) {
    console.error(`[ecc-mcp] Failed to parse ${configPath}: ${err.message}`);
    process.exit(1);
  }

  const existing = parsed.mcp_servers || {};
  const toAppend = [];

  for (const [name, spec] of Object.entries(ECC_SERVERS)) {
    // A subtable-only entry (e.g. mcp_servers.supabase.env without
    // mcp_servers.supabase) appears as a nested object without 'command'.
    // Treat it as missing — the server block itself doesn't exist.
    // Also check legacy aliases (e.g. 'context7' → 'context7-mcp').
    const entry = existing[name];
    const aliases = LEGACY_ALIASES[name] || [];
    const legacyName = aliases.find(a => existing[a] && typeof existing[a].command === 'string');
    const resolvedEntry = entry && typeof entry.command === 'string' ? entry : legacyName ? existing[legacyName] : null;
    const resolvedLabel = legacyName || name;

    if (resolvedEntry) {
      if (updateMcp) {
        // --update-mcp: remove existing section (and legacy alias), will re-add below
        log(`  [update] mcp_servers.${resolvedLabel} → ${name}`);
        raw = removeSectionFromText(raw, `[mcp_servers.${resolvedLabel}]`);
        if (resolvedLabel !== name) {
          raw = removeSectionFromText(raw, `[mcp_servers.${name}]`);
        }
        // Also remove sub-sections (e.g., mcp_servers.supabase.env)
        for (const key of Object.keys(existing)) {
          if (key.startsWith(name + '.') || key.startsWith(resolvedLabel + '.')) {
            raw = removeSectionFromText(raw, `[mcp_servers.${key}]`);
          }
        }
        toAppend.push(spec.toml);
      } else {
        // Add-only mode: skip, but warn about drift
        if (legacyName) {
          warn(`mcp_servers.${legacyName} is a legacy name for ${name} (run with --update-mcp to migrate)`);
        } else if (configDiffers(resolvedEntry, spec.fields)) {
          warn(`mcp_servers.${name} differs from ECC recommendation (run with --update-mcp to refresh)`);
        } else {
          log(`  [ok] mcp_servers.${name}`);
        }
      }
    } else {
      log(`  [add] mcp_servers.${name}`);
      toAppend.push(spec.toml);
    }
  }

  if (toAppend.length === 0) {
    log('All ECC MCP servers already present. Nothing to do.');
    return;
  }

  const appendText = '\n' + toAppend.join('\n\n') + '\n';

  if (dryRun) {
    log('Dry run — would append:');
    console.log(appendText);
    return;
  }

  // Write: for add-only, append to preserve existing content byte-for-byte.
  // For --update-mcp, we modified `raw` above, so write the full file + appended sections.
  if (updateMcp) {
    // Remove trailing whitespace from modified raw, then append
    const cleaned = raw.replace(/\n+$/, '\n');
    fs.writeFileSync(configPath, cleaned + appendText, 'utf8');
  } else {
    fs.appendFileSync(configPath, appendText, 'utf8');
  }

  log(`Done. ${toAppend.length} server(s) ${updateMcp ? 'updated' : 'added'}.`);
}

main();
