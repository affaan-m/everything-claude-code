# Verification Loop Skill

Claude Code セッション用の包括的な検証システムです。

## 使用するタイミング

以下の場合にこの skill を呼び出します：
- 機能や重要なコード変更の完了後
- PR 作成前
- 品質ゲートの通過を確認したいとき
- リファクタリング後

## 検証フェーズ

### フェーズ1: ビルド検証
```bash
# プロジェクトがビルドできるか確認
npm run build 2>&1 | tail -20
# または
pnpm build 2>&1 | tail -20
```

ビルドが失敗した場合、続行する前に停止して修正してください。

### フェーズ2: 型チェック
```bash
# TypeScriptプロジェクト
npx tsc --noEmit 2>&1 | head -30

# Pythonプロジェクト
pyright . 2>&1 | head -30
```

全ての型エラーを報告。続行する前に重大なものを修正。

### フェーズ3: Lintチェック
```bash
# JavaScript/TypeScript
npm run lint 2>&1 | head -30

# Python
ruff check . 2>&1 | head -30
```

### フェーズ4: テストスイート
```bash
# カバレッジ付きでテストを実行
npm run test -- --coverage 2>&1 | tail -50

# カバレッジ閾値をチェック
# 目標: 最低80%
```

報告内容：
- 総テスト数: X
- 成功: X
- 失敗: X
- カバレッジ: X%

### フェーズ5: セキュリティスキャン
```bash
# シークレットをチェック
grep -rn "sk-" --include="*.ts" --include="*.js" . 2>/dev/null | head -10
grep -rn "api_key" --include="*.ts" --include="*.js" . 2>/dev/null | head -10

# console.logをチェック
grep -rn "console.log" --include="*.ts" --include="*.tsx" src/ 2>/dev/null | head -10
```

### フェーズ6: 差分レビュー
```bash
# 変更内容を表示
git diff --stat
git diff HEAD~1 --name-only
```

各変更ファイルを以下の観点でレビュー：
- 意図しない変更
- 欠落しているエラーハンドリング
- 潜在的なエッジケース

## 出力フォーマット

全てのフェーズ実行後、検証レポートを生成：

```
検証レポート
==================

ビルド:     [PASS/FAIL]
型:         [PASS/FAIL] (X エラー)
Lint:       [PASS/FAIL] (X 警告)
テスト:     [PASS/FAIL] (X/Y 成功, Z% カバレッジ)
セキュリティ: [PASS/FAIL] (X 問題)
差分:       [X ファイル変更]

総合:       PR [準備完了/未準備]

修正が必要な問題:
1. ...
2. ...
```

## 継続モード

長いセッションでは、15分ごとまたは大きな変更後に検証を実行：

```markdown
メンタルチェックポイントを設定:
- 各関数の完了後
- コンポーネントの完了後
- 次のタスクに移る前

実行: /verify
```

## Hook との統合

この skill は PostToolUse hook を補完しますが、より深い検証を提供します。
hook は問題を即座に捕捉します。この skill は包括的なレビューを提供します。
