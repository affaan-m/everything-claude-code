'use strict';

const fs = require('fs');
const path = require('path');

const { writeInstallState } = require('../install-state');

/**
 * Replace all occurrences of `${CLAUDE_PLUGIN_ROOT}` in hook command strings
 * with the actual resolved install root path.
 *
 * This prevents hook failures when CLAUDE_PLUGIN_ROOT is unset at runtime —
 * the absolute path is baked in at install time instead.
 *
 * @param {object} hooks  The merged hooks object (mutated in-place on entries)
 * @param {string} root   The resolved ECC install root (absolute path)
 * @returns {object} New hooks object with paths resolved
 */
function resolvePluginRootInHooks(hooks, root) {
  if (!hooks || typeof hooks !== 'object' || Array.isArray(hooks)) {
    return hooks;
  }

  const placeholder = '${CLAUDE_PLUGIN_ROOT}';
  const escapedRoot = root.replace(/\\/g, '\\\\');

  function resolveValue(value) {
    if (typeof value === 'string' && value.includes(placeholder)) {
      // On Windows, backslashes in paths must be escaped inside double-quoted
      // shell strings. Replace each backslash with two backslashes.
      return value.split(placeholder).join(
        process.platform === 'win32' ? escapedRoot : root
      );
    }
    return value;
  }

  const resolved = {};
  for (const [eventName, entries] of Object.entries(hooks)) {
    if (!Array.isArray(entries)) {
      resolved[eventName] = entries;
      continue;
    }
    resolved[eventName] = entries.map(entry => {
      if (!entry || typeof entry !== 'object' || Array.isArray(entry)) {
        return entry;
      }
      if (!Array.isArray(entry.hooks)) {
        return entry;
      }
      return {
        ...entry,
        hooks: entry.hooks.map(hook => {
          if (!hook || typeof hook !== 'object' || typeof hook.command !== 'string') {
            return hook;
          }
          return { ...hook, command: resolveValue(hook.command) };
        }),
      };
    });
  }
  return resolved;
}

function readJsonObject(filePath, label) {
  let parsed;
  try {
    parsed = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  } catch (error) {
    throw new Error(`Failed to parse ${label} at ${filePath}: ${error.message}`);
  }

  if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
    throw new Error(`Invalid ${label} at ${filePath}: expected a JSON object`);
  }

  return parsed;
}

function buildLegacyHookSignature(entry) {
  if (!entry || typeof entry !== 'object' || Array.isArray(entry)) {
    return null;
  }

  if (typeof entry.matcher !== 'string' || !Array.isArray(entry.hooks)) {
    return null;
  }

  const hookSignature = entry.hooks.map(hook => JSON.stringify({
    type: hook && typeof hook === 'object' ? hook.type : undefined,
    command: hook && typeof hook === 'object' ? hook.command : undefined,
    timeout: hook && typeof hook === 'object' ? hook.timeout : undefined,
    async: hook && typeof hook === 'object' ? hook.async : undefined,
  }));

  return JSON.stringify({
    matcher: entry.matcher,
    hooks: hookSignature,
  });
}

function getHookEntryAliases(entry) {
  const aliases = [];

  if (!entry || typeof entry !== 'object' || Array.isArray(entry)) {
    return aliases;
  }

  if (typeof entry.id === 'string' && entry.id.trim().length > 0) {
    aliases.push(`id:${entry.id.trim()}`);
  }

  const legacySignature = buildLegacyHookSignature(entry);
  if (legacySignature) {
    aliases.push(`legacy:${legacySignature}`);
  }

  aliases.push(`json:${JSON.stringify(entry)}`);

  return aliases;
}

function mergeHookEntries(existingEntries, incomingEntries) {
  const mergedEntries = [];
  const seenEntries = new Set();

  for (const entry of [...existingEntries, ...incomingEntries]) {
    if (!entry || typeof entry !== 'object' || Array.isArray(entry)) {
      continue;
    }

    if ('id' in entry && typeof entry.id !== 'string') {
      continue;
    }

    const aliases = getHookEntryAliases(entry);
    if (aliases.some(alias => seenEntries.has(alias))) {
      continue;
    }

    for (const alias of aliases) {
      seenEntries.add(alias);
    }
    mergedEntries.push(entry);
  }

  return mergedEntries;
}

function findHooksSourcePath(plan, hooksDestinationPath) {
  const operation = plan.operations.find(item => item.destinationPath === hooksDestinationPath);
  return operation ? operation.sourcePath : null;
}

function buildMergedSettings(plan) {
  if (!plan.adapter || plan.adapter.target !== 'claude') {
    return null;
  }

  const hooksDestinationPath = path.join(plan.targetRoot, 'hooks', 'hooks.json');
  const hooksSourcePath = findHooksSourcePath(plan, hooksDestinationPath) || hooksDestinationPath;
  if (!fs.existsSync(hooksSourcePath)) {
    return null;
  }

  const hooksConfig = readJsonObject(hooksSourcePath, 'hooks config');
  const incomingHooks = hooksConfig.hooks;
  if (!incomingHooks || typeof incomingHooks !== 'object' || Array.isArray(incomingHooks)) {
    throw new Error(`Invalid hooks config at ${hooksSourcePath}: expected "hooks" to be a JSON object`);
  }

  const settingsPath = path.join(plan.targetRoot, 'settings.json');
  let settings = {};
  if (fs.existsSync(settingsPath)) {
    settings = readJsonObject(settingsPath, 'existing settings');
  }

  const existingHooks = settings.hooks && typeof settings.hooks === 'object' && !Array.isArray(settings.hooks)
    ? settings.hooks
    : {};
  const mergedHooks = { ...existingHooks };

  for (const [eventName, incomingEntries] of Object.entries(incomingHooks)) {
    const currentEntries = Array.isArray(existingHooks[eventName]) ? existingHooks[eventName] : [];
    const nextEntries = Array.isArray(incomingEntries) ? incomingEntries : [];
    mergedHooks[eventName] = mergeHookEntries(currentEntries, nextEntries);
  }

  // Resolve ${CLAUDE_PLUGIN_ROOT} to the actual install path so hooks work
  // even when the env var is unset at runtime. See: issue #547, #691.
  const resolvedHooks = resolvePluginRootInHooks(mergedHooks, plan.targetRoot);

  const mergedSettings = {
    ...settings,
    hooks: resolvedHooks,
  };

  return {
    settingsPath,
    mergedSettings,
  };
}

function applyInstallPlan(plan) {
  const mergedSettingsPlan = buildMergedSettings(plan);

  for (const operation of plan.operations) {
    fs.mkdirSync(path.dirname(operation.destinationPath), { recursive: true });
    fs.copyFileSync(operation.sourcePath, operation.destinationPath);
  }

  if (mergedSettingsPlan) {
    fs.mkdirSync(path.dirname(mergedSettingsPlan.settingsPath), { recursive: true });
    fs.writeFileSync(
      mergedSettingsPlan.settingsPath,
      JSON.stringify(mergedSettingsPlan.mergedSettings, null, 2) + '\n',
      'utf8'
    );
  }

  writeInstallState(plan.installStatePath, plan.statePreview);

  return {
    ...plan,
    applied: true,
  };
}

module.exports = {
  applyInstallPlan,
  resolvePluginRootInHooks,
};
