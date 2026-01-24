# Everything Claude Code - Agents（日本語版）

このフォルダには、[affaan-m/everything-claude-code](https://github.com/affaan-m/everything-claude-code)リポジトリのagentsフォルダを日本語に翻訳したファイルが含まれています。

## 概要

これらのエージェント設定ファイルは、Anthropicハッカソン優勝者による10ヶ月以上の実践経験から生まれた、Claude Code用の本番環境向け設定集です。

## エージェント一覧

| ファイル名                  | 説明                                                               |
| --------------------------- | ------------------------------------------------------------------ |
| `architect.md`              | ソフトウェアアーキテクチャスペシャリスト。システム設計、スケーラビリティ、技術的意思決定。 |
| `build-error-resolver.md`   | ビルドエラー解決スペシャリスト。TypeScript/ビルドエラーを最小限の変更で修正。           |
| `code-reviewer.md`          | コードレビュースペシャリスト。品質、セキュリティ、保守性のレビュー。                    |
| `doc-updater.md`            | ドキュメントスペシャリスト。コードマップとドキュメントの更新。                        |
| `e2e-runner.md`             | E2Eテストスペシャリスト。Playwrightを使用したテストの作成・実行・保守。               |
| `planner.md`                | 計画スペシャリスト。複雑な機能やリファクタリングの実装計画を作成。                     |
| `refactor-cleaner.md`       | リファクタリングスペシャリスト。デッドコードの検出と安全な削除。                       |
| `security-reviewer.md`      | セキュリティスペシャリスト。脆弱性の検出とOWASP Top 10のチェック。                  |
| `tdd-guide.md`              | TDDスペシャリスト。テスト先行開発と80%以上のカバレッジ確保。                       |

## 使用方法

これらのファイルはClaude Codeの`.claude/agents/`ディレクトリに配置して使用します。

```bash
# プロジェクトのルートで
mkdir -p .claude/agents
cp agents-ja/*.md .claude/agents/
```

## 各エージェントの用途

### アーキテクチャ・計画系

- **architect** - 新機能のシステム設計、アーキテクチャ決定時に使用
- **planner** - 複雑な機能の実装計画、リファクタリング計画時に使用

### コード品質系

- **code-reviewer** - コード変更後のレビューに使用（必須）
- **security-reviewer** - セキュリティに関わるコード変更後に使用
- **tdd-guide** - 新機能開発、バグ修正時にテスト先行で使用

### ビルド・テスト系

- **build-error-resolver** - ビルド失敗、型エラー発生時に使用
- **e2e-runner** - E2Eテストの作成・実行・保守に使用

### メンテナンス系

- **doc-updater** - ドキュメントとコードマップの更新に使用
- **refactor-cleaner** - デッドコードの削除、コード統合に使用

## 原著

- **リポジトリ**: https://github.com/affaan-m/everything-claude-code
- **作者**: Affaan Mustafa（Anthropicハッカソン優勝者）
- **ライセンス**: MIT

## 翻訳について

この翻訳は原著の内容を忠実に日本語化したものです。技術用語は適宜英語のままとしています。
