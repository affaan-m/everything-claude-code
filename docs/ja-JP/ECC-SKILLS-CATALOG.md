# ECC スキルカタログ

読むべき人: ECC の本体である `skills/` を主に使いたい人、Codex で ECC を使う人  
読むタイミング: command ではなく skill 単位で運用設計したいとき  
3行要約:
- ECC の正規ワークフロー面は `skills`。
- 本ファイルは 151 skill をカテゴリ別に整理し、全件を短い実務用メモとして並べる。
- まずカテゴリ要約を読み、必要な skill だけ深掘りするのが最も軽い。

## 使い方

### Claude Code

- command から入っても、実体が skill のことが多い
- 実際の運用は「この task ならどの skill を効かせるか」で考える

### Codex

- 最初から skill を主面として読む
- slash command 名より、skill の役割で覚える

## 最初に見るべき skill

最小構成なら次を先に押さえるだけで十分に価値が出ます。

- `tdd-workflow`
- `verification-loop`
- `security-review`
- `documentation-lookup`
- `search-first`
- `context-budget`
- `configure-ecc`

## カテゴリ概要

### 1. ハーネス・運用基盤

AI コーディング環境そのものを設計・評価・改善する skill 群。  
ECC を「ただのプロンプト集」ではなく、運用システムとして使うときの核です。

### 2. 計画・仕様・アーキテクチャ

実装前の仕様化、設計判断、ADR、blueprint、分割計画を扱います。

### 3. 品質・検証・レビュー・安全

TDD、検証ループ、セキュリティ、回帰検知、レビュー観点の standard skill 群です。

### 4. 言語・フレームワーク別実装

TypeScript / Python / Go / Java / Kotlin / Rust / C++ / Laravel / Swift など、言語別ベストプラクティスをまとめています。

### 5. データ・研究・MCP・外部知識

database、deep research、MCP server 実装、外部 docs 参照、Web 調査に関する skill 群です。

### 6. ブラウザ・デザイン・動画・メディア

Playwright、デザインシステム、UI デモ、スライド、画像/動画ワークフローをまとめています。

### 7. ビジネス・コンテンツ・営業・業務オペ

市場調査、投資家向け資料、アウトリーチ、Google Workspace、顧客対応など、コード以外の仕事に寄った skill 群です。

### 8. 業種特化

Healthcare、物流、通関、エネルギーなど、特定ドメイン向けの深い運用知識です。

## 全 skill 一覧

各項目は `用途 / どう依頼すると起動しやすいか / 似た skill との差分` の順に短く書いています。

## ハーネス・運用基盤

