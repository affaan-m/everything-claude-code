#!/usr/bin/env node
/**
 * 戦略的圧縮提案器
 *
 * クロスプラットフォーム対応（Windows、macOS、Linux）
 *
 * PreToolUse または定期的に実行され、論理的な間隔で手動圧縮を提案します
 *
 * 自動圧縮より手動を選ぶ理由:
 * - 自動圧縮は任意のタイミングで発生し、多くの場合タスクの途中で起こる
 * - 戦略的な圧縮は論理的なフェーズを通じて context を保持する
 * - 探索後、実行前に圧縮する
 * - マイルストーン完了後、次を開始する前に圧縮する
 */

const path = require('path');
const fs = require('fs');
const {
  getTempDir,
  readFile,
  writeFile,
  log
} = require('../lib/utils');

async function main() {
  // ツール呼び出し回数を追跡（一時ファイルでインクリメント）
  // 親プロセスの PID または環境変数のセッション ID に基づいて
  // セッション固有のカウンターファイルを使用
  const sessionId = process.env.CLAUDE_SESSION_ID || process.ppid || 'default';
  const counterFile = path.join(getTempDir(), `claude-tool-count-${sessionId}`);
  const threshold = parseInt(process.env.COMPACT_THRESHOLD || '50', 10);

  let count = 1;

  // 既存のカウントを読み取るか、1から開始
  const existing = readFile(counterFile);
  if (existing) {
    count = parseInt(existing.trim(), 10) + 1;
  }

  // 更新されたカウントを保存
  writeFile(counterFile, String(count));

  // 閾値のツール呼び出し回数に達したら圧縮を提案
  if (count === threshold) {
    log(`[StrategicCompact] ${threshold} tool calls reached - consider /compact if transitioning phases`);
  }

  // 閾値後の定期的な間隔で提案
  if (count > threshold && count % 25 === 0) {
    log(`[StrategicCompact] ${count} tool calls - good checkpoint for /compact if context is stale`);
  }

  process.exit(0);
}

main().catch(err => {
  console.error('[StrategicCompact] Error:', err.message);
  process.exit(0);
});
