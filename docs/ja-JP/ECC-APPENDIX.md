# ECC 付録

読むべき人: agents / MCP / rules / hooks / install profile の位置づけを知りたい人  
読むタイミング: 最小構成を決めるとき、拡張を足す前  
3行要約:
- ECC の補助面は `agents` `MCP` `rules` `hooks` `profiles` で構成される。
- 最初は全部有効にせず、運用コストの低いものから入れるのがよい。
- 本付録は「何を足すと何が増えるか」を判断するための資料。

## Agents 一覧

36 agent のうち、初期運用でよく触るものを先頭に置いています。

| Agent | 役割 | 使う場面 |
|---|---|---|
| `planner` | 実装計画作成 | 新機能、複雑な修正 |
| `architect` | 設計判断と拡張性検討 | 大きい構造変更 |
| `tdd-guide` | テスト先行の実装支援 | 機能追加、バグ修正 |
| `code-reviewer` | 総合コードレビュー | 実装直後 |
| `security-reviewer` | OWASP 系の security review | 認証、入力、秘密、API |
| `build-error-resolver` | build / type error の最小差分修正 | とにかく build を通したい時 |
| `doc-updater` | docs / codemap 更新 | 実装後の文書更新 |
| `docs-lookup` | Context7 経由の最新 docs 参照 | API / setup 調査 |
| `e2e-runner` | E2E 生成・実行 | 重要ユーザーフロー確認 |
| `refactor-cleaner` | 死コード・重複の整理 | 負債返済 |
| `harness-optimizer` | ハーネス設定の見直し | reliability / cost 改善 |
| `loop-operator` | 自律 loop の管理 | loop 運用 |
| `python-reviewer` | Python 専門レビュー | Python 変更 |
| `go-reviewer` | Go 専門レビュー | Go 変更 |
| `go-build-resolver` | Go build 修正 | Go build failure |
| `java-reviewer` | Java / Spring レビュー | Java 変更 |
| `java-build-resolver` | Java build 修正 | Maven / Gradle failure |
| `kotlin-reviewer` | Kotlin / Android / KMP レビュー | Kotlin 変更 |
| `kotlin-build-resolver` | Kotlin build 修正 | Kotlin compile failure |
| `rust-reviewer` | Rust 専門レビュー | Rust 変更 |
| `rust-build-resolver` | Rust build 修正 | cargo build failure |
| `cpp-reviewer` | C++ 専門レビュー | C++ 変更 |
| `cpp-build-resolver` | C++ build 修正 | CMake / linker failure |
| `typescript-reviewer` | TS / JS レビュー | TypeScript / JavaScript 変更 |
| `pytorch-build-resolver` | PyTorch / CUDA エラー修正 | training / inference crash |
| `database-reviewer` | PostgreSQL / Supabase 観点の DB review | schema / migration / SQL |
| `flutter-reviewer` | Flutter / Dart レビュー | Flutter 変更 |
| `performance-optimizer` | 性能改善 | perf 問題がある時 |
| `gan-planner` | GAN harness の設計側 | one-line prompt から仕様化 |
| `gan-generator` | GAN harness の実装側 | evaluator feedback を受けて実装 |
| `gan-evaluator` | GAN harness の評価側 | 実アプリを採点 |
| `opensource-forker` | OSS 公開用 fork 作成 | private repo の公開準備 |
| `opensource-sanitizer` | OSS 公開前 sanitization | secret / PII 検査 |
| `opensource-packager` | OSS 公開 packaging | README / LICENSE / template 整備 |
| `chief-of-staff` | コミュニケーション運用補助 | email / Slack / LINE / Messenger |
| `healthcare-reviewer` | 医療ソフト安全性 review | healthcare アプリ変更 |

## 既定 6 MCP

ECC ルートの `.mcp.json` に最初から入っている構成です。

| MCP | 何ができるか | 効果 | 前提 / 注意 |
|---|---|---|---|
| `github` | repo、issue、PR を読む / 操作する | GitHub 調査や PR ベースの作業が速い | token や認証設定が必要になることがある |
| `context7` | ライブラリ / framework の最新 docs を引く | 古い記憶より最新 API に寄せられる | docs lookup が主用途 |
| `exa` | Web を広く検索する | 公式 docs 外の比較調査に強い | 外部検索に依存 |
| `memory` | セッション横断の記憶 | 継続作業の説明コストを下げる | 初期段階では必須ではない |
| `playwright` | ブラウザ操作と検証 | E2E、UI 確認、録画ができる | ブラウザ環境依存 |
| `sequential-thinking` | 段階的な推論補助 | 複雑タスクの分解がしやすい | 常時必須ではない |

