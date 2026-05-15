#!/usr/bin/env node
/**
 * Scan dependency manifests, lockfiles, AI-tool configs, and installed package
 * payload paths for active supply-chain incident indicators.
 */

const fs = require('fs');
const os = require('os');
const path = require('path');

const DEFAULT_ROOT = path.resolve(__dirname, '../..');

const MALICIOUS_PACKAGE_VERSIONS = {
  '@mistralai/mistralai': ['2.2.3', '2.2.4'],
  '@mistralai/mistralai-azure': ['1.7.2', '1.7.3'],
  '@mistralai/mistralai-gcp': ['1.7.2', '1.7.3'],
  '@opensearch-project/opensearch': ['3.6.2', '3.8.0'],
  '@tanstack/arktype-adapter': ['1.166.12', '1.166.15'],
  '@tanstack/eslint-plugin-router': ['1.161.9', '1.161.12'],
  '@tanstack/eslint-plugin-start': ['0.0.4', '0.0.7'],
  '@tanstack/history': ['1.161.9', '1.161.12'],
  '@tanstack/nitro-v2-vite-plugin': ['1.154.12', '1.154.15'],
  '@tanstack/react-router': ['1.169.5', '1.169.8'],
  '@tanstack/react-router-devtools': ['1.166.16', '1.166.19'],
  '@tanstack/react-router-ssr-query': ['1.166.15', '1.166.18'],
  '@tanstack/react-start': ['1.167.68', '1.167.71'],
  '@tanstack/react-start-client': ['1.166.51', '1.166.54'],
  '@tanstack/react-start-rsc': ['0.0.47', '0.0.50'],
  '@tanstack/react-start-server': ['1.166.55', '1.166.58'],
  '@tanstack/router-cli': ['1.166.46', '1.166.49'],
  '@tanstack/router-core': ['1.169.5', '1.169.8'],
  '@tanstack/router-devtools': ['1.166.16', '1.166.19'],
  '@tanstack/router-devtools-core': ['1.167.6', '1.167.9'],
  '@tanstack/router-generator': ['1.166.45', '1.166.48'],
  '@tanstack/router-plugin': ['1.167.38', '1.167.41'],
  '@tanstack/router-ssr-query-core': ['1.168.3', '1.168.6'],
  '@tanstack/router-utils': ['1.161.11', '1.161.14'],
  '@tanstack/router-vite-plugin': ['1.166.53', '1.166.56'],
  '@tanstack/solid-router': ['1.169.5', '1.169.8'],
  '@tanstack/solid-router-devtools': ['1.166.16', '1.166.19'],
  '@tanstack/solid-router-ssr-query': ['1.166.15', '1.166.18'],
  '@tanstack/solid-start': ['1.167.65', '1.167.68'],
  '@tanstack/solid-start-client': ['1.166.50', '1.166.53'],
  '@tanstack/solid-start-server': ['1.166.54', '1.166.57'],
  '@tanstack/start-client-core': ['1.168.5', '1.168.8'],
  '@tanstack/start-fn-stubs': ['1.161.9', '1.161.12'],
  '@tanstack/start-plugin-core': ['1.169.23', '1.169.26'],
  '@tanstack/start-server-core': ['1.167.33', '1.167.36'],
  '@tanstack/start-static-server-functions': ['1.166.44', '1.166.47'],
  '@tanstack/start-storage-context': ['1.166.38', '1.166.41'],
  '@tanstack/valibot-adapter': ['1.166.12', '1.166.15'],
  '@tanstack/virtual-file-routes': ['1.161.10', '1.161.13'],
  '@tanstack/vue-router': ['1.169.5', '1.169.8'],
  '@tanstack/vue-router-devtools': ['1.166.16', '1.166.19'],
  '@tanstack/vue-router-ssr-query': ['1.166.15', '1.166.18'],
  '@tanstack/vue-start': ['1.167.61', '1.167.64'],
  '@tanstack/vue-start-client': ['1.166.46', '1.166.49'],
  '@tanstack/vue-start-server': ['1.166.50', '1.166.53'],
  '@tanstack/zod-adapter': ['1.166.12', '1.166.15'],
  '@uipath/agent.sdk': ['0.0.18'],
  '@uipath/agent-sdk': ['1.0.2'],
  '@uipath/apollo-core': ['5.9.2'],
  '@uipath/cli': ['1.0.1'],
  '@uipath/robot': ['1.3.4'],
  'cmux-agent-mcp': ['0.1.3', '0.1.4', '0.1.5', '0.1.6', '0.1.7', '0.1.8'],
  'guardrails-ai': ['0.10.1'],
  'mistralai': ['2.4.6'],
  'nextmove-mcp': ['0.1.3', '0.1.4', '0.1.5', '0.1.7'],
  'safe-action': ['0.8.3', '0.8.4'],
};

