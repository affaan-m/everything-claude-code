const antigravityProject = require('./antigravity-project');
const claudeHome = require('./claude-home');
const codexHome = require('./codex-home');
const cursorProject = require('./cursor-project');
const opencodeHome = require('./opencode-home');

const ADAPTERS = Object.freeze([
  claudeHome,
  cursorProject,
  antigravityProject,
  codexHome,
  opencodeHome,
]);

function listInstallTargetAdapters() {
  return ADAPTERS.slice();
}

function getInstallTargetAdapter(targetOrAdapterId) {
  const adapter = ADAPTERS.find(candidate => candidate.supports(targetOrAdapterId));

  if (!adapter) {
    throw new Error(`Unknown install target adapter: ${targetOrAdapterId}`);
  }

  return adapter;
}

function planInstallTargetScaffold(options = {}) {
  const adapter = getInstallTargetAdapter(options.target);
  const modules = Array.isArray(options.modules) ? options.modules : [];
  const planningInput = {
    repoRoot: options.repoRoot,
    projectRoot: options.projectRoot || options.repoRoot,
    homeDir: options.homeDir,
  };
  const validationIssues = adapter.validate(planningInput);
  const blockingIssues = validationIssues.filter(issue => issue.severity === 'error');
  if (blockingIssues.length > 0) {
    throw new Error(blockingIssues.map(issue => issue.message).join('; '));
  }
  const targetRoot = adapter.resolveRoot(planningInput);
  const installStatePath = adapter.getInstallStatePath(planningInput);
  const operations = adapter.planOperations({
    ...planningInput,
    modules,
  });

  return {
    adapter: {
      id: adapter.id,
      target: adapter.target,
      kind: adapter.kind,
    },
    targetRoot,
    installStatePath,
    validationIssues,
    operations,
  };
}

module.exports = {
  getInstallTargetAdapter,
  listInstallTargetAdapters,
  planInstallTargetScaffold,
};
