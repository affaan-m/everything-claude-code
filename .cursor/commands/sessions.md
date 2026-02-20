# Sessions Command

Manage Claude Code session history - list, load, alias, and edit sessions stored in `~/.claude/sessions/`.

## Usage

`/sessions [list|load|alias|info|help] [options]`

## Actions

### List Sessions

Display all sessions with metadata, filtering, and pagination.

```bash
/sessions                              # List all sessions (default)
/sessions list                         # Same as above
/sessions list --limit 10              # Show 10 sessions
/sessions list --date 2026-02-01       # Filter by date
/sessions list --search abc            # Search by session ID
```

**Script:**
```bash
node -e "
const sm = require((process.env.CLAUDE_PLUGIN_ROOT||require('path').join(require('os').homedir(),'.claude'))+'/scripts/lib/session-manager');
const aa = require((process.env.CLAUDE_PLUGIN_ROOT||require('path').join(require('os').homedir(),'.claude'))+'/scripts/lib/session-aliases');

const result = sm.getAllSessions({ limit: 20 });
const aliases = aa.listAliases();
const aliasMap = {};
for (const a of aliases) aliasMap[a.sessionPath] = a.name;

console.log('Sessions (showing ' + result.sessions.length + ' of ' + result.total + '):');
console.log('');
console.log('ID        Date        Time     Size     Lines  Alias');
console.log('────────────────────────────────────────────────────');

for (const s of result.sessions) {
  const alias = aliasMap[s.filename] || '';
  const size = sm.getSessionSize(s.sessionPath);
  const stats = sm.getSessionStats(s.sessionPath);
  const id = s.shortId === 'no-id' ? '(none)' : s.shortId.slice(0, 8);
  const time = s.modifiedTime.toTimeString().slice(0, 5);

  console.log(id.padEnd(8) + ' ' + s.date + '  ' + time + '   ' + size.padEnd(7) + '  ' + String(stats.lineCount).padEnd(5) + '  ' + alias);
}
"
```

### Load Session

Load and display a session's content (by ID or alias).

```bash
/sessions load <id|alias>             # Load session
/sessions load 2026-02-01             # By date (for no-id sessions)
/sessions load a1b2c3d4               # By short ID
/sessions load my-alias               # By alias name
```

**Script:**
```bash
node -e "
const sm = require((process.env.CLAUDE_PLUGIN_ROOT||require('path').join(require('os').homedir(),'.claude'))+'/scripts/lib/session-manager');
const aa = require((process.env.CLAUDE_PLUGIN_ROOT||require('path').join(require('os').homedir(),'.claude'))+'/scripts/lib/session-aliases');
const id = process.argv[1];

// First try to resolve as alias
const resolved = aa.resolveAlias(id);
const sessionId = resolved ? resolved.sessionPath : id;

const session = sm.getSessionById(sessionId, true);
if (!session) {
  console.log('Session not found: ' + id);
  process.exit(1);
}

const stats = sm.getSessionStats(session.sessionPath);
const size = sm.getSessionSize(session.sessionPath);
const aliases = aa.getAliasesForSession(session.filename);

console.log('Session: ' + session.filename);
console.log('Path: ~/.claude/sessions/' + session.filename);
console.log('');
console.log('Statistics:');
console.log('  Lines: ' + stats.lineCount);
console.log('  Total items: ' + stats.totalItems);
console.log('  Completed: ' + stats.completedItems);
console.log('  In progress: ' + stats.inProgressItems);
console.log('  Size: ' + size);
console.log('');

if (aliases.length > 0) {
  console.log('Aliases: ' + aliases.map(a => a.name).join(', '));
  console.log('');
}

if (session.metadata.title) {
  console.log('Title: ' + session.metadata.title);
  console.log('');
}

if (session.metadata.started) {
  console.log('Started: ' + session.metadata.started);
}

if (session.metadata.lastUpdated) {
  console.log('Last Updated: ' + session.metadata.lastUpdated);
}
" "$ARGUMENTS"
```

### Create Alias

Create a memorable alias for a session.

```bash
/sessions alias <id> <name>           # Create alias
/sessions alias 2026-02-01 today-work # Create alias named "today-work"
```

**Script:**
```bash
node -e "
const sm = require((process.env.CLAUDE_PLUGIN_ROOT||require('path').join(require('os').homedir(),'.claude'))+'/scripts/lib/session-manager');
const aa = require((process.env.CLAUDE_PLUGIN_ROOT||require('path').join(require('os').homedir(),'.claude'))+'/scripts/lib/session-aliases');

const sessionId = process.argv[1];
const aliasName = process.argv[2];

if (!sessionId || !aliasName) {
  console.log('Usage: /sessions alias <id> <name>');
  process.exit(1);
}

// Get session filename
const session = sm.getSessionById(sessionId);
if (!session) {
  console.log('Session not found: ' + sessionId);
  process.exit(1);
}

const result = aa.setAlias(aliasName, session.filename);
if (result.success) {
  console.log('✓ Alias created: ' + aliasName + ' → ' + session.filename);
} else {
  console.log('✗ Error: ' + result.error);
  process.exit(1);
}
" "$ARGUMENTS"
```

