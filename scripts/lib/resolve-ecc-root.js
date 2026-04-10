'use strict';

const fs = require('fs');
const path = require('path');
const os = require('os');

/**
 * Resolve the ECC source root directory.
 *
 * Tries, in order:
 *   1. CLAUDE_PLUGIN_ROOT env var (set by Claude Code for hooks, or by user)
 *   2. Standard install location (~/.claude/) — when scripts exist there
 *   3. Plugin cache auto-detection — scans ~/.claude/plugins/cache/everything-claude-code/
 *   4. Fallback to ~/.claude/ (original behaviour)
 *
 * @param {object} [options]
 * @param {string} [options.homeDir]  Override home directory (for testing)
 * @param {string} [options.envRoot]  Override CLAUDE_PLUGIN_ROOT (for testing)
 * @param {string} [options.probe]    Relative path used to verify a candidate root
 *                                    contains ECC scripts. Default: 'scripts/lib/utils.js'
 * @returns {string} Resolved ECC root path
 */
function resolveEccRoot(options = {}) {
  const envRoot = options.envRoot !== undefined
    ? options.envRoot
    : (process.env.CLAUDE_PLUGIN_ROOT || '');

  if (envRoot && envRoot.trim()) {
    return envRoot.trim();
  }

  const homeDir = options.homeDir || os.homedir();
  const claudeDir = path.join(homeDir, '.claude');
  const probe = options.probe || path.join('scripts', 'lib', 'utils.js');

  // Standard install — files are copied directly into ~/.claude/
  if (fs.existsSync(path.join(claudeDir, probe))) {
    return claudeDir;
  }

  // Plugin cache — Claude Code stores marketplace plugins under
  // ~/.claude/plugins/cache/<plugin-name>/<org>/<version>/
  try {
    const cacheBase = path.join(claudeDir, 'plugins', 'cache', 'everything-claude-code');
    const orgDirs = fs.readdirSync(cacheBase, { withFileTypes: true });

    for (const orgEntry of orgDirs) {
      if (!orgEntry.isDirectory()) continue;
      const orgPath = path.join(cacheBase, orgEntry.name);

      let versionDirs;
      try {
        versionDirs = fs.readdirSync(orgPath, { withFileTypes: true });
      } catch {
        continue;
      }

      for (const verEntry of versionDirs) {
        if (!verEntry.isDirectory()) continue;
        const candidate = path.join(orgPath, verEntry.name);
        if (fs.existsSync(path.join(candidate, probe))) {
          return candidate;
        }
      }
    }
  } catch {
    // Plugin cache doesn't exist or isn't readable — continue to fallback
  }

  return claudeDir;
}

/**
 * Compact inline version for embedding in command .md code blocks.
 *
 * This is the minified form of resolveEccRoot() suitable for use in
 * node -e "..." scripts where require() is not available before the
 * root is known.
 *
 * Usage in commands:
 *   const _r = <paste INLINE_RESOLVE>;
 *   const sm = require(_r + '/scripts/lib/session-manager');
 */
const INLINE_RESOLVE = `(()=>{var e=process.env.CLAUDE_PLUGIN_ROOT;if(e&&e.trim())return e.trim();var p=require('path'),f=require('fs'),h=require('os').homedir(),d=p.join(h,'.claude'),q=p.join('scripts','lib','utils.js');if(f.existsSync(p.join(d,q)))return d;try{var b=p.join(d,'plugins','cache','everything-claude-code');for(var o of f.readdirSync(b))for(var v of f.readdirSync(p.join(b,o))){var c=p.join(b,o,v);if(f.existsSync(p.join(c,q)))return c}}catch(x){}return d})()`;

module.exports = {
  resolveEccRoot,
  INLINE_RESOLVE,
};
