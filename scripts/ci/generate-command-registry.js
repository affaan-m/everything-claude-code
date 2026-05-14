#!/usr/bin/env node
/**
 * Generate Command → Agent/Skill Registry
 *
 * Scans all command markdown files and extracts:
 * - Command name/description
 * - Primary agent(s) referenced
 * - Skills referenced
 * - Command type (workflow, testing, review, etc.)
 *
 * Usage:
 *   node scripts/ci/generate-command-registry.js
 *   node scripts/ci/generate-command-registry.js --json
 *   node scripts/ci/generate-command-registry.js --write
 */

'use strict';

const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '../..');
const COMMANDS_DIR = path.join(ROOT, 'commands');
const AGENTS_DIR = path.join(ROOT, 'agents');
const OUTPUT_PATH = path.join(ROOT, 'docs', 'COMMAND-REGISTRY.json');
const WRITE_MODE = process.argv.includes('--write');
const OUTPUT_JSON = process.argv.includes('--json');

const KNOWN_AGENTS = new Set();
const KNOWN_SKILLS = new Set();

// Scan agents directory for known agents
function scanKnownAgents() {
  if (!fs.existsSync(AGENTS_DIR)) return;

  const files = fs.readdirSync(AGENTS_DIR, { withFileTypes: true });
  files.forEach(entry => {
    if (entry.isFile() && entry.name.endsWith('.md')) {
      const agentName = entry.name.replace('.md', '');
      KNOWN_AGENTS.add(agentName);
    }
  });
}

// Scan skills directory for known skills
function scanKnownSkills() {
  const skillsDir = path.join(ROOT, 'skills');
  if (!fs.existsSync(skillsDir)) return;

  const entries = fs.readdirSync(skillsDir, { withFileTypes: true });
  entries.forEach(entry => {
    if (entry.isDirectory() && fs.existsSync(path.join(skillsDir, entry.name, 'SKILL.md'))) {
      KNOWN_SKILLS.add(entry.name);
    }
  });
}

