#!/usr/bin/env node
/**
 * PreCompact Hook - context 圧縮前に状態を保存
 *
 * クロスプラットフォーム対応（Windows、macOS、Linux）
 *
 * Claude が context を圧縮する前に実行され、要約で失われる可能性のある
 * 重要な状態を保持する機会を提供します。
 */

const path = require('path');
const {
  getSessionsDir,
  getDateTimeString,
  getTimeString,
  findFiles,
  ensureDir,
  appendFile,
  log
} = require('../lib/utils');

async function main() {
  const sessionsDir = getSessionsDir();
  const compactionLog = path.join(sessionsDir, 'compaction-log.txt');

  ensureDir(sessionsDir);

  // タイムスタンプ付きで圧縮イベントをログに記録
  const timestamp = getDateTimeString();
  appendFile(compactionLog, `[${timestamp}] Context compaction triggered\n`);

  // アクティブなセッションファイルがある場合、圧縮を記録
  const sessions = findFiles(sessionsDir, '*.tmp');

  if (sessions.length > 0) {
    const activeSession = sessions[0].path;
    const timeStr = getTimeString();
    appendFile(activeSession, `\n---\n**[Compaction occurred at ${timeStr}]** - Context was summarized\n`);
  }

  log('[PreCompact] State saved before compaction');
  process.exit(0);
}

main().catch(err => {
  console.error('[PreCompact] Error:', err.message);
  process.exit(0);
});
