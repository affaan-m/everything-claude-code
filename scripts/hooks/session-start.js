#!/usr/bin/env node
/**
 * SessionStart Hook - 新しいセッション開始時に以前の context を読み込む
 *
 * クロスプラットフォーム対応（Windows、macOS、Linux）
 *
 * 新しい Claude セッション開始時に実行されます。最近のセッション
 * ファイルをチェックし、読み込み可能な context を Claude に通知します。
 */

const path = require('path');
const {
  getSessionsDir,
  getLearnedSkillsDir,
  findFiles,
  ensureDir,
  log
} = require('../lib/utils');
const { getPackageManager, getSelectionPrompt } = require('../lib/package-manager');

async function main() {
  const sessionsDir = getSessionsDir();
  const learnedDir = getLearnedSkillsDir();

  // ディレクトリの存在を確認
  ensureDir(sessionsDir);
  ensureDir(learnedDir);

  // 最近のセッションファイルをチェック（過去7日間）
  // 旧形式（YYYY-MM-DD-session.tmp）と新形式（YYYY-MM-DD-shortid-session.tmp）の両方にマッチ
  const recentSessions = findFiles(sessionsDir, '*-session.tmp', { maxAge: 7 });

  if (recentSessions.length > 0) {
    const latest = recentSessions[0];
    log(`[SessionStart] Found ${recentSessions.length} recent session(s)`);
    log(`[SessionStart] Latest: ${latest.path}`);
  }

  // 学習済み skill をチェック
  const learnedSkills = findFiles(learnedDir, '*.md');

  if (learnedSkills.length > 0) {
    log(`[SessionStart] ${learnedSkills.length} learned skill(s) available in ${learnedDir}`);
  }

  // パッケージマネージャーを検出して報告
  const pm = getPackageManager();
  log(`[SessionStart] Package manager: ${pm.name} (${pm.source})`);

  // パッケージマネージャーがフォールバックで検出された場合、選択プロンプトを表示
  if (pm.source === 'fallback' || pm.source === 'default') {
    log('[SessionStart] No package manager preference found.');
    log(getSelectionPrompt());
  }

  process.exit(0);
}

main().catch(err => {
  console.error('[SessionStart] Error:', err.message);
  process.exit(0); // エラーでブロックしない
});
