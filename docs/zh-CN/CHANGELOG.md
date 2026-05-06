# 更新日志

## 2.0.0-rc.1 - 2026-04-28

### 亮点

* 为 Hermes 操作符故事线添加了公共 ECC 2.0 发布候选版本表面。
* 将 ECC 记录为跨 Claude Code、Codex、Cursor、OpenCode 和 Gemini 的可复用跨框架基础。
* 添加了经过清理的 Hermes 导入技能表面，而非发布私有操作符状态。

### 发布表面

* 将包、插件、市场、OpenCode、代理和 README 元数据更新为 `2.0.0-rc.1`。
* 添加了 `docs/releases/2.0.0-rc.1/`，包含发布说明、社交媒体草稿、启动清单、交接说明和演示提示。
* 添加了 `docs/architecture/cross-harness.md` 以及针对 ECC/Hermes 边界的回归覆盖。
* 暂时保持 `ecc2/` 版本控制独立；除非发布工程另有决定，它仍是一个 alpha 控制平面脚手架。

### 备注

* 这是一个发布候选版本，并非对完整 ECC 2.0 控制平面路线图的 GA 声明。
* 预发布 npm 发布应使用 `next` 分发标签，除非发布工程明确选择其他方式。

## 1.10.0 - 2026-04-05

### 亮点

* 经过数周的 OSS 增长和积压合并后，公共发布表面与实时仓库同步。
* 操作符工作流通道扩展了语音、图排名、计费、工作区和外发技能。
* 媒体生成通道扩展了 Manim 和 Remotion 优先的启动工具。
* ECC 2.0 alpha 控制平面二进制文件现在可从 `ecc2/` 本地构建，并暴露了第一个可用的 CLI/TUI 表面。

### 发布表面

* 将插件、市场、Codex、OpenCode 和代理元数据更新为 `1.10.0`。
* 将发布计数与实时 OSS 表面同步：38 个代理、156 个技能、72 个命令。
* 刷新了顶级面向安装的文档和市场描述，以匹配当前仓库状态。

### 新工作流通道

* `brand-voice` — 规范的源衍生写作风格系统。
* `social-graph-ranker` — 加权暖启动图排名原语。
* `connections-optimizer` — 基于图排名的网络修剪/添加工作流。
* `customer-billing-ops`、`google-workspace-ops`、`project-flow-ops`、`workspace-surface-audit`。
* `manim-video`、`remotion-video-creation`、`nestjs-patterns`。

### ECC 2.0 Alpha

* `cargo build --manifest-path ecc2/Cargo.toml` 通过仓库基线。
* `ecc-tui` 当前暴露了 `dashboard`、`start`、`sessions`、`status`、`stop`、`resume` 和 `daemon`。
* alpha 版本是真实的，可用于本地实验，但更广泛的控制平面路线图仍不完整，不应视为 GA。

### 备注

* Claude 插件仍受平台级规则分发约束的限制；选择性安装/OSS 路径仍然是最可靠的完整安装方式。
* 此版本是仓库表面修正和生态系统同步，并非声称完整 ECC 2.0 路线图已完成。

## 1.9.0 - 2026-03-20

### 亮点

* 选择性安装架构，采用清单驱动流水线和 SQLite 状态存储。
* 语言覆盖范围扩展至 10 多个生态，新增 6 个代理和语言特定规则。
* 观察器可靠性增强，包括内存限制、沙箱修复和 5 层循环防护。
* 自我改进的技能基础，支持技能演进和会话适配器。

### 新代理

