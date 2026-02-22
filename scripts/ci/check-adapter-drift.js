#!/usr/bin/env node
/**
 * CI guard: fail when adapter files drift from canonical sources.
 */

const { syncCommandAdapters } = require('../sync/sync-commands');
const { syncRulesAndSkills } = require('../sync/sync-rules-skills');

try {
  const commandResult = syncCommandAdapters({ checkOnly: true });
  const rulesSkillsResult = syncRulesAndSkills({ checkOnly: true });
  const issueCount = commandResult.issues.length + rulesSkillsResult.issues.length;

  if (issueCount > 0) {
    process.exit(1);
  }
  console.log('Adapter drift check passed');
  process.exit(0);
} catch (err) {
  console.error(`ERROR: adapter drift check failed - ${err.message}`);
  process.exit(1);
}
