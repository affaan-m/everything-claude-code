# Everything Claude Code - Commands（日本語版）

このフォルダには、[affaan-m/everything-claude-code](https://github.com/affaan-m/everything-claude-code)リポジトリのcommandsフォルダを日本語に翻訳したファイルが含まれています。

## 概要

これらのコマンド設定ファイルは、Claude Codeで`/command`形式で呼び出せるカスタムコマンドを定義しています。

## コマンド一覧

| コマンド              | 説明                                                                   |
| --------------------- | ---------------------------------------------------------------------- |
| `/build-fix`          | TypeScriptとビルドエラーを段階的に修正                                 |
| `/checkpoint`         | ワークフローでチェックポイントを作成・検証                              |
| `/code-review`        | コミット前の包括的なセキュリティと品質レビュー                          |
| `/e2e`                | Playwrightを使ったE2Eテストの生成・実行                                 |
| `/eval`               | 評価駆動開発ワークフローを管理                                          |
| `/learn`              | セッションから再利用可能なパターンを抽出してスキル化                    |
| `/orchestrate`        | 複数のエージェントをシーケンシャルに実行するワークフロー                |
| `/plan`               | 実装前に包括的な計画を作成（確認を待つ）                                |
| `/refactor-clean`     | テスト検証付きでデッドコードを安全に削除                                |
| `/setup-pm`           | パッケージマネージャーの設定（npm/pnpm/yarn/bun）                       |
| `/tdd`                | テスト駆動開発ワークフローを強制                                        |
| `/test-coverage`      | テストカバレッジを分析し不足テストを生成                                |
| `/update-codemaps`    | コードベース構造からアーキテクチャドキュメントを更新                    |
| `/update-docs`        | package.jsonと.env.exampleからドキュメントを同期                        |
| `/verify`             | ビルド・型・リント・テストの包括的な検証                                |

## 使用方法

これらのファイルはClaude Codeの`.claude/commands/`ディレクトリに配置して使用します。

```bash
# プロジェクトのルートで
mkdir -p .claude/commands
cp commands-ja/*.md .claude/commands/
```

## コマンドのカテゴリ

### 開発フロー

- `/plan` - 実装計画を作成
- `/tdd` - テスト駆動開発で実装
- `/build-fix` - ビルドエラーを修正
- `/code-review` - コードをレビュー

### テスト

- `/tdd` - ユニットテスト作成
- `/e2e` - E2Eテスト作成・実行
- `/test-coverage` - カバレッジ分析

### メンテナンス

- `/refactor-clean` - デッドコード削除
- `/update-codemaps` - アーキテクチャドキュメント更新
- `/update-docs` - ドキュメント更新

### ワークフロー管理

- `/orchestrate` - エージェントのシーケンシャル実行
- `/checkpoint` - 進捗のチェックポイント管理
- `/verify` - 包括的な検証
- `/eval` - 評価駆動開発

### ユーティリティ

- `/learn` - パターンをスキルとして保存
- `/setup-pm` - パッケージマネージャー設定

## 原著

- **リポジトリ**: https://github.com/affaan-m/everything-claude-code
- **作者**: Affaan Mustafa（Anthropicハッカソン優勝者）
- **ライセンス**: MIT

## 翻訳について

この翻訳は原著の内容を忠実に日本語化したものです。技術用語は適宜英語のままとしています。
