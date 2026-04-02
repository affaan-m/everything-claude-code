# ECC コマンドリファレンス

読むべき人: slash command から ECC を使いたい人、Codex で対応 skill を知りたい人  
読むタイミング: 日常運用を始める前、どの command を選ぶか迷うとき  
3行要約:
- `commands/` は ECC の互換入口で、現在の正規ワークフロー面は `skills/`。
- Claude Code では slash command が使いやすく、Codex では対応する skill / agent に読み替える。
- 本ファイルは 68 command をカテゴリ別に一覧し、目的と使う場面を短くまとめる。

## 先に理解しておくこと

- Claude Code では `/command-name` がそのまま入口になる
- Codex では command より `skills` `agents` `AGENTS.md` が中心
- `Legacy slash-entry shim` と書かれている command は、実体として対応 skill を呼ぶ薄い入口

## 読み方

各行は次を表します。

- `Command`: slash command 名
- `目的`: 何をさせるか
- `使う場面`: いつ選ぶか
- `例`: 最小の呼び方
- `関連`: 背後の skill / agent / 機能
- `差分`: Claude と Codex の考え方の違い

## Core Workflow

| Command | 目的 | 使う場面 | 例 | 関連 | 差分 |
|---|---|---|---|---|---|
| `/plan` | 要件整理と実装計画 | 新機能、複雑な修正、着手前 | `/plan Add auth` | `planner` | Claude はそのまま。Codex は planner agent に読み替える。 |
| `/tdd` | TDD ワークフロー開始 | 新機能、バグ修正、リファクタ | `/tdd Add API tests` | `tdd-workflow` | Codex では skill を直接使う。 |
| `/code-review` | 変更差分の総合レビュー | 実装直後、PR 前 | `/code-review` | `code-reviewer` | Codex では reviewer agent を選ぶ。 |
| `/build-fix` | 言語自動判別で build 修正 | まずビルドを緑にしたい | `/build-fix` | `build-error-resolver` | Codex では build resolver agent に直行。 |
| `/verify` | build / lint / test / typecheck の検証 | マージ前、リリース前 | `/verify` | `verification-loop` | Codex では verification skill に読み替える。 |
| `/quality-gate` | プロジェクト基準に照らした品質確認 | 完了宣言前、PR 前 | `/quality-gate` | quality hooks / workflow | Codex は手動でチェック観点を適用。 |

## Testing

| Command | 目的 | 使う場面 | 例 | 関連 | 差分 |
|---|---|---|---|---|---|
| `/e2e` | Playwright E2E 生成と実行 | 重要 UX の検証 | `/e2e Checkout flow` | `e2e-testing`, `e2e-runner` | Codex では Playwright skill / MCP を使う。 |
| `/test-coverage` | カバレッジ確認 | テスト不足を洗いたい | `/test-coverage` | testing workflow | Codex は verify/testing skill へ。 |
| `/go-test` | Go 向け TDD | Go 機能追加 | `/go-test Add service tests` | `golang-testing` | Go skill 直利用で代替可。 |
| `/kotlin-test` | Kotlin 向け TDD | Kotlin / Android / KMP | `/kotlin-test Add ViewModel tests` | `kotlin-testing` | Codex は Kotlin testing skill。 |
| `/rust-test` | Rust 向け TDD | Rust の機能追加 | `/rust-test Add parser tests` | `rust-testing` | Codex は Rust testing skill。 |
| `/cpp-test` | C++ 向け TDD | C++ の変更 | `/cpp-test Add edge cases` | `cpp-testing` | Codex は C++ testing skill。 |

## Code Review

