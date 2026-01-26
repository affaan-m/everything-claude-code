/**
 * パッケージマネージャーの検出と選択
 * 優先パッケージマネージャーを自動検出するか、ユーザーに選択させます
 *
 * 対応: npm, pnpm, yarn, bun
 */

const fs = require('fs');
const path = require('path');
const { commandExists, getClaudeDir, readFile, writeFile, log, runCommand } = require('./utils');

// パッケージマネージャーの定義
const PACKAGE_MANAGERS = {
  npm: {
    name: 'npm',
    lockFile: 'package-lock.json',
    installCmd: 'npm install',
    runCmd: 'npm run',
    execCmd: 'npx',
    testCmd: 'npm test',
    buildCmd: 'npm run build',
    devCmd: 'npm run dev'
  },
  pnpm: {
    name: 'pnpm',
    lockFile: 'pnpm-lock.yaml',
    installCmd: 'pnpm install',
    runCmd: 'pnpm',
    execCmd: 'pnpm dlx',
    testCmd: 'pnpm test',
    buildCmd: 'pnpm build',
    devCmd: 'pnpm dev'
  },
  yarn: {
    name: 'yarn',
    lockFile: 'yarn.lock',
    installCmd: 'yarn',
    runCmd: 'yarn',
    execCmd: 'yarn dlx',
    testCmd: 'yarn test',
    buildCmd: 'yarn build',
    devCmd: 'yarn dev'
  },
  bun: {
    name: 'bun',
    lockFile: 'bun.lockb',
    installCmd: 'bun install',
    runCmd: 'bun run',
    execCmd: 'bunx',
    testCmd: 'bun test',
    buildCmd: 'bun run build',
    devCmd: 'bun run dev'
  }
};

// 検出の優先順位
const DETECTION_PRIORITY = ['pnpm', 'bun', 'yarn', 'npm'];

// 設定ファイルのパス
function getConfigPath() {
  return path.join(getClaudeDir(), 'package-manager.json');
}

/**
 * 保存されたパッケージマネージャー設定を読み込む
 */
function loadConfig() {
  const configPath = getConfigPath();
  const content = readFile(configPath);

  if (content) {
    try {
      return JSON.parse(content);
    } catch {
      return null;
    }
  }
  return null;
}

/**
 * パッケージマネージャー設定を保存する
 */
function saveConfig(config) {
  const configPath = getConfigPath();
  writeFile(configPath, JSON.stringify(config, null, 2));
}

/**
 * プロジェクトディレクトリのロックファイルからパッケージマネージャーを検出する
 */
function detectFromLockFile(projectDir = process.cwd()) {
  for (const pmName of DETECTION_PRIORITY) {
    const pm = PACKAGE_MANAGERS[pmName];
    const lockFilePath = path.join(projectDir, pm.lockFile);

    if (fs.existsSync(lockFilePath)) {
      return pmName;
    }
  }
  return null;
}

/**
 * package.jsonのpackageManagerフィールドからパッケージマネージャーを検出する
 */
function detectFromPackageJson(projectDir = process.cwd()) {
  const packageJsonPath = path.join(projectDir, 'package.json');
  const content = readFile(packageJsonPath);

  if (content) {
    try {
      const pkg = JSON.parse(content);
      if (pkg.packageManager) {
        // 形式: "pnpm@8.6.0" または単に "pnpm"
        const pmName = pkg.packageManager.split('@')[0];
        if (PACKAGE_MANAGERS[pmName]) {
          return pmName;
        }
      }
    } catch {
      // 無効なpackage.json
    }
  }
  return null;
}

/**
 * 利用可能なパッケージマネージャーを取得する（システムにインストール済みのもの）
 */
function getAvailablePackageManagers() {
  const available = [];

  for (const pmName of Object.keys(PACKAGE_MANAGERS)) {
    if (commandExists(pmName)) {
      available.push(pmName);
    }
  }

  return available;
}

/**
 * 現在のプロジェクトで使用するパッケージマネージャーを取得する
 *
 * 検出の優先順位:
 * 1. 環境変数 CLAUDE_PACKAGE_MANAGER
 * 2. プロジェクト固有の設定（.claude/package-manager.json内）
 * 3. package.jsonのpackageManagerフィールド
 * 4. ロックファイルの検出
 * 5. グローバルユーザー設定（~/.claude/package-manager.json内）
 * 6. 最初に利用可能なパッケージマネージャー（優先順位順）
 *
 * @param {object} options - { projectDir, fallbackOrder }
 * @returns {object} - { name, config, source }
 */