- `agent-eval`: 複数 coding agent の比較評価。`Claude と Codex を比較して` のように依頼。`eval-harness` は単一ワークフロー評価、こちらは agent 比較。
- `agent-harness-construction`: action space や tool 定義の設計。`agent harness を設計して` と依頼。`harness-audit` より構築寄り。
- `agent-payment-x402`: agent に支払い機能を持たせる。`AI agent が API に支払えるようにしたい` と依頼。決済統合専用。
- `agentic-engineering`: eval-first、分解、コスト意識を持つ agentic 開発。`agentic に進めて` と依頼。全体運用の作法。
- `ai-first-engineering`: AI を前提にしたチーム開発モデル。`AI-first な開発体制にしたい` と依頼。個別実装より組織運用向け。
- `autonomous-agent-harness`: 永続メモリと scheduled operations を持つ自律 agent 構築。`継続稼働する agent にしたい` と依頼。自律運用基盤。
- `autonomous-loops`: 自律ループ設計パターン。`loop を安全に回したい` と依頼。`continuous-agent-loop` より概念寄り。
- `ck`: プロジェクトごとの永続メモリ。`この repo の記憶を持たせたい` と依頼。Claude Code ネイティブ運用寄り。
- `claude-api`: Anthropic API 実装パターン。`Claude API を使ってアプリを作りたい` と依頼。Anthropic 固有。
- `claude-devfleet`: DevFleet による並列 agent 制御。`複数エージェントで並列実行したい` と依頼。worktree 運用に強い。
- `configure-ecc`: ECC の対話式インストーラ。`ECC を必要最小限で設定したい` と依頼。初回導入の入口。
- `context-budget`: コンテキスト消費の監査。`今の構成が重いか診断して` と依頼。スクラッチバッド節約に直結。
- `continuous-agent-loop`: quality gate 付き継続ループ設計。`止まりにくい継続 loop を作りたい` と依頼。`autonomous-loops` より実装指向。
- `continuous-learning`: セッションからパターン抽出。`この作業から reusable な知見を抽出して` と依頼。学習の初代系。
- `continuous-learning-v2`: instinct と confidence scoring を持つ学習系。`project-scoped に学習させたい` と依頼。v2 は project 汚染対策込み。
- `cost-aware-llm-pipeline`: LLM API のコスト最適化。`モデル選定と予算管理を組み込みたい` と依頼。token / retry / routing の実装面。
- `dmux-workflows`: tmux ベースの multi-agent orchestration。`tmux で並列運用したい` と依頼。`claude-devfleet` より手動制御寄り。
- `enterprise-agent-ops`: 長寿命 agent workload の運用。`agent 運用の observability を整えたい` と依頼。企業運用向け。
- `eval-harness`: eval-driven development の評価枠組み。`この変更を eval 駆動で検証して` と依頼。回帰テストの基盤。
- `mcp-server-patterns`: Node/TS で MCP server を作る。`MCP server を実装したい` と依頼。ECC 利用より provider 側実装向け。
- `nanoclaw-repl`: NanoClaw v2 REPL を運用・拡張する。`NanoClaw を使いたい` と依頼。対話 REPL 専用。
- `search-first`: 実装前に調査を挟む。`まず既存のライブラリや実装例を調べて` と依頼。最初に常用したい skill。
- `strategic-compact`: 論理的な区切りで手動 compaction を促す。`コンテキストを崩さず圧縮したい` と依頼。`context-budget` は監査、こちらは運用。
- `team-builder`: 並列 agent チームの編成。`この task に必要な agent チームを組んで` と依頼。役割割当向け。
- `token-budget-advisor`: token 消費を見積もる。`この運用の token コストを見て` と依頼。`context-budget` より予算観点。
- `workspace-surface-audit`: repo、MCP、plugins、env の棚卸し。`この環境で何が使えるか監査して` と依頼。導入直後に有用。

## 計画・仕様・アーキテクチャ

- `api-design`: REST API 設計。`API を設計して` と依頼。resource / error / pagination の標準化。
- `architecture-decision-records`: ADR を残す。`この設計判断を ADR にして` と依頼。設計ログ専用。
- `blueprint`: multi-session / multi-PR の construction plan。`大きい移行計画を blueprint 化して` と依頼。`plan` より長期分割向け。
- `codebase-onboarding`: 新しい repo の onboarding guide 生成。`この repo の onboarding doc を作って` と依頼。初見解析向け。
- `hexagonal-architecture`: Ports & Adapters 設計。`hexagonal に整理したい` と依頼。境界分離向け。
- `iterative-retrieval`: subagent context 問題への段階的 retrieval。`必要な文脈だけ徐々に渡したい` と依頼。大規模 repo で有効。
- `product-lens`: build 前に product 問題を検証。`何を作るべきか整理して` と依頼。実装より前の why を扱う。
- `project-guidelines-example`: project 固有 skill の雛形。`この repo 専用 skill を作りたい` と依頼。テンプレート用途。
- `ralphinho-rfc-pipeline`: RFC 駆動の DAG 実行。`RFC ベースで multi-agent 実行したい` と依頼。運用が重い分、大規模案件向け。

## 品質・検証・レビュー・安全

