'use strict';

const path = require('path');
const { cloneValue, readJson } = require('./file_utils.ts');

const DEFAULT_CONFIG = {
  model: {
    provider: 'mock',
    name: 'mock-agent-team'
  },
  temperature: 0.2,
  memory_paths: {
    working: 'agent_memory/working',
    episodic: 'agent_memory/episodic',
    semantic: 'agent_memory/semantic'
  },
  skill_library_path: 'agent_skills',
  tool_permissions: {
    allow_terminal: true,
    allow_file_system: true,
    allow_api: false,
    blocked_commands: [
      'rm -rf',
      'git reset --hard',
      'mkfs',
      'shutdown',
      'reboot'
    ]
  },
  execution_sandbox: {
    mode: 'workspace-write',
    dry_run: true,
    max_react_steps: 6
  }
};

function isPlainObject(value) {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}

function mergeConfig(baseValue, overrideValue) {
  if (Array.isArray(baseValue)) {
    return Array.isArray(overrideValue) ? [...overrideValue] : [...baseValue];
  }

  if (!isPlainObject(baseValue)) {
    return typeof overrideValue === 'undefined' ? baseValue : overrideValue;
  }

  const merged = { ...baseValue };
  const overrideEntries = Object.entries(isPlainObject(overrideValue) ? overrideValue : {});

  for (const [key, value] of overrideEntries) {
    if (isPlainObject(value) && isPlainObject(baseValue[key])) {
      merged[key] = mergeConfig(baseValue[key], value);
    } else if (Array.isArray(value)) {
      merged[key] = [...value];
    } else {
      merged[key] = value;
    }
  }

  return merged;
}

function loadAgentConfig(cwd, configPath, inlineOverrides) {
  const resolvedConfigPath = configPath
    ? path.resolve(cwd, configPath)
    : path.resolve(cwd, 'config', 'agent_config.json');

  const fileConfig = readJson(resolvedConfigPath, {});
  const merged = mergeConfig(DEFAULT_CONFIG, mergeConfig(fileConfig, inlineOverrides || {}));

  return {
    config: merged,
    configPath: resolvedConfigPath
  };
}

module.exports = {
  DEFAULT_CONFIG: cloneValue(DEFAULT_CONFIG),
  loadAgentConfig,
  mergeConfig
};