function getPackageManager(options = {}) {
  const { projectDir = process.cwd(), fallbackOrder = DETECTION_PRIORITY } = options;

  // 1. 環境変数をチェック
  const envPm = process.env.CLAUDE_PACKAGE_MANAGER;
  if (envPm && PACKAGE_MANAGERS[envPm]) {
    return {
      name: envPm,
      config: PACKAGE_MANAGERS[envPm],
      source: 'environment'
    };
  }

  // 2. プロジェクト固有の設定をチェック
  const projectConfigPath = path.join(projectDir, '.claude', 'package-manager.json');
  const projectConfig = readFile(projectConfigPath);
  if (projectConfig) {
    try {
      const config = JSON.parse(projectConfig);
      if (config.packageManager && PACKAGE_MANAGERS[config.packageManager]) {
        return {
          name: config.packageManager,
          config: PACKAGE_MANAGERS[config.packageManager],
          source: 'project-config'
        };
      }
    } catch {
      // 無効な設定
    }
  }

  // 3. package.jsonのpackageManagerフィールドをチェック
  const fromPackageJson = detectFromPackageJson(projectDir);
  if (fromPackageJson) {
    return {
      name: fromPackageJson,
      config: PACKAGE_MANAGERS[fromPackageJson],
      source: 'package.json'
    };
  }

  // 4. ロックファイルをチェック
  const fromLockFile = detectFromLockFile(projectDir);
  if (fromLockFile) {
    return {
      name: fromLockFile,
      config: PACKAGE_MANAGERS[fromLockFile],
      source: 'lock-file'
    };
  }

  // 5. グローバルユーザー設定をチェック
  const globalConfig = loadConfig();
  if (globalConfig && globalConfig.packageManager && PACKAGE_MANAGERS[globalConfig.packageManager]) {
    return {
      name: globalConfig.packageManager,
      config: PACKAGE_MANAGERS[globalConfig.packageManager],
      source: 'global-config'
    };
  }

  // 6. 最初に利用可能なパッケージマネージャーを使用
  const available = getAvailablePackageManagers();
  for (const pmName of fallbackOrder) {
    if (available.includes(pmName)) {
      return {
        name: pmName,
        config: PACKAGE_MANAGERS[pmName],
        source: 'fallback'
      };
    }
  }

  // デフォルトはnpm（Node.jsで常に利用可能）
  return {
    name: 'npm',
    config: PACKAGE_MANAGERS.npm,
    source: 'default'
  };
}

/**
 * ユーザーの優先パッケージマネージャーを設定する（グローバル）
 */
function setPreferredPackageManager(pmName) {
  if (!PACKAGE_MANAGERS[pmName]) {
    throw new Error(`Unknown package manager: ${pmName}`);
  }

  const config = loadConfig() || {};
  config.packageManager = pmName;
  config.setAt = new Date().toISOString();
  saveConfig(config);

  return config;
}

/**
 * プロジェクトの優先パッケージマネージャーを設定する
 */
function setProjectPackageManager(pmName, projectDir = process.cwd()) {
  if (!PACKAGE_MANAGERS[pmName]) {
    throw new Error(`Unknown package manager: ${pmName}`);
  }

  const configDir = path.join(projectDir, '.claude');
  const configPath = path.join(configDir, 'package-manager.json');

  const config = {
    packageManager: pmName,
    setAt: new Date().toISOString()
  };

  writeFile(configPath, JSON.stringify(config, null, 2));
  return config;
}

/**
 * スクリプトを実行するコマンドを取得する
 * @param {string} script - スクリプト名（例: "dev", "build", "test"）
 * @param {object} options - { projectDir }
 */
function getRunCommand(script, options = {}) {
  const pm = getPackageManager(options);

  switch (script) {
    case 'install':
      return pm.config.installCmd;
    case 'test':
      return pm.config.testCmd;
    case 'build':
      return pm.config.buildCmd;
    case 'dev':
      return pm.config.devCmd;
    default:
      return `${pm.config.runCmd} ${script}`;
  }
}

/**
 * パッケージバイナリを実行するコマンドを取得する
 * @param {string} binary - バイナリ名（例: "prettier", "eslint"）
 * @param {string} args - 渡す引数
 */
function getExecCommand(binary, args = '', options = {}) {
  const pm = getPackageManager(options);
  return `${pm.config.execCmd} ${binary}${args ? ' ' + args : ''}`;
}

/**
 * パッケージマネージャー選択のインタラクティブプロンプト
 * Claudeがユーザーに表示するメッセージを返す
 */
function getSelectionPrompt() {
  const available = getAvailablePackageManagers();
  const current = getPackageManager();

  let message = '[PackageManager] Available package managers:\n';

  for (const pmName of available) {
    const indicator = pmName === current.name ? ' (current)' : '';
    message += `  - ${pmName}${indicator}\n`;
  }

  message += '\nTo set your preferred package manager:\n';
  message += '  - Global: Set CLAUDE_PACKAGE_MANAGER environment variable\n';
  message += '  - Or add to ~/.claude/package-manager.json: {"packageManager": "pnpm"}\n';
  message += '  - Or add to package.json: {"packageManager": "pnpm@8"}\n';

  return message;
}

/**
 * すべてのパッケージマネージャーのコマンドにマッチする正規表現パターンを生成する
 * @param {string} action - アクションパターン（例: "run dev", "install", "test"）
 */
function getCommandPattern(action) {
  const patterns = [];

  if (action === 'dev') {
    patterns.push(
      'npm run dev',
      'pnpm( run)? dev',
      'yarn dev',
      'bun run dev'
    );
  } else if (action === 'install') {
    patterns.push(
      'npm install',
      'pnpm install',
      'yarn( install)?',
      'bun install'
    );
  } else if (action === 'test') {
    patterns.push(
      'npm test',
      'pnpm test',
      'yarn test',
      'bun test'
    );
  } else if (action === 'build') {
    patterns.push(
      'npm run build',
      'pnpm( run)? build',
      'yarn build',
      'bun run build'
    );
  } else {
    // 汎用のrunコマンド
    patterns.push(
      `npm run ${action}`,
      `pnpm( run)? ${action}`,
      `yarn ${action}`,
      `bun run ${action}`
    );
  }

  return `(${patterns.join('|')})`;
}

module.exports = {
  PACKAGE_MANAGERS,
  DETECTION_PRIORITY,
  getPackageManager,
  setPreferredPackageManager,
  setProjectPackageManager,
  getAvailablePackageManagers,
  detectFromLockFile,
  detectFromPackageJson,
  getRunCommand,
  getExecCommand,
  getSelectionPrompt,
  getCommandPattern
};