- `ai-regression-testing`: AI 実装の blind spot を拾う回帰戦略。`AI が書いた変更を回帰観点で見て` と依頼。`eval-harness` より QA 観点。
- `benchmark`: before/after 性能測定。`この PR の性能差を計測して` と依頼。回帰検知向け。
- `browser-qa`: browser automation による visual / interaction QA。`デプロイ後に UI を点検して` と依頼。E2E より QA 寄り。
- `canary-watch`: デプロイ後の回帰監視。`本番 URL を見張って` と依頼。継続監視向け。
- `click-path-audit`: ボタンから状態変化全体を追跡。`このボタンがなぜ効かないか経路で洗って` と依頼。UI デバッグ専用。
- `design-system`: design system 生成や監査。`デザインシステムを整理して` と依頼。`frontend-patterns` より design 観点。
- `documentation-lookup`: Context7 による最新 docs 参照。`React 19 の最新 API を調べて` と依頼。日常で最重要。
- `e2e-testing`: Playwright E2E 設計と運用。`E2E を整備して` と依頼。`browser-qa` は点検、こちらは test 本体。
- `plankton-code-quality`: edit 後の format / lint / AI 修正。`書くたびに品質を自動維持したい` と依頼。hooks 強め。
- `prompt-optimizer`: draft prompt を ECC 流に最適化。`この依頼文を改善して` と依頼。meta skill。
- `repo-scan`: ソース資産監査と third-party 埋め込み検出。`この repo を資産監査して` と依頼。棚卸し向け。
- `rules-distill`: skill 群から共通ルール抽出。`この skill セットから rules を作って` と依頼。横断原則化。
- `safety-guard`: 破壊的操作の防止。`本番や破壊的操作なので慎重に進めて` と依頼。prod safety 専用。
- `santa-method`: 2 reviewer 合意の adversarial review。`厳格に二重レビューして` と依頼。高コスト品質保証。
- `security-review`: 認証、入力、秘密、決済などの security review。`この API をセキュリティ観点で見て` と依頼。最初に入れるべき skill。
- `security-scan`: Claude Code 設定の脆弱性検査。`.claude 設定を scan して` と依頼。AgentShield 寄り。
- `skill-comply`: skills / rules / agents が本当に守られているか評価。`この skill が守られているか検証して` と依頼。品質監査向け。
- `skill-stocktake`: skill / command の棚卸し。`ECC skill 群の品質棚卸しをして` と依頼。メンテナ向け。
- `tdd-workflow`: 新機能・修正・リファクタの TDD。`テスト先行で進めて` と依頼。日常最重要。
- `verification-loop`: build / lint / tests / review の包括検証。`最後に verification を回して` と依頼。出荷前の締め。

## Web / JS / TS / Frontend / Backend

- `backend-patterns`: Node / Express / Next API の backend 実装指針。`Node backend を設計して` と依頼。Web backend 向け。
- `bun-runtime`: Bun の runtime / package manager 運用。`Bun を採用すべきか見て` と依頼。Node 代替の比較軸。
- `coding-standards`: TypeScript / JavaScript / React / Node の標準。`TS/JS の標準に沿って書いて` と依頼。最汎用。
- `content-hash-cache-pattern`: SHA-256 ベースの高コスト処理キャッシュ。`ファイル処理を content hash でキャッシュしたい` と依頼。局所パターン。
- `deployment-patterns`: CI/CD、Docker、health check、rollback。`本番デプロイの流れを設計して` と依頼。運用まで含む。
- `docker-patterns`: Docker / Compose 設計。`Docker 構成を整えて` と依頼。container 近辺に限定。
- `frontend-patterns`: React / Next / state / performance。`React フロントを改善して` と依頼。最重要 frontend skill。
- `frontend-slides`: HTML スライド作成。`プレゼン資料を Web スライドで作って` と依頼。ドキュメントではなく presentation 専用。
- `git-workflow`: branch / commit / rebase / conflict 解決。`このチーム向け git workflow を整理して` と依頼。チーム運用寄り。
- `nextjs-turbopack`: Next.js 16+ と Turbopack。`Turbopack に寄せたい` と依頼。Next 固有。
- `nuxt4-patterns`: Nuxt 4 の hydration / SSR / perf。`Nuxt 4 アプリを設計して` と依頼。Vue / Nuxt 固有。

## Python / Django

- `python-patterns`: Python の idiom と型と PEP 8。`Python らしく書き直して` と依頼。Python 基本。
- `python-testing`: pytest / fixtures / coverage。`pytest でテストを整備して` と依頼。Python TDD 面。
- `django-patterns`: Django / DRF / ORM / middleware。`Django API を作って` と依頼。Django 基本。
- `django-security`: Django の auth / CSRF / XSS / secure deploy。`Django のセキュリティを見て` と依頼。Django security 専用。
- `django-tdd`: pytest-django / factory_boy での TDD。`Django をテスト先行で進めて` と依頼。Django testing 特化。
- `django-verification`: migrations / lint / tests / security scan を回す。`Django の release readiness を見て` と依頼。verification 専用。

## Go

- `golang-patterns`: idiomatic Go 実装。`Go らしく整理して` と依頼。Go 基本。
- `golang-testing`: table-driven tests / fuzzing / coverage。`Go テストを増やして` と依頼。Go testing 特化。

## Java / Kotlin / Android / Spring

