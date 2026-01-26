/**
 * Claude Code hookとスクリプト用のクロスプラットフォームユーティリティ関数
 * Windows、macOS、Linuxで動作します
 */

const fs = require('fs');
const path = require('path');
const os = require('os');
const { execSync, spawnSync } = require('child_process');

// プラットフォーム検出
const isWindows = process.platform === 'win32';
const isMacOS = process.platform === 'darwin';
const isLinux = process.platform === 'linux';

/**
 * ユーザーのホームディレクトリを取得する（クロスプラットフォーム）
 */
function getHomeDir() {
  return os.homedir();
}

/**
 * Claude設定ディレクトリを取得する
 */
function getClaudeDir() {
  return path.join(getHomeDir(), '.claude');
}

/**
 * セッションディレクトリを取得する
 */
function getSessionsDir() {
  return path.join(getClaudeDir(), 'sessions');
}

/**
 * 学習済みskillディレクトリを取得する
 */
function getLearnedSkillsDir() {
  return path.join(getClaudeDir(), 'skills', 'learned');
}

/**
 * 一時ディレクトリを取得する（クロスプラットフォーム）
 */
function getTempDir() {
  return os.tmpdir();
}

/**
 * ディレクトリが存在することを確認する（存在しない場合は作成）
 */
function ensureDir(dirPath) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
  return dirPath;
}

/**
 * 現在の日付をYYYY-MM-DD形式で取得する
 */
function getDateString() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * 現在の時刻をHH:MM形式で取得する
 */
function getTimeString() {
  const now = new Date();
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  return `${hours}:${minutes}`;
}

/**
 * CLAUDE_SESSION_ID環境変数から短縮セッションIDを取得する
 * 簡潔さと一意性のために末尾8文字を返す
 * @param {string} fallback - セッションIDがない場合のフォールバック値（デフォルト: 'default'）
 */
function getSessionIdShort(fallback = 'default') {
  const sessionId = process.env.CLAUDE_SESSION_ID;
  if (!sessionId || sessionId.length === 0) {
    return fallback;
  }
  return sessionId.slice(-8);
}

/**
 * 現在の日時をYYYY-MM-DD HH:MM:SS形式で取得する
 */
function getDateTimeString() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  const seconds = String(now.getSeconds()).padStart(2, '0');
  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}

/**
 * ディレクトリ内でパターンにマッチするファイルを検索する（findのクロスプラットフォーム代替）
 * @param {string} dir - 検索するディレクトリ
 * @param {string} pattern - ファイルパターン（例: "*.tmp", "*.md"）
 * @param {object} options - オプション { maxAge: 日数, recursive: boolean }
 */
function findFiles(dir, pattern, options = {}) {
  const { maxAge = null, recursive = false } = options;
  const results = [];

  if (!fs.existsSync(dir)) {
    return results;
  }

  const regexPattern = pattern
    .replace(/\./g, '\\.')
    .replace(/\*/g, '.*')
    .replace(/\?/g, '.');
  const regex = new RegExp(`^${regexPattern}$`);

  function searchDir(currentDir) {
    try {
      const entries = fs.readdirSync(currentDir, { withFileTypes: true });

      for (const entry of entries) {
        const fullPath = path.join(currentDir, entry.name);

        if (entry.isFile() && regex.test(entry.name)) {
          if (maxAge !== null) {
            const stats = fs.statSync(fullPath);
            const ageInDays = (Date.now() - stats.mtimeMs) / (1000 * 60 * 60 * 24);
            if (ageInDays <= maxAge) {
              results.push({ path: fullPath, mtime: stats.mtimeMs });
            }
          } else {
            const stats = fs.statSync(fullPath);
            results.push({ path: fullPath, mtime: stats.mtimeMs });
          }
        } else if (entry.isDirectory() && recursive) {
          searchDir(fullPath);
        }
      }
    } catch (err) {
      // 権限エラーを無視
    }
  }

  searchDir(dir);

  // 変更時刻でソート（新しい順）
  results.sort((a, b) => b.mtime - a.mtime);

  return results;
}

/**
 * 標準入力からJSONを読み込む（hook入力用）
 */
async function readStdinJson() {
  return new Promise((resolve, reject) => {
    let data = '';

    process.stdin.setEncoding('utf8');
    process.stdin.on('data', chunk => {
      data += chunk;
    });

    process.stdin.on('end', () => {
      try {
        if (data.trim()) {
          resolve(JSON.parse(data));
        } else {
          resolve({});
        }
      } catch (err) {
        reject(err);
      }
    });

    process.stdin.on('error', reject);
  });
}

/**
 * 標準エラー出力にログを出力する（Claude Codeでユーザーに表示される）
 */
function log(message) {
  console.error(message);
}

/**
 * 標準出力に出力する（Claudeに返される）
 */
