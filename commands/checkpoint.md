# Checkpoint Command

ワークフロー内でチェックポイントを作成または検証します。

## 使用方法

`/checkpoint [create|verify|list] [name]`

## チェックポイントの作成

チェックポイントを作成する際:

1. `/verify quick` を実行して現在の状態がクリーンであることを確認
2. チェックポイント名で git stash または commit を作成
3. チェックポイントを `.claude/checkpoints.log` に記録:

```bash
echo "$(date +%Y-%m-%d-%H:%M) | $CHECKPOINT_NAME | $(git rev-parse --short HEAD)" >> .claude/checkpoints.log
```

4. チェックポイント作成完了を報告

## チェックポイントの検証

チェックポイントに対して検証する際:

1. ログからチェックポイントを読み取り
2. 現在の状態をチェックポイントと比較:
   - チェックポイント以降に追加されたファイル
   - チェックポイント以降に変更されたファイル
   - 現在と当時のテスト合格率
   - 現在と当時のカバレッジ

3. 報告:
```
CHECKPOINT COMPARISON: $NAME
============================
Files changed: X
Tests: +Y passed / -Z failed
Coverage: +X% / -Y%
Build: [PASS/FAIL]
```

## チェックポイントの一覧表示

以下の情報を含むすべてのチェックポイントを表示:
- 名前
- タイムスタンプ
- Git SHA
- ステータス (current, behind, ahead)

## ワークフロー

典型的なチェックポイントのフロー:

```
[Start] --> /checkpoint create "feature-start"
   |
[Implement] --> /checkpoint create "core-done"
   |
[Test] --> /checkpoint verify "core-done"
   |
[Refactor] --> /checkpoint create "refactor-done"
   |
[PR] --> /checkpoint verify "feature-start"
```

## 引数

$ARGUMENTS:
- `create <name>` - 名前付きチェックポイントを作成
- `verify <name>` - 名前付きチェックポイントに対して検証
- `list` - すべてのチェックポイントを表示
- `clear` - 古いチェックポイントを削除（最新5件は保持）
