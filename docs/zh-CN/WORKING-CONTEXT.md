# 工作上下文

最后更新：2026-04-02

## 目的

面向代理、技能、命令、钩子、规则、安装界面以及 ECC 2.0 平台构建的公共 ECC 插件仓库。

## 当前实况

* 默认分支：`main`
* 已解决的紧急阻塞问题：CI 锁文件漂移和钩子验证故障已在 `a273c62` 中修复
* 修复后本地完整测试套件状态：`1723/1723` 通过
* 主要活跃工作：
  * 保持默认分支为绿色（测试通过）
  * 继续处理来自 `main` 的问题驱动修复，目前公共 PR 积压已清零
  * 继续 ECC 2.0 控制平面和操作员界面的构建

## 当前约束

* 不得仅凭标题或提交摘要进行合并。
* 在已发布的 ECC 界面中，不得进行任意的外部运行时安装。
* 当功能重叠显著且运行时分离非必需时，应合并重叠的技能、钩子或代理。

## 活跃队列

* PR 积压：当前公共队列已清空；新工作应通过直接主线修复或新的、范围明确的 PR 来提交
* 产品：
  * 选择性安装清理
  * 控制平面原语
  * 操作员界面
  * 自我提升技能
* 技能质量：
  * 重写面向内容的技能，以使用基于来源的语音建模
  * 移除通用的 LLM 修辞、模式化的行动号召以及强制的平台刻板印象
  * 继续逐个审核重叠或低价值信号的技能内容
  * 将仓库指南和贡献流程转向技能优先，仅将命令保留为显式的兼容性垫片
  * 添加包装连接界面的操作员技能，而非仅暴露原始 API 或孤立的原语
  * 落地规范的语音系统、网络优化通道和可复用的 Manim 解释器通道
* 安全：
  * 保持依赖项状态清洁
  * 保持自包含的钩子和 MCP 行为

## 已关闭 PR 分类

* 于 2026-04-01 根据积压清理/合并策略关闭：
  * `#1069` `feat: add everything-claude-code ECC bundle`
  * `#1068` `feat: add everything-claude-code-conventions ECC bundle`
  * `#1080` `feat: add everything-claude-code ECC bundle`
  * `#1079` `feat: add everything-claude-code-conventions ECC bundle`
  * `#1064` `chore(deps-dev): bump @eslint/js from 9.39.2 to 10.0.1`
  * `#1063` `chore(deps-dev): bump eslint from 9.39.2 to 10.1.0`
* 于 2026-04-01 关闭，因其内容源自外部生态系统，应仅通过手动 ECC 原生重新移植方式落地：
  * `#852` openclaw-user-profiler
  * `#851` openclaw-soul-forge
  * `#640` harper skills
* 待下次完全差异审核的本地支持候选：
  * `#1055` Dart / Flutter 支持
  * `#1043` C# 审查器和 .NET 技能
* 审核后已落地的直接移植候选：
  * `#1078` 用于托管 Claude 钩子重新安装的 hook-id 去重
  * `#844` ui-demo 技能
  * `#1110` 安装时 Claude 钩子根路径解析
  * `#1106` 便携式 Codex Context7 密钥提取
  * `#1107` Codex 基线合并和示例代理角色同步
  * `#1119` 仍包含安全低风险修复的过时 CI/代码检查清理
* 完全审核后需在 ECC 内部移植或重建：
  * `#894` Jira 集成
  * `#814` + `#808` 重建为针对 Opencode 和跨工具界面的单一合并通知通道

## 接口

* 公共实况：GitHub issues 和 PRs
* 内部执行实况：链接到 ECC 项目下的 Linear 工作项
* 当前链接的 Linear 工作项：
  * `ECC-206` 生态系统 CI 基线
  * `ECC-207` PR 积压审核和合并策略执行
  * `ECC-208` 上下文清洁度
  * `ECC-210` 技能优先工作流迁移和命令兼容性退役

## 更新规则

仅针对当前冲刺、阻塞问题和后续行动保持此文件的详细性。一旦工作不再直接影响执行，将已完成的工作总结归档或移至仓库文档。

## 最新执行记录

