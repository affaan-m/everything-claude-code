---
name: continuous-learning-v2
description: hookを通じてセッションを観察し、信頼度スコアリング付きのアトミックなinstinctを作成し、それらをskill/command/agentに進化させるinstinctベースの学習システム。
version: 2.0.0
---

# Continuous Learning v2 - instinctベースアーキテクチャ

アトミックな「instinct」（信頼度スコアリング付きの小さな学習された行動）を通じて、Claude Codeセッションを再利用可能な知識に変換する高度な学習システム。

## v2の新機能

| 機能 | v1 | v2 |
|---------|----|----|
| 観察 | Stop hook（セッション終了時） | PreToolUse/PostToolUse（100%信頼性） |
| 分析 | メインcontext | バックグラウンドagent（Haiku） |
| 粒度 | 完全なskill | アトミックな「instinct」 |
| 信頼度 | なし | 0.3-0.9の重み付け |
| 進化 | 直接skillへ | instinct → クラスター → skill/command/agent |
| 共有 | なし | instinctのエクスポート/インポート |

## instinctモデル

instinctは小さな学習された行動です：

```yaml
---
id: prefer-functional-style
trigger: "when writing new functions"
confidence: 0.7
domain: "code-style"
source: "session-observation"
---

# Prefer Functional Style

## Action
適切な場合、クラスより関数型パターンを使用する。

## Evidence
- 関数型パターン選好の5インスタンスを観察
- 2025-01-15にユーザーがクラスベースアプローチを関数型に修正
```

**プロパティ：**
- **アトミック** — 1つのトリガー、1つのアクション
- **信頼度で重み付け** — 0.3 = 暫定的、0.9 = ほぼ確実
- **ドメインタグ付き** — code-style、testing、git、debugging、workflow など
- **エビデンスに基づく** — 何の観察がそれを作成したかを追跡

## 動作の仕組み

```
セッションアクティビティ
      │
      │ hookがプロンプト + ツール使用をキャプチャ（100%信頼性）
      ▼
┌─────────────────────────────────────────┐
│         observations.jsonl              │
│   （プロンプト、ツール呼び出し、結果）    │
└─────────────────────────────────────────┘
      │
      │ Observer agentが読み取り（バックグラウンド、Haiku）
      ▼
┌─────────────────────────────────────────┐
│          パターン検出                    │
│   • ユーザーの修正 → instinct            │
│   • エラー解決 → instinct                │
│   • 繰り返しのワークフロー → instinct     │
└─────────────────────────────────────────┘
      │
      │ 作成/更新
      ▼
┌─────────────────────────────────────────┐
│         instincts/personal/             │
│   • prefer-functional.md (0.7)          │
│   • always-test-first.md (0.9)          │
│   • use-zod-validation.md (0.6)         │
└─────────────────────────────────────────┘
      │
      │ /evolve がクラスタリング
      ▼
┌─────────────────────────────────────────┐
│              evolved/                   │
│   • commands/new-feature.md             │
│   • skills/testing-workflow.md          │
│   • agents/refactor-specialist.md       │
└─────────────────────────────────────────┘
```

## クイックスタート

### 1. 観察hookの有効化

`~/.claude/settings.json`に追加：

```json
{
  "hooks": {
    "PreToolUse": [{
      "matcher": "*",
      "hooks": [{
        "type": "command",
        "command": "~/.claude/skills/continuous-learning-v2/hooks/observe.sh pre"
      }]
    }],
    "PostToolUse": [{
      "matcher": "*",
      "hooks": [{
        "type": "command",
        "command": "~/.claude/skills/continuous-learning-v2/hooks/observe.sh post"
      }]
    }]
  }
}
```

### 2. ディレクトリ構造の初期化

```bash
mkdir -p ~/.claude/homunculus/{instincts/{personal,inherited},evolved/{agents,skills,commands}}
touch ~/.claude/homunculus/observations.jsonl
```

### 3. Observer Agentの実行（オプション）

オブザーバーはバックグラウンドで観察を分析できます：

```bash
# バックグラウンドオブザーバーを開始
~/.claude/skills/continuous-learning-v2/agents/start-observer.sh
```

