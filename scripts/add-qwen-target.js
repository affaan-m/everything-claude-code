#!/usr/bin/env node
/**
 * Add 'qwen' target to all install modules that support similar targets.
 */

const fs = require('fs');
const path = require('path');

const modulesPath = path.join(__dirname, '../manifests/install-modules.json');
const modules = JSON.parse(fs.readFileSync(modulesPath, 'utf8'));

// Modules that should support qwen (based on similarity to claude/cursor/antigravity)
const modulesToUpdate = modules.modules.map(module => {
  // Skip orchestration module as it's specific to Claude Code worktree/tmux orchestration
  if (module.id === 'orchestration') {
    return module;
  }
  
  // Add qwen to all modules that support claude, cursor, or antigravity
  if (module.targets.includes('claude') || module.targets.includes('cursor') || module.targets.includes('antigravity')) {
    if (!module.targets.includes('qwen')) {
      module.targets.push('qwen');
    }
  }
  
  return module;
});

// Write back
fs.writeFileSync(modulesPath, JSON.stringify(modules, null, 2) + '\n');

console.log(`Updated ${modulesToUpdate.length} modules to include 'qwen' target`);
console.log('Modules updated:');
modulesToUpdate.forEach(m => {
  if (m.targets.includes('qwen')) {
    console.log(`  - ${m.id}`);
  }
});