| Command | 目的 | 使う場面 | 例 | 関連 | 差分 |
|---|---|---|---|---|---|
| `/python-review` | Python 専門レビュー | Python 変更後 | `/python-review` | `python-reviewer` | Codex は Python reviewer agent。 |
| `/go-review` | Go 専門レビュー | Go 変更後 | `/go-review` | `go-reviewer` | Codex は Go reviewer agent。 |
| `/kotlin-review` | Kotlin 専門レビュー | Kotlin / Android / KMP | `/kotlin-review` | `kotlin-reviewer` | Codex は Kotlin reviewer agent。 |
| `/rust-review` | Rust 専門レビュー | Rust 変更後 | `/rust-review` | `rust-reviewer` | Codex は Rust reviewer agent。 |
| `/cpp-review` | C++ 専門レビュー | C++ 変更後 | `/cpp-review` | `cpp-reviewer` | Codex は C++ reviewer agent。 |

## Build Fixers

| Command | 目的 | 使う場面 | 例 | 関連 | 差分 |
|---|---|---|---|---|---|
| `/go-build` | Go build / vet / lint 修正 | Go build が落ちた | `/go-build` | `go-build-resolver` | Codex は Go build resolver。 |
| `/kotlin-build` | Kotlin / Gradle build 修正 | Kotlin compile error | `/kotlin-build` | `kotlin-build-resolver` | Codex は Kotlin build resolver。 |
| `/rust-build` | Rust build / borrow checker 修正 | cargo build failure | `/rust-build` | `rust-build-resolver` | Codex は Rust build resolver。 |
| `/cpp-build` | C++ / CMake / linker 修正 | C++ build failure | `/cpp-build` | `cpp-build-resolver` | Codex は C++ build resolver。 |
| `/gradle-build` | Gradle 系エラー修正 | Android / KMP / Java build failure | `/gradle-build` | Gradle / Kotlin / Java | Codex では Java / Kotlin resolver を使い分ける。 |
| `/gan-build` | GAN harness で生成側の実装推進 | GAN ワークフロー実行時 | `/gan-build` | `gan-generator` | Codex では GAN planner / generator へ寄せる。 |

## Planning & Architecture

| Command | 目的 | 使う場面 | 例 | 関連 | 差分 |
|---|---|---|---|---|---|
| `/multi-plan` | 複数モデル協調の計画 | 複数観点で仕様を詰めたい | `/multi-plan Add billing` | multi workflow runtime | Codex では orchestration skill を直接使う。 |
| `/multi-workflow` | 複数モデル協調の実行 | 複数トラック開発 | `/multi-workflow Build admin` | multi workflow runtime | 追加ランタイム前提。 |
| `/multi-backend` | backend 特化 multi workflow | API / DB 中心の作業 | `/multi-backend Build API` | multi workflow runtime | 同上。 |
| `/multi-frontend` | frontend 特化 multi workflow | UI / UX 中心の作業 | `/multi-frontend Build dashboard` | multi workflow runtime | 同上。 |
| `/multi-execute` | 計画済み作業の協調実行 | multi-plan の後 | `/multi-execute` | multi workflow runtime | 同上。 |
| `/orchestrate` | tmux / worktree 連携ガイド | 並列エージェント運用 | `/orchestrate` | `dmux-workflows`, `autonomous-agent-harness` | Codex でも概念は同じ。 |
| `/devfleet` | DevFleet で並列 agent を回す | worktree 並列化 | `/devfleet` | `claude-devfleet` | Claude 寄りの入口だが考え方は共通。 |
| `/gan-design` | GAN harness 用の仕様展開 | 1 行要求から設計したい | `/gan-design Landing page` | `gan-planner` | Codex は planner 的運用に読み替える。 |
| `/prp-plan` | PRP 形式の詳細実装計画 | 大きい feature spec | `/prp-plan Add OAuth` | PRP workflow | Codex でも計画生成として使える。 |
| `/prp-prd` | PRD を対話生成 | 仕様自体を詰めたい | `/prp-prd New onboarding` | product / planning workflow | Claude 入口が主。 |
| `/prompt-optimize` | プロンプト改善 | 依頼文やシステム文を整えたい | `/prompt-optimize` | `prompt-optimizer` | Codex では skill を直接使う。 |
| `/model-route` | タスクに合うモデル選定 | コスト / 品質を調整したい | `/model-route Review PR` | model routing | Codex は手動判断の補助として読む。 |