* 2026-04-02: `ECC-Tools/main` 发布了 `9566637` (`fix: prefer commit lookup over git ref resolution`)。PR 分析中的问题现已在应用仓库中修复，方法是在 `git.getRef` 之前优先采用显式提交解析，并增加了对拉取引用和普通分支引用的回归测试覆盖。本仓库中镜像的公共跟踪问题 `#1184` 已标记为上游已解决并关闭。
* 2026-04-02: 将 `#1043` 中干净的原生支持核心直接移植到 `main`：`agents/csharp-reviewer.md`、`skills/dotnet-patterns/SKILL.md` 和 `skills/csharp-testing/SKILL.md`。这填补了现有 C# 规则/文档提及与实际已发布的 C# 审查/测试指南之间的空白。
* 2026-04-02: 将 `#1055` 中干净的原生支持核心直接移植到 `main`：`agents/dart-build-resolver.md`、`commands/flutter-build.md`、`commands/flutter-review.md`、`commands/flutter-test.md`、`rules/dart/*` 和 `skills/dart-flutter-patterns/SKILL.md`。技能路径已接入当前的 `framework-language` 模块，而不是沿用旧 PR 中独立的 `flutter-dart` 模块布局。
* 2026-04-02: 在差异审计后关闭了 `#1081`。该 PR 仅向规范的 `x-api` 技能添加了外部 X/Twitter 后端 (`Xquik` / `x-twitter-scraper`) 的供应商营销文档，并未贡献 ECC 原生能力。
* 2026-04-02: 直接移植了 `#894` 中有用的 Jira 通道，但对其进行了清理以符合当前供应链策略。`commands/jira.md`、`skills/jira-integration/SKILL.md` 以及 `mcp-configs/mcp-servers.json` 中固定的 `jira` MCP 模板已纳入代码库，同时该技能不再指导用户通过 `curl | bash` 安装 `uv`。`jira-integration` 被归类到 `operator-workflows` 下供选择性安装。
* 2026-04-02: 在完整差异审计后关闭了 `#1125`。该捆绑包/技能路由器通道硬编码了许多不存在或非规范的接口，并创建了第二个路由抽象层，而不是一个轻量的 ECC 原生索引层。
* 2026-04-02: 在完整差异审计后关闭了 `#1124`。新增的代理列表编写得很用心，但它复制了现有的 ECC 代理接口，创建了第二个竞争性的目录 (`dispatch`、`explore`、`verifier`、`executor` 等)，而不是强化代码库中已有的规范代理。
* 2026-04-02: 在完整差异审计后关闭了整个 Argus 集群 `#1098`、`#1099`、`#1100`、`#1101` 和 `#1102`。这五个 PR 中共同的失败模式是：外部多 CLI 分发被当作已发布的 ECC 接口的一级运行时依赖。任何有用的协议想法应在以后重新移植到 ECC 原生的编排、审查或反射通道中，而不应假设存在外部 CLI 扇出。
* 2026-04-02: 先前开放的原生支持/集成队列 (`#1081`、`#1055`、`#1043`、`#894`) 现已通过直接移植或关闭策略完全解决。当前活跃的公共 PR 队列为零；下一步重点仍放在基于问题的主线修复和 CI 健康上，而非积压的 PR 接收。
* 2026-04-01: `main` CI 已在本地恢复，`1723/1723` 测试在修复 lockfile 和钩子验证后通过。
* 2026-04-01: 自动生成的 ECC 捆绑包 PR `#1068` 和 `#1069` 被关闭而非合并；有用的想法必须在显式差异审计后手动移植。
* 2026-04-01: 主版本 ESLint 升级 PR `#1063` 和 `#1064` 被关闭；仅在计划内的 ESLint 10 迁移通道中重新考虑。
* 2026-04-01: 通知 PR `#808` 和 `#814` 被识别为重叠，应重建为一个统一功能，而不是作为并行分支落地。
* 2026-04-01: 外部来源技能 PR `#640`、`#851` 和 `#852` 根据新的引入策略被关闭；以后应从审计过的来源复制想法，而不是直接合并品牌化/源导入的 PR。
* 2026-04-01: 剩余的低级别 GitHub 安全通告 `ecc2/Cargo.lock` 已通过将 `ratatui` 移至 `0.30` 并附带 `crossterm_0_28` 的方式解决，这将传递依赖的 `lru` 从 `0.12.5` 更新至 `0.16.3`。`cargo build --manifest-path ecc2/Cargo.toml` 测试仍然通过。
* 2026-04-01: `#834` 的安全核心被直接移植到 `main`，而不是整体合并该 PR。这包括更严格的安装计划验证、跳过不受支持模块树的反重力目标过滤、针对英文和 zh-CN 文档的跟踪目录同步，以及专用的 `catalog:sync` 写入模式。
* 2026-04-01: 仓库目录的真实状态现已在跟踪的英文和 zh-CN 文档中同步，涵盖 `36` 个代理、`68` 个命令和 `142` 个技能。
* 2026-04-01: 文档、脚本和测试中遗留的表情符号和非必要符号用法已规范化，以保持 Unicode 安全通道为绿色，同时不削弱检查本身。
* 2026-04-01: `#834` 中剩余的自包含部分 `docs/zh-CN/skills/browser-qa/SKILL.md` 已直接移植到仓库。提交后，`#834` 应标记为被直接移植取代并关闭。
* 2026-04-01: 内容技能清理已从 `content-engine`、`crosspost`、`article-writing` 和 `investor-outreach` 开始。新方向是源优先的语音捕捉、明确的反对陈词滥调禁令，以及不强制平台人设转换。
* 2026-04-01: `node scripts/ci/check-unicode-safety.js --write` 清理了剩余包含表情符号的 Markdown 文件，包括几个 `remotion-video-creation` 规则文档和一份旧的本地计划笔记。
* 2026-04-01: 核心英文仓库接口已转向技能优先的定位。README、AGENTS、插件元数据和贡献者说明现在将 `skills/` 视为规范，而将 `commands/` 视为迁移期间的遗留斜杠入口兼容性支持。
* 2026-04-01: 后续捆绑包清理关闭了 `#1080` 和 `#1079`，这些是生成的 `.claude/` 捆绑包 PR，它们复制了命令优先的脚手架，而不是发布规范的 ECC 源代码变更。
* 2026-04-01: 将 `#1078` 的有用核心直接移植到 `main`，但加强了实现，使得遗留的无 ID 钩子安装能在第一次重新安装时干净地去重，而不是第二次。向 `hooks/hooks.json` 添加了稳定的钩子 ID，向 `mergeHookEntries()` 添加了语义化回退别名，并增加了覆盖从无 ID 设置升级的回归测试。
* 2026-04-01: 将明显的命令/技能重复项合并为轻量的遗留垫片，因此 `skills/` 现在持有 NanoClaw、上下文预算、DevFleet、文档查找、E2E、评估、编排、提示优化、规则提炼、TDD 和验证的维护主体。
* 2026-04-01: 将 `#844` 的自包含核心直接移植到 `main` 作为 `skills/ui-demo/SKILL.md`，并将其注册到 `media-generation` 安装模块下，而不是整体合并该 PR。
* 2026-04-01: 添加了首个连接工作流操作员通道作为 ECC 原生技能，而不是将接口保留为原始插件或 API：`workspace-surface-audit`、`customer-billing-ops`、`project-flow-ops` 和 `google-workspace-ops`。这些在新 `operator-workflows` 安装模块下跟踪。
* 2026-04-01: 将未解决的钩子路径 PR 通道中的实际修复直接移植到活跃的安装程序中。Claude 安装现在将 `${CLAUDE_PLUGIN_ROOT}` 替换为具体的安装根目录，无论是在 `settings.json` 还是复制的 `hooks/hooks.json` 中，这使得 PreToolUse/PostToolUse 钩子在插件管理的环境注入之外也能工作。
* 2026-04-01: 将 `scripts/sync-ecc-to-codex.sh` 中仅限 GNU 的 `grep -P` 解析器替换为用于 Context7 密钥提取的可移植 Node 解析器。增加了源代码级别的回归测试覆盖，以确保 BSD/macOS 同步不会回退到不可移植的解析。
* 2026-04-01: 直接移植后的针对性回归测试套件为绿色：`tests/scripts/install-apply.test.js`、`tests/scripts/sync-ecc-to-codex.test.js` 和 `tests/scripts/codex-hooks.test.js`。
* 2026-04-01: 将 `#1107` 的有用核心直接移植到 `main` 作为仅添加的 Codex 基线合并。`scripts/sync-ecc-to-codex.sh` 现在填补了 `.codex/config.toml` 中缺失的非 MCP 默认值，将示例代理角色文件同步到 `~/.codex/agents`，并保留用户配置而不是替换它。增加了对稀疏配置和隐式父表的回归测试覆盖。
* 2026-04-01: 将 `#1119` 中的安全低风险清理直接移植到 `main`，而不是保持一个过时的 CI PR 开放。这包括 `.mjs` eslint 处理、更严格的空值检查、bash 日志测试中的 Windows 主目录覆盖，以及更长的 Trae shell 测试超时。
* 2026-04-01: 添加了 `brand-voice` 作为规范的源派生写作风格系统，并将内容通道配置为将其视为共享语音的单一事实来源，而不是在各个技能中复制部分风格启发式规则。
* 2026-04-01: 添加了 `connections-optimizer` 作为面向 X 和 LinkedIn 的审查优先社交图谱重组工作流，包含明确的剪枝模式、浏览器回退预期和 Apple Mail 草稿撰写指南。
* 2026-04-01: 添加了 `manim-video` 作为可复用的技术解释器通道，并为其植入了启动网络图场景，使得启动和系统动画不依赖于一次性的临时脚本。
* 2026-04-02: 将 `social-graph-ranker` 重新提取为一个独立的原语，因为加权桥接衰减模型在完整的潜在客户工作流之外也可复用。`lead-intelligence` 现在指向它作为规范的图排名参考，而不是内联携带完整的算法解释，而 `connections-optimizer` 仍然是用于剪枝、添加和出站审查包的更广泛的操作员层。
* 2026-04-02: 将同样的整合规则应用于写作通道。`brand-voice` 仍然是规范的语音系统，而 `content-engine`、`crosspost`、`article-writing` 和 `investor-outreach` 现在仅保留工作流特定的指导，而不是复制第二个 Affaan/ECC 语音模型或在多个地方重复完整的禁令列表。
* 2026-04-02: 根据现有策略关闭了新生成的捆绑包 PR `#1182` 和 `#1183`。生成器输出中的有用想法必须手动移植到规范的仓库接口中，而不是整体合并 `.claude`/捆绑包 PR。
* 2026-04-02: 将 `#1164` 中的安全单文件 macOS 观察者修复直接移植到 `main`，作为 `continuous-learning-v2` 延迟启动锁定的 POSIX `mkdir` 回退，然后将该 PR 标记为被直接移植取代并关闭。
* 2026-04-02: 将 `#1153` 的安全核心直接移植到 `main`：针对编排/文档接口的 markdownlint 清理，以及 `install-apply` / `repair` 测试中 Windows `USERPROFILE` 和路径规范化的修复。安装仓库依赖后的本地验证：`node tests/scripts/install-apply.test.js`、`node tests/scripts/repair.test.js` 和针对性的 `yarn markdownlint` 全部通过。
* 2026-04-02: 将 `#1122` 中的安全 Web/前端规则通道直接移植到 `rules/web/`，但调整了 `rules/web/hooks.md` 以优先使用项目本地工具，并避免远程一次性包执行示例。
* 2026-04-02: 将 `#1127` 中的设计质量提醒适配到当前的 ECC 钩子架构中，包含本地 `scripts/hooks/design-quality-check.js`、Claude `hooks/hooks.json` 连接、Cursor `after-file-edit.js` 连接，以及在 `tests/hooks/design-quality-check.test.js` 中的专用钩子覆盖。
* 2026-04-02: 修复了 `16e9b17` 中 `main` 上的 `#1141`。观察者生命周期现在具有会话感知能力，而非完全分离：`SessionStart` 写入项目作用域的租约，`SessionEnd` 在最后一个租约消失时移除该租约并停止观察者，`observe.sh` 记录项目活动，且 `observer-loop.sh` 现在在无剩余租约时于空闲状态退出。目标验证已通过 `bash -n`、`node tests/hooks/observer-memory.test.js`、`node tests/integration/hooks.test.js`、`node scripts/ci/validate-hooks.js hooks/hooks.json` 和 `node scripts/ci/check-unicode-safety.js`。
* 2026-04-02: 通过使 `scripts/lib/utils.js#getHomeDir()` 在回退到 `os.homedir()` 之前优先遵循显式的 `HOME` / `USERPROFILE` 覆盖，修复了 `#1070` 背后剩余的仅限 Windows 的钩子回归问题。这恢复了 Windows 上钩子集成运行的测试隔离观察者状态路径。在 `tests/lib/utils.test.js` 中添加了回归覆盖。目标验证已通过 `node tests/lib/utils.test.js`、`node tests/integration/hooks.test.js`、`node tests/hooks/observer-memory.test.js` 和 `node scripts/ci/check-unicode-safety.js`。
* 2026-04-02: 将 NestJS 对 `#1022` 的支持直接移植到 `main` 中作为 `skills/nestjs-patterns/SKILL.md`，并将其接入 `framework-language` 安装模块。随后同步了仓库目录（`38` 代理、`72` 命令、`156` 技能）并更新了文档，因此 NestJS 不再被列为未填补的框架空白。
