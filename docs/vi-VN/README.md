**Ngôn ngữ:** [English](../../README.md) | [Português (Brasil)](../pt-BR/README.md) | [简体中文](../../README.zh-CN.md) | [繁體中文](../zh-TW/README.md) | [日本語](../ja-JP/README.md) | [한국어](../ko-KR/README.md) | [Türkçe](../tr/README.md) | [Tiếng Việt](README.md)

# Everything Claude Code

[![Stars](https://img.shields.io/github/stars/affaan-m/everything-claude-code?style=flat)](https://github.com/affaan-m/everything-claude-code/stargazers)
[![Forks](https://img.shields.io/github/forks/affaan-m/everything-claude-code?style=flat)](https://github.com/affaan-m/everything-claude-code/network/members)
[![Contributors](https://img.shields.io/github/contributors/affaan-m/everything-claude-code?style=flat)](https://github.com/affaan-m/everything-claude-code/graphs/contributors)
[![npm ecc-universal](https://img.shields.io/npm/dw/ecc-universal?label=ecc-universal%20weekly%20downloads&logo=npm)](https://www.npmjs.com/package/ecc-universal)
[![npm ecc-agentshield](https://img.shields.io/npm/dw/ecc-agentshield?label=ecc-agentshield%20weekly%20downloads&logo=npm)](https://www.npmjs.com/package/ecc-agentshield)
[![GitHub App Install](https://img.shields.io/badge/GitHub%20App-150%20installs-2ea44f?logo=github)](https://github.com/marketplace/ecc-tools)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](../../LICENSE)
![Shell](https://img.shields.io/badge/-Shell-4EAA25?logo=gnu-bash&logoColor=white)
![TypeScript](https://img.shields.io/badge/-TypeScript-3178C6?logo=typescript&logoColor=white)
![Python](https://img.shields.io/badge/-Python-3776AB?logo=python&logoColor=white)
![Go](https://img.shields.io/badge/-Go-00ADD8?logo=go&logoColor=white)
![Java](https://img.shields.io/badge/-Java-ED8B00?logo=openjdk&logoColor=white)
![Perl](https://img.shields.io/badge/-Perl-39457E?logo=perl&logoColor=white)
![Markdown](https://img.shields.io/badge/-Markdown-000000?logo=markdown&logoColor=white)

> **140K+ stars** | **21K+ forks** | **170+ contributors** | **12+ language ecosystems** | **Anthropic Hackathon Winner**

---

<div align="center">

**Ngôn ngữ / Language / 语言 / 語言 / Dil**

[English](../../README.md) | [Português (Brasil)](../pt-BR/README.md) | [简体中文](../../README.zh-CN.md) | [繁體中文](../zh-TW/README.md) | [日本語](../ja-JP/README.md) | [한국어](../ko-KR/README.md) | [Türkçe](../tr/README.md) | **Tiếng Việt**

</div>

---

**Hệ thống tối ưu hiệu suất cho AI agent harness. Từ đội thắng giải hackathon của Anthropic.**

Không chỉ là config. Đây là một hệ thống hoàn chỉnh: skill, instinct, tối ưu memory, continuous learning, security scanning, và research-first development. Các agent, skill, hook, rule, config MCP production-ready, được phát triển qua hơn 10 tháng sử dụng hàng ngày để build sản phẩm thực tế.

Hoạt động trên **Claude Code**, **Codex**, **Cursor**, **OpenCode**, **Gemini**, và các AI agent harness khác.

---

## Hướng dẫn

Repo này chỉ chứa code. Các hướng dẫn giải thích mọi thứ.

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
<td align="center"><b>Hướng dẫn tóm tắt</b><br/>Setup, nền tảng, triết lý. <b>Đọc cái này trước.</b></td>
<td align="center"><b>Hướng dẫn chi tiết</b><br/>Tối ưu token, memory persistence, eval, parallelization.</td>
<td align="center"><b>Hướng dẫn bảo mật</b><br/>Attack vector, sandbox, sanitization, CVE, AgentShield.</td>
</tr>
</table>

| Chủ đề | Bạn sẽ học được gì |
|--------|---------------------|
| Tối ưu Token | Chọn model, tối ưu system prompt, background process |
| Memory Persistence | Hook tự động save/load context giữa các session |
| Continuous Learning | Tự động extract pattern từ session thành skill tái sử dụng |
| Verification Loop | Checkpoint vs eval liên tục, các loại grader, chỉ số pass@k |
| Parallelization | Git worktree, phương pháp cascade, khi nào nên scale instance |
| Subagent Orchestration | Vấn đề context, iterative retrieval pattern |

---

## Có gì Mới

### v1.10.0 — Làm mới surface, Operator workflow, và ECC 2.0 Alpha (Tháng 4/2026)

- **Surface công khai đồng bộ với repo đang chạy** — metadata, số đếm catalog, manifest plugin, và tài liệu hướng dẫn cài đặt giờ khớp surface OSS thực tế: 38 agent, 156 skill, và 72 legacy command shim.
- **Mở rộng workflow operator và outbound** — `brand-voice`, `social-graph-ranker`, `connections-optimizer`, `customer-billing-ops`, `ecc-tools-cost-audit`, `google-workspace-ops`, `project-flow-ops`, và `workspace-surface-audit` hoàn thiện làn operator.
- **Media và launch tooling** — `manim-video`, `remotion-video-creation`, và surface publish social được nâng cấp để giải thích kỹ thuật và nội dung launch nằm trong cùng một hệ thống.
- **Tăng trưởng framework và product surface** — `nestjs-patterns`, surface install Codex/OpenCode phong phú hơn, và đóng gói cross-harness mở rộng giúp repo hữu ích ngoài Claude Code.
- **ECC 2.0 alpha trong repo** — prototype control-plane Rust trong `ecc2/` giờ build local và có lệnh `dashboard`, `start`, `sessions`, `status`, `stop`, `resume`, và `daemon`. Dùng được ở mức alpha, chưa phải bản phát hành chung.
- **Củng cố hệ sinh thái** — AgentShield, kiểm soát chi phí ECC Tools, công việc billing portal, và làm mới website tiếp tục ship quanh core plugin thay vì tách thành silo riêng.

### v1.9.0 — Selective Install & Mở rộng Ngôn ngữ (Tháng 3/2026)

- **Kiến trúc selective install** — Install pipeline theo manifest với `install-plan.js` và `install-apply.js` để install từng component cụ thể. State store track những gì đã cài và cho phép incremental update.
- **6 agent mới** — `typescript-reviewer`, `pytorch-build-resolver`, `java-build-resolver`, `java-reviewer`, `kotlin-reviewer`, `kotlin-build-resolver` mở rộng hỗ trợ ngôn ngữ lên 10.
- **Skill mới** — `pytorch-patterns` cho deep learning, `documentation-lookup` cho tra cứu API, `bun-runtime` và `nextjs-turbopack` cho JS toolchain hiện đại, cùng 8 skill nghiệp vụ và `mcp-server-patterns`.
- **Hạ tầng session & state** — SQLite state store với query CLI, session adapter cho structured recording, nền tảng skill evolution cho skill tự cải thiện.
- **Nâng cấp orchestration** — Scoring harness audit deterministic, trạng thái và launcher orchestration được củng cố, chống loop observer với 5 lớp guard.
- **Độ tin cậy Observer** — Fix memory explosion với throttling và tail sampling, fix sandbox access, lazy-start logic, và re-entrancy guard.
- **12 hệ sinh thái ngôn ngữ** — Rule mới cho Java, PHP, Perl, Kotlin/Android/KMP, C++, và Rust tham gia cùng TypeScript, Python, Go, và common rule hiện có.
- **Đóng góp cộng đồng** — Bản dịch tiếng Hàn và Trung, tối ưu biome hook, skill xử lý video, skill nghiệp vụ, PowerShell installer, hỗ trợ Antigravity IDE.
- **Củng cố CI** — Fix 19 test fail, kiểm tra catalog count, validate install manifest, và toàn bộ test suite green.

### v1.8.0 — Harness Performance System (Tháng 3/2026)

- **Bản release harness-first** — ECC giờ được định vị rõ ràng là hệ thống hiệu suất agent harness, không chỉ là gói config.
- **Nâng cấp độ tin cậy hook** — SessionStart root fallback, session summary ở phase Stop, và script-based hook thay thế one-liner dễ lỗi.
- **Hook runtime control** — `ECC_HOOK_PROFILE=minimal|standard|strict` và `ECC_DISABLED_HOOKS=...` để điều khiển runtime mà không cần sửa file hook.
- **Lệnh harness mới** — `/harness-audit`, `/loop-start`, `/loop-status`, `/quality-gate`, `/model-route`.
- **NanoClaw v2** — Model routing, hot-load skill, session branch/search/export/compact/metrics.
- **Cross-harness parity** — Hành vi được siết chặt trên Claude Code, Cursor, OpenCode, và Codex app/CLI.
- **997 internal test pass** — Toàn bộ suite green sau khi refactor hook/runtime và cập nhật tương thích.

### v1.7.0 — Mở rộng đa nền tảng & Presentation Builder (Tháng 2/2026)

- **Hỗ trợ Codex app + CLI** — Hỗ trợ Codex trực tiếp qua `AGENTS.md`, installer targeting, và tài liệu Codex
- **Skill `frontend-slides`** — Zero-dependency HTML slide builder với hướng dẫn convert PPTX và viewport rule nghiêm ngặt
- **5 skill kinh doanh/nội dung mới** — `article-writing`, `content-engine`, `market-research`, `investor-materials`, `investor-outreach`
- **Hỗ trợ tool rộng hơn** — Cursor, Codex, và OpenCode được siết chặt để cùng repo chạy trên tất cả các harness chính
- **992 internal test** — Mở rộng validation và regression test trên plugin, hook, skill, và packaging

### v1.6.0 — Codex CLI, AgentShield & Marketplace (Tháng 2/2026)

- **Hỗ trợ Codex CLI** — Lệnh `/codex-setup` mới tạo `codex.md` tương thích OpenAI Codex CLI
- **7 skill mới** — `search-first`, `swift-actor-persistence`, `swift-protocol-di-testing`, `regex-vs-llm-structured-text`, `content-hash-cache-pattern`, `cost-aware-llm-pipeline`, `skill-stocktake`
- **Tích hợp AgentShield** — Skill `/security-scan` chạy AgentShield trực tiếp từ Claude Code; 1282 test, 102 rule
- **GitHub Marketplace** — ECC Tools GitHub App tại [github.com/marketplace/ecc-tools](https://github.com/marketplace/ecc-tools) với tier free/pro/enterprise
- **30+ PR cộng đồng đã merge** — Đóng góp từ 30 contributor qua 6 ngôn ngữ
- **978 internal test** — Mở rộng validation trên agent, skill, command, hook, và rule

### v1.4.1 — Sửa lỗi (Tháng 2/2026)

- **Sửa mất nội dung khi import instinct** — `parse_instinct_file()` đang lặng lẽ bỏ toàn bộ nội dung sau frontmatter (Action, Evidence, Examples) trong `/instinct-import`. ([#148](https://github.com/affaan-m/everything-claude-code/issues/148), [#161](https://github.com/affaan-m/everything-claude-code/pull/161))

### v1.4.0 — Rule đa ngôn ngữ, Installation Wizard & PM2 (Tháng 2/2026)

- **Installation wizard tương tác** — Skill `configure-ecc` hướng dẫn setup có phát hiện merge/overwrite
- **PM2 & orchestration đa agent** — 6 lệnh mới (`/pm2`, `/multi-plan`, `/multi-execute`, `/multi-backend`, `/multi-frontend`, `/multi-workflow`) cho workflow đa service
- **Kiến trúc rule đa ngôn ngữ** — Rule tách thành `common/` + `typescript/` + `python/` + `golang/` + các thư mục ngôn ngữ khác; chỉ cài ngôn ngữ bạn cần
- **Bản dịch tiếng Trung (zh-CN)** — Dịch đầy đủ agent, command, skill, và rule (80+ file)
- **GitHub Sponsors** — Hỗ trợ project qua GitHub Sponsors
- **CONTRIBUTING.md nâng cao** — Template PR chi tiết cho từng loại đóng góp

### v1.3.0 — Hỗ trợ plugin OpenCode (Tháng 2/2026)

- **Tích hợp OpenCode đầy đủ** — 12 agent, 24 command, 16 skill với hook qua plugin system của OpenCode (20+ loại event)
- **3 custom tool native** — run-tests, check-coverage, security-audit
- **Tài liệu LLM** — `llms.txt` cho toàn bộ tài liệu OpenCode

### v1.2.0 — Thống nhất Command & Skill (Tháng 2/2026)

- **Hỗ trợ Python/Django** — Skill pattern Django, security, TDD, verification
- **Skill Java Spring Boot** — Pattern, security, TDD, verification cho Spring Boot
- **Quản lý session** — Command `/sessions` cho lịch sử session
- **Continuous learning v2** — Học dựa instinct với confidence scoring, import/export, evolution

Xem changelog đầy đủ tại [Releases](https://github.com/affaan-m/everything-claude-code/releases).

---

## Bắt đầu Nhanh

Setup trong vòng 2 phút:

### Bước 1: Install Plugin

> LƯU Ý: Plugin tiện lợi, nhưng installer OSS bên dưới vẫn là đường ổn định nhất nếu bản Claude Code của bạn gặp khó khi resolve marketplace self-hosted.

```bash
# Thêm marketplace
/plugin marketplace add https://github.com/affaan-m/everything-claude-code

# Install plugin
/plugin install ecc@ecc
```

### Bước 2: Install Rules (Bắt buộc)

> WARNING: **Quan trọng:** Plugin Claude Code không thể distribute `rules` tự động. Cần install thủ công:

```bash
# Clone repo trước
git clone https://github.com/affaan-m/everything-claude-code.git
cd everything-claude-code

# Install dependency (chọn package manager của bạn)
npm install        # hoặc: pnpm install | yarn install | bun install

# macOS/Linux

# Khuyến nghị: install mọi thứ (profile full)
./install.sh --profile full

# Hoặc install cho ngôn ngữ cụ thể
./install.sh typescript    # hoặc python hoặc golang hoặc swift hoặc php
# ./install.sh typescript python golang swift php
# ./install.sh --target cursor typescript
# ./install.sh --target antigravity typescript
# ./install.sh --target gemini --profile full
```

```powershell
# Windows PowerShell

# Khuyến nghị: install mọi thứ (profile full)
.\install.ps1 --profile full

# Hoặc install cho ngôn ngữ cụ thể
.\install.ps1 typescript   # hoặc python hoặc golang hoặc swift hoặc php
# .\install.ps1 typescript python golang swift php
# .\install.ps1 --target cursor typescript
# .\install.ps1 --target antigravity typescript
# .\install.ps1 --target gemini --profile full

# npm entrypoint cũng hoạt động cross-platform
npx ecc-install typescript
```

Với hướng dẫn install thủ công, xem README trong thư mục `rules/`. Khi copy rule thủ công, copy cả thư mục ngôn ngữ (ví dụ `rules/common` hoặc `rules/golang`), không copy từng file bên trong, để các relative reference hoạt động đúng và không bị trùng tên file.

### Bước 3: Bắt đầu Sử dụng

```bash
# Skill là workflow surface chính.
# Tên lệnh slash hiện có vẫn hoạt động trong khi ECC migrate khỏi commands/.

# Plugin install dùng dạng namespace
/ecc:plan "Add user authentication"

# Manual install giữ dạng slash ngắn:
# /plan "Add user authentication"

# Xem các command khả dụng
/plugin list ecc@ecc
```

**Xong!** Bạn giờ có access vào 47 agent, 181 skill, và 79 legacy command shim.

### Các lệnh multi-model cần setup thêm

> WARNING: Các lệnh `multi-*` **không** nằm trong phần install plugin/rule cơ bản ở trên.
>
> Để dùng `/multi-plan`, `/multi-execute`, `/multi-backend`, `/multi-frontend`, và `/multi-workflow`, bạn cần install thêm runtime `ccg-workflow`.
>
> Khởi tạo với `npx ccg-workflow`.
>
> Runtime đó cung cấp các external dependency mà các lệnh này cần, bao gồm:
> - `~/.claude/bin/codeagent-wrapper`
> - `~/.claude/.ccg/prompts/*`
>
> Không có `ccg-workflow`, các lệnh `multi-*` sẽ không chạy đúng.

---

## Hỗ trợ Cross-Platform

Plugin này hỗ trợ đầy đủ **Windows, macOS, và Linux**, cùng với tích hợp chặt chẽ trên các IDE chính (Cursor, OpenCode, Antigravity) và CLI harness. Tất cả hook và script đã được rewrite bằng Node.js để tương thích tối đa.

### Phát hiện Package Manager

Plugin tự động detect package manager bạn dùng (npm, pnpm, yarn, hoặc bun) theo thứ tự ưu tiên:

1. **Biến môi trường**: `CLAUDE_PACKAGE_MANAGER`
2. **Project config**: `.claude/package-manager.json`
3. **package.json**: Trường `packageManager`
4. **Lock file**: Detect từ package-lock.json, yarn.lock, pnpm-lock.yaml, hoặc bun.lockb
5. **Global config**: `~/.claude/package-manager.json`
6. **Fallback**: Package manager khả dụng đầu tiên

Để set package manager bạn muốn:

```bash
# Qua biến môi trường
export CLAUDE_PACKAGE_MANAGER=pnpm

# Qua global config
node scripts/setup-package-manager.js --global pnpm

# Qua project config
node scripts/setup-package-manager.js --project bun

# Detect setting hiện tại
node scripts/setup-package-manager.js --detect
```

Hoặc dùng lệnh `/setup-pm` trong Claude Code.

### Hook Runtime Control

Dùng runtime flag để điều chỉnh mức nghiêm ngặt hoặc disable hook cụ thể tạm thời:

```bash
# Profile mức nghiêm ngặt hook (mặc định: standard)
export ECC_HOOK_PROFILE=standard

# Danh sách hook ID cách nhau bằng dấu phẩy để disable
export ECC_DISABLED_HOOKS="pre:bash:tmux-reminder,post:edit:typecheck"
```

---

## Bên trong có gì

Repo này là một **Claude Code plugin** — install trực tiếp hoặc copy component thủ công.

```
everything-claude-code/
|-- .claude-plugin/   # Plugin và marketplace manifest
|   |-- plugin.json         # Plugin metadata và component path
|   |-- marketplace.json    # Marketplace catalog cho /plugin marketplace add
|
|-- agents/           # 36 subagent chuyên biệt cho delegation
|   |-- planner.md           # Lập kế hoạch triển khai feature
|   |-- architect.md         # Quyết định thiết kế hệ thống
|   |-- tdd-guide.md         # Test-driven development
|   |-- code-reviewer.md     # Review chất lượng và bảo mật
|   |-- security-reviewer.md # Phân tích lỗ hổng
|   |-- build-error-resolver.md
|   |-- e2e-runner.md        # E2E test với Playwright
|   |-- refactor-cleaner.md  # Dọn dead code
|   |-- doc-updater.md       # Đồng bộ tài liệu
|   |-- docs-lookup.md       # Tra cứu doc/API
|   |-- chief-of-staff.md    # Phân loại và soạn thảo giao tiếp
|   |-- loop-operator.md     # Chạy autonomous loop
|   |-- harness-optimizer.md # Tinh chỉnh harness config
|   |-- cpp-reviewer.md      # Review code C++
|   |-- cpp-build-resolver.md # Fix lỗi build C++
|   |-- go-reviewer.md       # Review code Go
|   |-- go-build-resolver.md # Fix lỗi build Go
|   |-- python-reviewer.md   # Review code Python
|   |-- database-reviewer.md # Review Database/Supabase
|   |-- typescript-reviewer.md # Review code TypeScript/JavaScript
|   |-- java-reviewer.md     # Review code Java/Spring Boot
|   |-- java-build-resolver.md # Fix lỗi build Java/Maven/Gradle
|   |-- kotlin-reviewer.md   # Review code Kotlin/Android/KMP
|   |-- kotlin-build-resolver.md # Fix lỗi build Kotlin/Gradle
|   |-- rust-reviewer.md     # Review code Rust
|   |-- rust-build-resolver.md # Fix lỗi build Rust
|   |-- pytorch-build-resolver.md # Fix lỗi training PyTorch/CUDA
|
|-- skills/           # Workflow definition và domain knowledge
|   |-- coding-standards/           # Best practice cho từng ngôn ngữ
|   |-- clickhouse-io/              # ClickHouse analytics, query, data engineering
|   |-- backend-patterns/           # API, database, caching pattern
|   |-- frontend-patterns/          # React, Next.js pattern
|   |-- frontend-slides/            # HTML slide và workflow convert PPTX
|   |-- article-writing/            # Viết bài dài theo voice cung cấp
|   |-- content-engine/             # Nội dung social media đa nền tảng
|   |-- market-research/            # Nghiên cứu thị trường, đối thủ, nhà đầu tư
|   |-- investor-materials/         # Pitch deck, one-pager, memo, financial model
|   |-- investor-outreach/          # Fundraising outreach cá nhân hóa
|   |-- continuous-learning/        # Tự động extract pattern từ session
|   |-- continuous-learning-v2/     # Instinct-based learning với confidence scoring
|   |-- iterative-retrieval/        # Progressive context refinement cho subagent
|   |-- strategic-compact/          # Gợi ý compact context thủ công
|   |-- tdd-workflow/               # TDD methodology
|   |-- security-review/            # Security checklist
|   |-- eval-harness/               # Verification loop evaluation (Longform Guide)
|   |-- verification-loop/          # Continuous verification (Longform Guide)
|   |-- videodb/                   # Video/audio: ingest, search, edit, generate, stream (NEW)
|   |-- golang-patterns/            # Go idiom và best practice
|   |-- golang-testing/             # Go testing pattern, TDD, benchmark
|   |-- cpp-coding-standards/       # C++ coding standard từ C++ Core Guidelines (NEW)
|   |-- cpp-testing/                # C++ testing với GoogleTest, CMake/CTest (NEW)
|   |-- django-patterns/            # Django pattern, model, view (NEW)
|   |-- django-security/            # Django security best practice (NEW)
|   |-- django-tdd/                 # Django TDD workflow (NEW)
|   |-- django-verification/        # Django verification loop (NEW)
|   |-- laravel-patterns/           # Laravel architecture pattern (NEW)
|   |-- laravel-security/           # Laravel security best practice (NEW)
|   |-- laravel-tdd/                # Laravel TDD workflow (NEW)
|   |-- laravel-verification/       # Laravel verification loop (NEW)
|   |-- python-patterns/            # Python idiom và best practice (NEW)
|   |-- python-testing/             # Python testing với pytest (NEW)
|   |-- springboot-patterns/        # Java Spring Boot pattern (NEW)
|   |-- springboot-security/        # Spring Boot security (NEW)
|   |-- springboot-tdd/             # Spring Boot TDD (NEW)
|   |-- springboot-verification/    # Spring Boot verification (NEW)
|   |-- configure-ecc/              # Interactive installation wizard (NEW)
|   |-- security-scan/              # Tích hợp AgentShield security auditor (NEW)
|   |-- java-coding-standards/     # Java coding standards (NEW)
|   |-- jpa-patterns/              # JPA/Hibernate patterns (NEW)
|   |-- postgres-patterns/         # PostgreSQL optimization patterns (NEW)
|   |-- nutrient-document-processing/ # Xử lý tài liệu với Nutrient API (NEW)
|   |-- docs/examples/project-guidelines-template.md  # Template skill theo project
|   |-- database-migrations/         # Migration pattern (Prisma, Drizzle, Django, Go) (NEW)
|   |-- api-design/                  # REST API design, pagination, error response (NEW)
|   |-- deployment-patterns/         # CI/CD, Docker, health check, rollback (NEW)
|   |-- docker-patterns/            # Docker Compose, network, volume, bảo mật container (NEW)
|   |-- e2e-testing/                 # Playwright E2E và Page Object Model (NEW)
|   |-- content-hash-cache-pattern/  # Cache SHA-256 theo nội dung file (NEW)
|   |-- cost-aware-llm-pipeline/     # Tối ưu chi phí LLM, routing model, budget (NEW)
|   |-- regex-vs-llm-structured-text/ # Regex vs LLM khi parse text có cấu trúc (NEW)
|   |-- swift-actor-persistence/     # Swift actor persistence thread-safe (NEW)
|   |-- swift-protocol-di-testing/   # Protocol DI cho code test được (NEW)
|   |-- search-first/               # Research trước khi code (NEW)
|   |-- skill-stocktake/            # Audit chất lượng skill và command (NEW)
|   |-- liquid-glass-design/         # iOS 26 Liquid Glass design system (NEW)
|   |-- foundation-models-on-device/ # Apple on-device LLM FoundationModels (NEW)
|   |-- swift-concurrency-6-2/       # Swift 6.2 Approachable Concurrency (NEW)
|   |-- perl-patterns/              # Modern Perl 5.36+ idiom (NEW)
|   |-- perl-security/              # Perl security, taint mode, I/O an toàn (NEW)
|   |-- perl-testing/               # Perl TDD với Test2::V0, prove, Devel::Cover (NEW)
|   |-- autonomous-loops/           # Autonomous loop: pipeline, PR loop, DAG (NEW)
|   |-- plankton-code-quality/      # Chất lượng code lúc viết với Plankton hooks (NEW)
|
|-- commands/         # Legacy slash-entry shim; ưu tiên skills/
|   |-- tdd.md              # /tdd - Test-driven development
|   |-- plan.md             # /plan - Lập kế hoạch triển khai
|   |-- e2e.md              # /e2e - Generate E2E test
|   |-- code-review.md      # /code-review - Quality review
|   |-- build-fix.md        # /build-fix - Fix lỗi build
|   |-- refactor-clean.md   # /refactor-clean - Xóa dead code
|   |-- learn.md            # /learn - Extract pattern giữa session (Longform Guide)
|   |-- learn-eval.md       # /learn-eval - Extract, evaluate, lưu pattern (NEW)
|   |-- checkpoint.md       # /checkpoint - Lưu verification state (Longform Guide)
|   |-- verify.md           # /verify - Chạy verification loop (Longform Guide)
|   |-- setup-pm.md         # /setup-pm - Config package manager
|   |-- go-review.md        # /go-review - Go code review (NEW)
|   |-- go-test.md          # /go-test - Go TDD workflow (NEW)
|   |-- go-build.md         # /go-build - Fix lỗi build Go (NEW)
|   |-- skill-create.md     # /skill-create - Generate skill từ git history (NEW)
|   |-- instinct-status.md  # /instinct-status - Xem instinct đã học (NEW)
|   |-- instinct-import.md  # /instinct-import - Import instinct (NEW)
|   |-- instinct-export.md  # /instinct-export - Export instinct (NEW)
|   |-- evolve.md           # /evolve - Gom instinct thành skill
|   |-- prune.md            # /prune - Xóa instinct pending hết hạn (NEW)
|   |-- pm2.md              # /pm2 - Quản lý lifecycle PM2 (NEW)
|   |-- multi-plan.md       # /multi-plan - Phân rã task đa agent (NEW)
|   |-- multi-execute.md    # /multi-execute - Workflow đa agent có điều phối (NEW)
|   |-- multi-backend.md    # /multi-backend - Orchestration backend đa service (NEW)
|   |-- multi-frontend.md   # /multi-frontend - Orchestration frontend đa service (NEW)
|   |-- multi-workflow.md   # /multi-workflow - Workflow đa service tổng quát (NEW)
|   |-- orchestrate.md      # /orchestrate - Điều phối đa agent
|   |-- sessions.md         # /sessions - Quản lý session history
|   |-- eval.md             # /eval - Đánh giá theo tiêu chí
|   |-- test-coverage.md    # /test-coverage - Phân tích coverage
|   |-- update-docs.md      # /update-docs - Cập nhật tài liệu
|   |-- update-codemaps.md  # /update-codemaps - Cập nhật codemap
|   |-- python-review.md    # /python-review - Review Python (NEW)
|
|-- rules/            # Nguyên tắc luôn tuân thủ (copy vào ~/.claude/rules/)
|   |-- README.md            # Tổng quan cấu trúc và hướng dẫn install
|   |-- common/              # Nguyên tắc chung, không phụ thuộc ngôn ngữ
|   |   |-- coding-style.md    # Immutability, tổ chức file
|   |   |-- git-workflow.md    # Commit format, PR process
|   |   |-- testing.md         # TDD, yêu cầu coverage 80%
|   |   |-- performance.md     # Chọn model, quản lý context
|   |   |-- patterns.md        # Design pattern, skeleton project
|   |   |-- hooks.md           # Hook architecture, TodoWrite
|   |   |-- agents.md          # Khi nào delegate cho subagent
|   |   |-- security.md        # Security check bắt buộc
|   |-- typescript/          # Dành cho TypeScript/JavaScript
|   |-- python/              # Dành cho Python
|   |-- golang/              # Dành cho Go
|   |-- swift/               # Dành cho Swift
|   |-- php/                 # Dành cho PHP
|
|-- hooks/            # Automation dựa trên trigger
|   |-- README.md                 # Hook doc, recipe, và hướng dẫn customize
|   |-- hooks.json                # Tất cả hook config (PreToolUse, PostToolUse, Stop, v.v.)
|   |-- memory-persistence/       # Session lifecycle hook (Longform Guide)
|   |-- strategic-compact/        # Gợi ý compact context (Longform Guide)
|
|-- scripts/          # Cross-platform Node.js script (NEW)
|   |-- lib/                     # Shared utility
|   |   |-- utils.js             # Cross-platform file/path/system utility
|   |   |-- package-manager.js   # Detect và chọn package manager
|   |-- hooks/                   # Hook implementation
|   |   |-- session-start.js     # Load context khi bắt đầu session
|   |   |-- session-end.js       # Save state khi kết thúc session
|   |   |-- pre-compact.js       # Save state trước khi compact
|   |   |-- suggest-compact.js   # Gợi ý strategic compact
|   |   |-- evaluate-session.js  # Extract pattern từ session
|   |-- setup-package-manager.js # Interactive PM setup
|
|-- tests/            # Test suite (NEW)
|   |-- lib/                     # Library test
|   |-- hooks/                   # Hook test
|   |-- run-all.js               # Chạy tất cả test
|
|-- contexts/         # Dynamic system prompt injection (Longform Guide)
|   |-- dev.md              # Development mode context
|   |-- review.md           # Code review mode context
|   |-- research.md         # Research/exploration mode context
|
|-- examples/         # Config và session mẫu
|   |-- CLAUDE.md             # Project-level config mẫu
|   |-- user-CLAUDE.md        # User-level config mẫu
|   |-- saas-nextjs-CLAUDE.md   # SaaS thực tế (Next.js + Supabase + Stripe)
|   |-- go-microservice-CLAUDE.md # Go microservice thực tế (gRPC + PostgreSQL)
|   |-- django-api-CLAUDE.md      # Django REST API thực tế (DRF + Celery)
|   |-- laravel-api-CLAUDE.md     # Laravel API thực tế (PostgreSQL + Redis)
|   |-- rust-api-CLAUDE.md        # Rust API thực tế (Axum + SQLx + PostgreSQL)
|
|-- mcp-configs/      # MCP server config
|   |-- mcp-servers.json    # GitHub, Supabase, Vercel, Railway, v.v.
|
|-- marketplace.json  # Self-hosted marketplace config (cho /plugin marketplace add)
```

---

## Ecosystem Tools

### Skill Creator

Hai cách generate Claude Code skill từ repo của bạn:

#### Option A: Phân tích Local (Built-in)

Dùng lệnh `/skill-create` để phân tích local mà không cần service bên ngoài:

```bash
/skill-create                    # Phân tích repo hiện tại
/skill-create --instincts        # Cũng generate instinct cho continuous-learning
```

Lệnh này phân tích git history local và generate file SKILL.md.

#### Option B: GitHub App (Nâng cao)

Cho tính năng nâng cao (10k+ commit, auto PR, chia sẻ team):

[Install GitHub App](https://github.com/apps/skill-creator) | [ecc.tools](https://ecc.tools)

```bash
# Comment trên bất kỳ issue nào:
/skill-creator analyze

# Hoặc auto trigger khi push vào default branch
```

Cả hai option đều tạo:
- **File SKILL.md** — Skill sẵn sàng dùng cho Claude Code
- **Bộ instinct** — Cho continuous-learning-v2
- **Pattern extraction** — Học từ commit history của bạn

### AgentShield — Security Auditor

> Được build tại Claude Code Hackathon (Cerebral Valley x Anthropic, Tháng 2/2026). 1282 test, 98% coverage, 102 static analysis rule.

Scan config Claude Code của bạn để tìm vulnerability, misconfiguration, và injection risk.

```bash
# Quick scan (không cần install)
npx ecc-agentshield scan

# Auto-fix các issue an toàn
npx ecc-agentshield scan --fix

# Deep analysis với ba Opus 4.6 agent
npx ecc-agentshield scan --opus --stream

# Generate secure config từ đầu
npx ecc-agentshield init
```

**Scan những gì:** CLAUDE.md, settings.json, MCP config, hook, agent definition, và skill trên 5 category — secret detection (14 pattern), permission audit, hook injection analysis, MCP server risk profiling, và agent config review.

**Flag `--opus`** chạy ba Claude Opus 4.6 agent trong pipeline red-team/blue-team/auditor. Attacker tìm exploit chain, defender đánh giá protection, và auditor tổng hợp cả hai thành prioritized risk assessment. Adversarial reasoning, không chỉ pattern matching.

**Output format:** Terminal (xếp hạng A-F), JSON (CI pipeline), Markdown, HTML. Exit code 2 khi phát hiện critical cho build gate.

Dùng `/security-scan` trong Claude Code để chạy, hoặc thêm vào CI với [GitHub Action](https://github.com/affaan-m/agentshield).

[GitHub](https://github.com/affaan-m/agentshield) | [npm](https://www.npmjs.com/package/ecc-agentshield)

### Continuous Learning v2

Hệ thống instinct-based learning tự động học pattern của bạn:

```bash
/instinct-status        # Hiển thị instinct đã học với confidence
/instinct-import <file> # Import instinct từ người khác
/instinct-export        # Export instinct để chia sẻ
/evolve                 # Cluster instinct liên quan thành skill
```

Xem `skills/continuous-learning-v2/` để có doc đầy đủ.

---

## Yêu cầu

### Phiên bản Claude Code CLI

**Phiên bản tối thiểu: v2.1.0 trở lên**

Plugin này yêu cầu Claude Code CLI v2.1.0+ do thay đổi cách plugin system xử lý hook.

Kiểm tra phiên bản:
```bash
claude --version
```

### Quan trọng: Hành vi Auto-load Hook

> WARNING: **Cho contributor:** KHÔNG thêm field `"hooks"` vào `.claude-plugin/plugin.json`. Điều này được enforce bằng regression test.

Claude Code v2.1+ **tự động load** `hooks/hooks.json` từ bất kỳ plugin đã install nào. Khai báo explicit trong `plugin.json` gây lỗi duplicate detection:

```
Duplicate hooks file detected: ./hooks/hooks.json resolves to already-loaded file
```

---

## Cài đặt

### Option 1: Install dạng Plugin (Khuyến nghị)

Cách dễ nhất — install làm Claude Code plugin:

```bash
# Thêm repo này làm marketplace
/plugin marketplace add https://github.com/affaan-m/everything-claude-code

# Install plugin
/plugin install ecc@ecc
```

Hoặc thêm trực tiếp vào `~/.claude/settings.json`:

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
    "ecc@ecc": true
  }
}
```

Bạn sẽ có access ngay vào tất cả command, agent, skill, và hook.

> **Lưu ý:** Plugin system của Claude Code không hỗ trợ distribute `rules` qua plugin ([upstream limitation](https://code.claude.com/docs/en/plugins-reference)). Bạn cần install rule thủ công:
>
> ```bash
> # Clone repo trước
> git clone https://github.com/affaan-m/everything-claude-code.git
>
> # Option A: User-level rule (áp dụng cho tất cả project)
> mkdir -p ~/.claude/rules
> cp -r everything-claude-code/rules/common ~/.claude/rules/
> cp -r everything-claude-code/rules/typescript ~/.claude/rules/
> cp -r everything-claude-code/rules/python ~/.claude/rules/
> cp -r everything-claude-code/rules/golang ~/.claude/rules/
> cp -r everything-claude-code/rules/php ~/.claude/rules/
>
> # Option B: Project-level rule (chỉ áp dụng cho project hiện tại)
> mkdir -p .claude/rules
> cp -r everything-claude-code/rules/common .claude/rules/
> cp -r everything-claude-code/rules/typescript .claude/rules/
> ```

---

### Option 2: Manual Install

Nếu bạn muốn kiểm soát thủ công:

```bash
# Clone repo
git clone https://github.com/affaan-m/everything-claude-code.git

# Copy agent vào Claude config
cp everything-claude-code/agents/*.md ~/.claude/agents/

# Copy thư mục rule (common + language-specific)
mkdir -p ~/.claude/rules
cp -r everything-claude-code/rules/common ~/.claude/rules/
cp -r everything-claude-code/rules/typescript ~/.claude/rules/
cp -r everything-claude-code/rules/python ~/.claude/rules/
cp -r everything-claude-code/rules/golang ~/.claude/rules/
cp -r everything-claude-code/rules/php ~/.claude/rules/

# Copy skill trước (workflow surface chính)
cp -r everything-claude-code/.agents/skills/* ~/.claude/skills/
cp -r everything-claude-code/skills/search-first ~/.claude/skills/

# Optional: giữ niche/framework skill chỉ khi cần
# for s in django-patterns django-tdd laravel-patterns springboot-patterns; do
# cp -r everything-claude-code/skills/$s ~/.claude/skills/
# done

# Optional: giữ legacy slash command trong quá trình migrate
mkdir -p ~/.claude/commands
cp everything-claude-code/commands/*.md ~/.claude/commands/
```

#### Thêm hook vào settings.json

Copy hook từ `hooks/hooks.json` vào `~/.claude/settings.json`.

#### Config MCP

Copy MCP server definition bạn muốn từ `mcp-configs/mcp-servers.json` vào Claude Code config tại `~/.claude/settings.json`, hoặc vào `.mcp.json` cấp project nếu bạn muốn repo-local MCP access.

Nếu bạn đã tự chạy bản copy MCP trùng với ECC, đặt:

```bash
export ECC_DISABLED_MCPS="github,context7,exa,playwright,sequential-thinking,memory"
```

Luồng cài ECC và sync Codex sẽ bỏ qua hoặc gỡ server bundle trùng thay vì thêm trùng lặp.

**Quan trọng:** Thay placeholder `YOUR_*_HERE` bằng API key thực tế của bạn.

---

## Khái niệm Chính

### Agent

Subagent xử lý task được delegate với scope giới hạn. Ví dụ:

```markdown
---
name: code-reviewer
description: Review code về quality, security, và maintainability
tools: ["Read", "Grep", "Glob", "Bash"]
model: opus
---

Bạn là một senior code reviewer...
```

### Skill

Skill là workflow surface chính. Có thể gọi trực tiếp, auto-suggest, và tái sử dụng bởi agent. ECC vẫn ship `commands/` trong quá trình migrate, nhưng workflow mới nên đặt trong `skills/` trước.

```markdown
# TDD Workflow

1. Định nghĩa interface trước
2. Viết failing test (RED)
3. Implement code tối thiểu (GREEN)
4. Refactor (IMPROVE)
5. Verify coverage 80%+
```

### Hook

Hook trigger khi có tool event. Ví dụ — cảnh báo console.log:

```json
{
  "matcher": "tool == \"Edit\" && tool_input.file_path matches \"\\\\.(ts|tsx|js|jsx)$\"",
  "hooks": [{
    "type": "command",
    "command": "#!/bin/bash\ngrep -n 'console\\.log' \"$file_path\" && echo '[Hook] Xóa console.log' >&2"
  }]
}
```

### Rule

Rule là nguyên tắc luôn tuân thủ, tổ chức thành `common/` (language-agnostic) + thư mục language-specific:

```
rules/
  common/          # Nguyên tắc chung (luôn install)
  typescript/      # TS/JS specific pattern và tool
  python/          # Python specific pattern và tool
  golang/          # Go specific pattern và tool
  swift/           # Swift specific pattern và tool
  php/             # PHP specific pattern và tool
```

Xem [`rules/README.md`](../../rules/README.md) để biết chi tiết install và cấu trúc.

---

## Nên dùng Agent nào?

Không biết bắt đầu từ đâu? Dùng bảng tra cứu nhanh này. Skill là workflow surface chính; các slash command bên dưới là dạng tương thích mà hầu hết user đã quen. Các dạng slash vẫn được liệt kê vì thường là điểm vào quen thuộc nhất; bên dưới hood ECC đang chuyển dần các workflow này sang định nghĩa skills-first.

| Tôi muốn... | Dùng lệnh này | Agent được dùng |
|-------------|---------------|-----------------|
| Lập kế hoạch feature mới | `/ecc:plan "Add auth"` | planner |
| Thiết kế system architecture | `/ecc:plan` + architect agent | architect |
| Viết code với test trước | `/tdd` | tdd-guide |
| Review code vừa viết | `/code-review` | code-reviewer |
| Fix build fail | `/build-fix` | build-error-resolver |
| Chạy end-to-end test | `/e2e` | e2e-runner |
| Tìm security vulnerability | `/security-scan` | security-reviewer |
| Xóa dead code | `/refactor-clean` | refactor-cleaner |
| Update documentation | `/update-docs` | doc-updater |
| Review Go code | `/go-review` | go-reviewer |
| Review Python code | `/python-review` | python-reviewer |
| Review TypeScript/JavaScript code | *(gọi trực tiếp `typescript-reviewer`)* | typescript-reviewer |
| Audit database query | *(auto-delegate)* | database-reviewer |

### Workflow Thường dùng

**Bắt đầu feature mới:**
```
/ecc:plan "Thêm user authentication với OAuth"
                                              → planner tạo implementation blueprint
/tdd                                          → tdd-guide enforce write-test-first
/code-review                                  → code-reviewer kiểm tra công việc
```

**Fix bug:**
```
/tdd                                          → tdd-guide: viết failing test reproduce bug
                                              → implement fix, verify test pass
/code-review                                  → code-reviewer: bắt regression
```

**Chuẩn bị production:**
```
/security-scan                                → security-reviewer: audit OWASP Top 10
/e2e                                          → e2e-runner: test critical user flow
/test-coverage                                → verify coverage 80%+
```

---

## FAQ

<details>
<summary><b>Làm sao kiểm tra agent/command nào đã install?</b></summary>

```bash
/plugin list ecc@ecc
```

Lệnh này hiển thị tất cả agent, command, và skill có sẵn từ plugin.
</details>

<details>
<summary><b>Hook không hoạt động / Thấy lỗi "Duplicate hooks file"</b></summary>

Đây là issue phổ biến nhất. **KHÔNG thêm field `"hooks"` vào `.claude-plugin/plugin.json`.** Claude Code v2.1+ tự động load `hooks/hooks.json` từ plugin đã install. Khai báo explicit gây lỗi duplicate detection. Xem [#29](https://github.com/affaan-m/everything-claude-code/issues/29), [#52](https://github.com/affaan-m/everything-claude-code/issues/52), [#103](https://github.com/affaan-m/everything-claude-code/issues/103).
</details>

<details>
<summary><b>Dùng được ECC với custom API endpoint hoặc model gateway không?</b></summary>

Được. ECC không hardcode transport setting của Anthropic. Nó chạy local qua CLI/plugin surface bình thường của Claude Code, nên hoạt động với:

- Claude Code hosted bởi Anthropic
- Official Claude Code gateway setup dùng `ANTHROPIC_BASE_URL` và `ANTHROPIC_AUTH_TOKEN`
- Custom endpoint tương thích dùng Anthropic API mà Claude Code expect

Ví dụ tối giản:

```bash
export ANTHROPIC_BASE_URL=https://your-gateway.example.com
export ANTHROPIC_AUTH_TOKEN=your-token
claude
```

Nếu gateway của bạn remap model name, config điều đó trong Claude Code chứ không phải trong ECC. Hook, skill, command, và rule của ECC là model-provider agnostic khi CLI `claude` đã hoạt động.

Tài liệu chính thức:
- [Claude Code LLM gateway](https://docs.anthropic.com/en/docs/claude-code/llm-gateway)
- [Claude Code model configuration](https://docs.anthropic.com/en/docs/claude-code/model-config)
</details>

<details>
<summary><b>Context window đang bị thu hẹp / Claude hết context</b></summary>

Quá nhiều MCP server ăn context của bạn. Mỗi MCP tool description tiêu thụ token từ context window 200k, có thể giảm còn ~70k.

**Fix:** Disable MCP không dùng cho từng project:
```json
// Trong .claude/settings.json của project
{
  "disabledMcpServers": ["supabase", "railway", "vercel"]
}
```

Giữ dưới 10 MCP enabled và dưới 80 tool active.
</details>

<details>
<summary><b>Chỉ dùng một số component (ví dụ chỉ agent) được không?</b></summary>

Được. Dùng Option 2 (manual install) và chỉ copy những gì bạn cần:

```bash
# Chỉ agent
cp everything-claude-code/agents/*.md ~/.claude/agents/

# Chỉ rule
mkdir -p ~/.claude/rules/
cp -r everything-claude-code/rules/common ~/.claude/rules/
```

Mỗi component hoàn toàn độc lập.
</details>

<details>
<summary><b>ECC có hoạt động với Cursor / OpenCode / Codex / Antigravity không?</b></summary>

Có. ECC hỗ trợ cross-platform:
- **Cursor**: Config đã dịch sẵn trong `.cursor/`. Xem [Hỗ trợ Cursor IDE](#hỗ-trợ-cursor-ide).
- **Gemini CLI**: Hỗ trợ thử nghiệm cấp project qua `.gemini/GEMINI.md` và chung installer.
- **OpenCode**: Plugin đầy đủ trong `.opencode/`. Xem [Hỗ trợ OpenCode](#hỗ-trợ-opencode).
- **Codex**: Hỗ trợ tốt cho cả macOS app và CLI, có guard adapter và SessionStart fallback. Xem PR [#257](https://github.com/affaan-m/everything-claude-code/pull/257).
- **Antigravity**: Tích hợp chặt cho workflow, skill, và rule dẹt trong `.agent/`. Xem [Antigravity Guide](../../docs/ANTIGRAVITY-GUIDE.md).
- **Harness không native**: Đường fallback thủ công cho Grok và tương tự. Xem [Manual Adaptation Guide](../../docs/MANUAL-ADAPTATION-GUIDE.md).
- **Claude Code**: Native — đây là target chính.
</details>

<details>
<summary><b>Làm sao contribute skill hoặc agent mới?</b></summary>

Xem [CONTRIBUTING.md](../../CONTRIBUTING.md). Tóm tắt:
1. Fork repo
2. Tạo skill tại `skills/tên-skill/SKILL.md` (với YAML frontmatter)
3. Hoặc tạo agent tại `agents/tên-agent.md`
4. Gửi PR với mô tả rõ ràng về chức năng và khi nào dùng
</details>

---

## Chạy Test

Plugin bao gồm test suite đầy đủ:

```bash
# Chạy tất cả test
node tests/run-all.js

# Chạy từng test file
node tests/lib/utils.test.js
node tests/lib/package-manager.test.js
node tests/hooks/hooks.test.js
```

---

## Đóng góp

**Hoan nghênh và khuyến khích contribution.**

Repo này là tài nguyên cộng đồng. Nếu bạn có:
- Agent hoặc skill hữu ích
- Hook hay
- MCP config tốt hơn
- Rule được cải thiện

Hãy contribute! Xem [CONTRIBUTING.md](../../CONTRIBUTING.md) để biết hướng dẫn.

### Ý tưởng Contribution

- Language-specific skill (Rust, C#, Kotlin, Java) — Go, Python, Perl, Swift, và TypeScript đã có sẵn
- Framework-specific config (Rails, FastAPI) — Django, NestJS, Spring Boot, và Laravel đã có sẵn
- DevOps agent (Kubernetes, Terraform, AWS, Docker)
- Testing strategy (các framework khác nhau, visual regression)
- Domain-specific knowledge (ML, data engineering, mobile)

---

## Hỗ trợ Cursor IDE

ECC cung cấp **hỗ trợ Cursor IDE đầy đủ** với hook, rule, agent, skill, command và MCP config được chuyển sang định dạng native của Cursor.

### Bắt đầu nhanh (Cursor)

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

### Có gì trong bản Cursor

| Thành phần | Số lượng | Chi tiết |
|------------|----------|----------|
| Hook Events | 15 | sessionStart, beforeShellExecution, afterFileEdit, beforeMCPExecution, beforeSubmitPrompt, và 10 event khác |
| Hook Scripts | 16 | Script Node.js mỏng ủy quyền cho `scripts/hooks/` qua adapter chung |
| Rules | 34 | 9 common (alwaysApply) + 25 theo ngôn ngữ (TypeScript, Python, Go, Swift, PHP) |
| Agents | Shared | Qua AGENTS.md ở root (Cursor đọc native) |
| Skills | Shared + Bundled | Qua AGENTS.md và `.cursor/skills/` cho bản dịch thêm |
| Commands | Shared | `.cursor/commands/` nếu đã cài |
| MCP Config | Shared | `.cursor/mcp.json` nếu đã cài |

### Kiến trúc Hook (DRY Adapter Pattern)

Cursor có **nhiều hook event hơn Claude Code** (20 so với 8). Module `.cursor/hooks/adapter.js` chuyển stdin JSON của Cursor sang format Claude Code để tái sử dụng `scripts/hooks/*.js` không trùng code.

```
Cursor stdin JSON → adapter.js → transforms → scripts/hooks/*.js
                                              (shared với Claude Code)
```

Hook chính:
- **beforeShellExecution** — Chặn dev server ngoài tmux (exit 2), review trước git push
- **afterFileEdit** — Auto-format + kiểm tra TypeScript + cảnh báo console.log
- **beforeSubmitPrompt** — Phát hiện secret (sk-, ghp_, AKIA) trong prompt
- **beforeTabFileRead** — Chặn Tab đọc .env, .key, .pem (exit 2)
- **beforeMCPExecution / afterMCPExecution** — Ghi log audit MCP

### Định dạng Rules

Rule Cursor dùng YAML frontmatter với `description`, `globs`, và `alwaysApply`:

```yaml
---
description: "TypeScript coding style extending common rules"
globs: ["**/*.ts", "**/*.tsx", "**/*.js", "**/*.jsx"]
alwaysApply: false
---
```

---

## Codex — macOS App + CLI

ECC có **hỗ trợ Codex hạng nhất** cho cả app macOS và CLI, kèm config tham chiếu, bổ sung AGENTS.md riêng Codex, và skill dùng chung.

### Bắt đầu nhanh (Codex App + CLI)

```bash
# Chạy Codex CLI trong repo — AGENTS.md và .codex/ tự detect
codex

# Setup tự động: sync asset ECC vào ~/.codex
npm install && bash scripts/sync-ecc-to-codex.sh

# Hoặc copy config tham chiếu về home
cp .codex/config.toml ~/.codex/config.toml
```

Script sync merge MCP server ECC vào `~/.codex/config.toml` theo chiến lược **chỉ thêm** — không xóa hoặc sửa server bạn đã có. Chạy `--dry-run` để xem trước, hoặc `--update-mcp` để refresh server ECC mới nhất.

### Có gì trong bản Codex

| Thành phần | Số lượng | Chi tiết |
|------------|----------|----------|
| Config | 1 | `.codex/config.toml` — approval/sandbox/web_search, MCP, notification, profile |
| AGENTS.md | 2 | Root (chung) + `.codex/AGENTS.md` (bổ sung Codex) |
| Skills | 30 | `.agents/skills/` — SKILL.md + agents/openai.yaml mỗi skill |
| MCP Servers | 6 | GitHub, Context7, Exa, Memory, Playwright, Sequential Thinking (7 nếu sync Supabase qua `--update-mcp`) |
| Profiles | 2 | `strict` (sandbox read-only) và `yolo` (auto-approve đầy đủ) |
| Agent Roles | 3 | `.codex/agents/` — explorer, reviewer, docs-researcher |

Danh sách skill tại `.agents/skills/` (Codex auto-load) khớp bảng trong README tiếng Anh — xem [README gốc](../../README.md#codex-macos-app--cli-support).

### Giới hạn chính

Codex **chưa có parity thực thi hook kiểu Claude**. ECC áp enforcement qua `AGENTS.md`, tùy chọn `model_instructions_file`, và cài đặt sandbox/approval.

### Multi-Agent

Bật `features.multi_agent = true` trong `.codex/config.toml`, định nghĩa role trong `[agents.<name>]`, trỏ tới file trong `.codex/agents/`, dùng `/agent` trên CLI để điều khiển agent con.

---

## Hỗ trợ OpenCode

ECC có **hỗ trợ OpenCode đầy đủ** gồm plugin và hook.

### Bắt đầu nhanh

```bash
npm install -g opencode
opencode
```

Cấu hình đọc từ `.opencode/opencode.json`.

### So sánh tính năng (Feature parity)

| Tính năng | Claude Code | OpenCode | Ghi chú |
|-----------|-------------|----------|---------|
| Agents | PASS: 47 | PASS: 12 | Claude Code nhiều hơn |
| Commands | PASS: 79 | PASS: 31 | Claude Code nhiều hơn |
| Skills | PASS: 181 | PASS: 37 | Claude Code nhiều hơn |
| Hooks | PASS: 8 loại event | PASS: 11 event | OpenCode có nhiều event hơn |
| Rules | PASS: 29 | PASS: 13 instruction | Claude Code nhiều hơn |
| MCP Servers | PASS: 14 | PASS: Full | Parity đầy đủ |
| Custom Tools | PASS: Qua hook | PASS: 6 native tool | OpenCode mạnh hơn ở native tools |

### Hook qua plugin

Hệ thống plugin OpenCode phức tạp hơn Claude Code với 20+ loại event. Bảng map hook và danh sách lệnh slash (31+) giống README tiếng Anh — xem [README gốc](../../README.md#opencode-support).

### Cài plugin

**Cách 1:** `cd everything-claude-code && opencode`

**Cách 2:** `npm install ecc-universal` rồi thêm `"plugin": ["ecc-universal"]` vào `opencode.json`. Entry npm này bật module plugin OpenCode đã publish (hook/event và tool plugin); **không** tự thêm full catalog command/agent/instruction vào project. Để setup ECC đầy đủ: chạy OpenCode trong repo này hoặc copy `.opencode/` và nối `instructions`, `agent`, `command` trong `opencode.json`.

### Tài liệu

- Migration: `.opencode/MIGRATION.md`
- Plugin README: `.opencode/README.md`
- Rules gộp: `.opencode/instructions/INSTRUCTIONS.md`
- `llms.txt` — tài liệu OpenCode cho LLM

---

## So sánh tính năng giữa các tool (Cross-Tool)

ECC là một trong những plugin tối đa hóa hỗ trợ trên các AI coding tool chính. Bảng so sánh đầy đủ (Agents, Commands, Skills, Hook, Rules, MCP, v.v.) và các quyết định kiến trúc (AGENTS.md chung, adapter DRY cho Cursor, format SKILL.md) — xem bảng trong [README tiếng Anh](../../README.md#cross-tool-feature-parity) (phiên bản 1.10.0 trong bảng Version).

---

## Bối cảnh

Tác giả dùng Claude Code từ bản thử nghiệm. Thắng hackathon Anthropic x Forum Ventures (09/2025) cùng [@DRodriguezFX](https://x.com/DRodriguezFX) — xây [zenith.chat](https://zenith.chat) hoàn toàn bằng Claude Code.

Các config này đã được thử nghiệm trên nhiều ứng dụng production.

---

## Tối ưu Token

Dùng Claude Code có thể tốn kém nếu không quản lý token consumption. Các setting này giảm chi phí đáng kể mà không giảm chất lượng.

### Setting Khuyến nghị

Thêm vào `~/.claude/settings.json`:

```json
{
  "model": "sonnet",
  "env": {
    "MAX_THINKING_TOKENS": "10000",
    "CLAUDE_AUTOCOMPACT_PCT_OVERRIDE": "50"
  }
}
```

| Setting | Mặc định | Khuyến nghị | Tác động |
|---------|----------|-------------|----------|
| `model` | opus | **sonnet** | Giảm ~60% chi phí; xử lý 80%+ coding task |
| `MAX_THINKING_TOKENS` | 31,999 | **10,000** | Giảm ~70% hidden thinking cost mỗi request |
| `CLAUDE_AUTOCOMPACT_PCT_OVERRIDE` | 95 | **50** | Compact sớm hơn — chất lượng tốt hơn trong session dài |

Chuyển sang Opus chỉ khi cần deep architectural reasoning:
```
/model opus
```

### Lệnh Workflow Hàng ngày

| Lệnh | Khi nào dùng |
|------|--------------|
| `/model sonnet` | Mặc định cho hầu hết task |
| `/model opus` | Architecture phức tạp, debug, deep reasoning |
| `/clear` | Giữa các task không liên quan (miễn phí, reset ngay) |
| `/compact` | Tại điểm nghỉ logic (research xong, milestone xong) |
| `/cost` | Monitor token spending trong session |

### Strategic Compact

Skill `strategic-compact` (có sẵn trong plugin) gợi ý `/compact` tại các điểm nghỉ logic thay vì dựa vào auto-compact tại 95% context. Xem `skills/strategic-compact/SKILL.md` để có decision guide đầy đủ.

**Khi nào nên compact:**
- Sau research/exploration, trước khi implement
- Sau khi xong milestone, trước khi bắt đầu cái tiếp theo
- Sau debug, trước khi tiếp tục làm feature
- Sau approach thất bại, trước khi thử cách mới

**Khi nào KHÔNG nên compact:**
- Giữa lúc đang implement (sẽ mất variable name, file path, partial state)

### Quản lý Context Window

**Quan trọng:** Không enable tất cả MCP cùng lúc. Mỗi MCP tool description tiêu thụ token từ context window 200k, có thể giảm còn ~70k.

- Giữ dưới 10 MCP enabled cho mỗi project
- Giữ dưới 80 tool active
- Dùng `disabledMcpServers` trong project config để disable MCP không dùng

### Cảnh báo chi phí Agent Teams

Agent Teams tạo nhiều context window; mỗi teammate tiêu token độc lập. Chỉ dùng khi song song thực sự mang lại giá trị (đa module, review song song). Với tác vụ tuần tự đơn giản, subagent tiết kiệm token hơn.

---

## WARNING: Lưu ý quan trọng

### Tối ưu token

Hết quota hàng ngày? Xem **[Hướng dẫn tối ưu token](../token-optimization.md)** để có setting và workflow gợi ý.

Thắng nhanh:

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

Dùng `/clear` giữa task không liên quan, `/compact` tại điểm nghỉ logic, và `/cost` để theo dõi chi phí.

### Tuỳ biến

Các config này phù hợp workflow của tác giả. Bạn nên:
1. Bắt đầu từ phần hợp với bạn
2. Chỉnh cho stack của bạn
3. Bỏ phần không dùng
4. Thêm pattern riêng

---

## Dự án cộng đồng

Project xây dựng hoặc lấy cảm hứng từ Everything Claude Code:

| Project | Mô tả |
|---------|--------|
| [EVC](https://github.com/SaigonXIII/evc) | Marketing agent workspace — 42 lệnh cho content operator, brand governance, publish đa kênh. [Tổng quan](https://saigonxiii.github.io/evc). |

Bạn có project với ECC? Mở PR để thêm vào đây.

---

## Nhà tài trợ

Project này miễn phí và open source. Sponsor giúp duy trì và phát triển project.

[**Trở thành Sponsor**](https://github.com/sponsors/affaan-m) | [Sponsor Tier](../../SPONSORS.md) | [Sponsorship Program](../../SPONSORING.md)

---

## Star History

[![Star History Chart](https://api.star-history.com/svg?repos=affaan-m/everything-claude-code&type=Date)](https://star-history.com/#affaan-m/everything-claude-code&Date)

---

## Link

- **Hướng dẫn Tóm tắt (Bắt đầu từ đây):** [The Shorthand Guide to Everything Claude Code](https://x.com/affaanmustafa/status/2012378465664745795)
- **Hướng dẫn Chi tiết (Nâng cao):** [The Longform Guide to Everything Claude Code](https://x.com/affaanmustafa/status/2014040193557471352)
- **Hướng dẫn Bảo mật:** [Security Guide](../../the-security-guide.md) | [Thread](https://x.com/affaanmustafa/status/2033263813387223421)
- **Follow:** [@affaanmustafa](https://x.com/affaanmustafa)

---

## License

MIT — Tự do sử dụng, chỉnh sửa theo nhu cầu, contribute lại nếu có thể.

---

**Star repo này nếu hữu ích. Đọc cả hai hướng dẫn. Build something great.**
