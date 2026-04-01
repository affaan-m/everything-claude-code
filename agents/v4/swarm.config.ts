/**
 * V4 Swarm Configuration
 * 
 * This file is deprecated. The new task-driven orchestration system
 * uses YAML configuration files instead.
 * 
 * See: agents/config/swarm-topology.yaml
 */

import { readFileSync } from 'fs';
import { parse } from 'yaml';
import { join } from 'path';

/**
 * Load swarm configuration from YAML
 */
export function loadSwarmConfig() {
  const configPath = join(__dirname, 'agents/config/swarm-topology.yaml');
  const configFile = readFileSync(configPath, 'utf-8');
  return parse(configFile);
}

/**
 * Load task definitions from YAML
 */
export function loadTaskDefinitions() {
  const configPath = join(__dirname, 'agents/config/task-definitions.yaml');
  const configFile = readFileSync(configPath, 'utf-8');
  return parse(configFile);
}

/**
 * Load agent capabilities from YAML
 */
export function loadAgentCapabilities() {
  const configPath = join(__dirname, 'agents/config/agent-capabilities.yaml');
  const configFile = readFileSync(configPath, 'utf-8');
  return parse(configFile);
}

// Export for backward compatibility
export const swarmConfig = loadSwarmConfig();
export const taskDefinitions = loadTaskDefinitions();
export const agentCapabilities = loadAgentCapabilities();

// Default export
export default {
  swarm: swarmConfig,
  tasks: taskDefinitions,
  agents: agentCapabilities,
};
