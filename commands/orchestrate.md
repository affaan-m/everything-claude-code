---
description: 複雑なタスクのためのシーケンシャルエージェントワークフロー
---

# オーケストレートコマンド

複雑なタスクのためのシーケンシャルエージェントワークフロー。

## 使用方法

`/orchestrate [workflow-type] [task-description]`

## ワークフロータイプ

### feature

完全な機能実装ワークフロー:

```
planner -> tdd-guide -> code-reviewer -> security-reviewer
```

### bugfix

バグ調査と修正ワークフロー:

```
explorer -> tdd-guide -> code-reviewer
```

### refactor

安全なリファクタリングワークフロー:

```
architect -> code-reviewer -> tdd-guide
```

### security

セキュリティに焦点を当てたレビュー:

```
security-reviewer -> code-reviewer -> architect
```

## 実行パターン

ワークフローの各エージェントについて:

1. 前のエージェントからのコンテキストで**エージェントを呼び出す**
2. 構造化されたハンドオフドキュメントとして**出力を収集**
3. チェーンの**次のエージェントに渡す**
4. 最終レポートに**結果を集約**

## ハンドオフドキュメント形式

エージェント間でハンドオフドキュメントを作成:

```markdown
## ハンドオフ: [前のエージェント] -> [次のエージェント]

### コンテキスト

[何が行われたかの要約]

### 発見事項

[主要な発見や決定]

### 変更されたファイル

[触れたファイルのリスト]

### 未解決の質問

[次のエージェントへの未解決項目]

### 推奨事項

[推奨される次のステップ]
```

## 例: 機能ワークフロー

```
/orchestrate feature "ユーザー認証を追加"
```

実行内容:

1. **Plannerエージェント**
   - 要件を分析
   - 実装計画を作成
   - 依存関係を特定
   - 出力: `ハンドオフ: planner -> tdd-guide`

2. **TDD Guideエージェント**
   - plannerのハンドオフを読み取り
   - まずテストを書く
   - テストをパスするよう実装
   - 出力: `ハンドオフ: tdd-guide -> code-reviewer`

3. **Code Reviewerエージェント**
   - 実装をレビュー
   - 問題をチェック
   - 改善を提案
   - 出力: `ハンドオフ: code-reviewer -> security-reviewer`

4. **Security Reviewerエージェント**
   - セキュリティ監査
   - 脆弱性チェック
   - 最終承認
   - 出力: 最終レポート

## 最終レポート形式

```
オーケストレーションレポート
====================
ワークフロー: feature
タスク: ユーザー認証を追加
エージェント: planner -> tdd-guide -> code-reviewer -> security-reviewer

サマリー
-------
[1段落のサマリー]

エージェント出力
-------------
Planner: [サマリー]
TDD Guide: [サマリー]
Code Reviewer: [サマリー]
Security Reviewer: [サマリー]

変更されたファイル
-------------
[変更されたすべてのファイルのリスト]

テスト結果
----------
[テストのパス/失敗サマリー]

セキュリティステータス
---------------
[セキュリティ発見事項]

推奨
----------
[リリース可 / 要作業 / ブロック中]
```

## 並列実行

独立したチェックの場合、エージェントを並列で実行:

```markdown
### 並列フェーズ

同時実行:
- code-reviewer（品質）
- security-reviewer（セキュリティ）
- architect（設計）

### 結果のマージ

出力を単一のレポートに結合
```

## 引数

$ARGUMENTS:

- `feature <description>` - 完全な機能ワークフロー
- `bugfix <description>` - バグ修正ワークフロー
- `refactor <description>` - リファクタリングワークフロー
- `security <description>` - セキュリティレビューワークフロー
- `custom <agents> <description>` - カスタムエージェントシーケンス

## カスタムワークフロー例

```
/orchestrate custom "architect,tdd-guide,code-reviewer" "キャッシュレイヤーを再設計"
```

## ヒント

1. 複雑な機能には**plannerから始める**
2. マージ前には**常にcode-reviewerを含める**
3. 認証/支払い/PIIには**security-reviewerを使用**
4. ハンドオフは**簡潔に** - 次のエージェントに必要なものに焦点
5. 必要に応じてエージェント間で**検証を実行**