function output(data) {
  if (typeof data === 'object') {
    console.log(JSON.stringify(data));
  } else {
    console.log(data);
  }
}

/**
 * テキストファイルを安全に読み込む
 */
function readFile(filePath) {
  try {
    return fs.readFileSync(filePath, 'utf8');
  } catch {
    return null;
  }
}

/**
 * テキストファイルを書き込む
 */
function writeFile(filePath, content) {
  ensureDir(path.dirname(filePath));
  fs.writeFileSync(filePath, content, 'utf8');
}

/**
 * テキストファイルに追記する
 */
function appendFile(filePath, content) {
  ensureDir(path.dirname(filePath));
  fs.appendFileSync(filePath, content, 'utf8');
}

/**
 * コマンドがPATHに存在するかチェックする
 * コマンドインジェクションを防ぐためexecFileSyncを使用
 */
function commandExists(cmd) {
  // コマンド名を検証 - 英数字、ダッシュ、アンダースコア、ドットのみ許可
  if (!/^[a-zA-Z0-9_.-]+$/.test(cmd)) {
    return false;
  }

  try {
    if (isWindows) {
      // シェル補間を避けるためspawnSyncを使用
      const result = spawnSync('where', [cmd], { stdio: 'pipe' });
      return result.status === 0;
    } else {
      const result = spawnSync('which', [cmd], { stdio: 'pipe' });
      return result.status === 0;
    }
  } catch {
    return false;
  }
}

/**
 * コマンドを実行して出力を返す
 *
 * セキュリティ注意: この関数はシェルコマンドを実行します。
 * 信頼できるハードコードされたコマンドでのみ使用してください。
 * ユーザー入力を直接渡さないでください。
 * ユーザー入力の場合は、代わりに引数配列付きのspawnSyncを使用してください。
 *
 * @param {string} cmd - 実行するコマンド（信頼できる/ハードコードされたものであること）
 * @param {object} options - execSyncオプション
 */
function runCommand(cmd, options = {}) {
  try {
    const result = execSync(cmd, {
      encoding: 'utf8',
      stdio: ['pipe', 'pipe', 'pipe'],
      ...options
    });
    return { success: true, output: result.trim() };
  } catch (err) {
    return { success: false, output: err.stderr || err.message };
  }
}

/**
 * 現在のディレクトリがgitリポジトリかチェックする
 */
function isGitRepo() {
  return runCommand('git rev-parse --git-dir').success;
}

/**
 * gitで変更されたファイルを取得する
 */
function getGitModifiedFiles(patterns = []) {
  if (!isGitRepo()) return [];

  const result = runCommand('git diff --name-only HEAD');
  if (!result.success) return [];

  let files = result.output.split('\n').filter(Boolean);

  if (patterns.length > 0) {
    files = files.filter(file => {
      return patterns.some(pattern => {
        const regex = new RegExp(pattern);
        return regex.test(file);
      });
    });
  }

  return files;
}

/**
 * ファイル内のテキストを置換する（sedのクロスプラットフォーム代替）
 */
function replaceInFile(filePath, search, replace) {
  const content = readFile(filePath);
  if (content === null) return false;

  const newContent = content.replace(search, replace);
  writeFile(filePath, newContent);
  return true;
}

/**
 * ファイル内のパターンの出現回数をカウントする
 */
function countInFile(filePath, pattern) {
  const content = readFile(filePath);
  if (content === null) return 0;

  const regex = pattern instanceof RegExp ? pattern : new RegExp(pattern, 'g');
  const matches = content.match(regex);
  return matches ? matches.length : 0;
}

/**
 * ファイル内でパターンを検索し、行番号付きでマッチした行を返す
 */
function grepFile(filePath, pattern) {
  const content = readFile(filePath);
  if (content === null) return [];

  const regex = pattern instanceof RegExp ? pattern : new RegExp(pattern);
  const lines = content.split('\n');
  const results = [];

  lines.forEach((line, index) => {
    if (regex.test(line)) {
      results.push({ lineNumber: index + 1, content: line });
    }
  });

  return results;
}

module.exports = {
  // プラットフォーム情報
  isWindows,
  isMacOS,
  isLinux,

  // ディレクトリ
  getHomeDir,
  getClaudeDir,
  getSessionsDir,
  getLearnedSkillsDir,
  getTempDir,
  ensureDir,

  // 日付/時刻
  getDateString,
  getTimeString,
  getDateTimeString,
  getSessionIdShort,

  // ファイル操作
  findFiles,
  readFile,
  writeFile,
  appendFile,
  replaceInFile,
  countInFile,
  grepFile,

  // hook入出力
  readStdinJson,
  log,
  output,

  // システム
  commandExists,
  runCommand,
  isGitRepo,
  getGitModifiedFiles
};
