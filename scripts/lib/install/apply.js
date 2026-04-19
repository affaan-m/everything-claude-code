'use strict';

const fs = require('fs');
const path = require('path');

const { writeInstallState } = require('../install-state');
const { filterMcpConfig, parseDisabledMcpServers } = require('../mcp-config');

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

function findHooksSourcePath(plan, hooksDestinationPath) {
  const operation = plan.operations.find(item => item.destinationPath === hooksDestinationPath);
  return operation ? operation.sourcePath : null;
}

function isMcpConfigPath(filePath) {
  const basename = path.basename(String(filePath || ''));
  return basename === '.mcp.json' || basename === 'mcp.json';
}

function buildFilteredMcpWrites(plan) {
  const disabledServers = parseDisabledMcpServers(process.env.ECC_DISABLED_MCPS);
  if (disabledServers.length === 0) {
    return [];
  }

  const writes = [];

  for (const operation of plan.operations) {
    if (!isMcpConfigPath(operation.destinationPath) || !operation.sourcePath || !fs.existsSync(operation.sourcePath)) {
      continue;
    }

    let sourceConfig;
    try {
      sourceConfig = readJsonObject(operation.sourcePath, 'MCP config');
    } catch {
      continue;
    }

    if (!sourceConfig.mcpServers || typeof sourceConfig.mcpServers !== 'object' || Array.isArray(sourceConfig.mcpServers)) {
      continue;
    }

    const filtered = filterMcpConfig(sourceConfig, disabledServers);
    if (filtered.removed.length === 0) {
      continue;
    }

    writes.push({
      destinationPath: operation.destinationPath,
      filteredConfig: filtered.config,
    });
  }

  return writes;
}

function buildResolvedClaudeHooks(plan) {
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
  const resolvedHooks = replacePluginRootPlaceholders(hooksConfig.hooks, pluginRoot);
  if (!resolvedHooks || typeof resolvedHooks !== 'object' || Array.isArray(resolvedHooks)) {
    throw new Error(`Invalid hooks config at ${hooksSourcePath}: expected "hooks" to be a JSON object`);
  }

  return {
    hooksDestinationPath,
    resolvedHooksConfig: {
      ...hooksConfig,
      hooks: resolvedHooks,
    },
  };
}

function applyInstallPlan(plan) {
  const resolvedClaudeHooksPlan = buildResolvedClaudeHooks(plan);
  const filteredMcpWrites = buildFilteredMcpWrites(plan);

  for (const operation of plan.operations) {
    fs.mkdirSync(path.dirname(operation.destinationPath), { recursive: true });
    fs.copyFileSync(operation.sourcePath, operation.destinationPath);
  }

  if (resolvedClaudeHooksPlan) {
    fs.mkdirSync(path.dirname(resolvedClaudeHooksPlan.hooksDestinationPath), { recursive: true });
    fs.writeFileSync(
      resolvedClaudeHooksPlan.hooksDestinationPath,
      JSON.stringify(resolvedClaudeHooksPlan.resolvedHooksConfig, null, 2) + '\n',
      'utf8'
    );
  }

  for (const writePlan of filteredMcpWrites) {
    fs.mkdirSync(path.dirname(writePlan.destinationPath), { recursive: true });
    fs.writeFileSync(
      writePlan.destinationPath,
      JSON.stringify(writePlan.filteredConfig, null, 2) + '\n',
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
