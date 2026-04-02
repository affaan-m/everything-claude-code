# ECC 詳細ガイド

読むべき人: ECC をこれから入れる人、`full` を避けて必要なものだけ使いたい人  
読むタイミング: 初回導入前、既存 README だけでは全体像が掴みにくいとき  
3行要約:
- ECC は「Claude Code / Codex などの AI コーディング環境を強化するハーネス一式」で、単体アプリではない。
- 中核は `skills`、補助面は `agents` `rules` `commands` `hooks` `MCP`。
- 最初は全部入れず、最小構成から始める方がコンテキスト効率と運用負荷の両方で有利。

## まず読む順番

1. このファイル
2. [ECC 参照インデックス](./ECC-REFERENCE-INDEX.md)
3. [ECC コマンドリファレンス](./ECC-COMMANDS-REFERENCE.md)
4. [ECC スキルカタログ](./ECC-SKILLS-CATALOG.md)
5. [ECC 付録](./ECC-APPENDIX.md)

## ECC は何か

ECC は、AI エージェントに対して次の面をまとめて提供するリポジトリです。

- `skills`: 実務ワークフローや専門知識を与える Markdown ベースの再利用単位
- `agents`: 計画、レビュー、ビルド修正、セキュリティ確認などを役割分担する専門エージェント
- `commands`: 既存の slash-command 文化に合わせた入口。現在は `skills` が正規のワークフロー面
- `rules`: 常に守らせたい原則、言語別ガイドライン、品質ルール
- `hooks`: セッション開始、編集後、Bash 実行前後などに走る自動補助
- `MCP`: GitHub、Context7、Exa、Playwright など外部能力の接続
- `platform-configs`: Claude / Codex / Cursor / OpenCode などハーネスごとの設定

## 何ができるか

ECC が強いのは「コードを書く」ことそのものより、AI コーディングの運用を安定させることです。

- 新機能や大きい修正を始める前に、計画を明文化できる
- TDD と検証ループを標準化できる
- 言語別・領域別のレビュー基準を再利用できる
- build error resolver 系 agent で壊れたビルドを最小差分で直せる
- Context7 / Exa / GitHub を使った調査をルーチン化できる
- 継続学習、セッション再開、コンテキスト節約の仕組みを持ち込める
- multi-agent orchestration や loops まで段階的に広げられる

## Codex と Claude Code の違い

ECC の思想は共通ですが、入口が違います。

- Claude Code
  - `commands/` の slash command を直接使いやすい
  - hooks や `settings.json` を使った自動化が中心
  - plugin と rules の組み合わせで機能を足す
- Codex
  - `AGENTS.md`、plugin、skills、MCP を中心に使う
  - slash command 面はそのままでは主戦場ではない
  - Claude 的な command は「対応する skill / agent / 運用パターン」に読み替える

実務上の理解としては次の通りです。

- Claude では `commands` が入口、`skills` が本体
- Codex では最初から `skills` と `agents` を読む

## 低コンテキスト圧迫の考え方

ECC は強力ですが、全部を有効にすると読み物としても運用としても重くなります。  
このガイド群は次の設計で圧迫を抑えます。

- 1 本の巨大 README にしない
- 概要と索引を先に読むだけで判断できるようにする
- 全件一覧は別ファイルへ逃がす
- `full` を前提にせず、`今入れるもの` と `後で足すもの` を分ける
- Codex / Claude の差分は各章の末尾に短く書く

## 最小構成

このガイドの前提として採用している最小構成は次の通りです。

- `rules/common`
- `rules/typescript`
- `rules/python`
- 汎用 skill 群
  - TDD
  - コードレビュー
  - セキュリティレビュー
  - 調査 / docs lookup
- 既定 6 MCP
  - `github`
  - `context7`
  - `exa`
  - `memory`
  - `playwright`
  - `sequential-thinking`

この構成の狙いは、「毎日使うものだけ最初に入れる」ことです。

## 何を入れて、何を後回しにするか

### 最初に入れる

