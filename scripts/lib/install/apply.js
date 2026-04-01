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

// Deduplicates hook entries by id when present (existing entries take precedence).
// Falls back to exact-match dedup for legacy entries without an id field.
// Note: first reinstall after upgrading from a pre-id version may retain one
// duplicate per hook (old entry keyed by JSON, new entry keyed by id).
// Effective deduplication resumes on the second reinstall.
function mergeHookEntries(existingEntries, incomingEntries) {
  const byId = new Map();

  for (const entry of [...existingEntries, ...incomingEntries]) {
    if (!entry || typeof entry !== 'object' || Array.isArray(entry)) {
      console.error(`[mergeHookEntries] Invalid hook entry: expected object, got ${JSON.stringify(entry)} — skipping`);
      continue;
    }
    if ('id' in entry && typeof entry.id !== 'string') {
      console.error(`[mergeHookEntries] Invalid hook entry: id must be string, got ${typeof entry.id} — skipping`);
      continue;
    }
    const id = entry.id;
    if (id !== undefined) {
      if (!byId.has(id)) {
        byId.set(id, entry);
      }
    } else {
      const key = JSON.stringify(entry);
      if (!byId.has(key)) {
        byId.set(key, entry);
      }
    }
  }

  return Array.from(byId.values());
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