- `android-clean-architecture`: Android / KMP の clean architecture。`Android アプリを clean architecture にしたい` と依頼。モジュール構造向け。
- `compose-multiplatform-patterns`: Compose Multiplatform の UI 設計。`KMP UI を Compose で組みたい` と依頼。UI 層特化。
- `java-coding-standards`: Spring Boot 系 Java の標準。`Java サービスの標準に沿って直して` と依頼。Java 基本。
- `jpa-patterns`: JPA / Hibernate の entity、transaction、query 最適化。`JPA 設計を見直して` と依頼。ORM 特化。
- `kotlin-coroutines-flows`: coroutines / Flow / structured concurrency。`Flow と coroutine の設計を見て` と依頼。非同期専用。
- `kotlin-exposed-patterns`: JetBrains Exposed ORM。`Exposed で DB 層を作って` と依頼。Exposed 限定。
- `kotlin-ktor-patterns`: Ktor server 設計。`Ktor API を作って` と依頼。Ktor 固有。
- `kotlin-patterns`: Kotlin idiom 全般。`Kotlin らしく整理して` と依頼。Kotlin 基本。
- `kotlin-testing`: Kotest / MockK / Kover。`Kotlin テストを整えて` と依頼。Kotlin testing 特化。
- `springboot-patterns`: Spring Boot layered backend。`Spring Boot API を設計して` と依頼。Java backend 基本。
- `springboot-security`: Spring Security の auth / headers / validation。`Spring のセキュリティを見て` と依頼。security 専用。
- `springboot-tdd`: JUnit 5 / Mockito / MockMvc / Testcontainers。`Spring を TDD で進めて` と依頼。testing 特化。
- `springboot-verification`: build / static analysis / tests / scan。`Spring Boot の release readiness を見て` と依頼。verification 特化。

## Laravel / PHP

- `laravel-patterns`: Laravel の routing / service layer / queue / API resource。`Laravel の構成を整えて` と依頼。Laravel 基本。
- `laravel-plugin-discovery`: LaraPlugins.io で package 探索。`Laravel package を探して` と依頼。選定専用。
- `laravel-security`: Laravel の auth / validation / uploads / secrets。`Laravel の脆弱性を見て` と依頼。security 専用。
- `laravel-tdd`: PHPUnit / Pest / factories。`Laravel をテスト先行で` と依頼。testing 特化。
- `laravel-verification`: env / static analysis / tests / security。`Laravel の検証を回して` と依頼。verification 特化。

## Rust / C++ / Perl

- `cpp-coding-standards`: C++ Core Guidelines ベースの標準。`C++ を modern に直して` と依頼。C++ 基本。
- `cpp-testing`: GoogleTest / CTest / sanitizers。`C++ テストを整備して` と依頼。testing 特化。
- `perl-patterns`: Modern Perl 5.36+ の idiom。`Perl を modern に書き直して` と依頼。Perl 基本。
- `perl-security`: taint mode、DBI、web security。`Perl の security を確認して` と依頼。security 専用。
- `perl-testing`: Test2 / prove / coverage。`Perl テストを整えて` と依頼。testing 特化。
- `rust-patterns`: ownership / traits / concurrency。`Rust らしく設計して` と依頼。Rust 基本。
- `rust-testing`: unit / integration / async / property-based tests。`Rust テストを増やして` と依頼。testing 特化。

## Swift / Apple

- `foundation-models-on-device`: Apple FoundationModels の on-device LLM。`iOS で on-device LLM を使いたい` と依頼。Apple 独自面。
- `liquid-glass-design`: iOS 26 Liquid Glass design system。`Liquid Glass 風 UI にしたい` と依頼。デザイン専用。
- `swift-actor-persistence`: actor ベースの安全な永続化。`Swift で race-free persistence を組みたい` と依頼。局所設計。
- `swift-concurrency-6-2`: Swift 6.2 concurrency。`Swift 6.2 concurrency を前提に整理して` と依頼。言語進化寄り。
- `swift-protocol-di-testing`: protocol ベース DI とテスト。`Swift を testable にしたい` と依頼。DI / testing 専用。
- `swiftui-patterns`: SwiftUI の state / navigation / perf。`SwiftUI で実装して` と依頼。Apple UI 基本。

## データ・研究・外部知識