## Session Management

| Command | 目的 | 使う場面 | 例 | 関連 | 差分 |
|---|---|---|---|---|---|
| `/save-session` | セッション状態保存 | 作業を中断する前 | `/save-session` | session store | Codex ではメモリ / ノート運用と組み合わせる。 |
| `/resume-session` | 最新セッション再開 | 翌日再開時 | `/resume-session` | session store | Codex は memory / notes で代替することが多い。 |
| `/sessions` | セッション履歴管理 | どの作業を再開するか選びたい | `/sessions` | session store | Claude 入口が主。 |
| `/checkpoint` | セッションの節目を打つ | 大きい変更の前後 | `/checkpoint` | session / learning | Codex でも checkpoint 運用に使える概念。 |
| `/aside` | 本筋を崩さず横道質問 | ちょい質問を挟みたい | `/aside Explain this error` | session context | Codex では会話運用で代替。 |
| `/context-budget` | コンテキスト使用量の監査 | 重くなってきたとき | `/context-budget` | `context-budget` | Codex でも有用な考え方。 |

## Learning & Improvement

| Command | 目的 | 使う場面 | 例 | 関連 | 差分 |
|---|---|---|---|---|---|
| `/learn` | セッションから再利用パターン抽出 | 作業後の知識化 | `/learn` | `continuous-learning` | Codex でも skill 化の種として使える。 |
| `/learn-eval` | 抽出内容を自己評価つきで保存 | 学習の質も見たい | `/learn-eval` | `continuous-learning`, eval | Claude 側で運用しやすい。 |
| `/evolve` | instincts を skill / command 化へ進める | 学習結果を整理したい | `/evolve` | learning v2 | Codex は手動 skill 化へ。 |
| `/promote` | project-scoped instinct を global 化 | 汎用化できた時 | `/promote` | instinct system | Claude の学習面が主。 |
| `/instinct-status` | instincts 一覧を見る | 何を学習済みか知りたい | `/instinct-status` | instinct system | Claude 寄り。 |
| `/instinct-export` | instinct を書き出す | バックアップ / 移行 | `/instinct-export` | instinct system | Claude 寄り。 |
| `/instinct-import` | instinct を取り込む | 他環境から移行 | `/instinct-import` | instinct system | Claude 寄り。 |
| `/skill-create` | git 履歴から skill 作成 | チーム知見を skill 化したい | `/skill-create` | skill creator workflow | Codex でも有用。 |
| `/skill-health` | skill 群の品質監査 | 既存 skill の棚卸し | `/skill-health` | skill analytics | 保守寄り。 |
| `/rules-distill` | skill から rules を蒸留 | 横断原則を整理したい | `/rules-distill` | `rules-distill` | Codex では skill 直接利用。 |
| `/prune` | 古い未昇格 instinct を削除 | 学習データの整理 | `/prune` | instinct hygiene | Claude 寄り。 |

## Refactoring & Cleanup

| Command | 目的 | 使う場面 | 例 | 関連 | 差分 |
|---|---|---|---|---|---|
| `/refactor-clean` | 死んだコードや重複の整理 | 保守、負債返済 | `/refactor-clean` | `refactor-cleaner` | Codex では cleaner agent。 |
| `/quality-gate` | 変更後の品質確認 | PR 前 | `/quality-gate` | workflow quality | Core Workflow にも登場。 |
| `/santa-loop` | 二重レビューの収束ループ | 厳格な出荷前確認 | `/santa-loop` | `santa-method` | 高コストなので限定利用。 |

## Docs & Research

