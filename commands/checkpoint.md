---
description: ワークフローでチェックポイントを作成または検証する
---

# チェックポイントコマンド

ワークフローでチェックポイントを作成または検証します。

## 使用方法

`/checkpoint [create|verify|list] [name]`

## チェックポイントの作成

チェックポイントを作成する際:

1. `/verify quick`を実行して現在の状態がクリーンであることを確認
2. チェックポイント名でgit stashまたはコミットを作成
3. チェックポイントを`.claude/checkpoints.log`に記録:

```bash
echo "$(date +%Y-%m-%d-%H:%M) | $CHECKPOINT_NAME | $(git rev-parse --short HEAD)" >> .claude/checkpoints.log
```

4. チェックポイント作成を報告

## チェックポイントの検証

チェックポイントに対して検証する際:

1. ログからチェックポイントを読み取り
2. 現在の状態をチェックポイントと比較:
   - チェックポイント以降に追加されたファイル
   - チェックポイント以降に変更されたファイル
   - 現在とその時のテストパス率
   - 現在とその時のカバレッジ
3. レポート:

```
チェックポイント比較: $NAME
============================
変更されたファイル: X
テスト: +Y パス / -Z 失敗
カバレッジ: +X% / -Y%
ビルド: [パス/失敗]
```

## チェックポイント一覧

すべてのチェックポイントを以下の情報とともに表示:

- 名前
- タイムスタンプ
- Git SHA
- ステータス（current、behind、ahead）

## ワークフロー

典型的なチェックポイントフロー:

```
[開始] --> /checkpoint create "feature-start"
        |
[実装] --> /checkpoint create "core-done"
        |
[テスト] --> /checkpoint verify "core-done"
        |
[リファクタリング] --> /checkpoint create "refactor-done"
        |
[PR] --> /checkpoint verify "feature-start"
```

## 引数

$ARGUMENTS:

- `create <n>` - 名前付きチェックポイントを作成
- `verify <n>` - 名前付きチェックポイントに対して検証
- `list` - すべてのチェックポイントを表示
- `clear` - 古いチェックポイントを削除（最新5件を保持）