- `clickhouse-io`: ClickHouse の query / analytics パターン。`ClickHouse クエリを最適化して` と依頼。分析 DB 特化。
- `database-migrations`: schema change、data migration、rollback。`安全な migration plan を作って` と依頼。DB 移行の標準。
- `data-scraper-agent`: 公開情報を継続収集する agent。`価格や求人を定期収集したい` と依頼。自動収集向け。
- `deep-research`: firecrawl / exa を使う深掘り調査。`根拠付きで徹底調査して` と依頼。`search-first` より重い。
- `exa-search`: Exa MCP ベースの Web / code / company research。`Exa で調査して` と依頼。検索面の主力。
- `postgres-patterns`: PostgreSQL の query / schema / indexing / security。`Postgres を最適化して` と依頼。DB 基本。
- `pytorch-patterns`: PyTorch training / model / data pipeline。`PyTorch training pipeline を整えて` と依頼。ML 専用。
- `regex-vs-llm-structured-text`: regex と LLM の使い分け。`この構造化テキストは regex で行けるか判断して` と依頼。設計判断用。
- `workspace-surface-audit`: repo と外部接続面の監査。`MCP や plugin を含めて現状把握したい` と依頼。導入診断にも有効。

## ブラウザ・デザイン・メディア

- `fal-ai-media`: fal.ai による image / video / audio 生成。`fal.ai で画像や動画を作って` と依頼。生成メディア全般。
- `manim-video`: Manim で技術説明動画。`技術概念をアニメ動画で説明したい` と依頼。図解アニメ専用。
- `remotion-video-creation`: React / Remotion で動画制作。`Remotion で動画を作って` と依頼。React ベース。
- `ui-demo`: Playwright で polished UI demo を録画。`このアプリのデモ動画を撮って` と依頼。完成デモ向け。
- `videodb`: 動画 / 音声の ingest、検索、編集、アラート。`動画を理解して編集したい` と依頼。media ops 全般。
- `video-editing`: 実写ベースの AI-assisted video 編集。`動画素材をカットして仕上げたい` と依頼。制作ワークフロー寄り。
- `visa-doc-translate`: ビザ申請書類の英訳 PDF 化。`この書類画像を英訳して` と依頼。用途限定。

## OSS・リポジトリ公開

- `opensource-pipeline`: private repo を公開可能にする 3 agent pipeline。`この repo を open source 化したい` と依頼。パイプライン全体。
- `opensource-forker`: 公開用 fork 作成と secret 除去。`公開向け fork を作って` と依頼。第1段階。
- `opensource-sanitizer`: secret / PII / internal refs の最終検査。`公開前に sanitization を確認して` と依頼。第2段階。
- `opensource-packager`: README、LICENSE、template など公開 packaging。`OSS 公開向けパッケージを整えて` と依頼。第3段階。

## ビジネス・コンテンツ・営業・コミュニケーション

- `article-writing`: 長文記事やガイド執筆。`この内容で記事を書いて` と依頼。長文専用。
- `brand-voice`: 実例から文体プロファイルを作る。`この人の文体で書いて` と依頼。voice 再現専用。
- `connections-optimizer`: X / LinkedIn の関係網を最適化。`フォロー関係を整理したい` と依頼。network cleanup。
- `content-engine`: 複数媒体向けの content system 構築。`SNS と newsletter を横断するコンテンツ戦略を作って` と依頼。記事単発より運用向け。
- `crosspost`: X / LinkedIn / Threads / Bluesky へ再配布。`この投稿を各 SNS 向けに展開して` と依頼。platform adaptation 専用。
- `customer-billing-ops`: subscription / refund / churn 対応。`この顧客の請求状況を見て` と依頼。Stripe など billing 運用。
- `google-workspace-ops`: Drive / Docs / Sheets / Slides を横断運用。`Google Docs と Sheets を整理して` と依頼。Workspace 専用。
- `investor-materials`: pitch deck、one-pager、memo、financial model。`投資家向け資料を作って` と依頼。fundraising 材料向け。
- `investor-outreach`: investor 向け outreach 文面。`VC への初回メールを書いて` と依頼。資金調達コミュニケーション。
- `lead-intelligence`: AI-native lead intelligence と outreach pipeline。`狙うべき見込み顧客を絞って` と依頼。営業 pipeline 全体。
- `market-research`: 市場、競合、投資家 DD の調査。`市場調査をして` と依頼。意思決定材料向け。
- `project-flow-ops`: GitHub と Linear の execution flow 管理。`issue と PR の流れを整理して` と依頼。チケット運用専用。
- `social-graph-ranker`: warm intro 発見の ranking engine。`人脈から warm intro 候補を順位付けして` と依頼。network scoring 専用。
- `x-api`: X/Twitter API 連携。`X API で投稿や分析をしたい` と依頼。X 専用。