| Command | 目的 | 使う場面 | 例 | 関連 | 差分 |
|---|---|---|---|---|---|
| `/docs` | Context7 経由の最新 docs 参照 | API / setup / syntax 調査 | `/docs react useEffect` | `documentation-lookup` | Codex では skill と Context7 を直接使う。 |
| `/update-docs` | プロジェクト docs 更新 | 実装後の文書更新 | `/update-docs` | `doc-updater` | Codex でも docs 更新 agent 的に使える。 |
| `/update-codemaps` | codemap 再生成 | コードベース索引更新 | `/update-codemaps` | `doc-updater` | 解析用 docs 面。 |
| `/eval` | eval harness 実行 | 回帰検証、評価駆動開発 | `/eval` | `eval-harness` | Codex でも評価フレームとして読める。 |

## Loops & Automation

| Command | 目的 | 使う場面 | 例 | 関連 | 差分 |
|---|---|---|---|---|---|
| `/loop-start` | 繰り返し loop 開始 | 巡回監視や定期タスク | `/loop-start every 15m` | `loop-operator`, loop system | Claude 側運用が主。 |
| `/loop-status` | loop 状態確認 | 進捗や停止確認 | `/loop-status` | `loop-operator` | Claude 側運用が主。 |
| `/claw` | NanoClaw REPL 起動 | 永続 REPL、モデル切替、分岐 | `/claw` | `nanoclaw-repl` | Claude 色が強い。 |
| `/pm2` | PM2 初期化 | 長時間プロセス管理 | `/pm2` | PM2 workflow | ローカル運用向け。 |

## Project & Infrastructure

| Command | 目的 | 使う場面 | 例 | 関連 | 差分 |
|---|---|---|---|---|---|
| `/projects` | 既知プロジェクト一覧と統計 | 複数 repo の運用 | `/projects` | project memory | Claude 寄り。 |
| `/harness-audit` | ハーネス設定の監査 | 信頼性 / コストの見直し | `/harness-audit` | `harness-optimizer` | Codex でも価値が高い。 |
| `/setup-pm` | package manager 設定 | npm / pnpm / yarn / bun の固定 | `/setup-pm pnpm` | setup-package-manager | どのハーネスでも有用。 |

## PRP / Delivery

| Command | 目的 | 使う場面 | 例 | 関連 | 差分 |
|---|---|---|---|---|---|
| `/prp-implement` | 計画を実装へ落とす | `prp-plan` 後の遂行 | `/prp-implement` | PRP workflow | Claude 側の強い入口。 |
| `/prp-commit` | 自然文でコミット対象指定 | コミット整理 | `/prp-commit only docs files` | PRP workflow | Git 支援コマンド。 |
| `/prp-pr` | PR 作成 | 変更をまとめて提出 | `/prp-pr` | GitHub / PR workflow | GitHub CLI 前提になりやすい。 |

## コマンド選びの最短ガイド

### 新機能

- 最初に `/plan`
- そのまま `/tdd`
- 書き終えたら `/code-review`
- 最後に `/verify`

### 既存コードの修正

- build が壊れているなら `/build-fix`
- 原因調査なら `/docs` と `search-first`
- 仕上げに `/quality-gate`

### 調査や資料化

- 最新 docs なら `/docs`
- codemap 更新なら `/update-codemaps`
- ドキュメント更新なら `/update-docs`

## Codex での読み替え早見表

| Claude command | Codex での主な読み替え |
|---|---|
| `/plan` | `planner` agent |
| `/tdd` | `tdd-workflow` skill |
| `/code-review` | `code-reviewer` または言語別 reviewer |
| `/build-fix` | 言語別 build resolver agent |
| `/verify` | `verification-loop` skill |
| `/docs` | `documentation-lookup` + Context7 |
| `/refactor-clean` | `refactor-cleaner` agent |
| `/harness-audit` | `harness-optimizer` agent |

## 補足

- `commands/` は現在も重要ですが、長期的には `skills-first` が前提です。
- Codex を主環境にするなら、このファイルを「Claude 入口一覧」として見て、詳細は [ECC スキルカタログ](./ECC-SKILLS-CATALOG.md) を主に読む方が運用しやすいです。
