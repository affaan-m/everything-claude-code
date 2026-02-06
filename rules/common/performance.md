# パフォーマンス最適化

## モデル選択戦略

**Haiku 4.5**（Sonnet の90%の能力、3倍のコスト削減）：
- 頻繁に呼び出される軽量 agent
- ペアプログラミングとコード生成
- マルチエージェントシステムのワーカー agent

**Sonnet 4.5**（最高のコーディングモデル）：
- メイン開発作業
- マルチエージェントワークフローのオーケストレーション
- 複雑なコーディングタスク

**Opus 4.5**（最深の推論）：
- 複雑なアーキテクチャの決定
- 最大限の推論が必要な場合
- リサーチと分析タスク

## コンテキストウィンドウ管理

コンテキストウィンドウの最後の20%では以下を避ける：
- 大規模リファクタリング
- 複数ファイルにまたがる機能実装
- 複雑なインタラクションのデバッグ

コンテキスト感度が低いタスク：
- 単一ファイルの編集
- 独立したユーティリティの作成
- ドキュメント更新
- 単純なバグ修正

## Extended Thinking + Plan Mode

Extended thinking is enabled by default, reserving up to 31,999 tokens for internal reasoning.

Control extended thinking via:
- **Toggle**: Option+T (macOS) / Alt+T (Windows/Linux)
- **Config**: Set `alwaysThinkingEnabled` in `~/.claude/settings.json`
- **Budget cap**: `export MAX_THINKING_TOKENS=10000`
- **Verbose mode**: Ctrl+O to see thinking output

深い推論を必要とする複雑なタスクの場合：
1. 拡張された思考が有効であることを確認（デフォルトで有効）
2. 構造化されたアプローチのために **Plan Mode** を有効化
3. 複数の批評ラウンドで徹底的な分析を実施
4. 多様な分析のために役割分割サブエージェントを使用

## ビルドトラブルシューティング

ビルドが失敗した場合：
1. **build-error-resolver** agent を使用
2. エラーメッセージを分析
3. インクリメンタルに修正
4. 各修正後に検証
