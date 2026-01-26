# Agent オーケストレーション

## 利用可能な Agent

`~/.claude/agents/` に配置：

| Agent | 目的 | 使用タイミング |
|-------|------|---------------|
| planner | 実装計画 | 複雑な機能、リファクタリング |
| architect | システム設計 | アーキテクチャの決定 |
| tdd-guide | テスト駆動開発 | 新機能、バグ修正 |
| code-reviewer | コードレビュー | コード作成後 |
| security-reviewer | セキュリティ分析 | コミット前 |
| build-error-resolver | ビルドエラー修正 | ビルド失敗時 |
| e2e-runner | E2E テスト | クリティカルなユーザーフロー |
| refactor-cleaner | デッドコードクリーンアップ | コードメンテナンス |
| doc-updater | ドキュメント | ドキュメント更新 |

## Agent の即座の使用

ユーザープロンプト不要：
1. 複雑な機能リクエスト - **planner** agent を使用
2. コードを作成/修正した直後 - **code-reviewer** agent を使用
3. バグ修正または新機能 - **tdd-guide** agent を使用
4. アーキテクチャの決定 - **architect** agent を使用

## 並列タスク実行

独立した操作には常に並列 Task 実行を使用：

```markdown
# 良い例: 並列実行
3つの agent を並列で起動：
1. Agent 1: auth.ts のセキュリティ分析
2. Agent 2: キャッシュシステムのパフォーマンスレビュー
3. Agent 3: utils.ts の型チェック

# 悪い例: 不必要な順次実行
まず agent 1、次に agent 2、次に agent 3
```

## マルチパースペクティブ分析

複雑な問題には、役割分割サブエージェントを使用：
- 事実レビュアー
- シニアエンジニア
- セキュリティエキスパート
- 一貫性レビュアー
- 冗長性チェッカー