- `rules/common`
- 使う言語の rules
- `tdd-workflow`、`verification-loop`、`security-review`
- docs / research 系の skill
- GitHub / Context7 / Exa のような日常調査系 MCP

### 初期導入で様子を見る

- `memory`
- `playwright`
- `sequential-thinking`
- 学習系 skill
- orchestration 系 skill

### すぐには入れない

- 使わない言語の rules
- 業種特化 skill 群
- hooks の全面有効化
- `multi-*` コマンドの前提になる追加ランタイム
- `full` プロファイル

## 最小導入手順

### 1. リポジトリを取得する

```bash
git clone https://github.com/affaan-m/everything-claude-code.git
cd everything-claude-code
```

### 2. 依存を入れる

Windows PowerShell では `npm.ps1` が Execution Policy に引っかかることがあるため、`cmd /c` を使うと安全です。

```powershell
cmd /c npm install
```

macOS / Linux:

```bash
npm install
```

### 3. 最小ルールだけ入れる

Windows:

```powershell
powershell -ExecutionPolicy Bypass -File .\install.ps1 typescript python
```

macOS / Linux:

```bash
./install.sh typescript python
```

### 4. Claude Code の場合

- plugin を追加する
- `rules` は手動または installer で入れる
- 必要なら `hooks/hooks.json` を `settings.json` に移植する
- MCP は `.mcp.json` または `settings.json` に反映する

### 5. Codex の場合

- `AGENTS.md`
- `.codex-plugin/plugin.json`
- `.mcp.json`
- `skills/`

この 4 面を基準に使う。Codex では `skills` と `agents` が主面です。

## 日常ワークフロー

### 新機能を作る

1. まず計画する
2. TDD で書く
3. レビューする
4. 必要なら build-fix / verify を回す
5. ドキュメントと codemap を更新する

Claude Code なら:

```text
/plan
/tdd
/code-review
/verify
```

Codex なら:

- `planner` agent
- `tdd-workflow` skill
- `code-reviewer` / 言語別 reviewer
- `verification-loop` skill

### 壊れたビルドを直す

- 言語が分からないなら `/build-fix`
- 分かっているなら言語別 build command / build resolver agent
- 直した後は `verify` 系で閉じる

### 調査から始める

- ライブラリの API を知りたいなら `documentation-lookup`
- Web を広く見たいなら `exa-search` または Exa MCP
- GitHub 上の PR / issue / repo を見たいなら GitHub MCP
- 大きい調査は `search-first` や `deep-research`

### セッションを切り上げる

- `save-session`
- `learn-eval`
- `sessions`
- `resume-session`

## full を急がない理由

`full` が悪いのではなく、次の 3 点で初期コストが高いからです。

- 読む量が増える
- AI が参照しうる面が増え、ワークフローが散る
- hooks / automation / specialized skills まで一度に抱えると運用の失敗原因が切り分けづらい

まずは最小構成で、

- 毎週使う skill は何か
- 実際に不足した review / docs / test 支援は何か
- どの MCP が本当に必要か

を確認してから足す方が安定します。

## どのファイルを見ればよいか

- 導入と全体像: [ECC 参照インデックス](./ECC-REFERENCE-INDEX.md)
- slash command 全件: [ECC コマンドリファレンス](./ECC-COMMANDS-REFERENCE.md)
- skill 全件: [ECC スキルカタログ](./ECC-SKILLS-CATALOG.md)
- agents / MCP / rules / hooks / profiles: [ECC 付録](./ECC-APPENDIX.md)

## 既存ファイルとの関係

このガイドは次を再整理したものです。

- `README.md`
- `COMMANDS-QUICK-REF.md`
- `AGENTS.md`
- `RULES.md`
- `TROUBLESHOOTING.md`
- `commands/`
- `skills/`
- `agents/`
- `.mcp.json`
- `manifests/*`

既存 README はリポジトリの入口、こちらは「実際に使い始めるための運用ガイド」と捉えるとズレにくいです。
