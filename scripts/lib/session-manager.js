/**
 * Session Manager Library for Claude Code
 * Provides core session CRUD operations for listing, loading, and managing sessions
 *
 * Sessions are stored as markdown files in ~/.claude/sessions/ with format:
 * - YYYY-MM-DD-session.tmp (old format)
 * - YYYY-MM-DD-<short-id>-session.tmp (new format)
 */

const fs = require('fs');
const path = require('path');

const {
  getSessionsDir,
  readFile,
  log
} = require('./utils');

// Session filename pattern: YYYY-MM-DD-[short-id]-session.tmp
// The short-id is optional (old format) and can be 8+ alphanumeric characters
// Matches: "2026-02-01-session.tmp" or "2026-02-01-a1b2c3d4-session.tmp"
const SESSION_FILENAME_REGEX = /^(\d{4}-\d{2}-\d{2})(?:-([a-z0-9]{8,}))?-session\.tmp$/;

/**
 * Parse session filename to extract metadata
 * @param {string} filename - Session filename (e.g., "2026-01-17-abc123-session.tmp" or "2026-01-17-session.tmp")
 * @returns {object|null} Parsed metadata or null if invalid
 */
function parseSessionFilename(filename) {
  const match = filename.match(SESSION_FILENAME_REGEX);
  if (!match) return null;

  const dateStr = match[1];
  // match[2] is undefined for old format (no ID)
  const shortId = match[2] || 'no-id';

  return {
    filename,
    shortId,
    date: dateStr,
    // Convert date string to Date object
    datetime: new Date(dateStr)
  };
}

/**
 * Get the full path to a session file
 * @param {string} filename - Session filename
 * @returns {string} Full path to session file
 */
function getSessionPath(filename) {
  return path.join(getSessionsDir(), filename);
}

/**
 * Read and parse session markdown content
 * @param {string} sessionPath - Full path to session file
 * @returns {string|null} Session content or null if not found
 */
function getSessionContent(sessionPath) {
  if (!fs.existsSync(sessionPath)) {
    return null;
  }

  return readFile(sessionPath);
}

/**
 * Parse session metadata from markdown content
 * @param {string} content - Session markdown content
 * @returns {object} Parsed metadata
 */
