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

  const mergedSettings = {
    ...settings,
    hooks: mergedHooks,
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
};
