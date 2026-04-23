# Everything Claude Code

[![Stars](https://img.shields.io/github/stars/affaan-m/everything-claude-code?style=flat)](https://github.com/affaan-m/everything-claude-code/stargazers)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
![Shell](https://img.shields.io/badge/-Shell-4EAA25?logo=gnu-bash&logoColor=white)
![TypeScript](https://img.shields.io/badge/-TypeScript-3178C6?logo=typescript&logoColor=white)
![Go](https://img.shields.io/badge/-Go-00ADD8?logo=go&logoColor=white)
![Markdown](https://img.shields.io/badge/-Markdown-000000?logo=markdown&logoColor=white)

---

<div align="center">

**Language / 语言 / 語言 / Dil**

[**English**](../../README.md) | [Português (Brasil)](../pt-BR/README.md) | [简体中文](../../README.zh-CN.md) | [繁體中文](README.md) | [日本語](../ja-JP/README.md) | [한국어](../ko-KR/README.md) | [Türkçe](../tr/README.md)

</div>

---

**來自 Anthropic 黑客松冠軍的完整 Claude Code 設定集合。**

經過 10 個月以上密集日常使用、打造真實產品所淬煉出的生產就緒代理程式、技能、鉤子、指令、規則和 MCP 設定。

---

## 指南

本儲存庫僅包含原始程式碼。指南會解釋所有內容。

<table>
<tr>
<td width="50%">
<a href="https://x.com/affaanmustafa/status/2012378465664745795">
<img src="https://github.com/user-attachments/assets/1a471488-59cc-425b-8345-5245c7efbcef" alt="Everything Claude Code 簡明指南" />
</a>
</td>
<td width="50%">
<a href="https://x.com/affaanmustafa/status/2014040193557471352">
<img src="https://github.com/user-attachments/assets/c9ca43bc-b149-427f-b551-af6840c368f0" alt="Everything Claude Code 完整指南" />
</a>
</td>
</tr>
<tr>
<td align="center"><b>簡明指南</b><br/>設定、基礎、理念。<b>請先閱讀此指南。</b></td>
<td align="center"><b>完整指南</b><br/>權杖最佳化、記憶持久化、評估、平行處理。</td>
</tr>
</table>

| 主題 | 學習內容 |
|------|----------|
| 權杖最佳化 | 模型選擇、系統提示精簡、背景程序 |
| 記憶持久化 | 自動跨工作階段儲存/載入上下文的鉤子 |
| 持續學習 | 從工作階段自動擷取模式並轉化為可重用技能 |
| 驗證迴圈 | 檢查點 vs 持續評估、評分器類型、pass@k 指標 |
| 平行處理 | Git worktrees、串聯方法、何時擴展實例 |
| 子代理程式協調 | 上下文問題、漸進式檢索模式 |

---

## 最新動態

### v1.10.0 — 介面更新、操作者工作流與 ECC 2.0 Alpha（2026 年 4 月）

- **儀表板 GUI** — 全新基於 Tkinter 的桌面應用程式（`ecc_dashboard.py` 或 `npm run dashboard`），支援深色/淺色主題切換、字型自訂、頁首與工作列的專案 Logo。
- **公開介面與實際儲存庫同步** — 中繼資料、目錄數量、外掛程式資訊清單與安裝相關文件現已與實際 OSS 介面一致：38 個代理程式、156 項技能、72 個 legacy 指令 shim。
- **操作者與對外工作流擴充** — `brand-voice`、`social-graph-ranker`、`connections-optimizer`、`customer-billing-ops`、`ecc-tools-cost-audit`、`google-workspace-ops`、`project-flow-ops`、`workspace-surface-audit` 補強操作者通道。
- **媒體與發佈工具** — `manim-video`、`remotion-video-creation`，以及升級後的社群發佈介面，讓技術說明與發佈內容成為同一系統的一部分。
- **框架與產品介面擴充** — `nestjs-patterns`、更豐富的 Codex/OpenCode 安裝介面，以及擴充後的跨 harness 封裝，讓本儲存庫在 Claude Code 之外仍然好用。
- **ECC 2.0 Alpha 已進入主儲存庫** — `ecc2/` 中的 Rust 控制面原型現已可在本機建置，並提供 `dashboard`、`start`、`sessions`、`status`、`stop`、`resume`、`daemon` 指令。目前為 alpha 階段，尚非正式發行。
- **生態系統強化** — AgentShield、ECC Tools 成本控制、帳務入口與網站更新等工作持續圍繞核心外掛程式交付，不再分散為獨立儲存庫。

### v1.9.0 — 選擇性安裝與多語言擴充（2026 年 3 月）

- **選擇性安裝架構** — 以 `install-plan.js` 與 `install-apply.js` 為基礎的資訊清單驅動安裝流程，僅安裝所需元件。狀態儲存追蹤已安裝項目並支援增量更新。
- **6 個新代理程式** — `typescript-reviewer`、`pytorch-build-resolver`、`java-build-resolver`、`java-reviewer`、`kotlin-reviewer`、`kotlin-build-resolver` 將語言涵蓋範圍擴充至 10 種。
- **新技能** — 用於深度學習的 `pytorch-patterns`、用於 API 參考查詢的 `documentation-lookup`、用於現代 JS 工具鏈的 `bun-runtime` 與 `nextjs-turbopack`，以及 8 個營運領域技能與 `mcp-server-patterns`。
- **工作階段與狀態基礎建設** — 附查詢 CLI 的 SQLite 狀態儲存、用於結構化紀錄的工作階段轉接器、作為自我進化技能基礎的技能進化框架。
- **協調系統大幅整修** — 讓 harness 稽核評分具決定性，強化協調狀態與啟動器相容性，以 5 層防護避免觀察者迴圈。
- **觀察者可靠性** — 以節流與尾端取樣修正記憶體爆炸問題、修正沙箱存取、延遲啟動邏輯、加入重入防護。
- **12 個語言生態系** — 在既有 TypeScript、Python、Go、通用規則之外，新增 Java、PHP、Perl、Kotlin/Android/KMP、C++、Rust 規則。
- **社群貢獻** — 韓文與中文翻譯、biome 鉤子最佳化、影片處理技能、營運技能、PowerShell 安裝程式、Antigravity IDE 支援。
- **CI 強化** — 修正 19 項測試失敗、強制目錄計數、驗證安裝資訊清單，並讓完整測試套件通過。

完整變更紀錄請見 [Releases](https://github.com/affaan-m/everything-claude-code/releases)。

---

## 快速開始

在 2 分鐘內快速上手：

### 第一步：安裝外掛程式

> NOTE: 外掛程式很方便，但如果您的 Claude Code 版本在解析自架市集項目時遇到問題，以下 OSS 安裝程式仍是最穩妥的路徑。

```bash
# 新增市集
/plugin marketplace add https://github.com/affaan-m/everything-claude-code

# 安裝外掛程式
/plugin install everything-claude-code@everything-claude-code
```

### 命名 + 遷移說明

ECC 目前有三個對外公開的識別碼，彼此不可互換：

- GitHub 原始儲存庫：`affaan-m/everything-claude-code`
- Claude 市集/外掛識別碼：`everything-claude-code@everything-claude-code`
- npm 套件：`ecc-universal`

這是刻意設計。Anthropic 的市集/外掛安裝以正規化的外掛識別碼為鍵，因此 ECC 將列表名稱、`/plugin install`、`/plugin list` 和儲存庫文件統一指向同一個公開安裝介面 `everything-claude-code@everything-claude-code`。舊文章中可能仍看到早期的短別稱；該縮寫已不建議使用。另一方面，npm 套件則保留為 `ecc-universal`，因此 npm 安裝與市集安裝會刻意使用不同名稱。

### 第二步：安裝規則（必需）

> WARNING: **重要提示：** Claude Code 外掛程式無法自動分發 `rules`，需要手動安裝：

```bash
# 首先複製儲存庫
git clone https://github.com/affaan-m/everything-claude-code.git

# 複製規則（應用於所有專案）
cp -r everything-claude-code/rules/* ~/.claude/rules/
```

### 第三步：開始使用

```bash
# 技能是主要的工作流介面。
# 在 ECC 從 commands/ 移轉的期間，既有的斜線指令名稱仍可使用。

# 嘗試一個指令（外掛安裝使用命名空間形式）
/ecc:plan "新增使用者認證"

# 手動安裝（選項2）使用簡短形式：
# /plan "新增使用者認證"

# 查看可用指令
/plugin list everything-claude-code@everything-claude-code
```

**完成！** 您現在可以使用 48 個代理程式、183 項技能以及 79 個 legacy 指令 shim。

### 儀表板 GUI

啟動桌面儀表板，可視化瀏覽 ECC 元件：

```bash
npm run dashboard
# 或
python3 ./ecc_dashboard.py
```

**功能：**
- 分頁介面：Agents、Skills、Commands、Rules、Settings
- 深色/淺色主題切換
- 字型自訂（字型與字級）
- 頁首與工作列的專案 Logo
- 跨所有元件的搜尋/篩選

### 多模型指令需要額外設定

> WARNING: `multi-*` 指令 **不包含** 在上述基本外掛/規則安裝之中。
>
> 若要使用 `/multi-plan`、`/multi-execute`、`/multi-backend`、`/multi-frontend`、`/multi-workflow`，您必須一併安裝 `ccg-workflow` 執行期。
>
> 使用 `npx ccg-workflow` 進行初始化。
>
> 該執行期提供這些指令所需的外部相依：
> - `~/.claude/bin/codeagent-wrapper`
> - `~/.claude/.ccg/prompts/*`
>
> 沒有 `ccg-workflow`，這些 `multi-*` 指令將無法正常執行。

---

## 跨平台支援

此外掛程式現已完整支援 **Windows、macOS 和 Linux**。所有鉤子和腳本已使用 Node.js 重寫以獲得最佳相容性。

### 套件管理器偵測

外掛程式會自動偵測您偏好的套件管理器（npm、pnpm、yarn 或 bun），優先順序如下：

1. **環境變數**：`CLAUDE_PACKAGE_MANAGER`
2. **專案設定**：`.claude/package-manager.json`
3. **package.json**：`packageManager` 欄位
4. **鎖定檔案**：從 package-lock.json、yarn.lock、pnpm-lock.yaml 或 bun.lockb 偵測
5. **全域設定**：`~/.claude/package-manager.json`
6. **備援方案**：第一個可用的套件管理器

設定您偏好的套件管理器：

```bash
# 透過環境變數
export CLAUDE_PACKAGE_MANAGER=pnpm

# 透過全域設定
node scripts/setup-package-manager.js --global pnpm

# 透過專案設定
node scripts/setup-package-manager.js --project bun

# 偵測目前設定
node scripts/setup-package-manager.js --detect
```

或在 Claude Code 中使用 `/setup-pm` 指令。

---

## 內容概覽

本儲存庫是一個 **Claude Code 外掛程式** - 可直接安裝或手動複製元件。

```
everything-claude-code/
|-- .claude-plugin/   # 外掛程式和市集清單
|   |-- plugin.json         # 外掛程式中繼資料和元件路徑
|   |-- marketplace.json    # 用於 /plugin marketplace add 的市集目錄
|
|-- agents/           # 用於委派任務的專門子代理程式
|   |-- planner.md           # 功能實作規劃
|   |-- architect.md         # 系統設計決策
|   |-- tdd-guide.md         # 測試驅動開發
|   |-- code-reviewer.md     # 品質與安全審查
|   |-- security-reviewer.md # 弱點分析
|   |-- build-error-resolver.md
|   |-- e2e-runner.md        # Playwright E2E 測試
|   |-- refactor-cleaner.md  # 無用程式碼清理
|   |-- doc-updater.md       # 文件同步
|   |-- go-reviewer.md       # Go 程式碼審查（新增）
|   |-- go-build-resolver.md # Go 建置錯誤解決（新增）
|
|-- skills/           # 工作流程定義和領域知識
|   |-- coding-standards/           # 程式語言最佳實務
|   |-- backend-patterns/           # API、資料庫、快取模式
|   |-- frontend-patterns/          # React、Next.js 模式
|   |-- continuous-learning/        # 從工作階段自動擷取模式（完整指南）
|   |-- continuous-learning-v2/     # 基於本能的學習與信心評分
|   |-- iterative-retrieval/        # 子代理程式的漸進式上下文精煉
|   |-- strategic-compact/          # 手動壓縮建議（完整指南）
|   |-- tdd-workflow/               # TDD 方法論
|   |-- security-review/            # 安全性檢查清單
|   |-- eval-harness/               # 驗證迴圈評估（完整指南）
|   |-- verification-loop/          # 持續驗證（完整指南）
|   |-- golang-patterns/            # Go 慣用語法和最佳實務（新增）
|   |-- golang-testing/             # Go 測試模式、TDD、基準測試（新增）
|
|-- commands/         # 快速執行的斜線指令
|   |-- tdd.md              # /tdd - 測試驅動開發
|   |-- plan.md             # /plan - 實作規劃
|   |-- e2e.md              # /e2e - E2E 測試生成
|   |-- code-review.md      # /code-review - 品質審查
|   |-- build-fix.md        # /build-fix - 修復建置錯誤
|   |-- refactor-clean.md   # /refactor-clean - 移除無用程式碼
|   |-- learn.md            # /learn - 工作階段中擷取模式（完整指南）
|   |-- checkpoint.md       # /checkpoint - 儲存驗證狀態（完整指南）
|   |-- verify.md           # /verify - 執行驗證迴圈（完整指南）
|   |-- setup-pm.md         # /setup-pm - 設定套件管理器
|   |-- go-review.md        # /go-review - Go 程式碼審查（新增）
|   |-- go-test.md          # /go-test - Go TDD 工作流程（新增）
|   |-- go-build.md         # /go-build - 修復 Go 建置錯誤（新增）
|
|-- rules/            # 必須遵守的準則（複製到 ~/.claude/rules/）
|   |-- security.md         # 強制性安全檢查
|   |-- coding-style.md     # 不可變性、檔案組織
|   |-- testing.md          # TDD、80% 覆蓋率要求
|   |-- git-workflow.md     # 提交格式、PR 流程
|   |-- agents.md           # 何時委派給子代理程式
|   |-- performance.md      # 模型選擇、上下文管理
|
|-- hooks/            # 基於觸發器的自動化
|   |-- hooks.json                # 所有鉤子設定（PreToolUse、PostToolUse、Stop 等）
|   |-- memory-persistence/       # 工作階段生命週期鉤子（完整指南）
|   |-- strategic-compact/        # 壓縮建議（完整指南）
|
|-- scripts/          # 跨平台 Node.js 腳本（新增）
|   |-- lib/                     # 共用工具
|   |   |-- utils.js             # 跨平台檔案/路徑/系統工具
|   |   |-- package-manager.js   # 套件管理器偵測與選擇
|   |-- hooks/                   # 鉤子實作
|   |   |-- session-start.js     # 工作階段開始時載入上下文
|   |   |-- session-end.js       # 工作階段結束時儲存狀態
|   |   |-- pre-compact.js       # 壓縮前狀態儲存
|   |   |-- suggest-compact.js   # 策略性壓縮建議
|   |   |-- evaluate-session.js  # 從工作階段擷取模式
|   |-- setup-package-manager.js # 互動式套件管理器設定
|
|-- tests/            # 測試套件（新增）
|   |-- lib/                     # 函式庫測試
|   |-- hooks/                   # 鉤子測試
|   |-- run-all.js               # 執行所有測試
|
|-- contexts/         # 動態系統提示注入上下文（完整指南）
|   |-- dev.md              # 開發模式上下文
|   |-- review.md           # 程式碼審查模式上下文
|   |-- research.md         # 研究/探索模式上下文
|
|-- examples/         # 範例設定和工作階段
|   |-- CLAUDE.md           # 專案層級設定範例
|   |-- user-CLAUDE.md      # 使用者層級設定範例
|
|-- mcp-configs/      # MCP 伺服器設定
|   |-- mcp-servers.json    # GitHub、Supabase、Vercel、Railway 等
|
|-- marketplace.json  # 自託管市集設定（用於 /plugin marketplace add）
```

---

## 生態系統工具

### ecc.tools - 技能建立器

從您的儲存庫自動生成 Claude Code 技能。

[安裝 GitHub App](https://github.com/apps/skill-creator) | [ecc.tools](https://ecc.tools)

分析您的儲存庫並建立：
- **SKILL.md 檔案** - 可直接用於 Claude Code 的技能
- **本能集合** - 用於 continuous-learning-v2
- **模式擷取** - 從您的提交歷史學習

```bash
# 安裝 GitHub App 後，技能會出現在：
~/.claude/skills/generated/
```

與 `continuous-learning-v2` 技能無縫整合以繼承本能。

---

## 安裝

### 選項 1：以外掛程式安裝（建議）

使用本儲存庫最簡單的方式 - 安裝為 Claude Code 外掛程式：

```bash
# 將此儲存庫新增為市集
/plugin marketplace add https://github.com/affaan-m/everything-claude-code

# 安裝外掛程式
/plugin install everything-claude-code
```

或直接新增到您的 `~/.claude/settings.json`：

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

這會讓您立即存取所有指令、代理程式、技能和鉤子。

---

### 選項 2：手動安裝

如果您偏好手動控制安裝內容：

```bash
# 複製儲存庫
git clone https://github.com/affaan-m/everything-claude-code.git

# 將代理程式複製到您的 Claude 設定
cp everything-claude-code/agents/*.md ~/.claude/agents/

# 複製規則
cp everything-claude-code/rules/*.md ~/.claude/rules/

# 複製指令
cp everything-claude-code/commands/*.md ~/.claude/commands/

# 複製技能
cp -r everything-claude-code/skills/* ~/.claude/skills/
```

#### 將鉤子新增到 settings.json

僅在手動安裝時，才將 `hooks/hooks.json` 中的鉤子複製到您的 `~/.claude/settings.json`。

如果您是透過 `/plugin install` 安裝 ECC，請不要再把這些鉤子複製到 `settings.json`。Claude Code v2.1+ 會自動載入外掛中的 `hooks/hooks.json`，重複註冊會導致重複執行以及 `${CLAUDE_PLUGIN_ROOT}` 無法解析。

#### 設定 MCP

將 `mcp-configs/mcp-servers.json` 中所需的 MCP 伺服器複製到您的 `~/.claude.json`。

**重要：** 將 `YOUR_*_HERE` 佔位符替換為您實際的 API 金鑰。

---

## 核心概念

### 代理程式（Agents）

子代理程式以有限範圍處理委派的任務。範例：

```markdown
---
name: code-reviewer
description: Reviews code for quality, security, and maintainability
tools: ["Read", "Grep", "Glob", "Bash"]
model: opus
---

You are a senior code reviewer...
```

### 技能（Skills）

技能是由指令或代理程式調用的工作流程定義：

```markdown
# TDD Workflow

1. Define interfaces first
2. Write failing tests (RED)
3. Implement minimal code (GREEN)
4. Refactor (IMPROVE)
5. Verify 80%+ coverage
```

### 鉤子（Hooks）

鉤子在工具事件時觸發。範例 - 警告 console.log：

```json
{
  "matcher": "tool == \"Edit\" && tool_input.file_path matches \"\\\\.(ts|tsx|js|jsx)$\"",
  "hooks": [{
    "type": "command",
    "command": "#!/bin/bash\ngrep -n 'console\\.log' \"$file_path\" && echo '[Hook] Remove console.log' >&2"
  }]
}
```

### 規則（Rules）

規則是必須遵守的準則。保持模組化：

```
~/.claude/rules/
  security.md      # 禁止寫死密鑰
  coding-style.md  # 不可變性、檔案限制
  testing.md       # TDD、覆蓋率要求
```

---

## 執行測試

外掛程式包含完整的測試套件：

```bash
# 執行所有測試
node tests/run-all.js

# 執行個別測試檔案
node tests/lib/utils.test.js
node tests/lib/package-manager.test.js
node tests/hooks/hooks.test.js
```

---

## 貢獻

**歡迎並鼓勵貢獻。**

本儲存庫旨在成為社群資源。如果您有：
- 實用的代理程式或技能
- 巧妙的鉤子
- 更好的 MCP 設定
- 改進的規則

請貢獻！詳見 [CONTRIBUTING.md](CONTRIBUTING.md) 的指南。

### 貢獻想法

- 特定語言的技能（Python、Rust 模式）- Go 現已包含！
- 特定框架的設定（Django、Rails、Laravel）
- DevOps 代理程式（Kubernetes、Terraform、AWS）
- 測試策略（不同框架）
- 特定領域知識（ML、資料工程、行動開發）

---

## 背景

我從實驗性推出就開始使用 Claude Code。2025 年 9 月與 [@DRodriguezFX](https://x.com/DRodriguezFX) 一起使用 Claude Code 打造 [zenith.chat](https://zenith.chat)，贏得了 Anthropic x Forum Ventures 黑客松。

這些設定已在多個生產應用程式中經過實戰測試。

---

## WARNING: 重要注意事項

### 上下文視窗管理

**關鍵：** 不要同時啟用所有 MCP。啟用過多工具會讓您的 200k 上下文視窗縮減至 70k。

經驗法則：
- 設定 20-30 個 MCP
- 每個專案啟用少於 10 個
- 啟用的工具少於 80 個

在專案設定中使用 `disabledMcpServers` 來停用未使用的 MCP。

### 自訂

這些設定適合我的工作流程。您應該：
1. 從您認同的部分開始
2. 根據您的技術堆疊修改
3. 移除不需要的部分
4. 添加您自己的模式

---

## Star 歷史

[![Star History Chart](https://api.star-history.com/svg?repos=affaan-m/everything-claude-code&type=Date)](https://star-history.com/#affaan-m/everything-claude-code&Date)

---

## 連結

- **簡明指南（從這裡開始）：** [Everything Claude Code 簡明指南](https://x.com/affaanmustafa/status/2012378465664745795)
- **完整指南（進階）：** [Everything Claude Code 完整指南](https://x.com/affaanmustafa/status/2014040193557471352)
- **追蹤：** [@affaanmustafa](https://x.com/affaanmustafa)
- **zenith.chat：** [zenith.chat](https://zenith.chat)
- **技能目錄：** awesome-agent-skills（社區維護的智能體技能目錄）

---

## 授權

MIT - 自由使用、依需求修改、如可能請回饋貢獻。

---

**如果有幫助請為本儲存庫加星。閱讀兩份指南。打造偉大的作品。**