// Extract agents and skills from markdown content
function extractReferences(content) {
  const agents = new Set();
  const skills = new Set();

  // Pattern: @agent-name or agent-name in code blocks, lists, or descriptions
  const agentPatterns = [
    /@([a-z][a-z0-9-]*)/gi,  // @agent-name
    /agent:\s*([a-z][a-z0-9-]*)/gi,  // agent: name
    /subagent(?:_type)?:\s*["']?([a-z][a-z0-9-]*)/gi,  // subagent_type: "name"
  ];

  // Pattern: /skill-name or /command-name
  const skillPatterns = [
    /\/([a-z][a-z0-9-]*)/gi,  // /skill-name
    /skill:\s*\/?([a-z][a-z0-9-]*)/gi,  // skill: /name or skill: name
  ];

  // Extract agents
  agentPatterns.forEach(pattern => {
    const matches = content.matchAll(pattern);
    for (const match of matches) {
      const ref = match[1];
      if (KNOWN_AGENTS.has(ref)) {
        agents.add(ref);
      }
    }
  });

  // Extract skills
  skillPatterns.forEach(pattern => {
    const matches = content.matchAll(pattern);
    for (const match of matches) {
      const ref = match[1];
      if (KNOWN_SKILLS.has(ref)) {
        skills.add(ref);
      }
    }
  });

  return {
    agents: Array.from(agents).sort(),
    skills: Array.from(skills).sort()
  };
}

// Infer command type from content
function inferCommandType(content, filename) {
  const lower = content.toLowerCase();

  if (lower.includes('test') || lower.includes('tdd') || lower.includes('coverage')) {
    return 'testing';
  }
  if (lower.includes('review') || lower.includes('audit') || lower.includes('quality')) {
    return 'review';
  }
  if (lower.includes('plan') || lower.includes('design') || lower.includes('architecture')) {
    return 'planning';
  }
  if (lower.includes('refactor') || lower.includes('clean') || lower.includes('simplify')) {
    return 'refactoring';
  }
  if (lower.includes('build') || lower.includes('compile') || lower.includes('setup')) {
    return 'build';
  }
  if (filename.startsWith('multi-')) {
    return 'orchestration';
  }

  return 'general';
}

// Process single command file
function processCommandFile(filename) {
  const filePath = path.join(COMMANDS_DIR, filename);
  const content = fs.readFileSync(filePath, 'utf8');

  // Extract description from frontmatter or first heading
  let description = '';
  const frontmatterMatch = content.match(/^---\n[\s\S]*?\ndescription:\s*(.+?)\n[\s\S]*?^---/m);
  if (frontmatterMatch) {
    description = frontmatterMatch[1].trim();
  } else {
    const headingMatch = content.match(/^#\s+(.+)$/m);
    if (headingMatch) {
      description = headingMatch[1].trim();
    }
  }

  const commandName = filename.replace('.md', '');
  const references = extractReferences(content);
  const type = inferCommandType(content, filename);

  return {
    command: commandName,
    description,
    type,
    primaryAgents: references.agents.slice(0, 3), // Top 3 agents
    allAgents: references.agents,
    skills: references.skills,
    path: `commands/${filename}`
  };
}

// Generate full registry
function generateRegistry() {
  scanKnownAgents();
  scanKnownSkills();

  if (!fs.existsSync(COMMANDS_DIR)) {
    console.error('commands/ directory not found');
    process.exit(1);
  }

  const files = fs.readdirSync(COMMANDS_DIR, { withFileTypes: true })
    .filter(entry => entry.isFile() && entry.name.endsWith('.md'))
    .map(entry => entry.name)
    .sort();

  const registry = {
    generated: new Date().toISOString(),
    totalCommands: files.length,
    commands: files.map(processCommandFile)
  };

  // Add statistics
  const typeCounts = {};
  const agentUsage = {};
  const skillUsage = {};

  registry.commands.forEach(cmd => {
    typeCounts[cmd.type] = (typeCounts[cmd.type] || 0) + 1;
    cmd.allAgents.forEach(agent => {
      agentUsage[agent] = (agentUsage[agent] || 0) + 1;
    });
    cmd.skills.forEach(skill => {
      skillUsage[skill] = (skillUsage[skill] || 0) + 1;
    });
  });

  registry.statistics = {
    byType: typeCounts,
    topAgents: Object.entries(agentUsage)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([agent, count]) => ({ agent, count })),
    topSkills: Object.entries(skillUsage)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([skill, count]) => ({ skill, count }))
  };

  return registry;
}

// Main execution
function main() {
  const registry = generateRegistry();

  if (OUTPUT_JSON) {
    console.log(JSON.stringify(registry, null, 2));
  } else {
    console.log('\n📊 Command Registry Statistics\n');
    console.log(`Total commands: ${registry.totalCommands}`);
    console.log('\nBy type:');
    Object.entries(registry.statistics.byType)
      .sort((a, b) => b[1] - a[1])
      .forEach(([type, count]) => {
        console.log(`  ${type}: ${count}`);
      });

    console.log('\nTop 10 agents:');
    registry.statistics.topAgents.forEach(({ agent, count }) => {
      console.log(`  ${agent}: ${count} commands`);
    });

    console.log('\nTop 10 skills:');
    registry.statistics.topSkills.forEach(({ skill, count }) => {
      console.log(`  ${skill}: ${count} commands`);
    });

    console.log(`\n📄 Generated: ${registry.generated}`);
  }

  if (WRITE_MODE) {
    fs.mkdirSync(path.dirname(OUTPUT_PATH), { recursive: true });
    fs.writeFileSync(OUTPUT_PATH, JSON.stringify(registry, null, 2) + '\n');
    console.log(`\n✅ Registry written to: ${OUTPUT_PATH}`);
  }
}

main();