### 今回の導入方針

- 採用はする
- ただし常用するのは `github` `context7` `exa` が中心
- `memory` `playwright` `sequential-thinking` は、必要になった時だけ前に出す

## Rules

`RULES.md` と `rules/` は、AI が常に守るべき行動原則の層です。

### 中核の考え方

- specialized agent を使う
- テスト先行と重要経路の検証を守る
- 入力検証と security を崩さない
- mutation より immutable update を好む
- 既存 repo パターンを優先する
- 変更は小さくレビューしやすく保つ

### 最小構成で入れる rules

- `rules/common`
- `rules/typescript`
- `rules/python`

### すぐに入れなくてよい rules

- 使わない言語群
- まだ触っていない framework / domain の rules

## Hooks

`hooks/hooks.json` には、Claude Code 向けの runtime automation が入っています。  
代表的なものは次です。

- `pre:bash:block-no-verify`: `--no-verify` の禁止
- `pre:bash:auto-tmux-dev`: dev server を tmux 起動
- `pre:bash:commit-quality`: commit 前品質確認
- `pre:edit-write:suggest-compact`: compaction の提案
- `pre:observe:continuous-learning`: continuous learning の観測
- `pre:config-protection`: lint / format 設定の無効化を防ぐ
- `pre:mcp-health-check`: MCP の健康確認
- `session:start`: 前回文脈と package manager の読み込み
- `post:quality-gate`: edit 後品質確認
- `post:edit:accumulator`: 編集ファイル蓄積
- `post:bash:command-log-audit`: bash command の監査ログ

### なぜ初期導入で外しやすいか

- 挙動の変化点が多い
- 問題が出た時の切り分けが難しい
- Claude Code 依存が強い

### いつ足すか

- daily workflow が固まってから
- 自動品質保証の恩恵が大きいと判断した時
- Claude Code を主環境にすると決めた時

## Install Profiles

`manifests/install-profiles.json` には、導入の束ね方が定義されています。

| Profile | 向いている人 | 含まれるものの傾向 | 初期採用 |
|---|---|---|---|
| `core` | 最小構成で始めたい人 | rules、agents、commands、hooks runtime、platform config、quality workflow | 近い |
| `developer` | 一般的な app 開発者 | core + framework/language + database + orchestration | 必要に応じて |
| `security` | security 重視 | core + security module | 条件付き |
| `research` | 調査や発信寄り | core + research + business/content + social | 目的次第 |
| `full` | 全部ほしい人 | すべての module | 初期は非推奨 |

### 今回の方針との関係

今回のガイドは `core` を基準にしつつ、

- `rules/typescript`
- `rules/python`
- 汎用 quality skill
- 既定 6 MCP

だけを明示的に採用する、という立て付けです。

## 最小構成と full の比較

| 観点 | 最小構成 | full |
|---|---|---|
| 導入速度 | 速い | 遅い |
| 読む量 | 少ない | 多い |
| スクラッチバッド圧迫 | 低い | 高い |
| 自動化の多さ | 少ない | 多い |
| 切り分けやすさ | 高い | 低い |
| 向いている段階 | 初期導入 | 定着後 |

## Codex と Claude の運用差

### Codex

- `skills` と `agents` が中心
- `AGENTS.md` と plugin 定義を読み込ませる
- slash command の知識は「対応 skill を探すための辞書」として使う

### Claude Code

- plugin + rules + settings + hooks を組み合わせやすい
- slash command が入口として分かりやすい
- hooks / session / instinct 系の自動化が生きやすい

## おすすめの拡張順

1. `github` `context7` `exa` を日常で使う
2. `tdd-workflow` `verification-loop` `security-review` を回す
3. 言語別 skill を追加する
4. `memory` を入れてセッション跨ぎを楽にする
5. `playwright` を E2E / demo 用に使う
6. hooks を限定導入する
7. orchestration / loops / research / business skill を足す

## 参照先

- 全体像: [ECC 詳細ガイド](./ECC-GUIDE.md)
- 目的別索引: [ECC 参照インデックス](./ECC-REFERENCE-INDEX.md)
- slash command 全件: [ECC コマンドリファレンス](./ECC-COMMANDS-REFERENCE.md)
- skill 全件: [ECC スキルカタログ](./ECC-SKILLS-CATALOG.md)