## ドメイン特化: Healthcare

- `healthcare-cdss-patterns`: CDSS の開発パターン。`臨床意思決定支援を実装したい` と依頼。診療支援専用。
- `healthcare-emr-patterns`: EMR/EHR の workflow 設計。`EMR 画面や処方フローを設計したい` と依頼。医療 UI / workflow 向け。
- `healthcare-eval-harness`: patient safety 評価。`医療アプリの安全性 eval を回して` と依頼。医療 release gate。
- `healthcare-phi-compliance`: PHI / PII の保護。`この医療データ設計が compliant か見て` と依頼。規制順守専用。

## ドメイン特化: 物流・調達・通関・製造

- `carrier-relationship-management`: carrier portfolio、rate negotiation、scorecards。`運送会社との交渉や評価を整理して` と依頼。物流調達寄り。
- `customs-trade-compliance`: HS code、duty、restricted party screening。`輸出入の通関・関税を見て` と依頼。通関専用。
- `energy-procurement`: energy sourcing と契約最適化。`電力調達の比較をして` と依頼。調達専用。
- `inventory-demand-planning`: demand planning と在庫配分。`需要予測と在庫計画を整理して` と依頼。SCM 計画向け。
- `logistics-exception-management`: 物流例外対応。`配送遅延や欠品の例外対応を整理して` と依頼。運用トラブル向け。
- `production-scheduling`: 生産計画とスケジューリング。`工場の生産順序を最適化したい` と依頼。製造計画向け。
- `quality-nonconformance`: 品質不適合の記録と是正。`品質不良の是正フローを整理して` と依頼。品質業務向け。
- `returns-reverse-logistics`: 返品と reverse logistics。`返品オペレーションを設計して` と依頼。逆物流専用。

## そのほかの specialized skill

- `browser-qa`: deploy 後の visual QA。`リリース後の UI を確認して` と依頼。E2E より軽い確認向け。
- `canary-watch`: canary URL の監視。`デプロイ直後の回帰を監視して` と依頼。継続監視向け。
- `carrier-relationship-management`: 物流 carrier 管理。`運送会社ポートフォリオを見直して` と依頼。SCM 実務向け。
- `clickhouse-io`: analytics DB としての ClickHouse。`分析クエリを最適化して` と依頼。分析基盤特化。
- `connections-optimizer`: ソーシャル graph の整理。`X / LinkedIn の接続を整理したい` と依頼。営業より network hygiene。
- `flutter-dart-code-review`: Flutter / Dart の library-agnostic code review。`Flutter の PR をレビューして` と依頼。state management 非依存の review 用。
- `foundation-models-on-device`: iOS の on-device LLM。`Apple の on-device AI を使いたい` と依頼。Apple / ML 交差点。
- `gan-style-harness`: generator / evaluator 分離の GAN 風 harness。`GAN 風ループで作りたい` と依頼。研究的ワークフロー。
- `openclaw-persona-forge`: OpenClaw persona / character / identity 生成。`OpenClaw の persona を作りたい` と依頼。OpenClaw 特化。
- `plankton-code-quality`: write-time quality automation。`編集直後に format/lint を強制したい` と依頼。hook 前提。
- `nutrient-document-processing`: PDF / DOCX / XLSX / PPTX / 画像の処理。`OCR、変換、抽出、redaction をしたい` と依頼。文書処理 API 専用。
- `ui-demo`: polished screen recording。`使い方動画を収録して` と依頼。browser-qa と違い成果物が動画。

## 選定のコツ

### 最初に入れると価値が高い

- `tdd-workflow`
- `verification-loop`
- `security-review`
- `documentation-lookup`
- `search-first`
- `context-budget`
- `configure-ecc`

### 実際に必要になったら足す

- 言語 / framework 特化 skill
- `continuous-learning-v2`
- `deep-research`
- `claude-devfleet`
- `browser-qa`
- `ui-demo`

### 最後に考える

- 業種特化 skill
- media generation skill
- multi-agent / autonomous loop skill
- open source pipeline skill

## 補足

- 151 skill を毎回全部読む必要はありません。
- 「今やっている task に対して 1 つか 2 つだけ選ぶ」のが基本です。
- Codex ではこのファイルを主に参照し、Claude Code では [ECC コマンドリファレンス](./ECC-COMMANDS-REFERENCE.md) を入口として読むのが実務上扱いやすいです。
