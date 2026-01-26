# Orchestrate Command

複雑なタスクのための順次 agent ワークフロー。

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
セキュリティ重視のレビュー:
```
security-reviewer -> code-reviewer -> architect
```

## 実行パターン

ワークフロー内の各 agent について:

1. **agent を呼び出し** - 前の agent からの context を使用
2. **出力を収集** - 構造化された引き継ぎドキュメントとして
3. **次の agent に渡す** - チェーン内で
4. **結果を集約** - 最終レポートに

## 引き継ぎドキュメント形式

agent 間で引き継ぎドキュメントを作成:

```markdown
## HANDOFF: [previous-agent] -> [next-agent]

### Context
[実行内容の要約]

### Findings
[主な発見や決定事項]

### Files Modified
[変更したファイルのリスト]

### Open Questions
[次の agent 向けの未解決事項]

### Recommendations
[推奨される次のステップ]
```

## 例: Feature ワークフロー

```
/orchestrate feature "Add user authentication"
```

実行内容:

1. **Planner Agent**
   - 要件を分析
   - 実装計画を作成
   - 依存関係を特定
   - 出力: `HANDOFF: planner -> tdd-guide`

2. **TDD Guide Agent**
   - planner の引き継ぎを読み取り
   - 最初にテストを作成
   - テストをパスするよう実装
   - 出力: `HANDOFF: tdd-guide -> code-reviewer`

3. **Code Reviewer Agent**
   - 実装をレビュー
   - 問題をチェック
   - 改善を提案
   - 出力: `HANDOFF: code-reviewer -> security-reviewer`

4. **Security Reviewer Agent**
   - セキュリティ監査
   - 脆弱性チェック
   - 最終承認
   - 出力: 最終レポート

## 最終レポート形式

```
ORCHESTRATION REPORT
====================
Workflow: feature
Task: Add user authentication
Agents: planner -> tdd-guide -> code-reviewer -> security-reviewer

SUMMARY
-------
[1段落の要約]

AGENT OUTPUTS
-------------
Planner: [要約]
TDD Guide: [要約]
Code Reviewer: [要約]
Security Reviewer: [要約]

FILES CHANGED
-------------
[変更されたすべてのファイルのリスト]

TEST RESULTS
------------
[テスト合格/不合格の要約]

SECURITY STATUS
---------------
[セキュリティ上の発見事項]

RECOMMENDATION
--------------
[SHIP / NEEDS WORK / BLOCKED]
```

## 並列実行

独立したチェックについては、agent を並列実行:

```markdown
### Parallel Phase
同時に実行:
- code-reviewer (品質)
- security-reviewer (セキュリティ)
- architect (設計)

### Merge Results
出力を単一のレポートに統合
```

## 引数

$ARGUMENTS:
- `feature <description>` - 完全な機能ワークフロー
- `bugfix <description>` - バグ修正ワークフロー
- `refactor <description>` - リファクタリングワークフロー
- `security <description>` - セキュリティレビューワークフロー
- `custom <agents> <description>` - カスタム agent シーケンス

## カスタムワークフローの例

```
/orchestrate custom "architect,tdd-guide,code-reviewer" "Redesign caching layer"
```

## ヒント

1. **複雑な機能は planner から開始** する
2. **マージ前には必ず code-reviewer を含める**
3. **認証/決済/個人情報には security-reviewer を使用**
4. **引き継ぎは簡潔に** - 次の agent に必要な情報に焦点を当てる
5. **必要に応じて agent 間で検証を実行**
