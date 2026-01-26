---
name: instinct-status
description: 学習した全ての instinct を confidence レベルと共に表示します
command: /instinct-status
implementation: python3 ~/.claude/skills/continuous-learning-v2/scripts/instinct-cli.py status
---

# Instinct Status Command

全ての学習した instinct を confidence スコアと共にドメイン別にグループ化して表示します。

## 実装

```bash
python3 ~/.claude/skills/continuous-learning-v2/scripts/instinct-cli.py status
```

## 使用方法

```
/instinct-status
/instinct-status --domain code-style
/instinct-status --low-confidence
```

## 実行内容

1. `~/.claude/homunculus/instincts/personal/` から全ての instinct ファイルを読み込み
2. `~/.claude/homunculus/instincts/inherited/` から継承された instinct を読み込み
3. ドメイン別にグループ化し confidence バーと共に表示

## 出力フォーマット

```
Instinct ステータス
==================

## Code Style（4 instinct）

### prefer-functional-style
トリガー: 新しい関数を書くとき
アクション: クラスよりも関数型パターンを使用
Confidence: ████████░░ 80%
ソース: session-observation | 最終更新: 2025-01-22

### use-path-aliases
トリガー: モジュールをインポートするとき
アクション: 相対インポートの代わりに @/ パスエイリアスを使用
Confidence: ██████░░░░ 60%
ソース: repo-analysis (github.com/acme/webapp)

## Testing（2 instinct）

### test-first-workflow
トリガー: 新しい機能を追加するとき
アクション: 実装より先にテストを書く
Confidence: █████████░ 90%
ソース: session-observation

## Workflow（3 instinct）

### grep-before-edit
トリガー: コードを修正するとき
アクション: Grep で検索、Read で確認、その後 Edit
Confidence: ███████░░░ 70%
ソース: session-observation

---
合計: 9 instinct（4 パーソナル、5 継承）
Observer: 実行中（最終分析: 5分前）
```

## フラグ

- `--domain <name>`: ドメインでフィルター（code-style、testing、git など）
- `--low-confidence`: confidence が0.5未満の instinct のみ表示
- `--high-confidence`: confidence が0.7以上の instinct のみ表示
- `--source <type>`: ソースでフィルター（session-observation、repo-analysis、inherited）
- `--json`: プログラムで使用するためにJSONで出力
