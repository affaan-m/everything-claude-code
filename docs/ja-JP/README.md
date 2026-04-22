**言語:** [English](../../README.md) | [Português (Brasil)](../pt-BR/README.md) | [简体中文](../../README.zh-CN.md) | [繁體中文](../zh-TW/README.md) | [日本語](README.md) | [한국어](../ko-KR/README.md) | [Türkçe](../tr/README.md)

# Everything Claude Code

![Everything Claude Code — AI エージェントハーネス向けパフォーマンスシステム](../../assets/hero.png)

[![Stars](https://img.shields.io/github/stars/affaan-m/everything-claude-code?style=flat)](https://github.com/affaan-m/everything-claude-code/stargazers)
[![Forks](https://img.shields.io/github/forks/affaan-m/everything-claude-code?style=flat)](https://github.com/affaan-m/everything-claude-code/network/members)
[![Contributors](https://img.shields.io/github/contributors/affaan-m/everything-claude-code?style=flat)](https://github.com/affaan-m/everything-claude-code/graphs/contributors)
[![npm ecc-universal](https://img.shields.io/npm/dw/ecc-universal?label=ecc-universal%20weekly%20downloads&logo=npm)](https://www.npmjs.com/package/ecc-universal)
[![npm ecc-agentshield](https://img.shields.io/npm/dw/ecc-agentshield?label=ecc-agentshield%20weekly%20downloads&logo=npm)](https://www.npmjs.com/package/ecc-agentshield)
[![GitHub App Install](https://img.shields.io/badge/GitHub%20App-150%20installs-2ea44f?logo=github)](https://github.com/marketplace/ecc-tools)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
![Shell](https://img.shields.io/badge/-Shell-4EAA25?logo=gnu-bash&logoColor=white)
![TypeScript](https://img.shields.io/badge/-TypeScript-3178C6?logo=typescript&logoColor=white)
![Python](https://img.shields.io/badge/-Python-3776AB?logo=python&logoColor=white)
![Go](https://img.shields.io/badge/-Go-00ADD8?logo=go&logoColor=white)
![Java](https://img.shields.io/badge/-Java-ED8B00?logo=openjdk&logoColor=white)
![Perl](https://img.shields.io/badge/-Perl-39457E?logo=perl&logoColor=white)
![Markdown](https://img.shields.io/badge/-Markdown-000000?logo=markdown&logoColor=white)

> **140K+ stars** | **21K+ forks** | **170+ contributors** | **12+ language ecosystems**

---

<div align="center">

**言語 / Language / 語言 / Dil**

[English](../../README.md) | [Português (Brasil)](../pt-BR/README.md) | [简体中文](../../README.zh-CN.md) | [繁體中文](../zh-TW/README.md) | [**日本語**](README.md) | [한국어](../ko-KR/README.md) | [Türkçe](../tr/README.md)

</div>

---

**AI エージェントハーネス向けのパフォーマンス最適化システム。Anthropic ハッカソン優勝者による成果物。**

単なる設定集ではありません。スキル、インスティンクト、メモリ最適化、継続的学習、セキュリティスキャン、リサーチファースト開発を含む完全なシステムです。10 ヶ月以上にわたる集中的な日常使用で実プロダクト構築の過程で進化した、本番環境対応のエージェント、スキル、フック、ルール、MCP 設定、そしてレガシーコマンドシムを提供します。

**Claude Code**、**Codex**、**Cursor**、**OpenCode**、**Gemini** など、主要な AI エージェントハーネス全体で動作します。

---

## ガイド

このリポジトリは生のコードのみです。詳細はガイドで解説します。

<table>
<tr>
<td width="33%">
<a href="https://x.com/affaanmustafa/status/2012378465664745795">
<img src="../../assets/images/guides/shorthand-guide.png" alt="The Shorthand Guide to Everything Claude Code" />
</a>
</td>
<td width="33%">
<a href="https://x.com/affaanmustafa/status/2014040193557471352">
<img src="../../assets/images/guides/longform-guide.png" alt="The Longform Guide to Everything Claude Code" />
</a>
</td>
<td width="33%">
<a href="https://x.com/affaanmustafa/status/2033263813387223421">
<img src="../../assets/images/security/security-guide-header.png" alt="The Shorthand Guide to Everything Agentic Security" />
</a>
</td>
</tr>
<tr>
<td align="center"><b>簡潔ガイド</b><br/>セットアップ、基礎、哲学。<b>まずこれを読んでください。</b></td>
<td align="center"><b>長文ガイド</b><br/>トークン最適化、メモリ永続化、評価、並列化。</td>
<td align="center"><b>セキュリティガイド</b><br/>攻撃ベクター、サンドボックス化、サニタイゼーション、CVE、AgentShield。</td>
</tr>
</table>

| トピック | 学べる内容 |
|-------|-------------------|
| トークン最適化 | モデル選択、システムプロンプト削減、バックグラウンドプロセス |
| メモリ永続化 | セッション間でコンテキストを自動保存/読み込みするフック |
| 継続的学習 | セッションからパターンを自動抽出し再利用可能なスキルに変換 |
| 検証ループ | チェックポイント vs 継続的評価、グレーダータイプ、pass@k メトリクス |
| 並列化 | Git ワークツリー、カスケード方式、インスタンスをスケールするタイミング |
| サブエージェント オーケストレーション | コンテキスト問題、反復検索パターン |

---

## 新機能

### v1.10.0 — サーフェスリフレッシュ、オペレーターワークフロー、ECC 2.0 アルファ（2026 年 4 月）

- **ダッシュボード GUI** — Tkinter ベースのデスクトップアプリ（`ecc_dashboard.py` または `npm run dashboard`）を新規追加。ダーク/ライトテーマ切替、フォントカスタマイズ、ヘッダーとタスクバーのプロジェクトロゴに対応。
- **公開サーフェスをライブリポジトリと同期** — メタデータ、カタログ数、プラグインマニフェスト、インストール向けドキュメントが実際の OSS サーフェス（38 エージェント、156 スキル、72 レガシーコマンドシム）と一致。
- **オペレーター・アウトバウンドワークフローの拡張** — `brand-voice`、`social-graph-ranker`、`connections-optimizer`、`customer-billing-ops`、`ecc-tools-cost-audit`、`google-workspace-ops`、`project-flow-ops`、`workspace-surface-audit` がオペレーターレーンを充実。
- **メディア・ローンチツール** — `manim-video`、`remotion-video-creation`、アップグレードされたソーシャル配信サーフェスで、技術解説動画とローンチコンテンツが同じシステムに統合。
- **フレームワーク・プロダクトサーフェスの成長** — `nestjs-patterns`、充実した Codex/OpenCode インストールサーフェス、クロスハーネスパッケージングの拡張で Claude Code 単体にとどまらず利用可能。
- **ECC 2.0 アルファがツリー内に存在** — `ecc2/` の Rust コントロールプレーンプロトタイプがローカルビルド可能で、`dashboard`、`start`、`sessions`、`status`、`stop`、`resume`、`daemon` コマンドを公開。アルファとして利用可能ですが、一般リリースではありません。
- **エコシステム強化** — AgentShield、ECC Tools コストコントロール、課金ポータル作業、Web サイト刷新がコアプラグイン周辺で継続的にリリース。

### v1.9.0 — 選択的インストール & 言語拡張（2026 年 3 月）

- **選択的インストールアーキテクチャ** — `install-plan.js` と `install-apply.js` によるマニフェスト駆動のインストールパイプラインで特定コンポーネントをインストール可能。ステートストアがインストール済みを追跡し増分更新に対応。
- **6 つの新エージェント** — `typescript-reviewer`、`pytorch-build-resolver`、`java-build-resolver`、`java-reviewer`、`kotlin-reviewer`、`kotlin-build-resolver` により 10 言語に拡張。
- **新スキル** — 深層学習向け `pytorch-patterns`、API リファレンス調査向け `documentation-lookup`、モダン JS ツールチェーン向け `bun-runtime` と `nextjs-turbopack`、8 つのオペレーショナルドメインスキル、`mcp-server-patterns` を追加。
- **セッション・ステート基盤** — クエリ CLI を備えた SQLite ステートストア、構造化記録のためのセッションアダプター、自己改善スキルのためのスキル進化基盤。
- **オーケストレーション刷新** — ハーネス監査スコアリングの決定論化、オーケストレーションステータスとランチャー互換性の強化、5 層ガードによるオブザーバーループ防止。
- **オブザーバーの信頼性** — スロットリングとテイルサンプリングによるメモリ爆発の修正、サンドボックスアクセスの修正、遅延起動ロジック、再入可能ガード。
- **12 言語エコシステム** — Java、PHP、Perl、Kotlin/Android/KMP、C++、Rust の新ルールが既存の TypeScript、Python、Go、共通ルールに追加。
- **コミュニティ貢献** — 韓国語・中国語翻訳、biome フック最適化、動画処理スキル、運用スキル、PowerShell インストーラ、Antigravity IDE サポート。
- **CI の強化** — 19 件のテスト失敗修正、カタログ数の強制、インストールマニフェスト検証、テストスイート全通過。

### v1.8.0 — ハーネスパフォーマンスシステム（2026 年 3 月）

- **ハーネスファーストリリース** — ECC は単なる設定パックではなく、エージェントハーネスのパフォーマンスシステムとして明確に位置付け。
- **フック信頼性の刷新** — SessionStart ルートフォールバック、Stop フェーズのセッションサマリ、壊れやすいインラインワンライナーをスクリプトベースフックに置換。
- **フックランタイム制御** — `ECC_HOOK_PROFILE=minimal|standard|strict` と `ECC_DISABLED_HOOKS=...` によりフックファイルを編集せず実行時制御が可能。
- **新ハーネスコマンド** — `/harness-audit`、`/loop-start`、`/loop-status`、`/quality-gate`、`/model-route`。
- **NanoClaw v2** — モデルルーティング、スキルホットロード、セッション branch/search/export/compact/metrics。
- **クロスハーネスパリティ** — Claude Code、Cursor、OpenCode、Codex アプリ/CLI 間で挙動を厳密化。
- **内部テスト 997 件通過** — フック/ランタイムリファクタと互換性アップデート後、フルスイート全通過。

### v1.7.0 — クロスプラットフォーム拡張 & プレゼンテーションビルダー（2026 年 2 月）

- **Codex アプリ + CLI サポート** — `AGENTS.md` ベースの Codex 直接サポート、インストーラターゲット、Codex ドキュメント
- **`frontend-slides` スキル** — 依存ゼロの HTML プレゼンビルダー。PPTX 変換ガイダンスと厳密なビューポートフィットルール付き
- **5 つの汎用ビジネス/コンテンツスキル** — `article-writing`、`content-engine`、`market-research`、`investor-materials`、`investor-outreach`
- **より広いツールカバレッジ** — Cursor、Codex、OpenCode のサポートを強化し、同じリポジトリで主要ハーネス全てに対応
- **内部テスト 992 件** — プラグイン、フック、スキル、パッケージング全体で検証と回帰カバレッジを拡張

### v1.6.0 — Codex CLI、AgentShield & マーケットプレイス（2026 年 2 月）

- **Codex CLI サポート** — 新しい `/codex-setup` コマンドで OpenAI Codex CLI 互換の `codex.md` を生成
- **7 つの新スキル** — `search-first`、`swift-actor-persistence`、`swift-protocol-di-testing`、`regex-vs-llm-structured-text`、`content-hash-cache-pattern`、`cost-aware-llm-pipeline`、`skill-stocktake`
- **AgentShield 統合** — `/security-scan` スキルが Claude Code から AgentShield を直接実行。1282 テスト、102 ルール
- **GitHub マーケットプレイス** — ECC Tools GitHub App を [github.com/marketplace/ecc-tools](https://github.com/marketplace/ecc-tools) で公開。free/pro/enterprise ティア
- **コミュニティ PR 30 件以上マージ** — 6 言語にまたがる 30 名の貢献者による
- **内部テスト 978 件** — エージェント、スキル、コマンド、フック、ルール全体にわたる検証スイート拡張

### v1.4.1 — バグ修正（2026 年 2 月）

- **instinct インポート時のコンテンツ喪失を修正** — `/instinct-import` 実行時に `parse_instinct_file()` が frontmatter 後のコンテンツ（Action、Evidence、Examples セクション）を暗黙的に削除していた問題を修正。（[#148](https://github.com/affaan-m/everything-claude-code/issues/148), [#161](https://github.com/affaan-m/everything-claude-code/pull/161)）

### v1.4.0 — マルチ言語ルール、インストールウィザード & PM2（2026 年 2 月）

- **インタラクティブインストールウィザード** — 新しい `configure-ecc` スキルがマージ/上書き検出付きガイドセットアップを提供
- **PM2 & マルチエージェントオーケストレーション** — 複雑なマルチサービスワークフロー管理用の 6 つの新コマンド（`/pm2`、`/multi-plan`、`/multi-execute`、`/multi-backend`、`/multi-frontend`、`/multi-workflow`）
- **マルチ言語ルールアーキテクチャ** — ルールをフラットファイルから `common/` + `typescript/` + `python/` + `golang/` ディレクトリに再構成。必要な言語のみインストール可能
- **中国語（zh-CN）翻訳** — 全エージェント、コマンド、スキル、ルールの完全翻訳（80+ ファイル）
- **GitHub Sponsors サポート** — GitHub Sponsors 経由でプロジェクトを支援可能
- **強化された CONTRIBUTING.md** — 各貢献タイプ向けの詳細な PR テンプレート

### v1.3.0 — OpenCode プラグイン対応（2026 年 2 月）

- **フル OpenCode 統合** — OpenCode のプラグインシステム（20+ イベントタイプ）でフック対応の 12 エージェント、24 コマンド、16 スキル
- **3 つのネイティブカスタムツール** — run-tests、check-coverage、security-audit
- **LLM ドキュメント** — 包括的な OpenCode ドキュメント用の `llms.txt`

### v1.2.0 — 統合コマンド & スキル（2026 年 2 月）

- **Python/Django サポート** — Django パターン、セキュリティ、TDD、検証スキル
- **Java Spring Boot スキル** — Spring Boot 向けパターン、セキュリティ、TDD、検証
- **セッション管理** — セッション履歴用の `/sessions` コマンド
- **継続的学習 v2** — 信頼度スコアリング、インポート/エクスポート、進化を伴う instinct ベースの学習

完全なチェンジログは [Releases](https://github.com/affaan-m/everything-claude-code/releases) を参照してください。

---

## クイックスタート

2 分以内にセットアップ可能です。

### ステップ 1：プラグインをインストール

> 注記：プラグインは便利ですが、Claude Code のビルドがセルフホスト型マーケットプレイスのエントリ解決に問題を抱える場合、以下の OSS インストーラが最も信頼できる経路です。

```bash
# マーケットプレイスを追加
/plugin marketplace add https://github.com/affaan-m/everything-claude-code

# プラグインをインストール
/plugin install everything-claude-code@everything-claude-code
```

### ネーミングと移行に関する注記

ECC は現在 3 つの公開識別子を持ち、互換性はありません。

- GitHub ソースリポジトリ：`affaan-m/everything-claude-code`
- Claude マーケットプレイス/プラグイン識別子：`everything-claude-code@everything-claude-code`
- npm パッケージ：`ecc-universal`

これは意図的なものです。Anthropic のマーケットプレイス/プラグインインストールは正準プラグイン識別子でキー付けされるため、ECC は `everything-claude-code@everything-claude-code` を標準化し、リスティング名、`/plugin install`、`/plugin list`、リポジトリドキュメントを 1 つの公開インストール面に整合させています。古い投稿には旧略称が残っている場合がありますが、その略称は非推奨です。一方、npm パッケージは `ecc-universal` のままなので、npm インストールとマーケットプレイスインストールは意図的に異なる名前を使用しています。

### ステップ 2：ルールをインストール（必須）

> WARNING: **重要：** Claude Code プラグインは `rules` を自動配布できません。
>
> 既に `/plugin install` で ECC をインストール済みの場合は、**その後に `./install.sh --profile full`、`.\install.ps1 --profile full`、`npx ecc-install --profile full` を実行しないでください**。プラグインは既に ECC のスキル、コマンド、フックを読み込んでいます。プラグインインストール後に full インストーラを実行すると、同じサーフェスがユーザーディレクトリに二重にコピーされ、スキルの重複とランタイム動作の重複が発生する可能性があります。
>
> プラグインインストールの場合は、欲しい `rules/` ディレクトリのみを手動でコピーしてください。プラグイン経路ではなく完全な手動 ECC インストールを行う場合にのみ full インストーラを使用してください。
>
> ローカルの Claude セットアップが消去・リセットされた場合でも ECC を再購入する必要はありません。まず `ecc list-installed` を実行し、その後 `ecc doctor` と `ecc repair` を実行してから再インストールを検討してください。これで通常は ECC 管理のファイルを再構築せずに復旧します。ECC Tools のアカウントやマーケットプレイスアクセスの問題は、別途請求/アカウント復旧で対応してください。

```bash
# まずリポジトリをクローン
git clone https://github.com/affaan-m/everything-claude-code.git
cd everything-claude-code

# 依存関係をインストール（お好みのパッケージマネージャを選択）
npm install        # または: pnpm install | yarn install | bun install

# プラグインインストール経路：ルールのみコピー
mkdir -p ~/.claude/rules
cp -R rules/common ~/.claude/rules/
cp -R rules/typescript ~/.claude/rules/

# 完全な手動 ECC インストール経路（/plugin install の代わりにこちらを使用）
# ./install.sh --profile full
```

```powershell
# Windows PowerShell

# プラグインインストール経路：ルールのみコピー
New-Item -ItemType Directory -Force -Path "$HOME/.claude/rules" | Out-Null
Copy-Item -Recurse rules/common "$HOME/.claude/rules/"
Copy-Item -Recurse rules/typescript "$HOME/.claude/rules/"

# 完全な手動 ECC インストール経路（/plugin install の代わりにこちらを使用）
# .\install.ps1 --profile full
# npx ecc-install --profile full
```

手動インストールの詳細は `rules/` フォルダ内の README を参照してください。ルールを手動コピーする場合は、ディレクトリ内のファイルではなく言語ディレクトリ全体（例：`rules/common` や `rules/golang`）をコピーし、相対参照が機能しファイル名衝突を避けられるようにしてください。

### ステップ 3：使用開始

```bash
# スキルが主要なワークフロー面です。
# ECC が commands/ から移行中も、既存のスラッシュスタイルのコマンド名は引き続き動作します。

# プラグインインストールは名前空間形式を使用
/ecc:plan "ユーザー認証を追加"

# 手動インストールは短縮形を維持：
# /plan "ユーザー認証を追加"

# 利用可能なコマンドを確認
/plugin list everything-claude-code@everything-claude-code
```

**これで完了です！** 48 エージェント、183 スキル、79 レガシーコマンドシムが利用可能になります。

### ダッシュボード GUI

デスクトップダッシュボードを起動して ECC コンポーネントを視覚的に探索できます。

```bash
npm run dashboard
# または
python3 ./ecc_dashboard.py
```

**機能：**
- タブ式インターフェース：エージェント、スキル、コマンド、ルール、設定
- ダーク/ライトテーマ切替
- フォントカスタマイズ（ファミリー & サイズ）
- ヘッダーとタスクバーのプロジェクトロゴ
- 全コンポーネントを横断する検索・フィルター

### マルチモデルコマンドには追加セットアップが必要

> WARNING: `multi-*` コマンドは上記のベースプラグイン/ルールインストールには**含まれません**。
>
> `/multi-plan`、`/multi-execute`、`/multi-backend`、`/multi-frontend`、`/multi-workflow` を使用するには、`ccg-workflow` ランタイムも追加インストールしてください。
>
> `npx ccg-workflow` で初期化します。
>
> このランタイムがこれらのコマンドに必要な外部依存関係を提供します：
> - `~/.claude/bin/codeagent-wrapper`
> - `~/.claude/.ccg/prompts/*`
>
> `ccg-workflow` がないとこれらの `multi-*` コマンドは正しく動作しません。

---

## クロスプラットフォームサポート

このプラグインは **Windows、macOS、Linux** を完全サポートし、主要 IDE（Cursor、OpenCode、Antigravity）と CLI ハーネスとのタイトな統合を提供します。全てのフックとスクリプトは互換性最大化のため Node.js で書き直されています。

### パッケージマネージャー検出

プラグインは以下の優先順で好みのパッケージマネージャー（npm、pnpm、yarn、bun）を自動検出します。

1. **環境変数**：`CLAUDE_PACKAGE_MANAGER`
2. **プロジェクト設定**：`.claude/package-manager.json`
3. **package.json**：`packageManager` フィールド
4. **ロックファイル**：package-lock.json、yarn.lock、pnpm-lock.yaml、bun.lockb から検出
5. **グローバル設定**：`~/.claude/package-manager.json`
6. **フォールバック**：最初に利用可能なパッケージマネージャー

好みのパッケージマネージャーを設定するには：

```bash
# 環境変数経由
export CLAUDE_PACKAGE_MANAGER=pnpm

# グローバル設定経由
node scripts/setup-package-manager.js --global pnpm

# プロジェクト設定経由
node scripts/setup-package-manager.js --project bun

# 現在の設定を検出
node scripts/setup-package-manager.js --detect
```

または Claude Code 内で `/setup-pm` コマンドを使用してください。

### フックランタイム制御

ランタイムフラグで厳格度を調整したり、一時的に特定のフックを無効化できます。

```bash
# フック厳格度プロファイル（デフォルト：standard）
export ECC_HOOK_PROFILE=standard

# 無効化するフック ID をカンマ区切りで指定
export ECC_DISABLED_HOOKS="pre:bash:tmux-reminder,post:edit:typecheck"
```

---

## 含まれるもの

このリポジトリは **Claude Code プラグイン** です。直接インストールするか、コンポーネントを手動コピーできます。

```
everything-claude-code/
|-- .claude-plugin/   # プラグイン & マーケットプレイスマニフェスト
|   |-- plugin.json         # プラグインメタデータとコンポーネントパス
|   |-- marketplace.json    # /plugin marketplace add 用マーケットプレイスカタログ
|
|-- agents/           # 委譲用の 36 の専門サブエージェント
|   |-- planner.md           # 機能実装計画
|   |-- architect.md         # システム設計決定
|   |-- tdd-guide.md         # テスト駆動開発
|   |-- code-reviewer.md     # 品質・セキュリティレビュー
|   |-- security-reviewer.md # 脆弱性分析
|   |-- build-error-resolver.md
|   |-- e2e-runner.md        # Playwright E2E テスト
|   |-- refactor-cleaner.md  # デッドコード削除
|   |-- doc-updater.md       # ドキュメント同期
|   |-- docs-lookup.md       # ドキュメント/API 参照
|   |-- chief-of-staff.md    # コミュニケーション振り分けとドラフト
|   |-- loop-operator.md     # 自律ループ実行
|   |-- harness-optimizer.md # ハーネス設定チューニング
|   |-- cpp-reviewer.md      # C++ コードレビュー
|   |-- cpp-build-resolver.md # C++ ビルドエラー解決
|   |-- go-reviewer.md       # Go コードレビュー
|   |-- go-build-resolver.md # Go ビルドエラー解決
|   |-- python-reviewer.md   # Python コードレビュー
|   |-- database-reviewer.md # データベース/Supabase レビュー
|   |-- typescript-reviewer.md # TypeScript/JavaScript コードレビュー
|   |-- java-reviewer.md     # Java/Spring Boot コードレビュー
|   |-- java-build-resolver.md # Java/Maven/Gradle ビルドエラー
|   |-- kotlin-reviewer.md   # Kotlin/Android/KMP コードレビュー
|   |-- kotlin-build-resolver.md # Kotlin/Gradle ビルドエラー
|   |-- rust-reviewer.md     # Rust コードレビュー
|   |-- rust-build-resolver.md # Rust ビルドエラー解決
|   |-- pytorch-build-resolver.md # PyTorch/CUDA トレーニングエラー
|
|-- skills/           # ワークフロー定義とドメイン知識
|   |-- coding-standards/           # 言語ベストプラクティス
|   |-- clickhouse-io/              # ClickHouse 分析、クエリ、データエンジニアリング
|   |-- backend-patterns/           # API、データベース、キャッシュパターン
|   |-- frontend-patterns/          # React、Next.js パターン
|   |-- frontend-slides/            # HTML スライドデッキと PPTX → Web プレゼンワークフロー (NEW)
|   |-- article-writing/            # 指定ボイスでの長文執筆、汎用 AI 調回避 (NEW)
|   |-- content-engine/             # マルチプラットフォーム SNS コンテンツと再利用ワークフロー (NEW)
|   |-- market-research/            # 出典付き市場・競合・投資家リサーチ (NEW)
|   |-- investor-materials/         # ピッチデッキ、ワンペーパー、メモ、財務モデル (NEW)
|   |-- investor-outreach/          # パーソナライズされた資金調達アウトリーチとフォローアップ (NEW)
|   |-- continuous-learning/        # レガシー v1 Stop フックパターン抽出
|   |-- continuous-learning-v2/     # 信頼度スコアリングによる instinct ベース学習
|   |-- iterative-retrieval/        # サブエージェント向け段階的コンテキスト精緻化
|   |-- strategic-compact/          # 手動圧縮提案（長文ガイド）
|   |-- tdd-workflow/               # TDD 手法
|   |-- security-review/            # セキュリティチェックリスト
|   |-- eval-harness/               # 検証ループ評価（長文ガイド）
|   |-- verification-loop/          # 継続的検証（長文ガイド）
|   |-- videodb/                   # 動画・音声：取り込み、検索、編集、生成、配信 (NEW)
|   |-- golang-patterns/            # Go イディオムとベストプラクティス
|   |-- golang-testing/             # Go テストパターン、TDD、ベンチマーク
|   |-- cpp-coding-standards/         # C++ Core Guidelines 準拠の C++ コーディング標準 (NEW)
|   |-- cpp-testing/                # GoogleTest、CMake/CTest による C++ テスト (NEW)
|   |-- django-patterns/            # Django パターン、モデル、ビュー (NEW)
|   |-- django-security/            # Django セキュリティベストプラクティス (NEW)
|   |-- django-tdd/                 # Django TDD ワークフロー (NEW)
|   |-- django-verification/        # Django 検証ループ (NEW)
|   |-- laravel-patterns/           # Laravel アーキテクチャパターン (NEW)
|   |-- laravel-security/           # Laravel セキュリティベストプラクティス (NEW)
|   |-- laravel-tdd/                # Laravel TDD ワークフロー (NEW)
|   |-- laravel-verification/       # Laravel 検証ループ (NEW)
|   |-- python-patterns/            # Python イディオムとベストプラクティス (NEW)
|   |-- python-testing/             # pytest による Python テスト (NEW)
|   |-- springboot-patterns/        # Java Spring Boot パターン (NEW)
|   |-- springboot-security/        # Spring Boot セキュリティ (NEW)
|   |-- springboot-tdd/             # Spring Boot TDD (NEW)
|   |-- springboot-verification/    # Spring Boot 検証 (NEW)
|   |-- configure-ecc/              # インタラクティブインストールウィザード (NEW)
|   |-- security-scan/              # AgentShield セキュリティ監査統合 (NEW)
|   |-- java-coding-standards/     # Java コーディング標準 (NEW)
|   |-- jpa-patterns/              # JPA/Hibernate パターン (NEW)
|   |-- postgres-patterns/         # PostgreSQL 最適化パターン (NEW)
|   |-- nutrient-document-processing/ # Nutrient API による文書処理 (NEW)
|   |-- docs/examples/project-guidelines-template.md  # プロジェクト固有スキル用テンプレート
|   |-- database-migrations/         # マイグレーションパターン（Prisma、Drizzle、Django、Go）(NEW)
|   |-- api-design/                  # REST API 設計、ページネーション、エラーレスポンス (NEW)
|   |-- deployment-patterns/         # CI/CD、Docker、ヘルスチェック、ロールバック (NEW)
|   |-- docker-patterns/            # Docker Compose、ネットワーキング、ボリューム、コンテナセキュリティ (NEW)
|   |-- e2e-testing/                 # Playwright E2E パターンと Page Object Model (NEW)
|   |-- content-hash-cache-pattern/  # ファイル処理向け SHA-256 コンテンツハッシュキャッシュ (NEW)
|   |-- cost-aware-llm-pipeline/     # LLM コスト最適化、モデルルーティング、予算追跡 (NEW)
|   |-- regex-vs-llm-structured-text/ # テキスト解析の選択フレームワーク：regex vs LLM (NEW)
|   |-- swift-actor-persistence/     # アクターによるスレッドセーフ Swift データ永続化 (NEW)
|   |-- swift-protocol-di-testing/   # テスト可能な Swift コードのためのプロトコルベース DI (NEW)
|   |-- search-first/               # コーディング前にリサーチするワークフロー (NEW)
|   |-- skill-stocktake/            # 品質のためのスキル・コマンド監査 (NEW)
|   |-- liquid-glass-design/         # iOS 26 Liquid Glass デザインシステム (NEW)
|   |-- foundation-models-on-device/ # FoundationModels による Apple オンデバイス LLM (NEW)
|   |-- swift-concurrency-6-2/       # Swift 6.2 Approachable Concurrency (NEW)
|   |-- perl-patterns/             # モダン Perl 5.36+ イディオムとベストプラクティス (NEW)
|   |-- perl-security/             # Perl セキュリティパターン、taint モード、安全 I/O (NEW)
|   |-- perl-testing/              # Test2::V0、prove、Devel::Cover による Perl TDD (NEW)
|   |-- autonomous-loops/           # 自律ループパターン：逐次パイプライン、PR ループ、DAG オーケストレーション (NEW)
|   |-- plankton-code-quality/      # Plankton フックによる書込時コード品質強制 (NEW)
|
|-- commands/         # レガシースラッシュエントリシム；skills/ を優先
|   |-- tdd.md              # /tdd - テスト駆動開発
|   |-- plan.md             # /plan - 実装計画
|   |-- e2e.md              # /e2e - E2E テスト生成
|   |-- code-review.md      # /code-review - 品質レビュー
|   |-- build-fix.md        # /build-fix - ビルドエラー修正
|   |-- refactor-clean.md   # /refactor-clean - デッドコード削除
|   |-- learn.md            # /learn - セッション中にパターン抽出（長文ガイド）
|   |-- learn-eval.md       # /learn-eval - パターンを抽出、評価、保存 (NEW)
|   |-- checkpoint.md       # /checkpoint - 検証状態を保存（長文ガイド）
|   |-- verify.md           # /verify - 検証ループ実行（長文ガイド）
|   |-- setup-pm.md         # /setup-pm - パッケージマネージャー設定
|   |-- go-review.md        # /go-review - Go コードレビュー (NEW)
|   |-- go-test.md          # /go-test - Go TDD ワークフロー (NEW)
|   |-- go-build.md         # /go-build - Go ビルドエラー修正 (NEW)
|   |-- skill-create.md     # /skill-create - git 履歴からスキル生成 (NEW)
|   |-- instinct-status.md  # /instinct-status - 学習済み instinct 表示 (NEW)
|   |-- instinct-import.md  # /instinct-import - instinct インポート (NEW)
|   |-- instinct-export.md  # /instinct-export - instinct エクスポート (NEW)
|   |-- evolve.md           # /evolve - instinct をスキルにクラスター化
|   |-- prune.md            # /prune - 期限切れ pending instinct 削除 (NEW)
|   |-- pm2.md              # /pm2 - PM2 サービスライフサイクル管理 (NEW)
|   |-- multi-plan.md       # /multi-plan - マルチエージェントタスク分解 (NEW)
|   |-- multi-execute.md    # /multi-execute - オーケストレーション済マルチエージェントワークフロー (NEW)
|   |-- multi-backend.md    # /multi-backend - バックエンドマルチサービスオーケストレーション (NEW)
|   |-- multi-frontend.md   # /multi-frontend - フロントエンドマルチサービスオーケストレーション (NEW)
|   |-- multi-workflow.md   # /multi-workflow - 汎用マルチサービスワークフロー (NEW)
|   |-- orchestrate.md      # /orchestrate - マルチエージェント調整
|   |-- sessions.md         # /sessions - セッション履歴管理
|   |-- eval.md             # /eval - 基準に対する評価
|   |-- test-coverage.md    # /test-coverage - テストカバレッジ分析
|   |-- update-docs.md      # /update-docs - ドキュメント更新
|   |-- update-codemaps.md  # /update-codemaps - コードマップ更新
|   |-- python-review.md    # /python-review - Python コードレビュー (NEW)
|
|-- rules/            # 常に従うガイドライン（~/.claude/rules/ にコピー）
|   |-- README.md            # 構造概要とインストールガイド
|   |-- common/              # 言語非依存の原則
|   |   |-- coding-style.md    # 不変性、ファイル構成
|   |   |-- git-workflow.md    # コミット形式、PR プロセス
|   |   |-- testing.md         # TDD、80% カバレッジ要件
|   |   |-- performance.md     # モデル選択、コンテキスト管理
|   |   |-- patterns.md        # デザインパターン、スケルトンプロジェクト
|   |   |-- hooks.md           # フックアーキテクチャ、TodoWrite
|   |   |-- agents.md          # サブエージェントに委譲するタイミング
|   |   |-- security.md        # 必須セキュリティチェック
|   |-- typescript/          # TypeScript/JavaScript 固有
|   |-- python/              # Python 固有
|   |-- golang/              # Go 固有
|   |-- swift/               # Swift 固有
|   |-- php/                 # PHP 固有 (NEW)
|
|-- hooks/            # トリガーベース自動化
|   |-- README.md                 # フックドキュメント、レシピ、カスタマイズガイド
|   |-- hooks.json                # 全フック設定（PreToolUse、PostToolUse、Stop など）
|   |-- memory-persistence/       # セッションライフサイクルフック（長文ガイド）
|   |-- strategic-compact/        # 圧縮提案（長文ガイド）
|
|-- scripts/          # クロスプラットフォーム Node.js スクリプト (NEW)
|   |-- lib/                     # 共有ユーティリティ
|   |   |-- utils.js             # クロスプラットフォームファイル/パス/システムユーティリティ
|   |   |-- package-manager.js   # パッケージマネージャー検出と選択
|   |-- hooks/                   # フック実装
|   |   |-- session-start.js     # セッション開始時にコンテキストを読み込み
|   |   |-- session-end.js       # セッション終了時に状態を保存
|   |   |-- pre-compact.js       # 圧縮前の状態保存
|   |   |-- suggest-compact.js   # 戦略的圧縮提案
|   |   |-- evaluate-session.js  # セッションからパターン抽出
|   |-- setup-package-manager.js # インタラクティブ PM セットアップ
|
|-- tests/            # テストスイート (NEW)
|   |-- lib/                     # ライブラリテスト
|   |-- hooks/                   # フックテスト
|   |-- run-all.js               # 全テスト実行
|
|-- contexts/         # 動的システムプロンプト注入コンテキスト（長文ガイド）
|   |-- dev.md              # 開発モードコンテキスト
|   |-- review.md           # コードレビューモードコンテキスト
|   |-- research.md         # 調査/探索モードコンテキスト
|
|-- examples/         # 設定とセッション例
|   |-- CLAUDE.md             # プロジェクトレベル設定例
|   |-- user-CLAUDE.md        # ユーザーレベル設定例
|   |-- saas-nextjs-CLAUDE.md   # 実世界 SaaS（Next.js + Supabase + Stripe）
|   |-- go-microservice-CLAUDE.md # 実世界 Go マイクロサービス（gRPC + PostgreSQL）
|   |-- django-api-CLAUDE.md      # 実世界 Django REST API（DRF + Celery）
|   |-- laravel-api-CLAUDE.md     # 実世界 Laravel API（PostgreSQL + Redis）(NEW)
|   |-- rust-api-CLAUDE.md        # 実世界 Rust API（Axum + SQLx + PostgreSQL）(NEW)
|
|-- mcp-configs/      # MCP サーバー設定
|   |-- mcp-servers.json    # GitHub、Supabase、Vercel、Railway など
|
|-- ecc_dashboard.py  # デスクトップ GUI ダッシュボード（Tkinter）
|
|-- assets/           # ダッシュボード用アセット
|   |-- images/
|       |-- ecc-logo.png
|
|-- marketplace.json  # セルフホスト型マーケットプレイス設定（/plugin marketplace add 用）
```

---

## エコシステムツール

### スキルクリエーター

リポジトリから Claude Code スキルを生成する 2 つの方法：

#### オプション A：ローカル分析（ビルトイン）

外部サービス不要で `/skill-create` コマンドによるローカル分析を使用：

```bash
/skill-create                    # 現在のリポジトリを分析
/skill-create --instincts        # continuous-learning-v2 用の instinct も生成
```

git 履歴をローカルで分析して SKILL.md ファイルを生成します。

#### オプション B：GitHub アプリ（高度）

高度な機能（10k+ コミット、自動 PR、チーム共有）向け：

[GitHub App をインストール](https://github.com/apps/skill-creator) | [ecc.tools](https://ecc.tools)

```bash
# 任意の Issue にコメント：
/skill-creator analyze

# またはデフォルトブランチへのプッシュで自動トリガー
```

どちらのオプションも以下を作成します：
- **SKILL.md ファイル** - Claude Code ですぐ使えるスキル
- **instinct コレクション** - continuous-learning-v2 用
- **パターン抽出** - コミット履歴から学習

### AgentShield — セキュリティ監査

> Claude Code ハッカソン（Cerebral Valley x Anthropic、2026 年 2 月）で構築。1282 テスト、カバレッジ 98%、静的解析ルール 102。

Claude Code 設定をスキャンして脆弱性、誤設定、インジェクションリスクを検出します。

```bash
# クイックスキャン（インストール不要）
npx ecc-agentshield scan

# 安全な問題を自動修正
npx ecc-agentshield scan --fix

# 3 つの Opus 4.6 エージェントによる深い分析
npx ecc-agentshield scan --opus --stream

# ゼロから安全な設定を生成
npx ecc-agentshield init
```

**スキャン対象：** CLAUDE.md、settings.json、MCP 設定、フック、エージェント定義、スキルを 5 カテゴリでチェック — シークレット検出（14 パターン）、権限監査、フックインジェクション分析、MCP サーバーリスクプロファイリング、エージェント設定レビュー。

**`--opus` フラグ** は Claude Opus 4.6 エージェント 3 体をレッドチーム/ブルーチーム/監査役のパイプラインで実行します。攻撃者がエクスプロイトチェーンを発見し、守備側が保護を評価し、監査役が両者を統合して優先度付きリスク評価を作成します。パターンマッチではなく敵対的推論です。

**出力形式：** ターミナル（カラーグレード A〜F）、JSON（CI パイプライン）、Markdown、HTML。重大な発見時は終了コード 2 でビルドゲートに使えます。

Claude Code では `/security-scan` で実行するか、[GitHub Action](https://github.com/affaan-m/agentshield) で CI に組み込んでください。

[GitHub](https://github.com/affaan-m/agentshield) | [npm](https://www.npmjs.com/package/ecc-agentshield)

### 継続的学習 v2

instinct ベースの学習システムがあなたのパターンを自動学習します：

```bash
/instinct-status        # 信頼度付きで学習済み instinct を表示
/instinct-import <file> # 他者から instinct をインポート
/instinct-export        # instinct を共有用にエクスポート
/evolve                 # 関連 instinct をスキルにクラスター化
```

詳細は `skills/continuous-learning-v2/` を参照してください。
`continuous-learning/` はレガシー v1 Stop フックによる学習スキルフローを明示的に使いたい場合にのみ保持してください。

---

## 要件

### Claude Code CLI バージョン

**最低バージョン：v2.1.0 以降**

このプラグインはプラグインシステムのフック処理変更のため Claude Code CLI v2.1.0+ を必要とします。

バージョン確認：
```bash
claude --version
```

### 重要：フック自動読み込み挙動

> WARNING: **コントリビューターの方へ：** `.claude-plugin/plugin.json` に `"hooks"` フィールドを追加しないでください。回帰テストで強制されています。

Claude Code v2.1+ は**規約により**任意のインストール済プラグインから `hooks/hooks.json` を**自動読み込み**します。`plugin.json` で明示的に宣言すると重複検出エラーが発生します：

```
Duplicate hooks file detected: ./hooks/hooks.json resolves to already-loaded file
```

**経緯：** このリポジトリで何度も fix/revert サイクルが発生しました（[#29](https://github.com/affaan-m/everything-claude-code/issues/29)、[#52](https://github.com/affaan-m/everything-claude-code/issues/52)、[#103](https://github.com/affaan-m/everything-claude-code/issues/103)）。Claude Code のバージョン間で挙動が変わり混乱を招いたため、回帰テストを追加して再発を防止しています。

---

## インストール

### オプション 1：プラグインとしてインストール（推奨）

最も簡単な方法 — Claude Code プラグインとしてインストールします：

```bash
# このリポジトリをマーケットプレイスとして追加
/plugin marketplace add https://github.com/affaan-m/everything-claude-code

# プラグインをインストール
/plugin install everything-claude-code@everything-claude-code
```

または `~/.claude/settings.json` に直接追加：

```json
{
  "extraKnownMarketplaces": {
    "ecc": {
      "source": {
        "source": "github",
        "repo": "affaan-m/everything-claude-code"
      }
    }
  },
  "enabledPlugins": {
    "everything-claude-code@everything-claude-code": true
  }
}
```

これで全てのコマンド、エージェント、スキル、フックが即座に利用可能になります。

> **注記：** Claude Code プラグインシステムはプラグイン経由での `rules` 配布をサポートしません（[上流の制限](https://code.claude.com/docs/en/plugins-reference)）。ルールは手動でインストールする必要があります：
>
> ```bash
> # まずリポジトリをクローン
> git clone https://github.com/affaan-m/everything-claude-code.git
>
> # オプション A：ユーザーレベルルール（全プロジェクトに適用）
> mkdir -p ~/.claude/rules
> cp -r everything-claude-code/rules/common ~/.claude/rules/
> cp -r everything-claude-code/rules/typescript ~/.claude/rules/   # スタックを選択
> cp -r everything-claude-code/rules/python ~/.claude/rules/
> cp -r everything-claude-code/rules/golang ~/.claude/rules/
> cp -r everything-claude-code/rules/php ~/.claude/rules/
>
> # オプション B：プロジェクトレベルルール（現在のプロジェクトのみ適用）
> mkdir -p .claude/rules
> cp -r everything-claude-code/rules/common .claude/rules/
> cp -r everything-claude-code/rules/typescript .claude/rules/     # スタックを選択
> ```

---

### オプション 2：手動インストール

インストール内容を手動で制御したい場合：

```bash
# リポジトリをクローン
git clone https://github.com/affaan-m/everything-claude-code.git

# エージェントを Claude 設定にコピー
cp everything-claude-code/agents/*.md ~/.claude/agents/

# ルールディレクトリ（共通 + 言語固有）をコピー
mkdir -p ~/.claude/rules
cp -r everything-claude-code/rules/common ~/.claude/rules/
cp -r everything-claude-code/rules/typescript ~/.claude/rules/   # スタックを選択
cp -r everything-claude-code/rules/python ~/.claude/rules/
cp -r everything-claude-code/rules/golang ~/.claude/rules/
cp -r everything-claude-code/rules/php ~/.claude/rules/

# スキルを先にコピー（主要ワークフロー面）
# 推奨（新規ユーザー）：コア/汎用スキルのみ
cp -r everything-claude-code/.agents/skills/* ~/.claude/skills/
cp -r everything-claude-code/skills/search-first ~/.claude/skills/

# オプション：ニッチ/フレームワーク固有スキルは必要な時だけ追加
# for s in django-patterns django-tdd laravel-patterns springboot-patterns; do
# cp -r everything-claude-code/skills/$s ~/.claude/skills/
# done

# オプション：移行中にレガシースラッシュコマンド互換を維持
mkdir -p ~/.claude/commands
cp everything-claude-code/commands/*.md ~/.claude/commands/
```

#### フックをインストール

`hooks/hooks.json` を `~/.claude/settings.json` や `~/.claude/hooks/hooks.json` にそのままコピーしないでください。このファイルはプラグイン/リポジトリ向けで、ECC インストーラまたはプラグインとして読み込む前提のため、生コピーはサポートされた手動インストール経路ではありません。

コマンドパスが正しく書き換えられるよう、Claude フックランタイムのみをインストーラでインストールしてください：

```bash
# macOS / Linux
bash ./install.sh --target claude --modules hooks-runtime
```

```powershell
# Windows PowerShell
pwsh -File .\install.ps1 --target claude --modules hooks-runtime
```

これにより解決済みフックが `~/.claude/hooks/hooks.json` に書き込まれ、既存の `~/.claude/settings.json` には手を加えません。

`/plugin install` 経由で ECC をインストールした場合、それらのフックを `settings.json` にコピーしないでください。Claude Code v2.1+ はプラグインの `hooks/hooks.json` を既に自動読み込みしており、`settings.json` に重複させると実行が重複しクロスプラットフォームフック競合が起きます。

Windows 注意：Claude 設定ディレクトリは `~/claude` ではなく `%USERPROFILE%\\.claude` です。

#### MCP を設定

`mcp-configs/mcp-servers.json` から必要な MCP サーバー定義を公式 Claude Code 設定 `~/.claude/settings.json` にコピーするか、リポジトリローカルな MCP アクセスを希望する場合はプロジェクトスコープの `.mcp.json` にコピーしてください。

自分で ECC 同梱の MCP のコピーを既に実行している場合は以下を設定してください：

```bash
export ECC_DISABLED_MCPS="github,context7,exa,playwright,sequential-thinking,memory"
```

ECC 管理のインストールと Codex 同期フローは重複を避けてこれら同梱サーバーをスキップまたは削除します。

**重要：** `YOUR_*_HERE` プレースホルダーを実際の API キーに置き換えてください。

---

## 主要概念

### エージェント

サブエージェントは限定スコープで委譲タスクを処理します。例：

```markdown
---
name: code-reviewer
description: Reviews code for quality, security, and maintainability
tools: ["Read", "Grep", "Glob", "Bash"]
model: opus
---

You are a senior code reviewer...
```

### スキル

スキルは主要なワークフロー面です。直接起動、自動提案、エージェントによる再利用が可能です。ECC は移行期間中 `commands/` も出荷しますが、新しいワークフロー開発は `skills/` に先に追加してください。

```markdown
# TDD Workflow

1. インターフェースをまず定義
2. 失敗するテストを書く（RED）
3. 最小限のコードを実装（GREEN）
4. リファクタ（IMPROVE）
5. 80%+ カバレッジを検証
```

### フック

フックはツールイベントで発火します。例 — console.log を警告：

```json
{
  "matcher": "tool == \"Edit\" && tool_input.file_path matches \"\\\\.(ts|tsx|js|jsx)$\"",
  "hooks": [{
    "type": "command",
    "command": "#!/bin/bash\ngrep -n 'console\\.log' \"$file_path\" && echo '[Hook] Remove console.log' >&2"
  }]
}
```

### ルール

ルールは常に従うガイドラインで、`common/`（言語非依存）+ 言語固有ディレクトリに整理されます：

```
rules/
  common/          # 普遍的原則（常にインストール）
  typescript/      # TS/JS 固有のパターンとツール
  python/          # Python 固有のパターンとツール
  golang/          # Go 固有のパターンとツール
  swift/           # Swift 固有のパターンとツール
  php/             # PHP 固有のパターンとツール
```

インストールと構造の詳細は [`rules/README.md`](../../rules/README.md) を参照してください。

---

## どのエージェントを使うべき？

どこから始めるか迷ったらこのクイックリファレンスを使ってください。スキルが正準のワークフロー面で、以下のスラッシュエントリは多くのユーザーが既知の互換形式です。

| やりたいこと | このコマンドを使う | 使用エージェント |
|--------------|-----------------|------------|
| 新機能を計画 | `/ecc:plan "認証を追加"` | planner |
| システム設計 | `/ecc:plan` + architect エージェント | architect |
| テストファーストでコードを書く | `/tdd` | tdd-guide |
| 書いたコードをレビュー | `/code-review` | code-reviewer |
| 失敗するビルドを修正 | `/build-fix` | build-error-resolver |
| E2E テストを実行 | `/e2e` | e2e-runner |
| セキュリティ脆弱性を見つける | `/security-scan` | security-reviewer |
| デッドコード削除 | `/refactor-clean` | refactor-cleaner |
| ドキュメント更新 | `/update-docs` | doc-updater |
| Go コードレビュー | `/go-review` | go-reviewer |
| Python コードレビュー | `/python-review` | python-reviewer |
| TypeScript/JavaScript コードレビュー | *(`typescript-reviewer` を直接呼び出し)* | typescript-reviewer |
| DB クエリ監査 | *(自動委譲)* | database-reviewer |

### 一般的なワークフロー

以下のスラッシュ形式はまだ最速で馴染みのあるエントリポイントのため掲載しています。内部では、ECC はこれらのワークフローをスキルファースト定義にシフトしています。

**新機能を開始：**
```
/ecc:plan "OAuth によるユーザー認証を追加"
                                              → planner が実装ブループリントを作成
/tdd                                          → tdd-guide がテストファーストを強制
/code-review                                  → code-reviewer が作業を確認
```

**バグ修正：**
```
/tdd                                          → tdd-guide：バグを再現する失敗テストを書く
                                              → 修正を実装し、テストが通ることを確認
/code-review                                  → code-reviewer：回帰を検出
```

**本番準備：**
```
/security-scan                                → security-reviewer：OWASP Top 10 監査
/e2e                                          → e2e-runner：重要ユーザーフローテスト
/test-coverage                                → 80%+ カバレッジを検証
```

---

## FAQ

<details>
<summary><b>インストール済みのエージェント/コマンドを確認するには？</b></summary>

```bash
/plugin list everything-claude-code@everything-claude-code
```

これでプラグインから利用可能な全エージェント、コマンド、スキルを表示します。
</details>

<details>
<summary><b>フックが動かない / "Duplicate hooks file" エラーが出る</b></summary>

これは最も一般的な問題です。**`.claude-plugin/plugin.json` に `"hooks"` フィールドを追加しないでください。** Claude Code v2.1+ はインストール済プラグインから `hooks/hooks.json` を自動読み込みします。明示的に宣言すると重複検出エラーが発生します。[#29](https://github.com/affaan-m/everything-claude-code/issues/29)、[#52](https://github.com/affaan-m/everything-claude-code/issues/52)、[#103](https://github.com/affaan-m/everything-claude-code/issues/103) を参照。
</details>

<details>
<summary><b>ECC はカスタム API エンドポイントやモデルゲートウェイ上の Claude Code で使えますか？</b></summary>

はい。ECC は Anthropic ホスト型のトランスポート設定をハードコードしません。Claude Code の通常の CLI/プラグイン面を通じてローカルで動作するため、以下で動作します：

- Anthropic ホスト型 Claude Code
- `ANTHROPIC_BASE_URL` と `ANTHROPIC_AUTH_TOKEN` を使用した公式 Claude Code ゲートウェイ設定
- Claude Code が期待する Anthropic API に互換性のあるカスタムエンドポイント

最小例：

```bash
export ANTHROPIC_BASE_URL=https://your-gateway.example.com
export ANTHROPIC_AUTH_TOKEN=your-token
claude
```

ゲートウェイがモデル名をリマップする場合は、ECC ではなく Claude Code 側で設定してください。ECC のフック、スキル、コマンド、ルールは、`claude` CLI が既に動作していればモデルプロバイダーに依存しません。

公式リファレンス：
- [Claude Code LLM ゲートウェイドキュメント](https://docs.anthropic.com/en/docs/claude-code/llm-gateway)
- [Claude Code モデル設定ドキュメント](https://docs.anthropic.com/en/docs/claude-code/model-config)

</details>

<details>
<summary><b>コンテキストウィンドウが縮んでいる / Claude がコンテキスト不足になる</b></summary>

MCP サーバーが多すぎるとコンテキストを消費します。各 MCP ツール記述は 200k ウィンドウからトークンを消費し、~70k まで削る可能性があります。

**修正：** プロジェクトごとに未使用 MCP を無効化：
```json
// プロジェクトの .claude/settings.json 内
{
  "disabledMcpServers": ["supabase", "railway", "vercel"]
}
```

有効な MCP は 10 個未満、アクティブなツールは 80 未満に保ってください。
</details>

<details>
<summary><b>一部のコンポーネント（例：エージェントのみ）だけ使えますか？</b></summary>

はい。オプション 2（手動インストール）を使って必要なものだけコピーしてください：

```bash
# エージェントのみ
cp everything-claude-code/agents/*.md ~/.claude/agents/

# ルールのみ
mkdir -p ~/.claude/rules/
cp -r everything-claude-code/rules/common ~/.claude/rules/
```

各コンポーネントは完全に独立しています。
</details>

<details>
<summary><b>Cursor / OpenCode / Codex / Antigravity で動きますか？</b></summary>

はい。ECC はクロスプラットフォームです：
- **Cursor**：`.cursor/` に事前翻訳済み設定。[Cursor IDE サポート](#cursor-ide-サポート)参照。
- **Gemini CLI**：`.gemini/GEMINI.md` と共通インストーラ配管による実験的プロジェクトローカルサポート。
- **OpenCode**：`.opencode/` でフルプラグインサポート。[OpenCode サポート](#opencode-サポート)参照。
- **Codex**：アダプタードリフトガードと SessionStart フォールバックを備え、macOS アプリと CLI 両方にファーストクラスサポート。PR [#257](https://github.com/affaan-m/everything-claude-code/pull/257) 参照。
- **Antigravity**：`.agent/` にワークフロー、スキル、フラット化ルールのタイトな統合セットアップ。[Antigravity ガイド](../ANTIGRAVITY-GUIDE.md)参照。
- **ネイティブ非対応ハーネス**：Grok などのインターフェース向け手動フォールバック経路。[手動適応ガイド](../MANUAL-ADAPTATION-GUIDE.md)参照。
- **Claude Code**：ネイティブ — 主要ターゲットです。
</details>

<details>
<summary><b>新しいスキルやエージェントを貢献するには？</b></summary>

[CONTRIBUTING.md](../../CONTRIBUTING.md) を参照してください。要点：
1. リポジトリを Fork
2. `skills/your-skill-name/SKILL.md`（YAML frontmatter 付き）でスキルを作成
3. または `agents/your-agent.md` でエージェントを作成
4. 何をするか、いつ使うかを明確に説明して PR を提出
</details>

---

## テストを実行

このプラグインには包括的なテストスイートが含まれます：

```bash
# 全テストを実行
node tests/run-all.js

# 個別のテストファイルを実行
node tests/lib/utils.test.js
node tests/lib/package-manager.test.js
node tests/hooks/hooks.test.js
```

---

## 貢献

**貢献を歓迎します。**

このリポジトリはコミュニティリソースを目指しています。以下をお持ちの方：
- 有用なエージェントまたはスキル
- 巧妙なフック
- より良い MCP 設定
- 改善されたルール

ぜひ貢献してください。ガイドラインは [CONTRIBUTING.md](../../CONTRIBUTING.md) を参照してください。

### 貢献アイデア

- 言語固有スキル（Rust、C#、Kotlin、Java）— Go、Python、Perl、Swift、TypeScript は既に含まれています
- フレームワーク固有設定（Rails、FastAPI）— Django、NestJS、Spring Boot、Laravel は既に含まれています
- DevOps エージェント（Kubernetes、Terraform、AWS、Docker）
- テスト戦略（各種フレームワーク、ビジュアルリグレッション）
- ドメイン固有知識（ML、データエンジニアリング、モバイル）

### コミュニティエコシステムの注記

以下は ECC に同梱されておらず、このリポジトリで監査もされていませんが、より広い Claude Code スキルエコシステムを探索する際に知っておくと有用です：

- [claude-seo](https://github.com/AgriciDaniel/claude-seo) — SEO フォーカスのスキルとエージェント集
- [claude-ads](https://github.com/AgriciDaniel/claude-ads) — 広告監査と有料グロースワークフロー集
- [claude-cybersecurity](https://github.com/AgriciDaniel/claude-cybersecurity) — セキュリティ指向のスキルとエージェント集

---

## Cursor IDE サポート

ECC は **Cursor IDE の完全サポート**を提供し、フック、ルール、エージェント、スキル、コマンド、MCP 設定を Cursor のネイティブ形式に適応させています。

### クイックスタート（Cursor）

```bash
# macOS/Linux
./install.sh --target cursor typescript
./install.sh --target cursor python golang swift php
```

```powershell
# Windows PowerShell
.\install.ps1 --target cursor typescript
.\install.ps1 --target cursor python golang swift php
```

### 含まれるもの

| コンポーネント | 数 | 詳細 |
|-----------|-------|---------|
| フックイベント | 15 | sessionStart、beforeShellExecution、afterFileEdit、beforeMCPExecution、beforeSubmitPrompt など 10 種以上 |
| フックスクリプト | 16 | 共有アダプター経由で `scripts/hooks/` に委譲する薄い Node.js スクリプト |
| ルール | 34 | 共通 9 個（alwaysApply）+ 言語固有 25 個（TypeScript、Python、Go、Swift、PHP） |
| エージェント | 共有 | ルートの AGENTS.md 経由（Cursor がネイティブに読み込み） |
| スキル | 共有 + 同梱 | ルートの AGENTS.md と翻訳追加分は `.cursor/skills/` |
| コマンド | 共有 | `.cursor/commands/`（インストールされていれば） |
| MCP 設定 | 共有 | `.cursor/mcp.json`（インストールされていれば） |

### フックアーキテクチャ（DRY アダプターパターン）

Cursor は **Claude Code よりフックイベントが多い**（20 vs 8）です。`.cursor/hooks/adapter.js` モジュールが Cursor の stdin JSON を Claude Code の形式に変換するので、既存の `scripts/hooks/*.js` を重複なく再利用できます。

```
Cursor stdin JSON → adapter.js → 変換 → scripts/hooks/*.js
                                              （Claude Code と共有）
```

主要フック：
- **beforeShellExecution** — tmux 外の dev サーバーをブロック（exit 2）、git push レビュー
- **afterFileEdit** — 自動フォーマット + TypeScript チェック + console.log 警告
- **beforeSubmitPrompt** — プロンプト内のシークレット検出（sk-、ghp_、AKIA パターン）
- **beforeTabFileRead** — Tab が .env、.key、.pem ファイルを読むのをブロック（exit 2）
- **beforeMCPExecution / afterMCPExecution** — MCP 監査ロギング

### ルール形式

Cursor ルールは `description`、`globs`、`alwaysApply` を含む YAML frontmatter を使用：

```yaml
---
description: "TypeScript coding style extending common rules"
globs: ["**/*.ts", "**/*.tsx", "**/*.js", "**/*.jsx"]
alwaysApply: false
---
```

---

## Codex macOS アプリ + CLI サポート

ECC は macOS アプリと CLI 両方に**ファーストクラスの Codex サポート**を提供し、リファレンス設定、Codex 固有の AGENTS.md 補足、共有スキルを備えています。

### クイックスタート（Codex アプリ + CLI）

```bash
# リポジトリ内で Codex CLI を実行 — AGENTS.md と .codex/ が自動検出されます
codex

# 自動セットアップ：ECC アセット（AGENTS.md、スキル、MCP サーバー）を ~/.codex に同期
npm install && bash scripts/sync-ecc-to-codex.sh
# または: pnpm install && bash scripts/sync-ecc-to-codex.sh
# または: yarn install && bash scripts/sync-ecc-to-codex.sh
# または: bun install && bash scripts/sync-ecc-to-codex.sh

# または手動：リファレンス設定をホームディレクトリにコピー
cp .codex/config.toml ~/.codex/config.toml
```

同期スクリプトは **add-only 戦略**で ECC MCP サーバーを既存の `~/.codex/config.toml` に安全にマージします — 既存サーバーの削除や変更は行いません。`--dry-run` で変更をプレビュー、`--update-mcp` で ECC サーバーを最新推奨設定に強制更新できます。

Context7 について、ECC は正準の Codex セクション名 `[mcp_servers.context7]` を使用しつつ、`@upstash/context7-mcp` パッケージを起動します。既にレガシーの `[mcp_servers.context7-mcp]` エントリがある場合、`--update-mcp` が正準セクション名に移行します。

Codex macOS アプリ：
- このリポジトリをワークスペースとして開きます。
- ルートの `AGENTS.md` は自動検出されます。
- `.codex/config.toml` と `.codex/agents/*.toml` はプロジェクトローカルに保つのが最適です。
- リファレンスの `.codex/config.toml` は意図的に `model` や `model_provider` を固定しないため、上書きしない限り Codex が現在の既定値を使用します。
- オプション：グローバル既定値として `.codex/config.toml` を `~/.codex/config.toml` にコピー可能です。マルチエージェントロールファイルは、`.codex/agents/` もコピーしない限りプロジェクトローカルに保ってください。

### 含まれるもの

| コンポーネント | 数 | 詳細 |
|-----------|-------|---------|
| Config | 1 | `.codex/config.toml` — トップレベル approvals/sandbox/web_search、MCP サーバー、通知、プロファイル |
| AGENTS.md | 2 | ルート（共通）+ `.codex/AGENTS.md`（Codex 固有補足） |
| スキル | 30 | `.agents/skills/` — 各スキルに SKILL.md + agents/openai.yaml |
| MCP サーバー | 6 | GitHub、Context7、Exa、Memory、Playwright、Sequential Thinking（`--update-mcp` 同期で Supabase 含む 7 に） |
| プロファイル | 2 | `strict`（読み取り専用サンドボックス）と `yolo`（完全自動承認） |
| エージェントロール | 3 | `.codex/agents/` — explorer、reviewer、docs-researcher |

### スキル

`.agents/skills/` のスキルは Codex が自動読み込みします：

| スキル | 説明 |
|-------|-------------|
| api-design | REST API 設計パターン |
| article-writing | ノートとボイス参照からの長文執筆 |
| backend-patterns | API 設計、データベース、キャッシュ |
| brand-voice | 実コンテンツから派生したソース派生ライティングスタイルプロファイル |
| bun-runtime | Bun をランタイム、パッケージマネージャー、バンドラー、テストランナーとして |
| claude-api | Python と TypeScript 向け Anthropic Claude API パターン |
| coding-standards | 普遍的コーディング標準 |
| content-engine | プラットフォームネイティブ SNS コンテンツと再利用 |
| crosspost | X、LinkedIn、Threads 横断のマルチプラットフォーム配信 |
| deep-research | 統合と出典明示による多ソース調査 |
| dmux-workflows | tmux ペインマネージャーによるマルチエージェントオーケストレーション |
| documentation-lookup | Context7 MCP による最新ライブラリ/フレームワークドキュメント |
| e2e-testing | Playwright E2E テスト |
| eval-harness | 評価駆動開発 |
| everything-claude-code | プロジェクト向け開発規約とパターン |
| exa-search | Exa MCP によるニューラル検索（Web、コード、企業調査） |
| fal-ai-media | 画像、動画、音声の統合メディア生成 |
| frontend-patterns | React/Next.js パターン |
| frontend-slides | HTML プレゼン、PPTX 変換、ビジュアルスタイル探索 |
| investor-materials | デック、メモ、モデル、ワンペーパー |
| investor-outreach | パーソナライズされたアウトリーチ、フォローアップ、イントロブラーブ |
| market-research | 出典付き市場・競合調査 |
| mcp-server-patterns | Node/TypeScript SDK で MCP サーバーを構築 |
| nextjs-turbopack | Next.js 16+ と Turbopack 増分バンドリング |
| security-review | 包括的セキュリティチェックリスト |
| strategic-compact | コンテキスト管理 |
| tdd-workflow | 80%+ カバレッジを伴うテスト駆動開発 |
| verification-loop | ビルド、テスト、lint、型チェック、セキュリティ |
| video-editing | FFmpeg と Remotion による AI 支援動画編集ワークフロー |
| x-api | 投稿と分析のための X/Twitter API 統合 |

### 主要な制限

Codex は **Claude スタイルのフック実行パリティをまだ提供していません**。ECC の強制は `AGENTS.md`、オプションの `model_instructions_file` オーバーライド、サンドボックス/承認設定による指示ベースで行われます。

### マルチエージェントサポート

現行の Codex ビルドは安定したマルチエージェントワークフローをサポートします。

- `.codex/config.toml` で `features.multi_agent = true` を有効化
- `[agents.<name>]` でロールを定義
- 各ロールを `.codex/agents/` 配下のファイルに向ける
- CLI で `/agent` を使い子エージェントを確認・誘導

ECC はサンプルロール設定を 3 種同梱しています：

| ロール | 目的 |
|------|---------|
| `explorer` | 編集前の読み取り専用コードベース証拠収集 |
| `reviewer` | 正確性、セキュリティ、欠落テストのレビュー |
| `docs_researcher` | リリース/ドキュメント変更前のドキュメント・API 検証 |

---

## OpenCode サポート

ECC はプラグインとフックを含む **OpenCode の完全サポート**を提供します。

### クイックスタート

```bash
# OpenCode をインストール
npm install -g opencode

# リポジトリルートで実行
opencode
```

設定は `.opencode/opencode.json` から自動検出されます。

### 機能パリティ

| 機能 | Claude Code | OpenCode | ステータス |
|---------|-------------|----------|--------|
| エージェント | PASS：48 エージェント | PASS：12 エージェント | **Claude Code が優位** |
| コマンド | PASS：79 コマンド | PASS：31 コマンド | **Claude Code が優位** |
| スキル | PASS：183 スキル | PASS：37 スキル | **Claude Code が優位** |
| フック | PASS：8 イベントタイプ | PASS：11 イベント | **OpenCode の方が多い！** |
| ルール | PASS：29 ルール | PASS：13 指示 | **Claude Code が優位** |
| MCP サーバー | PASS：14 サーバー | PASS：フル | **フルパリティ** |
| カスタムツール | PASS：フック経由 | PASS：6 ネイティブツール | **OpenCode が優れる** |

### プラグインによるフックサポート

OpenCode のプラグインシステムは Claude Code より洗練されており、20+ イベントタイプがあります：

| Claude Code フック | OpenCode プラグインイベント |
|-----------------|----------------------|
| PreToolUse | `tool.execute.before` |
| PostToolUse | `tool.execute.after` |
| Stop | `session.idle` |
| SessionStart | `session.created` |
| SessionEnd | `session.deleted` |

**追加の OpenCode イベント**：`file.edited`、`file.watcher.updated`、`message.updated`、`lsp.client.diagnostics`、`tui.toast.show` など。

### 利用可能なスラッシュエントリシム（31+）

| コマンド | 説明 |
|---------|-------------|
| `/plan` | 実装計画を作成 |
| `/tdd` | TDD ワークフロー強制 |
| `/code-review` | コード変更レビュー |
| `/build-fix` | ビルドエラー修正 |
| `/e2e` | E2E テスト生成 |
| `/refactor-clean` | デッドコード削除 |
| `/orchestrate` | マルチエージェントワークフロー |
| `/learn` | セッションからパターン抽出 |
| `/checkpoint` | 検証状態保存 |
| `/verify` | 検証ループ実行 |
| `/eval` | 基準に対する評価 |
| `/update-docs` | ドキュメント更新 |
| `/update-codemaps` | コードマップ更新 |
| `/test-coverage` | カバレッジ分析 |
| `/go-review` | Go コードレビュー |
| `/go-test` | Go TDD ワークフロー |
| `/go-build` | Go ビルドエラー修正 |
| `/python-review` | Python コードレビュー（PEP 8、型ヒント、セキュリティ） |
| `/multi-plan` | マルチモデル協調計画 |
| `/multi-execute` | マルチモデル協調実行 |
| `/multi-backend` | バックエンド重視のマルチモデルワークフロー |
| `/multi-frontend` | フロントエンド重視のマルチモデルワークフロー |
| `/multi-workflow` | フルマルチモデル開発ワークフロー |
| `/pm2` | PM2 サービスコマンド自動生成 |
| `/sessions` | セッション履歴管理 |
| `/skill-create` | git からスキル生成 |
| `/instinct-status` | 学習済み instinct 表示 |
| `/instinct-import` | instinct インポート |
| `/instinct-export` | instinct エクスポート |
| `/evolve` | instinct をスキルへクラスター化 |
| `/promote` | プロジェクト instinct をグローバルスコープに昇格 |
| `/projects` | 既知プロジェクトと instinct 統計を一覧 |
| `/prune` | 期限切れ pending instinct 削除（30 日 TTL） |
| `/learn-eval` | 保存前にパターンを抽出・評価 |
| `/setup-pm` | パッケージマネージャー設定 |
| `/harness-audit` | ハーネスの信頼性、評価準備、リスク姿勢を監査 |
| `/loop-start` | 制御されたエージェンティックループ実行パターン開始 |
| `/loop-status` | アクティブループ状態とチェックポイントを検査 |
| `/quality-gate` | パスまたはリポジトリ全体の品質ゲートチェックを実行 |
| `/model-route` | 複雑度と予算でタスクをモデルにルーティング |

### プラグインインストール

**オプション 1：直接使用**
```bash
cd everything-claude-code
opencode
```

**オプション 2：npm パッケージとしてインストール**
```bash
npm install ecc-universal
```

その後 `opencode.json` に追加：
```json
{
  "plugin": ["ecc-universal"]
}
```

この npm プラグインエントリは ECC が公開する OpenCode プラグインモジュール（フック/イベントとプラグインツール）を有効化します。
**ECC の完全なコマンド/エージェント/指示カタログがプロジェクト設定に自動追加されるわけではありません。**

ECC の完全な OpenCode セットアップには、以下のいずれかを行ってください：
- このリポジトリ内で OpenCode を実行する、または
- 同梱の `.opencode/` 設定アセットをプロジェクトにコピーし、`opencode.json` の `instructions`、`agent`、`command` エントリを配線する

### ドキュメント

- **移行ガイド**：`.opencode/MIGRATION.md`
- **OpenCode プラグイン README**：`.opencode/README.md`
- **統合ルール**：`.opencode/instructions/INSTRUCTIONS.md`
- **LLM ドキュメント**：`llms.txt`（LLM 向け完全 OpenCode ドキュメント）

---

## クロスツール機能パリティ

ECC は**主要 AI コーディングツール全てを最大限活用する初のプラグイン**です。各ハーネスの比較：

| 機能 | Claude Code | Cursor IDE | Codex CLI | OpenCode |
|---------|------------|------------|-----------|----------|
| **エージェント** | 48 | 共有（AGENTS.md） | 共有（AGENTS.md） | 12 |
| **コマンド** | 79 | 共有 | 指示ベース | 31 |
| **スキル** | 183 | 共有 | 10（ネイティブ形式） | 37 |
| **フックイベント** | 8 種 | 15 種 | まだなし | 11 種 |
| **フックスクリプト** | 20+ スクリプト | 16 スクリプト（DRY アダプター） | N/A | プラグインフック |
| **ルール** | 34（共通 + 言語） | 34（YAML frontmatter） | 指示ベース | 13 指示 |
| **カスタムツール** | フック経由 | フック経由 | N/A | 6 ネイティブツール |
| **MCP サーバー** | 14 | 共有（mcp.json） | 7（TOML パーサーで自動マージ） | フル |
| **設定形式** | settings.json | hooks.json + rules/ | config.toml | opencode.json |
| **コンテキストファイル** | CLAUDE.md + AGENTS.md | AGENTS.md | AGENTS.md | AGENTS.md |
| **シークレット検出** | フックベース | beforeSubmitPrompt フック | サンドボックスベース | フックベース |
| **自動フォーマット** | PostToolUse フック | afterFileEdit フック | N/A | file.edited フック |
| **バージョン** | プラグイン | プラグイン | リファレンス設定 | 1.10.0 |

**主要なアーキテクチャ決定：**
- ルートの **AGENTS.md** がユニバーサルなクロスツールファイル（4 ツール全てが読み込み）
- **DRY アダプターパターン**により Cursor が Claude Code のフックスクリプトを重複なく再利用
- **スキル形式**（YAML frontmatter の SKILL.md）は Claude Code、Codex、OpenCode で動作
- Codex のフック不在は `AGENTS.md`、オプションの `model_instructions_file` オーバーライド、サンドボックス権限で補われる

---

## 背景

実験的ロールアウト以来 Claude Code を使用しています。2025 年 9 月の Anthropic x Forum Ventures ハッカソンで [@DRodriguezFX](https://x.com/DRodriguezFX) と共に優勝し、Claude Code だけで [zenith.chat](https://zenith.chat) を完全に構築しました。

これらの設定は複数の本番アプリケーションで実戦テスト済みです。

---

## トークン最適化

Claude Code の利用はトークン消費を管理しないと高額になり得ます。これらの設定は品質を犠牲にせずコストを大幅に削減します。

### 推奨設定

`~/.claude/settings.json` に追加：

```json
{
  "model": "sonnet",
  "env": {
    "MAX_THINKING_TOKENS": "10000",
    "CLAUDE_AUTOCOMPACT_PCT_OVERRIDE": "50"
  }
}
```

| 設定 | 既定値 | 推奨 | 影響 |
|---------|---------|-------------|--------|
| `model` | opus | **sonnet** | 約 60% のコスト削減；コーディングタスクの 80%+ を処理 |
| `MAX_THINKING_TOKENS` | 31,999 | **10,000** | リクエストごとの隠れ思考コストを約 70% 削減 |
| `CLAUDE_AUTOCOMPACT_PCT_OVERRIDE` | 95 | **50** | 早めに圧縮 — 長いセッションで品質向上 |

深いアーキテクチャ推論が必要なときだけ Opus に切り替え：
```
/model opus
```

### 日常ワークフローコマンド

| コマンド | 使用タイミング |
|---------|-------------|
| `/model sonnet` | 多くのタスクのデフォルト |
| `/model opus` | 複雑なアーキテクチャ、デバッグ、深い推論 |
| `/clear` | 無関係タスク間（無料、即時リセット） |
| `/compact` | 論理的タスクの区切り（調査完了、マイルストーン達成） |
| `/cost` | セッション中のトークン使用を監視 |

### 戦略的圧縮

`strategic-compact` スキル（このプラグインに含まれる）は、95% コンテキストでの自動圧縮ではなく、論理的区切りで `/compact` を提案します。完全な判断ガイドは `skills/strategic-compact/SKILL.md` を参照してください。

**圧縮すべきとき：**
- 調査/探索の後、実装前
- マイルストーン完了後、次の開始前
- デバッグ後、機能作業の継続前
- 失敗したアプローチ後、新しい試行前

**圧縮すべきでないとき：**
- 実装中（変数名、ファイルパス、部分状態を失う）

### コンテキストウィンドウ管理

**重要：** 全 MCP を一度に有効化しないでください。各 MCP ツール記述は 200k ウィンドウからトークンを消費し、~70k まで削る可能性があります。

- プロジェクトごとに有効 MCP は 10 個未満に
- アクティブなツールは 80 個未満に
- 未使用は `disabledMcpServers` でプロジェクト設定内で無効化

### エージェントチームコスト警告

エージェントチームは複数のコンテキストウィンドウをスポーンします。各チームメイトが独立してトークンを消費します。並列化が明確な価値を提供するタスク（マルチモジュール作業、並列レビュー）でのみ使用してください。単純な逐次タスクではサブエージェントの方がトークン効率的です。

---

## WARNING: 重要な注記

### トークン最適化

毎日の上限に達していますか？ 推奨設定とワークフローのヒントは **[トークン最適化ガイド](../token-optimization.md)** を参照してください。

クイックウィン：

```json
// ~/.claude/settings.json
{
  "model": "sonnet",
  "env": {
    "MAX_THINKING_TOKENS": "10000",
    "CLAUDE_AUTOCOMPACT_PCT_OVERRIDE": "50",
    "CLAUDE_CODE_SUBAGENT_MODEL": "haiku"
  }
}
```

無関係なタスク間では `/clear`、論理的区切りでは `/compact`、支出監視には `/cost` を使ってください。

### カスタマイズ

これらの設定は私のワークフローに合わせたものです。以下をお勧めします：
1. 共感できるものから始める
2. 自分のスタックに合わせて改造
3. 使わないものは削除
4. 自分のパターンを追加

---

## コミュニティプロジェクト

Everything Claude Code 上に構築された、または触発されたプロジェクト：

| プロジェクト | 説明 |
|---------|-------------|
| [EVC](https://github.com/SaigonXIII/evc) | マーケティングエージェントワークスペース — コンテンツオペレーター、ブランドガバナンス、マルチチャネル配信向けの 42 コマンド。[ビジュアル概要](https://saigonxiii.github.io/evc)。 |

ECC で何か作りましたか？ PR を開いてここに追加してください。

---

## スポンサー

このプロジェクトは無料かつオープンソースです。スポンサーが維持と成長を支えます。

[**スポンサーになる**](https://github.com/sponsors/affaan-m) | [スポンサーティア](../../SPONSORS.md) | [スポンサーシッププログラム](../../SPONSORING.md)

---

## Star 履歴

[![Star History Chart](https://api.star-history.com/svg?repos=affaan-m/everything-claude-code&type=Date)](https://star-history.com/#affaan-m/everything-claude-code&Date)

---

## リンク

- **簡潔ガイド（ここから開始）：** [The Shorthand Guide to Everything Claude Code](https://x.com/affaanmustafa/status/2012378465664745795)
- **長文ガイド（上級）：** [The Longform Guide to Everything Claude Code](https://x.com/affaanmustafa/status/2014040193557471352)
- **セキュリティガイド：** [Security Guide](../../the-security-guide.md) | [Thread](https://x.com/affaanmustafa/status/2033263813387223421)
- **フォロー：** [@affaanmustafa](https://x.com/affaanmustafa)

---

## ライセンス

MIT - 自由に使用、必要に応じて改造、可能ならお返しに貢献してください。

---

**このリポジトリが役立ったらスターをお願いします。両方のガイドを読んでください。何か素晴らしいものを作りましょう。**
