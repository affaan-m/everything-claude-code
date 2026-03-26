#!/usr/bin/env node
/**
 * SessionStart Hook - Load previous context on new session
 *
 * Cross-platform (Windows, macOS, Linux)
 *
 * Runs when a new Claude session starts. Loads the most recent session
 * summary into Claude's context via stdout, and reports available
 * sessions and learned skills.
 */

const {
  getSessionsDir,
  getLearnedSkillsDir,
  findFiles,
  ensureDir,
  readFile,
  stripAnsi,
  log
} = require('../lib/utils');
const { getPackageManager, getSelectionPrompt } = require('../lib/package-manager');
const { listAliases } = require('../lib/session-aliases');
const { detectProjectType } = require('../lib/project-detect');

/**
 * Write a single JSON envelope to stdout and exit.
 * Claude Code SessionStart hooks must output exactly one JSON object to stdout —
 * multiple writes or plain strings are silently discarded.
 * See: https://github.com/affaan-m/everything-claude-code/issues/843
 */
function emitContext(additionalContext) {
  const payload = { hookSpecificOutput: { hookEventName: 'SessionStart', additionalContext } };
  process.stdout.write(JSON.stringify(payload, null, 2) + '\n');
  process.exit(0);
}

async function main() {
  const sessionsDir = getSessionsDir();
  const learnedDir = getLearnedSkillsDir();

  // Ensure directories exist
  ensureDir(sessionsDir);
  ensureDir(learnedDir);

  // Check for recent session files (last 7 days)
  const recentSessions = findFiles(sessionsDir, '*-session.tmp', { maxAge: 7 });

  if (recentSessions.length > 0) {
    const latest = recentSessions[0];
    log(`[SessionStart] Found ${recentSessions.length} recent session(s)`);
    log(`[SessionStart] Latest: ${latest.path}`);
<<<<<<< HEAD

    // Read and inject the latest session content into Claude's context.
    // Claude Code SessionStart hooks must output JSON with hookSpecificOutput
    // or the content is silently discarded. See issue #843.
    const content = stripAnsi(readFile(latest.path));
    if (content && !content.includes('[Session context goes here]')) {
      // Only inject if the session has actual content (not the blank template)
      const payload = {
        hookSpecificOutput: {
          hookEventName: 'SessionStart',
          additionalContext: `Previous session summary:\n${content}`
        }
      };
      process.stdout.write(JSON.stringify(payload) + '\n');
    }
=======
>>>>>>> 25a1c45 (fix(#843): ecc-sessions dir + single hookSpecificOutput JSON envelope)
  }

  // Check for learned skills
  const learnedSkills = findFiles(learnedDir, '*.md');

  if (learnedSkills.length > 0) {
    log(`[SessionStart] ${learnedSkills.length} learned skill(s) available in ${learnedDir}`);
  }

  // Check for available session aliases
  const aliases = listAliases({ limit: 5 });

  if (aliases.length > 0) {
    const aliasNames = aliases.map(a => a.name).join(', ');
    log(`[SessionStart] ${aliases.length} session alias(es) available: ${aliasNames}`);
    log(`[SessionStart] Use /sessions load <alias> to continue a previous session`);
  }

  // Detect and report package manager
  const pm = getPackageManager();
  log(`[SessionStart] Package manager: ${pm.name} (${pm.source})`);

  // If no explicit package manager config was found, show selection prompt
  if (pm.source === 'default') {
    log('[SessionStart] No package manager preference found.');
    log(getSelectionPrompt());
  }

  // Detect project type and frameworks (#293)
  const projectInfo = detectProjectType();
  if (projectInfo.languages.length > 0 || projectInfo.frameworks.length > 0) {
    const parts = [];
    if (projectInfo.languages.length > 0) {
      parts.push(`languages: ${projectInfo.languages.join(', ')}`);
    }
    if (projectInfo.frameworks.length > 0) {
      parts.push(`frameworks: ${projectInfo.frameworks.join(', ')}`);
    }
    log(`[SessionStart] Project detected — ${parts.join('; ')}`);
<<<<<<< HEAD
    const projPayload = {
      hookSpecificOutput: {
        hookEventName: 'SessionStart',
        additionalContext: `Project type: ${JSON.stringify(projectInfo)}`
      }
    };
    process.stdout.write(JSON.stringify(projPayload) + '\n');
=======
>>>>>>> 25a1c45 (fix(#843): ecc-sessions dir + single hookSpecificOutput JSON envelope)
  } else {
    log('[SessionStart] No specific project type detected');
  }

  // Build a single context string from all collected information.
  // This is emitted as ONE JSON object via hookSpecificOutput so Claude
  // Code accepts it (plain stdout / multiple writes are silently discarded).
  const lines = [];

  if (recentSessions.length > 0) {
    const latest = recentSessions[0];
    const content = stripAnsi(readFile(latest.path));
    if (content && !content.includes('[Session context goes here]')) {
      lines.push(`Previous session summary:\n${content}`);
    }
  }

  if (learnedSkills.length > 0) {
    lines.push(`Note: ${learnedSkills.length} learned skill(s) are available in ${learnedDir}`);
  }

  if (aliases.length > 0) {
    const aliasNames = aliases.map(a => a.name).join(', ');
    lines.push(`Session aliases available: ${aliasNames} — use /sessions load <alias> to continue a previous session`);
  }

  if (projectInfo.languages.length > 0 || projectInfo.frameworks.length > 0) {
    lines.push(`Project type: ${JSON.stringify(projectInfo)}`);
  }

  const additionalContext = lines.length > 0 ? lines.join('\n\n') : null;

  if (additionalContext) {
    emitContext(additionalContext);
  } else {
    // No context to inject — exit silently (don't write anything to stdout)
    process.exit(0);
  }
}

main().catch(err => {
  console.error('[SessionStart] Error:', err.message);
  process.exit(0); // Don't block on errors
});
