#!/usr/bin/env node
'use strict';

/**
 * Merge the non-MCP Codex baseline from `.codex/config.toml` into a target
 * `config.toml` without overwriting existing user choices.
 *
 * Strategy: add-only.
 * - Missing root keys are inserted before the first TOML table.
 * - Missing table keys are appended to existing tables.
 * - Missing tables are appended to the end of the file.
 */

const fs = require('fs');
const path = require('path');

let TOML;
try {
  TOML = require('@iarna/toml');
} catch {
  console.error('[ecc-codex] Missing dependency: @iarna/toml');
  console.error('[ecc-codex] Run: npm install   (from the ECC repo root)');
  process.exit(1);
}

const ROOT_KEYS = ['approval_policy', 'sandbox_mode', 'web_search', 'notify', 'persistent_instructions'];
const TABLE_PATHS = [
  'features',
  'profiles.strict',
  'profiles.yolo',
  'agents',
  'agents.explorer',
  'agents.reviewer',
  'agents.docs_researcher',
];

function log(message) {
  console.log(`[ecc-codex] ${message}`);
}

function getNested(obj, pathParts) {
  let current = obj;
  for (const part of pathParts) {
    if (!current || typeof current !== 'object' || !(part in current)) {
      return undefined;
    }
    current = current[part];
  }
  return current;
}

function setNested(obj, pathParts, value) {
  let current = obj;
  for (let i = 0; i < pathParts.length - 1; i += 1) {
    const part = pathParts[i];
    if (!current[part] || typeof current[part] !== 'object' || Array.isArray(current[part])) {
      current[part] = {};
    }
    current = current[part];
  }
  current[pathParts[pathParts.length - 1]] = value;
}