## コマンド

| コマンド | 説明 |
|---------|-------------|
| `/instinct-status` | 信頼度とともにすべての学習済みinstinctを表示 |
| `/evolve` | 関連するinstinctをskill/commandにクラスタリング |
| `/instinct-export` | 共有用にinstinctをエクスポート |
| `/instinct-import <file>` | 他の人からinstinctをインポート |

## 設定

`config.json`を編集：

```json
{
  "version": "2.0",
  "observation": {
    "enabled": true,
    "store_path": "~/.claude/homunculus/observations.jsonl",
    "max_file_size_mb": 10,
    "archive_after_days": 7
  },
  "instincts": {
    "personal_path": "~/.claude/homunculus/instincts/personal/",
    "inherited_path": "~/.claude/homunculus/instincts/inherited/",
    "min_confidence": 0.3,
    "auto_approve_threshold": 0.7,
    "confidence_decay_rate": 0.05
  },
  "observer": {
    "enabled": true,
    "model": "haiku",
    "run_interval_minutes": 5,
    "patterns_to_detect": [
      "user_corrections",
      "error_resolutions",
      "repeated_workflows",
      "tool_preferences"
    ]
  },
  "evolution": {
    "cluster_threshold": 3,
    "evolved_path": "~/.claude/homunculus/evolved/"
  }
}
```

## ファイル構造

```
~/.claude/homunculus/
├── identity.json           # あなたのプロファイル、技術レベル
├── observations.jsonl      # 現在のセッション観察
├── observations.archive/   # 処理済み観察
├── instincts/
│   ├── personal/           # 自動学習されたinstinct
│   └── inherited/          # 他から インポートされたもの
└── evolved/
    ├── agents/             # 生成されたスペシャリストagent
    ├── skills/             # 生成されたskill
    └── commands/           # 生成されたcommand
```

## Skill Creatorとの統合

[Skill Creator GitHub App](https://skill-creator.app)を使用すると、**両方**が生成されます：
- 従来のSKILL.mdファイル（後方互換性のため）
- instinctコレクション（v2学習システム用）

リポジトリ分析からのinstinctは`source: "repo-analysis"`を持ち、ソースリポジトリURLを含みます。

## 信頼度スコアリング

信頼度は時間とともに進化します：

| スコア | 意味 | 動作 |
|-------|---------|----------|
| 0.3 | 暫定的 | 提案されるが強制されない |
| 0.5 | 中程度 | 関連する場合に適用 |
| 0.7 | 強い | 適用の自動承認 |
| 0.9 | ほぼ確実 | コア動作 |

**信頼度が上がる**場合：
- パターンが繰り返し観察される
- ユーザーが提案された動作を修正しない
- 他のソースからの類似instinctが一致する

**信頼度が下がる**場合：
- ユーザーが明示的に動作を修正する
- パターンが長期間観察されない
- 矛盾するエビデンスが現れる

## 観察にhookを使う理由 vs skill

> 「v1は観察にskillを使用していました。skillは確率的で、Claudeの判断に基づいて約50-80%の確率で発火します。」

hookは**100%の確率**で決定論的に発火します。これは：
- すべてのツール呼び出しが観察される
- パターンが見逃されない
- 学習が包括的になる

## 後方互換性

v2はv1と完全に互換性があります：
- 既存の`~/.claude/skills/learned/` skillは引き続き機能
- Stop hookは引き続き実行（ただし現在はv2にもフィード）
- 段階的な移行パス：両方を並行して実行

## プライバシー

- 観察はあなたのマシンに**ローカル**に保存
- **instinct**（パターン）のみがエクスポート可能
- 実際のコードや会話内容は共有されない
- 何がエクスポートされるかはあなたがコントロール

## 関連

- [Skill Creator](https://skill-creator.app) - リポジトリ履歴からinstinctを生成
- [Homunculus](https://github.com/humanplane/homunculus) - v2アーキテクチャのインスピレーション
- [The Longform Guide](https://x.com/affaanmustafa/status/2014040193557471352) - continuous learningセクション

---

*instinctベースの学習：一度の観察からClaudeにあなたのパターンを教える。*