const CRITICAL_TEXT_INDICATORS = [
  '@tanstack/setup',
  'github:tanstack/router#79ac49eedf774dd4b0cfa308722bc463cfe5885c',
  'router_init.js',
  'router_runtime.js',
  'tanstack_runner.js',
  'gh-token-monitor',
  'com.user.gh-token-monitor',
  'filev2.getsession.org',
  'seed1.getsession.org',
  'seed2.getsession.org',
  'seed3.getsession.org',
  'git-tanstack.com',
  '83.142.209.194',
  'api.masscan.cloud',
  'A Mini Shai-Hulud has Appeared',
  'PUSH UR T3MPRR',
];

const DEPENDENCY_FILENAMES = new Set([
  'package.json',
  'package-lock.json',
  'pnpm-lock.yaml',
  'yarn.lock',
  'bun.lock',
  'pyproject.toml',
  'poetry.lock',
  'requirements.txt',
]);

const PERSISTENCE_FILENAMES = new Set([
  'settings.json',
  'tasks.json',
  'router_runtime.js',
  'setup.mjs',
  'gh-token-monitor.sh',
  'com.user.gh-token-monitor.plist',
  'gh-token-monitor.service',
]);

const PAYLOAD_FILENAMES = new Set([
  'router_init.js',
  'router_runtime.js',
  'tanstack_runner.js',
  'gh-token-monitor.sh',
]);

const IGNORED_DIRS = new Set([
  '.git',
  '.next',
  '.pytest_cache',
  '__pycache__',
  'coverage',
  'dist',
  'docs',
  'target',
  'tests',
]);

function normalizeForMatch(value) {
  return value.toLowerCase();
}

function isInSpecialConfigPath(filePath) {
  const normalized = filePath.split(path.sep).join('/');
  return /\/\.claude\//.test(normalized)
    || /\/\.vscode\//.test(normalized)
    || /\/\.kiro\/settings\//.test(normalized)
    || /\/Library\/LaunchAgents\//.test(normalized)
    || /\/\.config\/systemd\/user\//.test(normalized)
    || /\/\.local\/bin\//.test(normalized);
}

function shouldInspectFile(filePath) {
  const base = path.basename(filePath);
  if (DEPENDENCY_FILENAMES.has(base)) return true;
  if (PERSISTENCE_FILENAMES.has(base) && isInSpecialConfigPath(filePath)) return true;
  if (PAYLOAD_FILENAMES.has(base) && filePath.includes(`${path.sep}node_modules${path.sep}`)) return true;
  return false;
}

function walkFiles(rootDir, files = []) {
  if (!fs.existsSync(rootDir)) return files;

  const stat = fs.statSync(rootDir);
  if (stat.isFile()) {
    if (shouldInspectFile(rootDir)) files.push(rootDir);
    return files;
  }

  for (const entry of fs.readdirSync(rootDir, { withFileTypes: true })) {
    const fullPath = path.join(rootDir, entry.name);
    if (entry.isDirectory()) {
      if (IGNORED_DIRS.has(entry.name) && entry.name !== 'node_modules') continue;
      if (entry.name === 'node_modules') {
        walkNodeModules(fullPath, files);
      } else {
        walkFiles(fullPath, files);
      }
    } else if (entry.isFile() && shouldInspectFile(fullPath)) {
      files.push(fullPath);
    }
  }

  return files;
}

function walkNodeModules(nodeModulesDir, files) {
  if (!fs.existsSync(nodeModulesDir)) return;

  for (const entry of fs.readdirSync(nodeModulesDir, { withFileTypes: true })) {
    if (entry.name.startsWith('.')) continue;
    const fullPath = path.join(nodeModulesDir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name.startsWith('@')) {
        for (const scopedEntry of fs.readdirSync(fullPath, { withFileTypes: true })) {
          if (scopedEntry.isDirectory()) {
            inspectPackageDir(path.join(fullPath, scopedEntry.name), files);
          }
        }
      } else {
        inspectPackageDir(fullPath, files);
      }
    }
  }
}

function inspectPackageDir(packageDir, files) {
  for (const filename of [...DEPENDENCY_FILENAMES, ...PAYLOAD_FILENAMES, 'setup.mjs', 'execution.js']) {
    const candidate = path.join(packageDir, filename);
    if (fs.existsSync(candidate) && fs.statSync(candidate).isFile()) {
      files.push(candidate);
    }
  }
}

