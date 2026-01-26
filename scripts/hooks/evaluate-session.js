#!/usr/bin/env node
/**
 * 継続学習 - セッション評価器
 *
 * クロスプラットフォーム対応（Windows、macOS、Linux）
 *
 * Stop hook で実行され、Claude Code セッションから再利用可能なパターンを抽出します
 *
 * UserPromptSubmit ではなく Stop hook を使用する理由:
 * - Stop はセッション終了時に1回だけ実行される（軽量）
 * - UserPromptSubmit は毎メッセージで実行される（重く、レイテンシが増加する）
 */

const path = require('path');
const fs = require('fs');
const {
  getLearnedSkillsDir,
  ensureDir,
  readFile,
  countInFile,
  log
} = require('../lib/utils');

async function main() {
  // 設定ファイルを見つけるためにスクリプトディレクトリを取得
  const scriptDir = __dirname;
  const configFile = path.join(scriptDir, '..', '..', 'skills', 'continuous-learning', 'config.json');

  // デフォルト設定
  let minSessionLength = 10;
  let learnedSkillsPath = getLearnedSkillsDir();

  // 設定ファイルが存在すれば読み込む
  const configContent = readFile(configFile);
  if (configContent) {
    try {
      const config = JSON.parse(configContent);
      minSessionLength = config.min_session_length || 10;

      if (config.learned_skills_path) {
        // パス内の ~ を処理
        learnedSkillsPath = config.learned_skills_path.replace(/^~/, require('os').homedir());
      }
    } catch {
      // 無効な設定、デフォルトを使用
    }
  }

  // 学習済み skill ディレクトリが存在することを確認
  ensureDir(learnedSkillsPath);

  // 環境変数からトランスクリプトパスを取得（Claude Code によって設定される）
  const transcriptPath = process.env.CLAUDE_TRANSCRIPT_PATH;

  if (!transcriptPath || !fs.existsSync(transcriptPath)) {
    process.exit(0);
  }

  // セッション内のユーザーメッセージ数をカウント
  const messageCount = countInFile(transcriptPath, /"type":"user"/g);

  // 短いセッションはスキップ
  if (messageCount < minSessionLength) {
    log(`[ContinuousLearning] Session too short (${messageCount} messages), skipping`);
    process.exit(0);
  }

  // 抽出可能なパターンを評価する必要があることを Claude に通知
  log(`[ContinuousLearning] Session has ${messageCount} messages - evaluate for extractable patterns`);
  log(`[ContinuousLearning] Save learned skills to: ${learnedSkillsPath}`);

  process.exit(0);
}

main().catch(err => {
  console.error('[ContinuousLearning] Error:', err.message);
  process.exit(0);
});
