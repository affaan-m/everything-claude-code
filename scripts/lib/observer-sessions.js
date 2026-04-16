const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { spawnSync } = require('child_process');
const { getClaudeDir, ensureDir, sanitizeSessionId } = require('./utils');

function getHomunculusDir() {
  return path.join(getClaudeDir(), 'homunculus');
}

function getProjectsDir() {
  return path.join(getHomunculusDir(), 'projects');
}

function getProjectRegistryPath() {
  return path.join(getHomunculusDir(), 'projects.json');
}

function readProjectRegistry() {
  try {
    return JSON.parse(fs.readFileSync(getProjectRegistryPath(), 'utf8'));
  } catch {
    return {};
  }
}

function runGit(args, cwd) {
  const result = spawnSync('git', args, {
    cwd,
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'ignore']
  });
  if (result.status !== 0) return '';
  return (result.stdout || '').trim();
}

function stripRemoteCredentials(remoteUrl) {
  if (!remoteUrl) return '';
  return String(remoteUrl).replace(/:\/\/[^@]+@/, '://');
}

function resolveProjectRoot(cwd = process.cwd()) {
  const envRoot = process.env.CLAUDE_PROJECT_DIR;
  if (envRoot && fs.existsSync(envRoot)) {
    return path.resolve(envRoot);
  }

  const gitRoot = runGit(['rev-parse', '--show-toplevel'], cwd);
  if (gitRoot) return path.resolve(gitRoot);

  return '';
}

function computeProjectId(projectRoot) {
  const remoteUrl = stripRemoteCredentials(runGit(['remote', 'get-url', 'origin'], projectRoot));
  return crypto.createHash('sha256').update(remoteUrl || projectRoot).digest('hex').slice(0, 12);
}

function resolveProjectContext(cwd = process.cwd()) {
  const projectRoot = resolveProjectRoot(cwd);
  if (!projectRoot) {
    const projectDir = getHomunculusDir();
    ensureDir(projectDir);
    return { projectId: 'global', projectRoot: '', projectDir, isGlobal: true };
  }

  const registry = readProjectRegistry();
  const registryEntry = Object.values(registry).find(entry => entry && path.resolve(entry.root || '') === projectRoot);
  const projectId = registryEntry?.id || computeProjectId(projectRoot);
  const projectDir = path.join(getProjectsDir(), projectId);
  ensureDir(projectDir);

  return { projectId, projectRoot, projectDir, isGlobal: false };
}

function getObserverPidFile(context) {
  return path.join(context.projectDir, '.observer.pid');
}

function getObserverSignalCounterFile(context) {
  return path.join(context.projectDir, '.observer-signal-counter');
}

function getObserverActivityFile(context) {
  return path.join(context.projectDir, '.observer-last-activity');
}

function getSessionLeaseDir(context) {
  return path.join(context.projectDir, '.observer-sessions');
}

function resolveSessionId(rawSessionId = process.env.CLAUDE_SESSION_ID) {
  return sanitizeSessionId(rawSessionId || '') || '';
}

function getSessionLeaseFile(context, rawSessionId = process.env.CLAUDE_SESSION_ID) {
  const sessionId = resolveSessionId(rawSessionId);
  if (!sessionId) return '';
  return path.join(getSessionLeaseDir(context), `${sessionId}.json`);
}

function writeSessionLease(context, rawSessionId = process.env.CLAUDE_SESSION_ID, extra = {}) {
  const leaseFile = getSessionLeaseFile(context, rawSessionId);
  if (!leaseFile) return '';

  ensureDir(getSessionLeaseDir(context));
  const payload = {
    sessionId: resolveSessionId(rawSessionId),
    cwd: process.cwd(),
    pid: process.pid,
    updatedAt: new Date().toISOString(),
    ...extra
  };
  fs.writeFileSync(leaseFile, JSON.stringify(payload, null, 2) + '\n');
  return leaseFile;
}

function removeSessionLease(context, rawSessionId = process.env.CLAUDE_SESSION_ID) {
  const leaseFile = getSessionLeaseFile(context, rawSessionId);
  if (!leaseFile) return false;
  try {
    fs.rmSync(leaseFile, { force: true });
    return true;
  } catch {
    return false;
  }
}

function listSessionLeases(context) {
  const leaseDir = getSessionLeaseDir(context);
  if (!fs.existsSync(leaseDir)) return [];
  return fs.readdirSync(leaseDir)
    .filter(name => name.endsWith('.json'))
    .map(name => path.join(leaseDir, name));
}

function stopObserverForContext(context) {
  const pidFile = getObserverPidFile(context);
  if (!fs.existsSync(pidFile)) return false;

  const pid = (fs.readFileSync(pidFile, 'utf8') || '').trim();
  if (!/^[0-9]+$/.test(pid) || pid === '0' || pid === '1') {
    fs.rmSync(pidFile, { force: true });
    return false;
  }

  try {
    process.kill(Number(pid), 0);
  } catch {
    fs.rmSync(pidFile, { force: true });
    return false;
  }

  try {
    process.kill(Number(pid), 'SIGTERM');
  } catch {
    return false;
  }

  fs.rmSync(pidFile, { force: true });
  fs.rmSync(getObserverSignalCounterFile(context), { force: true });
  return true;
}

module.exports = {
  resolveProjectContext,
  getObserverActivityFile,
  getObserverPidFile,
  getSessionLeaseDir,
  writeSessionLease,
  removeSessionLease,
  listSessionLeases,
  stopObserverForContext,
  resolveSessionId
};