* `typescript-reviewer` — TypeScript/JavaScript 代码审查专家 (#647)
* `pytorch-build-resolver` — PyTorch 运行时、CUDA 及训练错误解决 (#549)
* `java-build-resolver` — Maven/Gradle 构建错误解决 (#538)
* `java-reviewer` — Java 和 Spring Boot 代码审查 (#528)
* `kotlin-reviewer` — Kotlin/Android/KMP 代码审查 (#309)
* `kotlin-build-resolver` — Kotlin/Gradle 构建错误 (#309)
* `rust-reviewer` — Rust 代码审查 (#523)
* `rust-build-resolver` — Rust 构建错误解决 (#523)
* `docs-lookup` — 文档和 API 参考研究 (#529)

### 新技能

* `pytorch-patterns` — PyTorch 深度学习工作流 (#550)
* `documentation-lookup` — API 参考和库文档研究 (#529)
* `bun-runtime` — Bun 运行时模式 (#529)
* `nextjs-turbopack` — Next.js Turbopack 工作流 (#529)
* `mcp-server-patterns` — MCP 服务器设计模式 (#531)
* `data-scraper-agent` — AI 驱动的公共数据收集 (#503)
* `team-builder` — 团队构成技能 (#501)
* `ai-regression-testing` — AI 回归测试工作流 (#433)
* `claude-devfleet` — 多代理编排 (#505)
* `blueprint` — 多会话构建规划
* `everything-claude-code` — 自引用 ECC 技能 (#335)
* `prompt-optimizer` — 提示优化技能 (#418)
* 8 个 Evos 操作领域技能 (#290)
* 3 个 Laravel 技能 (#420)
* VideoDB 技能 (#301)

### 新命令

* `/docs` — 文档查找 (#530)
* `/aside` — 侧边对话 (#407)
* `/prompt-optimize` — 提示优化 (#418)
* `/resume-session`, `/save-session` — 会话管理
* `learn-eval` 改进，支持基于清单的整体裁决

### 新规则

* Java 语言规则 (#645)
* PHP 规则包 (#389)
* Perl 语言规则和技能（模式、安全、测试）
* Kotlin/Android/KMP 规则 (#309)
* C++ 语言支持 (#539)
* Rust 语言支持 (#523)

### 基础设施

* 选择性安装架构，支持清单解析 (`install-plan.js`, `install-apply.js`) (#509, #512)
* SQLite 状态存储，提供查询 CLI 以跟踪已安装组件 (#510)
* 会话适配器，用于结构化会话记录 (#511)
* 技能演进基础，支持自我改进的技能 (#514)
* 编排框架，支持确定性评分 (#524)
* CI 中的目录计数强制执行 (#525)
* 对所有 109 项技能的安装清单验证 (#537)
* PowerShell 安装器包装器 (#532)
* 通过 `--target antigravity` 标志支持 Antigravity IDE (#332)
* Codex CLI 自定义脚本 (#336)

### 错误修复

* 解决了 6 个文件中的 19 个 CI 测试失败 (#519)
* 修复了安装流水线、编排器和修复工具中的 8 个测试失败 (#564)
* 观察器内存爆炸问题，通过限制、重入防护和尾部采样解决 (#536)
* 观察器沙箱访问修复，用于 Haiku 调用 (#661)
* 工作树项目 ID 不匹配修复 (#665)
* 观察器延迟启动逻辑 (#508)
* 观察器 5 层循环预防防护 (#399)
* 钩子可移植性和 Windows .cmd 支持
* Biome 钩子优化 — 消除了 npx 开销 (#359)
* InsAIts 安全钩子改为可选启用 (#370)
* Windows spawnSync 导出修复 (#431)
* instinct CLI 的 UTF-8 编码修复 (#353)
* 钩子中的密钥擦除 (#348)

### 翻译

* 韩语 (ko-KR) 翻译 — README、代理、命令、技能、规则 (#392)
* 中文 (zh-CN) 文档同步 (#428)

### 鸣谢

* @ymdvsymd — 观察器沙箱和工作树修复
* @pythonstrup — biome 钩子优化
* @Nomadu27 — InsAIts 安全钩子
* @hahmee — 韩语翻译
* @zdocapp — 中文翻译同步
* @cookiee339 — Kotlin 生态
* @pangerlkr — CI 工作流修复
* @0xrohitgarg — VideoDB 技能
* @nocodemf — Evos 操作技能
* @swarnika-cmd — 社区贡献

## 1.8.0 - 2026-03-04

### 亮点

* 首次发布以可靠性、评估规程和自主循环操作为核心的版本。
* Hook 运行时现在支持基于配置文件的控制和针对性的 Hook 禁用。
* NanoClaw v2 增加了模型路由、技能热加载、分支、搜索、压缩、导出和指标功能。

### 核心

* 新增命令：`/harness-audit`, `/loop-start`, `/loop-status`, `/quality-gate`, `/model-route`。
* 新增技能：
  * `agent-harness-construction`
  * `agentic-engineering`
  * `ralphinho-rfc-pipeline`
  * `ai-first-engineering`
  * `enterprise-agent-ops`
  * `nanoclaw-repl`
  * `continuous-agent-loop`
* 新增代理：
  * `harness-optimizer`
  * `loop-operator`

### Hook 可靠性

* 修复了 SessionStart 的根路径解析，增加了健壮的回退搜索。
* 将会话摘要持久化移至 `Stop`，此处可获得转录负载。
* 增加了质量门和成本追踪钩子。
* 用专门的脚本文件替换了脆弱的单行内联钩子。
* 增加了 `ECC_HOOK_PROFILE` 和 `ECC_DISABLED_HOOKS` 控制。

### 跨平台

* 改进了文档警告逻辑中 Windows 安全路径的处理。
* 强化了观察者循环行为，以避免非交互式挂起。

### 备注

* `autonomous-loops` 作为一个兼容性别名保留一个版本；`continuous-agent-loop` 是规范名称。

### 鸣谢

* 灵感来自 [zarazhangrui](https://github.com/zarazhangrui)
* homunculus 灵感来自 [humanplane](https://github.com/humanplane)
