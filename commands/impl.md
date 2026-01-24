---
description: Execute cc-sdd task with TDD, code review, and verification. Smart implementation workflow using subagents.
---

# Implementation Command

cc-sddで分解されたタスクを、TDD・コードレビュー・検証を組み合わせてスマートに実装するコマンド。

## Usage

```
/impl [task-file-or-description]
```

**Examples:**
```bash
# cc-sddタスクファイルを指定
/impl .kiro/specs/auth-feature/tasks/task-001.md

# タスク名で指定（.kiro/specs/内を自動検索）
/impl task-001

# 直接タスク説明を指定
/impl "JWTトークン検証ミドルウェアを実装"
```

## Workflow

```
┌─────────────────────────────────────────────────────────────┐
│                    /impl workflow                           │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  1. TASK ANALYSIS                                           │
│     └─> タスク内容を読み込み、実装計画を簡潔に提示          │
│                                                             │
│  2. TDD IMPLEMENTATION (tdd-guide agent)                    │
│     ├─> インターフェース定義                                │
│     ├─> 失敗するテスト作成 (RED)                            │
│     ├─> 最小実装 (GREEN)                                    │
│     └─> リファクタリング (REFACTOR)                         │
│                                                             │
│  3. CODE REVIEW (code-reviewer agent)                       │
│     ├─> 品質チェック                                        │
│     ├─> セキュリティチェック                                │
│     └─> 改善提案 → 必要なら修正                             │
│                                                             │
│  4. SECURITY REVIEW (条件付き: security-reviewer agent)     │
│     └─> 認証/認可/決済/PII関連の場合のみ実行                │
│                                                             │
│  5. VERIFICATION (/verify)                                  │
│     ├─> ビルド確認                                          │
│     ├─> 型チェック                                          │
│     ├─> テスト実行                                          │
│     └─> カバレッジ確認 (80%+)                               │
│                                                             │
│  6. COMPLETION REPORT                                       │
│     └─> 実装サマリー、変更ファイル一覧、次のタスク提案      │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

## Execution Steps

### Step 1: Task Analysis

タスクファイルまたは説明を読み込み、以下を提示：

```markdown
## Task Analysis

**Task:** [タスク名]
**Goal:** [達成すべきこと]
**Files to create/modify:** [推定ファイル一覧]
**Dependencies:** [依存するタスク/コンポーネント]
**Estimated complexity:** [LOW/MEDIUM/HIGH]

Proceed with implementation? (y/n)
```

### Step 2: TDD Implementation

**tdd-guide**エージェントを起動：

```markdown
Invoke tdd-guide agent with:
- Task description from Step 1
- Target files identified
- Test coverage requirement: 80%+

Agent will:
1. Define interfaces/types first
2. Write failing tests
3. Implement minimal code to pass
4. Refactor for quality
```

### Step 3: Code Review

**code-reviewer**エージェントを起動：

```markdown
Invoke code-reviewer agent with:
- All files modified in Step 2
- Focus areas: security, performance, maintainability

If issues found:
- CRITICAL/HIGH: Fix immediately, re-run review
- MEDIUM/LOW: Note for future, continue
```

### Step 4: Security Review (Conditional)

以下のキーワードがタスクに含まれる場合、**security-reviewer**エージェントを起動：

- auth, authentication, authorization
- password, credential, secret, token
- payment, billing, stripe
- user data, PII, personal information
- admin, permission, role

```markdown
Invoke security-reviewer agent with:
- All modified files
- OWASP Top 10 checklist
- Project-specific security rules

Block completion if CRITICAL issues found.
```

### Step 5: Verification

`/verify pre-commit`相当のチェックを実行：

```bash
# Build check
npm run build

# Type check
npx tsc --noEmit

# Lint check
npm run lint

# Test with coverage
npm run test -- --coverage

# Check for console.log
grep -rn "console.log" --include="*.ts" --include="*.tsx" src/
```

### Step 6: Completion Report

```markdown
## Implementation Complete

### Summary
- **Task:** [タスク名]
- **Status:** ✅ COMPLETE / ⚠️ NEEDS ATTENTION
- **Tests:** X passed, Y% coverage

### Files Changed
- `src/lib/auth.ts` (created)
- `src/lib/auth.test.ts` (created)
- `src/middleware/jwt.ts` (modified)

### Review Results
- Code Review: PASSED
- Security Review: PASSED (or N/A)
- Verification: PASSED

### Next Steps
- [ ] Next task: task-002 (depends on this)
- [ ] Consider: [改善提案があれば]

Ready for commit? (y/n)
```

## Options

```
/impl [task] --skip-review     # コードレビューをスキップ（非推奨）
/impl [task] --skip-security   # セキュリティレビューをスキップ
/impl [task] --auto            # 確認なしで進行（CI用）
/impl [task] --loop            # Ralph loop統合（完成まで自動リトライ）
```

## Integration with cc-sdd

cc-sddでタスク分解後、このコマンドで実装：

```bash
# 1. cc-sddでタスク分解（既存）
/kiro:spec-tasks auth-feature

# 2. 生成されたタスクを順番に実装
/impl .kiro/specs/auth-feature/tasks/task-001.md
/impl .kiro/specs/auth-feature/tasks/task-002.md
/impl .kiro/specs/auth-feature/tasks/task-003.md

# または、タスク名で
/impl task-001
```

## Integration with Ralph Loop

長いタスクや不安定な実装には、Ralph loopと組み合わせ：

```bash
/ralph-loop "/impl task-001 --auto" --max-iterations 10 --completion-promise "IMPL-COMPLETE"
```

## Error Handling

| エラー | 対応 |
|--------|------|
| テスト失敗 | tdd-guideエージェントが自動修正を試行 |
| ビルドエラー | build-error-resolverエージェントを起動 |
| セキュリティ問題 | 修正必須、ブロック |
| カバレッジ不足 | 追加テスト生成 |

## Notes

- このコマンドは `/plan` の代わりではない（計画はcc-sddで）
- 実装フェーズに特化したオーケストレーション
- 各ステップで人間の確認を挟む（--auto以外）