function parseSessionMetadata(content) {
  const metadata = {
    title: null,
    date: null,
    started: null,
    lastUpdated: null,
    completed: [],
    inProgress: [],
    notes: '',
    context: ''
  };

  if (!content) return metadata;

  // Extract title from first heading
  const titleMatch = content.match(/^#\s+(.+)$/m);
  if (titleMatch) {
    metadata.title = titleMatch[1].trim();
  }

  // Extract date
  const dateMatch = content.match(/\*\*Date:\*\*\s*(\d{4}-\d{2}-\d{2})/);
  if (dateMatch) {
    metadata.date = dateMatch[1];
  }

  // Extract started time
  const startedMatch = content.match(/\*\*Started:\*\*\s*([\d:]+)/);
  if (startedMatch) {
    metadata.started = startedMatch[1];
  }

  // Extract last updated
  const updatedMatch = content.match(/\*\*Last Updated:\*\*\s*([\d:]+)/);
  if (updatedMatch) {
    metadata.lastUpdated = updatedMatch[1];
  }

  // Extract completed items
  const completedSection = content.match(/### Completed\s*\n([\s\S]*?)(?=###|\n\n|$)/);
  if (completedSection) {
    const items = completedSection[1].match(/- \[x\]\s*(.+)/g);
    if (items) {
      metadata.completed = items.map(item => item.replace(/- \[x\]\s*/, '').trim());
    }
  }

  // Extract in-progress items
  const progressSection = content.match(/### In Progress\s*\n([\s\S]*?)(?=###|\n\n|$)/);
  if (progressSection) {
    const items = progressSection[1].match(/- \[ \]\s*(.+)/g);
    if (items) {
      metadata.inProgress = items.map(item => item.replace(/- \[ \]\s*/, '').trim());
    }
  }

  // Extract notes
  const notesSection = content.match(/### Notes for Next Session\s*\n([\s\S]*?)(?=###|\n\n|$)/);
  if (notesSection) {
    metadata.notes = notesSection[1].trim();
  }

  // Extract context to load
  const contextSection = content.match(/### Context to Load\s*\n```\n([\s\S]*?)```/);
  if (contextSection) {
    metadata.context = contextSection[1].trim();
  }

  return metadata;
}

/**
 * Calculate statistics for a session
 * @param {string} sessionPath - Full path to session file
 * @returns {object} Statistics object
 */
function getSessionStats(sessionPath) {
  const content = getSessionContent(sessionPath);
  const metadata = parseSessionMetadata(content);

  return {
    totalItems: metadata.completed.length + metadata.inProgress.length,
    completedItems: metadata.completed.length,
    inProgressItems: metadata.inProgress.length,
    lineCount: content ? content.split('\n').length : 0,
    hasNotes: !!metadata.notes,
    hasContext: !!metadata.context
  };
}

/**
 * Get all sessions with optional filtering and pagination
 * @param {object} options - Options object
 * @param {number} options.limit - Maximum number of sessions to return
 * @param {number} options.offset - Number of sessions to skip
 * @param {string} options.date - Filter by date (YYYY-MM-DD format)
 * @param {string} options.search - Search in short ID
 * @returns {object} Object with sessions array and pagination info
 */
function getAllSessions(options = {}) {
  const {
    limit = 50,
    offset = 0,
    date = null,
    search = null
  } = options;

  const sessionsDir = getSessionsDir();

  if (!fs.existsSync(sessionsDir)) {
    return { sessions: [], total: 0, offset, limit, hasMore: false };
  }

  const entries = fs.readdirSync(sessionsDir, { withFileTypes: true });
  const sessions = [];

  for (const entry of entries) {
    // Skip non-files (only process .tmp files)
    if (!entry.isFile() || !entry.name.endsWith('.tmp')) continue;

    const filename = entry.name;
    const metadata = parseSessionFilename(filename);

    if (!metadata) continue;

    // Apply date filter
    if (date && metadata.date !== date) {
      continue;
    }

    // Apply search filter (search in short ID)
    if (search && !metadata.shortId.includes(search)) {
      continue;
    }

    const sessionPath = path.join(sessionsDir, filename);

    // Get file stats
    const stats = fs.statSync(sessionPath);

    sessions.push({
      ...metadata,
      sessionPath,
      hasContent: stats.size > 0,
      size: stats.size,
      modifiedTime: stats.mtime,
      createdTime: stats.birthtime
    });
  }

  // Sort by modified time (newest first)
  sessions.sort((a, b) => b.modifiedTime - a.modifiedTime);

  // Apply pagination
  const paginatedSessions = sessions.slice(offset, offset + limit);

  return {
    sessions: paginatedSessions,
    total: sessions.length,
    offset,
    limit,
    hasMore: offset + limit < sessions.length
  };
}

/**
 * Get a single session by ID (short ID or full path)
 * @param {string} sessionId - Short ID or session filename
 * @param {boolean} includeContent - Include session content
 * @returns {object|null} Session object or null if not found
 */
function getSessionById(sessionId, includeContent = false) {
  const sessionsDir = getSessionsDir();

  if (!fs.existsSync(sessionsDir)) {
    return null;
  }

  const entries = fs.readdirSync(sessionsDir, { withFileTypes: true });

  for (const entry of entries) {
    if (!entry.isFile() || !entry.name.endsWith('.tmp')) continue;

    const filename = entry.name;
    const metadata = parseSessionFilename(filename);

    if (!metadata) continue;

    // Check if session ID matches (short ID or full filename without .tmp)
    const shortIdMatch = metadata.shortId !== 'no-id' && metadata.shortId.startsWith(sessionId);
    const filenameMatch = filename === sessionId || filename === `${sessionId}.tmp`;
    const noIdMatch = metadata.shortId === 'no-id' && filename === `${sessionId}-session.tmp`;

    if (!shortIdMatch && !filenameMatch && !noIdMatch) {
      continue;
    }

    const sessionPath = path.join(sessionsDir, filename);
    const stats = fs.statSync(sessionPath);

    const session = {
      ...metadata,
      sessionPath,
      size: stats.size,
      modifiedTime: stats.mtime,
      createdTime: stats.birthtime
    };

    if (includeContent) {
      session.content = getSessionContent(sessionPath);
      session.metadata = parseSessionMetadata(session.content);
      session.stats = getSessionStats(sessionPath);
    }

    return session;
  }

  return null;
}

/**
 * Get session title from content
 * @param {string} sessionPath - Full path to session file
 * @returns {string} Title or default text
 */
function getSessionTitle(sessionPath) {
  const content = getSessionContent(sessionPath);
  const metadata = parseSessionMetadata(content);

  return metadata.title || 'Untitled Session';
}

/**
 * Format session size in human-readable format
 * @param {string} sessionPath - Full path to session file
 * @returns {string} Formatted size (e.g., "1.2 KB")
 */
function getSessionSize(sessionPath) {
  if (!fs.existsSync(sessionPath)) {
    return '0 B';
  }

  const stats = fs.statSync(sessionPath);
  const size = stats.size;

  if (size < 1024) return `${size} B`;
  if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`;
  return `${(size / (1024 * 1024)).toFixed(1)} MB`;
}

/**
 * Write session content to file
 * @param {string} sessionPath - Full path to session file
 * @param {string} content - Markdown content to write
 * @returns {boolean} Success status
 */
function writeSessionContent(sessionPath, content) {
  try {
    fs.writeFileSync(sessionPath, content, 'utf8');
    return true;
  } catch (err) {
    log(`[SessionManager] Error writing session: ${err.message}`);
    return false;
  }
}

/**
 * Append content to a session
 * @param {string} sessionPath - Full path to session file
 * @param {string} content - Content to append
 * @returns {boolean} Success status
 */
function appendSessionContent(sessionPath, content) {
  try {
    fs.appendFileSync(sessionPath, content, 'utf8');
    return true;
  } catch (err) {
    log(`[SessionManager] Error appending to session: ${err.message}`);
    return false;
  }
}

/**
 * Delete a session file
 * @param {string} sessionPath - Full path to session file
 * @returns {boolean} Success status
 */
function deleteSession(sessionPath) {
  try {
    if (fs.existsSync(sessionPath)) {
      fs.unlinkSync(sessionPath);
      return true;
    }
    return false;
  } catch (err) {
    log(`[SessionManager] Error deleting session: ${err.message}`);
    return false;
  }
}

/**
 * Check if a session exists
 * @param {string} sessionPath - Full path to session file
 * @returns {boolean} True if session exists
 */
function sessionExists(sessionPath) {
  return fs.existsSync(sessionPath) && fs.statSync(sessionPath).isFile();
}

module.exports = {
  parseSessionFilename,
  getSessionPath,
  getSessionContent,
  parseSessionMetadata,
  getSessionStats,
  getSessionTitle,
  getSessionSize,
  getAllSessions,
  getSessionById,
  writeSessionContent,
  appendSessionContent,
  deleteSession,
  sessionExists
};
