# フックシステム

## フックの種類

- **PreToolUse**: ツール実行前（バリデーション、パラメータ変更）
- **PostToolUse**: ツール実行後（自動フォーマット、チェック）
- **Stop**: セッション終了時（最終検証）

## 現在のフック（~/.claude/settings.json 内）

### PreToolUse
- **tmuxリマインダー**: 長時間実行コマンド（npm, pnpm, yarn, cargo など）にtmuxの使用を提案
- **git pushレビュー**: プッシュ前にZedでレビューを開く
- **ドキュメントブロッカー**: 不要な .md/.txt ファイルの作成をブロック

### PostToolUse
- **PR作成**: PR URLとGitHub Actionsのステータスをログに記録
- **Prettier**: 編集後にJS/TSファイルを自動フォーマット
- **TypeScriptチェック**: .ts/.tsx ファイル編集後にtscを実行
- **console.log警告**: 編集されたファイル内のconsole.logについて警告

### Stop
- **console.log監査**: セッション終了前に変更されたすべてのファイルでconsole.logをチェック

## 自動承認パーミッション

慎重に使用すること:
- 信頼できる、明確に定義された計画に対して有効化
- 探索的な作業では無効化
- dangerously-skip-permissions フラグは絶対に使用しない
- 代わりに `~/.claude.json` の `allowedTools` を設定

## TodoWrite ベストプラクティス

TodoWriteツールの用途:
- マルチステップタスクの進捗管理
- 指示の理解を確認
- リアルタイムのステアリングを可能にする
- 詳細な実装ステップを表示

Todoリストで発見できること:
- 順序が間違っているステップ
- 不足している項目
- 不要な余分な項目
- 粒度の問題
- 誤解された要件
