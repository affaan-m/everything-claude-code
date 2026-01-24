# フックシステム

## フックの種類

- **PreToolUse**: ツール実行前（バリデーション、パラメータ変更）
- **PostToolUse**: ツール実行後（自動フォーマット、チェック）
- **Stop**: セッション終了時（最終確認）

## 現在のフック（~/.claude/settings.json内）

### PreToolUse
- **tmuxリマインダー**: 長時間実行コマンド（npm, pnpm, yarn, cargoなど）にtmux使用を提案
- **git pushレビュー**: プッシュ前にZedでレビューを開く
- **docブロッカー**: 不要な.md/.txtファイル作成をブロック

### PostToolUse
- **PR作成**: PR URLとGitHub Actionsステータスをログ
- **Prettier**: JS/TSファイル編集後に自動フォーマット
- **TypeScriptチェック**: .ts/.tsx編集後にtscを実行
- **console.log警告**: 編集ファイル内のconsole.logを警告

### Stop
- **console.log監査**: セッション終了前に全修正ファイルのconsole.logをチェック

## 自動承認権限

慎重に使用:
- 信頼された明確な計画には有効化
- 探索的作業には無効化
- dangerously-skip-permissionsフラグは絶対に使用しない
- 代わりに `~/.claude.json` で `allowedTools` を設定

## TodoWriteベストプラクティス

TodoWriteツールの用途:
- 複数ステップのタスク進捗を追跡
- 指示の理解を確認
- リアルタイムでの軌道修正を可能に
- 詳細な実装ステップを表示

Todoリストで判明すること:
- 順序が間違っているステップ
- 欠落している項目
- 不要な余分な項目
- 粒度の問題
- 誤解された要件
