'use strict';

const fs = require('fs');
const path = require('path');

const { writeInstallState } = require('../install-state');

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

function replacePluginRootPlaceholders(value, pluginRoot) {
  if (!pluginRoot) {
    return value;
  }

  if (typeof value === 'string') {
    return value.split('${CLAUDE_PLUGIN_ROOT}').join(pluginRoot);
  }

  if (Array.isArray(value)) {
    return value.map(item => replacePluginRootPlaceholders(item, pluginRoot));
  }

  if (value && typeof value === 'object') {
    return Object.fromEntries(
      Object.entries(value).map(([key, nestedValue]) => [
        key,
        replacePluginRootPlaceholders(nestedValue, pluginRoot),
      ])
    );
  }

  return value;
}

function buildLegacyHookSignature(entry, pluginRoot) {
  if (!entry || typeof entry !== 'object' || Array.isArray(entry)) {
    return null;
  }

  const normalizedEntry = replacePluginRootPlaceholders(entry, pluginRoot);

  if (typeof normalizedEntry.matcher !== 'string' || !Array.isArray(normalizedEntry.hooks)) {
    return null;
  }

  const hookSignature = normalizedEntry.hooks.map(hook => JSON.stringify({
    type: hook && typeof hook === 'object' ? hook.type : undefined,
    command: hook && typeof hook === 'object' ? hook.command : undefined,
    timeout: hook && typeof hook === 'object' ? hook.timeout : undefined,
    async: hook && typeof hook === 'object' ? hook.async : undefined,
  }));

  return JSON.stringify({
    matcher: normalizedEntry.matcher,
    hooks: hookSignature,
  });
}

function getHookEntryAliases(entry, pluginRoot) {
  const aliases = [];

  if (!entry || typeof entry !== 'object' || Array.isArray(entry)) {
    return aliases;
  }

  const normalizedEntry = replacePluginRootPlaceholders(entry, pluginRoot);

  if (typeof normalizedEntry.id === 'string' && normalizedEntry.id.trim().length > 0) {
    aliases.push(`id:${normalizedEntry.id.trim()}`);
  }

  const legacySignature = buildLegacyHookSignature(normalizedEntry, pluginRoot);
  if (legacySignature) {
    aliases.push(`legacy:${legacySignature}`);
  }

  aliases.push(`json:${JSON.stringify(normalizedEntry)}`);

  return aliases;
}

function mergeHookEntries(existingEntries, incomingEntries, pluginRoot) {
  const mergedEntries = [];
  const seenEntries = new Set();

  for (const entry of [...existingEntries, ...incomingEntries]) {
    if (!entry || typeof entry !== 'object' || Array.isArray(entry)) {
      continue;
    }

    if ('id' in entry && typeof entry.id !== 'string') {
      continue;
    }

    const aliases = getHookEntryAliases(entry, pluginRoot);
    if (aliases.some(alias => seenEntries.has(alias))) {
      continue;
    }

    for (const alias of aliases) {
      seenEntries.add(alias);
    }
    mergedEntries.push(replacePluginRootPlaceholders(entry, pluginRoot));
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

  const pluginRoot = plan.targetRoot;
  const hooksDestinationPath = path.join(plan.targetRoot, 'hooks', 'hooks.json');
  const hooksSourcePath = findHooksSourcePath(plan, hooksDestinationPath) || hooksDestinationPath;
  if (!fs.existsSync(hooksSourcePath)) {
    return null;
  }

  const hooksConfig = readJsonObject(hooksSourcePath, 'hooks config');
  const incomingHooks = replacePluginRootPlaceholders(hooksConfig.hooks, pluginRoot);
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
    mergedHooks[eventName] = mergeHookEntries(currentEntries, nextEntries, pluginRoot);
  }

  const mergedSettings = {
    ...settings,
    hooks: mergedHooks,
  };

  return {
    settingsPath,
    mergedSettings,
    hooksDestinationPath,
    resolvedHooksConfig: {
      ...hooksConfig,
      hooks: incomingHooks,
    },
  };
}

function applyInstallPlan(plan) {
  const mergedSettingsPlan = buildMergedSettings(plan);

  for (const operation of plan.operations) {
    fs.mkdirSync(path.dirname(operation.destinationPath), { recursive: true });
    fs.copyFileSync(operation.sourcePath, operation.destinationPath);
  }

  if (mergedSettingsPlan) {
    fs.mkdirSync(path.dirname(mergedSettingsPlan.hooksDestinationPath), { recursive: true });
    fs.writeFileSync(
      mergedSettingsPlan.hooksDestinationPath,
      JSON.stringify(mergedSettingsPlan.resolvedHooksConfig, null, 2) + '\n',
      'utf8'
    );
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
};