function readText(filePath) {
  try {
    return fs.readFileSync(filePath, 'utf8');
  } catch {
    return '';
  }
}

function lineForIndex(text, index) {
  return text.slice(0, index).split(/\r?\n/).length;
}

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function addFinding(findings, severity, filePath, line, indicator, message) {
  findings.push({ severity, filePath, line, indicator, message });
}

function scanFile(filePath, rootDir, findings) {
  const base = path.basename(filePath);
  const relativePath = path.relative(rootDir, filePath) || filePath;
  const text = readText(filePath);
  const lowerText = normalizeForMatch(text);

  if (PAYLOAD_FILENAMES.has(base)) {
    addFinding(
      findings,
      'critical',
      relativePath,
      1,
      base,
      'Known Mini Shai-Hulud/TanStack payload or persistence filename is present',
    );
  }

  for (const indicator of CRITICAL_TEXT_INDICATORS) {
    const index = lowerText.indexOf(normalizeForMatch(indicator));
    if (index !== -1) {
      addFinding(
        findings,
        'critical',
        relativePath,
        lineForIndex(text, index),
        indicator,
        'Known active supply-chain IOC is present',
      );
    }
  }

  if (!DEPENDENCY_FILENAMES.has(base)) return;

  for (const [packageName, versions] of Object.entries(MALICIOUS_PACKAGE_VERSIONS)) {
    const packageIndex = lowerText.indexOf(normalizeForMatch(packageName));
    if (packageIndex === -1) continue;

    for (const version of versions) {
      const versionPattern = new RegExp(`(^|[^0-9a-z.])${escapeRegExp(version)}([^0-9a-z.]|$)`, 'i');
      if (versionPattern.test(text) || lowerText.includes(`@${version}`)) {
        addFinding(
          findings,
          'critical',
          relativePath,
          lineForIndex(text, packageIndex),
          `${packageName}@${version}`,
          'Dependency manifest or lockfile references a known compromised package version',
        );
      }
    }
  }
}

function homeTargets(homeDir) {
  return [
    '.claude/settings.json',
    '.claude/router_runtime.js',
    '.claude/setup.mjs',
    '.vscode/tasks.json',
    '.vscode/setup.mjs',
    'Library/LaunchAgents/com.user.gh-token-monitor.plist',
    '.config/systemd/user/gh-token-monitor.service',
    '.local/bin/gh-token-monitor.sh',
  ].map(relativePath => path.join(homeDir, relativePath));
}

function scanSupplyChainIocs(options = {}) {
  const rootDir = path.resolve(options.rootDir || DEFAULT_ROOT);
  const files = walkFiles(rootDir);
  const findings = [];

  if (options.home) {
    for (const target of homeTargets(options.homeDir || os.homedir())) {
      if (fs.existsSync(target)) files.push(target);
    }
  }

  for (const filePath of [...new Set(files)].sort()) {
    scanFile(filePath, rootDir, findings);
  }

  return {
    rootDir,
    scannedFiles: files.length,
    findings,
  };
}

function parseArgs(argv) {
  const options = {};
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (arg === '--root') {
      options.rootDir = argv[++i];
    } else if (arg === '--home') {
      options.home = true;
    } else if (arg === '--home-dir') {
      options.home = true;
      options.homeDir = argv[++i];
    } else if (arg === '--json') {
      options.json = true;
    } else {
      throw new Error(`Unknown argument: ${arg}`);
    }
  }
  return options;
}

function printReport(result, json = false) {
  if (json) {
    console.log(JSON.stringify(result, null, 2));
    return;
  }

  if (result.findings.length === 0) {
    console.log(`Supply-chain IOC scan passed for ${result.rootDir} (${result.scannedFiles} files inspected)`);
    return;
  }

  for (const finding of result.findings) {
    console.error(
      `${finding.severity.toUpperCase()}: ${finding.filePath}:${finding.line} ${finding.indicator}`,
    );
    console.error(`  ${finding.message}`);
  }
}

if (require.main === module) {
  try {
    const options = parseArgs(process.argv.slice(2));
    const result = scanSupplyChainIocs(options);
    printReport(result, options.json);
    process.exit(result.findings.length > 0 ? 1 : 0);
  } catch (error) {
    console.error(error.message);
    process.exit(2);
  }
}

module.exports = {
  CRITICAL_TEXT_INDICATORS,
  MALICIOUS_PACKAGE_VERSIONS,
  scanSupplyChainIocs,
};