### Remove Alias

Delete an existing alias.

```bash
/sessions alias --remove <name>        # Remove alias
/sessions unalias <name>               # Same as above
```

**Script:**
```bash
node -e "
const aa = require((process.env.CLAUDE_PLUGIN_ROOT||require('path').join(require('os').homedir(),'.claude'))+'/scripts/lib/session-aliases');

const aliasName = process.argv[1];
if (!aliasName) {
  console.log('Usage: /sessions alias --remove <name>');
  process.exit(1);
}

const result = aa.deleteAlias(aliasName);
if (result.success) {
  console.log('✓ Alias removed: ' + aliasName);
} else {
  console.log('✗ Error: ' + result.error);
  process.exit(1);
}
" "$ARGUMENTS"
```

### Session Info

Show detailed information about a session.

```bash
/sessions info <id|alias>              # Show session details
```

**Script:**
```bash
node -e "
const sm = require((process.env.CLAUDE_PLUGIN_ROOT||require('path').join(require('os').homedir(),'.claude'))+'/scripts/lib/session-manager');
const aa = require((process.env.CLAUDE_PLUGIN_ROOT||require('path').join(require('os').homedir(),'.claude'))+'/scripts/lib/session-aliases');

const id = process.argv[1];
const resolved = aa.resolveAlias(id);
const sessionId = resolved ? resolved.sessionPath : id;

const session = sm.getSessionById(sessionId, true);
if (!session) {
  console.log('Session not found: ' + id);
  process.exit(1);
}

const stats = sm.getSessionStats(session.sessionPath);
const size = sm.getSessionSize(session.sessionPath);
const aliases = aa.getAliasesForSession(session.filename);

console.log('Session Information');
console.log('════════════════════');
console.log('ID:          ' + (session.shortId === 'no-id' ? '(none)' : session.shortId));
console.log('Filename:    ' + session.filename);
console.log('Date:        ' + session.date);
console.log('Modified:    ' + session.modifiedTime.toISOString().slice(0, 19).replace('T', ' '));
console.log('');
console.log('Content:');
console.log('  Lines:         ' + stats.lineCount);
console.log('  Total items:   ' + stats.totalItems);
console.log('  Completed:     ' + stats.completedItems);
console.log('  In progress:   ' + stats.inProgressItems);
console.log('  Size:          ' + size);
if (aliases.length > 0) {
  console.log('Aliases:     ' + aliases.map(a => a.name).join(', '));
}
" "$ARGUMENTS"
```

### List Aliases

Show all session aliases.

```bash
/sessions aliases                      # List all aliases
```

**Script:**
```bash
node -e "
const aa = require((process.env.CLAUDE_PLUGIN_ROOT||require('path').join(require('os').homedir(),'.claude'))+'/scripts/lib/session-aliases');

const aliases = aa.listAliases();
console.log('Session Aliases (' + aliases.length + '):');
console.log('');

if (aliases.length === 0) {
  console.log('No aliases found.');
} else {
  console.log('Name          Session File                    Title');
  console.log('─────────────────────────────────────────────────────────────');
  for (const a of aliases) {
    const name = a.name.padEnd(12);
    const file = (a.sessionPath.length > 30 ? a.sessionPath.slice(0, 27) + '...' : a.sessionPath).padEnd(30);
    const title = a.title || '';
    console.log(name + ' ' + file + ' ' + title);
  }
}
"
```

## Arguments

$ARGUMENTS:
- `list [options]` - List sessions
  - `--limit <n>` - Max sessions to show (default: 50)
  - `--date <YYYY-MM-DD>` - Filter by date
  - `--search <pattern>` - Search in session ID
- `load <id|alias>` - Load session content
- `alias <id> <name>` - Create alias for session
- `alias --remove <name>` - Remove alias
- `unalias <name>` - Same as `--remove`
- `info <id|alias>` - Show session statistics
- `aliases` - List all aliases
- `help` - Show this help

## Examples

```bash
# List all sessions
/sessions list

# Create an alias for today's session
/sessions alias 2026-02-01 today

# Load session by alias
/sessions load today

# Show session info
/sessions info today

# Remove alias
/sessions alias --remove today

# List all aliases
/sessions aliases
```

## Notes

- Sessions are stored as markdown files in `~/.claude/sessions/`
- Aliases are stored in `~/.claude/session-aliases.json`
- Session IDs can be shortened (first 4-8 characters usually unique enough)
- Use aliases for frequently referenced sessions
