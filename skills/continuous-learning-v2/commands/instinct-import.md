---
name: instinct-import
description: チームメイト、Skill Creator、またはその他のソースから instinct をインポートします
command: /instinct-import
implementation: python3 ~/.claude/skills/continuous-learning-v2/scripts/instinct-cli.py import <file>
---

# Instinct Import Command

## 実装

```bash
python3 ~/.claude/skills/continuous-learning-v2/scripts/instinct-cli.py import <file-or-url> [--dry-run] [--force] [--min-confidence 0.7]
```

以下からの instinct をインポート：
- チームメイトのエクスポート
- Skill Creator（リポジトリ分析）
- コミュニティコレクション
- 以前のマシンのバックアップ

## 使用方法

```
/instinct-import team-instincts.yaml
/instinct-import https://github.com/org/repo/instincts.yaml
/instinct-import --from-skill-creator acme/webapp
```

## 実行内容

1. instinct ファイルを取得（ローカルパスまたはURL）
2. フォーマットを解析して検証
3. 既存の instinct との重複をチェック
4. 新しい instinct をマージまたは追加
5. `~/.claude/homunculus/instincts/inherited/` に保存

## インポートプロセス

```
instinct をインポート中: team-instincts.yaml
================================================

12個の instinct が見つかりました。

競合を分析中...

## 新しい Instinct（8個）
以下が追加されます:
  ✓ use-zod-validation (confidence: 0.7)
  ✓ prefer-named-exports (confidence: 0.65)
  ✓ test-async-functions (confidence: 0.8)
  ...

## 重複する Instinct（3個）
類似の instinct が既に存在:
  ⚠️ prefer-functional-style
     ローカル: 0.8 confidence、12 観測
     インポート: 0.7 confidence
     → ローカルを維持（confidence が高い）

  ⚠️ test-first-workflow
     ローカル: 0.75 confidence
     インポート: 0.9 confidence
     → インポートに更新（confidence が高い）

## 競合する Instinct（1個）
ローカルの instinct と矛盾:
  ❌ use-classes-for-services
     競合: avoid-classes
     → スキップ（手動での解決が必要）

---
8個を新規追加、1個を更新、3個をスキップしますか？
```

## マージ戦略

### 重複の場合
既存と一致する instinct をインポートする場合：
- **高い confidence が優先**: confidence が高い方を維持
- **エビデンスをマージ**: 観測回数を合算
- **タイムスタンプを更新**: 最近検証されたとマーク

### 競合の場合
既存と矛盾する instinct をインポートする場合：
- **デフォルトでスキップ**: 競合する instinct はインポートしない
- **レビュー用にフラグ**: 両方に注意が必要とマーク
- **手動解決**: ユーザーがどちらを維持するか決定

## ソース追跡

インポートされた instinct には以下がマークされます：
```yaml
source: "inherited"
imported_from: "team-instincts.yaml"
imported_at: "2025-01-22T10:30:00Z"
original_source: "session-observation"  # または "repo-analysis"
```

## Skill Creator 統合

Skill Creator からインポートする場合：

```
/instinct-import --from-skill-creator acme/webapp
```

リポジトリ分析から生成された instinct を取得：
- ソース: `repo-analysis`
- 初期 confidence が高い（0.7以上）
- ソースリポジトリにリンク

## フラグ

- `--dry-run`: インポートせずにプレビュー
- `--force`: 競合があってもインポート
- `--merge-strategy <higher|local|import>`: 重複の処理方法
- `--from-skill-creator <owner/repo>`: Skill Creator 分析からインポート
- `--min-confidence <n>`: 閾値以上の instinct のみインポート

## 出力

インポート後：
```
✅ インポート完了！

追加: 8 instinct
更新: 1 instinct
スキップ: 3 instinct（2 重複、1 競合）

新しい instinct の保存先: ~/.claude/homunculus/instincts/inherited/

/instinct-status を実行して全ての instinct を確認できます。
```