function findFirstTableIndex(raw) {
  const match = /^\s*\[/m.exec(raw);
  return match ? match.index : -1;
}

function findTableRange(raw, tablePath) {
  const escaped = tablePath.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const headerPattern = new RegExp(`^\\s*\\[${escaped}\\]\\s*(?:#.*)?$`, 'm');
  const match = headerPattern.exec(raw);
  if (!match) {
    return null;
  }

  const headerEnd = raw.indexOf('\n', match.index);
  const bodyStart = headerEnd === -1 ? raw.length : headerEnd + 1;
  const nextHeaderRel = raw.slice(bodyStart).search(/^\s*\[/m);
  const bodyEnd = nextHeaderRel === -1 ? raw.length : bodyStart + nextHeaderRel;
  return { bodyStart, bodyEnd };
}

function ensureTrailingNewline(text) {
  return text.endsWith('\n') ? text : `${text}\n`;
}

function insertBeforeFirstTable(raw, block) {
  const normalizedBlock = ensureTrailingNewline(block.trimEnd());
  const firstTableIndex = findFirstTableIndex(raw);
  if (firstTableIndex === -1) {
    const prefix = raw.trimEnd();
    return prefix ? `${prefix}\n${normalizedBlock}` : normalizedBlock;
  }

  const before = raw.slice(0, firstTableIndex).trimEnd();
  const after = raw.slice(firstTableIndex).replace(/^\n+/, '');
  return `${before}\n\n${normalizedBlock}\n${after}`;
}

function appendBlock(raw, block) {
  const prefix = raw.trimEnd();
  const normalizedBlock = block.trimEnd();
  return prefix ? `${prefix}\n\n${normalizedBlock}\n` : `${normalizedBlock}\n`;
}

function appendToTable(raw, tablePath, block) {
  const range = findTableRange(raw, tablePath);
  if (!range) {
    return appendBlock(raw, block);
  }

  const before = raw.slice(0, range.bodyEnd).trimEnd();
  const after = raw.slice(range.bodyEnd).replace(/^\n*/, '\n');
  return `${before}\n${block.trimEnd()}\n${after}`;
}

function stringifyRootKeys(keys) {
  return TOML.stringify(keys).trim();
}

function stringifyTable(tablePath, value) {
  const scalarOnly = {};
  for (const [key, entryValue] of Object.entries(value)) {
    if (entryValue && typeof entryValue === 'object' && !Array.isArray(entryValue)) {
      continue;
    }
    scalarOnly[key] = entryValue;
  }

  const snippet = {};
  setNested(snippet, tablePath.split('.'), scalarOnly);
  return TOML.stringify(snippet).trim();
}

function stringifyTableKeys(tableValue) {
  const lines = [];
  for (const [key, value] of Object.entries(tableValue)) {
    if (value && typeof value === 'object' && !Array.isArray(value)) {
      continue;
    }
    lines.push(TOML.stringify({ [key]: value }).trim());
  }
  return lines.join('\n');
}

function main() {
  const args = process.argv.slice(2);
  const configPath = args.find(arg => !arg.startsWith('-'));
  const dryRun = args.includes('--dry-run');

  if (!configPath) {
    console.error('Usage: merge-codex-config.js <config.toml> [--dry-run]');
    process.exit(1);
  }

  const referencePath = path.join(__dirname, '..', '..', '.codex', 'config.toml');
  if (!fs.existsSync(referencePath)) {
    console.error(`[ecc-codex] Reference config not found: ${referencePath}`);
    process.exit(1);
  }

  if (!fs.existsSync(configPath)) {
    console.error(`[ecc-codex] Config file not found: ${configPath}`);
    process.exit(1);
  }

  const raw = fs.readFileSync(configPath, 'utf8');
  const referenceRaw = fs.readFileSync(referencePath, 'utf8');

  let targetConfig;
  let referenceConfig;
  try {
    targetConfig = TOML.parse(raw);
    referenceConfig = TOML.parse(referenceRaw);
  } catch (error) {
    console.error(`[ecc-codex] Failed to parse TOML: ${error.message}`);
    process.exit(1);
  }

  const missingRootKeys = {};
  for (const key of ROOT_KEYS) {
    if (referenceConfig[key] !== undefined && targetConfig[key] === undefined) {
      missingRootKeys[key] = referenceConfig[key];
    }
  }

  const missingTables = [];
  const missingTableKeys = [];
  for (const tablePath of TABLE_PATHS) {
    const pathParts = tablePath.split('.');
    const referenceValue = getNested(referenceConfig, pathParts);
    if (referenceValue === undefined) {
      continue;
    }

    const targetValue = getNested(targetConfig, pathParts);
    if (targetValue === undefined) {
      missingTables.push(tablePath);
      continue;
    }

    const missingKeys = {};
    for (const [key, value] of Object.entries(referenceValue)) {
      if (value && typeof value === 'object' && !Array.isArray(value)) {
        continue;
      }
      if (targetValue[key] === undefined) {
        missingKeys[key] = value;
      }
    }

    if (Object.keys(missingKeys).length > 0) {
      missingTableKeys.push({ tablePath, missingKeys });
    }
  }

  if (
    Object.keys(missingRootKeys).length === 0 &&
    missingTables.length === 0 &&
    missingTableKeys.length === 0
  ) {
    log('All baseline Codex settings already present. Nothing to do.');
    return;
  }

  let nextRaw = raw;
  if (Object.keys(missingRootKeys).length > 0) {
    log(`  [add-root] ${Object.keys(missingRootKeys).join(', ')}`);
    nextRaw = insertBeforeFirstTable(nextRaw, stringifyRootKeys(missingRootKeys));
  }

  for (const { tablePath, missingKeys } of missingTableKeys) {
    log(`  [add-keys] [${tablePath}] -> ${Object.keys(missingKeys).join(', ')}`);
    nextRaw = appendToTable(nextRaw, tablePath, stringifyTableKeys(missingKeys));
  }

  for (const tablePath of missingTables) {
    log(`  [add-table] [${tablePath}]`);
    nextRaw = appendBlock(nextRaw, stringifyTable(tablePath, getNested(referenceConfig, tablePath.split('.'))));
  }

  if (dryRun) {
    log('Dry run — would write the merged Codex baseline.');
    return;
  }

  fs.writeFileSync(configPath, nextRaw, 'utf8');
  log('Done. Baseline Codex settings merged.');
}

main();
