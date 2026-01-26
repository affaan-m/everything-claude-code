---
name: continuous-learning
description: Claude Codeセッションから再利用可能なパターンを自動的に抽出し、将来の使用のために学習済みskillとして保存します。
---

# Continuous Learning Skill

セッション終了時にClaude Codeセッションを自動的に評価し、学習済みskillとして保存できる再利用可能なパターンを抽出します。

## 動作の仕組み

このskillは各セッションの終了時に**Stop hook**として実行されます：

1. **セッション評価**：セッションに十分なメッセージがあるか確認（デフォルト：10以上）
2. **パターン検出**：セッションから抽出可能なパターンを特定
3. **Skill抽出**：有用なパターンを`~/.claude/skills/learned/`に保存

## 設定

`config.json`を編集してカスタマイズ：

```json
{
  "min_session_length": 10,
  "extraction_threshold": "medium",
  "auto_approve": false,
  "learned_skills_path": "~/.claude/skills/learned/",
  "patterns_to_detect": [
    "error_resolution",
    "user_corrections",
    "workarounds",
    "debugging_techniques",
    "project_specific"
  ],
  "ignore_patterns": [
    "simple_typos",
    "one_time_fixes",
    "external_api_issues"
  ]
}
```

## パターンタイプ

| パターン | 説明 |
|---------|-------------|
| `error_resolution` | 特定のエラーがどのように解決されたか |
| `user_corrections` | ユーザーの修正からのパターン |
| `workarounds` | フレームワーク/ライブラリの癖に対する解決策 |
| `debugging_techniques` | 効果的なデバッグアプローチ |
| `project_specific` | プロジェクト固有の規約 |

## hookのセットアップ

`~/.claude/settings.json`に追加：

```json
{
  "hooks": {
    "Stop": [{
      "matcher": "*",
      "hooks": [{
        "type": "command",
        "command": "~/.claude/skills/continuous-learning/evaluate-session.sh"
      }]
    }]
  }
}
```

## なぜStop hookか？

- **軽量**：セッション終了時に一度だけ実行
- **ノンブロッキング**：すべてのメッセージにレイテンシを追加しない
- **完全なcontext**：完全なセッショントランスクリプトにアクセス可能

## 関連

- [The Longform Guide](https://x.com/affaanmustafa/status/2014040193557471352) - continuous learningのセクション
- `/learn` command - セッション中の手動パターン抽出

---

## 比較ノート（調査：2025年1月）

### vs Homunculus (github.com/humanplane/homunculus)

Homunculus v2はより洗練されたアプローチを取っています：

| 機能 | 私たちのアプローチ | Homunculus v2 |
|---------|--------------|---------------|
| 観察 | Stop hook（セッション終了時） | PreToolUse/PostToolUse hook（100%信頼性） |
| 分析 | メインcontext | バックグラウンドagent（Haiku） |
| 粒度 | 完全なskill | アトミックな「instinct」 |
| 信頼度 | なし | 0.3-0.9の重み付け |
| 進化 | 直接skillへ | instinct → クラスター → skill/command/agent |
| 共有 | なし | instinctのエクスポート/インポート |

**homunculusからの重要な洞察：**
> 「v1は観察にskillを使用していました。skillは確率的で、約50-80%の確率で発火します。v2は観察にhook（100%信頼性）を使用し、学習された行動のアトミック単位としてinstinctを使用します。」

### 潜在的なv2の改善点

1. **instinctベースの学習** - 信頼度スコアリング付きの小さくアトミックな行動
2. **バックグラウンドオブザーバー** - 並行して分析するHaiku agent
3. **信頼度の減衰** - 矛盾があるとinstinctは信頼度を失う
4. **ドメインタグ付け** - code-style、testing、git、debugging など
5. **進化パス** - 関連するinstinctをskill/commandにクラスタリング

詳細は：`/Users/affoon/Documents/tasks/12-continuous-learning-v2.md`の完全な仕様を参照。
