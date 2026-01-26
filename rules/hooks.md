# Hook システム

## Hook タイプ

- **PreToolUse**: ツール実行前（バリデーション、パラメータ変更）
- **PostToolUse**: ツール実行後（自動フォーマット、チェック）
- **Stop**: セッション終了時（最終検証）

## 現在の Hook（~/.claude/settings.json 内）

### PreToolUse
- **tmux リマインダー**: 長時間実行コマンド（npm、pnpm、yarn、cargo など）に tmux を提案
- **git push レビュー**: プッシュ前に Zed でレビューを開く
- **doc ブロッカー**: 不要な .md/.txt ファイルの作成をブロック

### PostToolUse
- **PR 作成**: PR URL と GitHub Actions のステータスをログ
- **Prettier**: 編集後に JS/TS ファイルを自動フォーマット
- **TypeScript チェック**: .ts/.tsx ファイル編集後に tsc を実行
- **console.log 警告**: 編集されたファイル内の console.log について警告

### Stop
- **console.log 監査**: セッション終了前にすべての変更ファイルで console.log をチェック

## 自動承認パーミッション

慎重に使用：
- 信頼できる、明確に定義された計画に対して有効化
- 探索的作業では無効化
- dangerously-skip-permissions フラグは決して使用しない
- 代わりに `~/.claude.json` で `allowedTools` を設定

## TodoWrite ベストプラクティス

TodoWrite ツールを使用して：
- マルチステップタスクの進捗を追跡
- 指示の理解を確認
- リアルタイムのステアリングを可能に
- 詳細な実装ステップを表示

Todo リストで分かること：
- 順序が違うステップ
- 不足しているアイテム
- 余分な不要なアイテム
- 粒度の間違い
- 誤解された要件
