# 工作上下文

最后更新：2026-04-08

## 目的

面向代理、技能、命令、钩子、规则、安装界面及 ECC 2.0 平台构建的公共 ECC 插件仓库。

## 当前事实

* 默认分支：`main`
* 公共发布界面对齐于 `v1.10.0`
* 公共目录事实：`47` 个代理、`79` 条命令和 `181` 项技能
* 公共插件 slug 现为 `ecc`；为保持兼容性，仍支持旧版 `everything-claude-code` 安装路径
* 发布讨论：`#1272`
* ECC 2.0 存在于树内并可构建，但仍处于 alpha 阶段，尚未正式发布
* 主要活跃运维工作：
  * 保持默认分支绿色
  * 在公共 PR 积压清零后，继续从 `main` 进行问题驱动的修复
  * 继续 ECC 2.0 控制平面和操作界面的构建

## 当前约束

* 不得仅凭标题或提交摘要进行合并。
* 在已发布的 ECC 界面中，不得进行任意的外部运行时安装。
* 当重叠内容具有实质性且无需运行时分离时，应合并重叠的技能、钩子或代理。

## 活跃队列

* PR 积压：已减少但仍活跃；仅直接移植安全的 ECC 原生变更，并关闭重叠、过时的生成器及未经审计的外部运行时通道
* 上游分支积压仍需选择性挖掘和清理：
  * `origin/feat/hermes-generated-ops-skills` 仍有三个独特提交，但仅应从中抢救可复用的 ECC 原生技能
  * 多个 `origin/ecc-tools/*` 自动化分支已过时，在确认其无独特价值后应予以修剪
* 产品：
  * 选择性安装清理
  * 控制平面原语
  * 操作界面
  * 自我改进技能
  * 保持 `agent.yaml` 导出与已发布的 `commands/` 和 `skills/` 目录的奇偶性，以便现代安装界面不会静默丢失命令注册
* 技能质量：
  * 重写面向内容的技能，使用基于源的语音建模
  * 移除通用 LLM 套话、固定 CTA 模式及强制的平台刻板印象
  * 继续逐一审计重叠或低信号技能内容
  * 将仓库指导和贡献流程迁移至技能优先，仅将命令保留为显式兼容性垫片
  * 添加封装连接界面的操作技能，而非仅暴露原始 API 或断开连接的原语
  * 落地规范语音系统、网络优化通道及可复用的 Manim 解释器通道
* 安全：
  * 保持依赖状态清洁
  * 保留自包含的钩子和 MCP 行为

## 开放 PR 分类

* 于 2026-04-01 根据积压清理/合并策略关闭：
  * `#1069` `feat: add everything-claude-code ECC bundle`
  * `#1068` `feat: add everything-claude-code-conventions ECC bundle`
  * `#1080` `feat: add everything-claude-code ECC bundle`
  * `#1079` `feat: add everything-claude-code-conventions ECC bundle`
  * `#1064` `chore(deps-dev): bump @eslint/js from 9.39.2 to 10.0.1`
  * `#1063` `chore(deps-dev): bump eslint from 9.39.2 to 10.1.0`
* 于 2026-04-01 关闭，因为内容源自外部生态系统，应仅通过手动 ECC 原生重新移植方式落地：
  * `#852` openclaw-user-profiler
  * `#851` openclaw-soul-forge
  * `#640` harper 技能
* 待进行完整差异审计的原生支持候选：
  * `#1055` Dart / Flutter 支持
  * `#1043` C# 审查者和 .NET 技能
* 审计后落地的直接移植候选：
  * `#1078` 用于托管 Claude 钩子重新安装的钩子 ID 去重
  * `#844` ui-demo 技能
  * `#1110` 安装时 Claude 钩子根目录解析
  * `#1106` 可移植的 Codex Context7 密钥提取
  * `#1107` Codex 基线合并及示例代理角色同步
  * `#1119` 过时 CI/lint 清理，其中仍包含安全低风险修复
* 在完整审计后在 ECC 内部移植或重建：
  * `#894` Jira 集成
  * `#814` + `#808` 重建为 Opencode 及跨框架界面的单一合并通知通道

## 接口

* 公共事实：GitHub 议题和 PR
* 内部执行事实：ECC 项目下关联的 Linear 工作项
* 当前关联的 Linear 项：
  * `ECC-206` 生态系统 CI 基线
  * `ECC-207` PR 积压审计和合并策略执行
  * `ECC-208` 上下文卫生
  * `ECC-210` 技能优先工作流迁移及命令兼容性退役

## 更新规则

仅针对当前冲刺、阻塞项和下一步行动保持此文件的详细性。一旦完成的工作不再积极影响执行，将其总结归档到存档或仓库文档中。

## 最新执行说明

* 2026-04-05: 继续清理 `#1213` 的重叠部分，将 `coding-standards` 收窄到基线跨项目约定层，而不是删除它。该技能现在明确将详细的 React/UI 指南指向 `frontend-patterns`，将后端/API 结构指向 `backend-patterns` / `api-design`，并仅保留可重用的命名、可读性、不可变性和代码质量期望。
* 2026-04-05: 为 OpenCode 发布路径添加了打包回归防护，因为在 `#1287` 显示已发布的 `v1.10.0` 工件仍然过时之后。`tests/scripts/build-opencode.test.js` 现在断言 `npm pack --dry-run` tarball 包含 `.opencode/dist/index.js` 以及编译后的插件/工具入口点，因此未来的发布不会静默地遗漏构建好的 OpenCode 负载。
* 2026-04-05: 为 `#829` 引入了 `skills/agent-introspection-debugging`，作为 ECC 原生的自我调试框架。它有意采用指导优先而非虚假的运行时自动化：捕获失败状态，对模式进行分类，应用最小的包含性恢复操作，然后发出结构化的内省报告，并在适当时移交给 `verification-loop` / `continuous-learning-v2`。
* 2026-04-05: 修复了最新直接移植后 `main` npm CI 的中断问题。`package-lock.json` 在 `globals` 开发依赖项上落后于 `package.json`（`^17.1.0` vs `^17.4.0`），导致所有基于 npm 的 GitHub Actions 作业在 `npm ci` 失败。仅刷新了 lockfile，验证了 `npm ci --ignore-scripts`，并保持混合锁工作区其他部分不变。
* 2026-04-05: 直接移植了 `#1221` 中有用的可发现性部分，而没有复制第二个医疗合规系统。添加了 `skills/hipaa-compliance/SKILL.md` 作为一个精简的 HIPAA 特定入口点，指向规范的 `healthcare-phi-compliance` / `healthcare-reviewer` 通道，并将两个医疗隐私技能连接到 `security` 安装模块以实现选择性安装。
* 2026-04-05: 将经过审计的区块链/Web3 安全通道从 `#1222` 直接移植到 `main`，作为四个独立的技能：`defi-amm-security`、`evm-token-decimals`、`llm-trading-agent-security` 和 `nodejs-keccak256`。这些现在属于 `security` 安装模块的一部分，而不是作为一个未合并的分支 PR 存在。
* 2026-04-05: 完成了从 `#1203` 直接在 `main` 上的有用抢救性移植。`skills/security-bounty-hunter`、`skills/api-connector-builder` 和 `skills/dashboard-builder` 现在作为 ECC 原生重写存在于树中，而不是较薄的原始社区草稿。原始 PR 应被视为已被取代，而非合并。
* 2026-04-02: `ECC-Tools/main` 发布了 `9566637`（`fix: prefer commit lookup over git ref resolution`）。PR 分析问题现在通过在 `git.getRef` 之前优先使用显式提交解析在应用仓库中得到修复，并包含了对拉取引用和普通分支引用的回归覆盖。此仓库中镜像的公开跟踪问题 `#1184` 已作为上游已解决关闭。
* 2026-04-02: 将 `#1043` 的干净原生支持核心直接移植到 `main`：`agents/csharp-reviewer.md`、`skills/dotnet-patterns/SKILL.md` 和 `skills/csharp-testing/SKILL.md`。这填补了现有 C# 规则/文档提及与实际已发布的 C# 审查/测试指南之间的空白。
* 2026-04-02: 将 `#1055` 的干净原生支持核心直接移植到 `main`：`agents/dart-build-resolver.md`、`commands/flutter-build.md`、`commands/flutter-review.md`、`commands/flutter-test.md`、`rules/dart/*` 和 `skills/dart-flutter-patterns/SKILL.md`。技能路径被连接到当前的 `framework-language` 模块，而不是重放旧 PR 的单独 `flutter-dart` 模块布局。
* 2026-04-02: 在差异审计后关闭了 `#1081`。该 PR 仅向规范的 `x-api` 技能添加了外部 X/Twitter 后端（`Xquik` / `x-twitter-scraper`）的供应商营销文档，而没有贡献 ECC 原生能力。
* 2026-04-02: 直接移植了来自 `#894` 的有用 Jira 通道，但对其进行了清理以匹配当前的供应链策略。`commands/jira.md`、`skills/jira-integration/SKILL.md` 以及 `mcp-configs/mcp-servers.json` 中固定的 `jira` MCP 模板已存在于树中，而该技能不再告诉用户通过 `curl | bash` 安装 `uv`。`jira-integration` 被归类在 `operator-workflows` 下以实现选择性安装。
* 2026-04-02: 在完整差异审计后关闭了 `#1125`。bundle/skill-router 通道硬编码了许多不存在或非规范的表面，并创建了第二个路由抽象，而不是一个小的 ECC 原生索引层。
* 2026-04-02: 在完整差异审计后关闭了 `#1124`。添加的代理名册写得很有思想，但它用第二个竞争性目录（`dispatch`、`explore`、`verifier`、`executor` 等）复制了现有的 ECC 代理表面，而不是加强已在树中的规范代理。
* 2026-04-02: 在完整差异审计后关闭了整个 Argus 集群 `#1098`、`#1099`、`#1100`、`#1101` 和 `#1102`。所有五个 PR 的常见失败模式相同：外部多 CLI 调度被视为已发布 ECC 表面的一等运行时依赖项。任何有用的协议想法应稍后重新移植到 ECC 原生编排、审查或反思通道中，而不带有外部 CLI 扇出假设。
* 2026-04-02: 先前开放的本地支持/集成队列（`#1081`、`#1055`、`#1043`、`#894`）现已通过直接移植或关闭策略完全解决。当前活跃的公开 PR 队列为零；下一个重点仍然是问题驱动的主线修复和 CI 健康，而不是积压的 PR 接收。
* 2026-04-01: `main` CI 在本地恢复，`1723/1723` 测试在 lockfile 和钩子验证修复后通过。
* 2026-04-01: 自动生成的 ECC bundle PR `#1068` 和 `#1069` 被关闭而非合并；有用的想法必须在显式差异审计后手动移植。
* 2026-04-01: 主版本 ESLint 升级 PR `#1063` 和 `#1064` 被关闭；仅在计划内的 ESLint 10 迁移通道中重新审视。
* 2026-04-01: 通知 PR `#808` 和 `#814` 被识别为重叠，应重建为一个统一的功能，而不是作为并行分支落地。
* 2026-04-01: 外部来源技能 PR `#640`、`#851` 和 `#852` 根据新的引入策略被关闭；稍后从审计过的来源复制想法，而不是直接合并品牌/来源导入的 PR。
* 2026-04-01: `ecc2/Cargo.lock` 上剩余的较低 GitHub 安全公告通过将 `ratatui` 移动到 `0.30` 并带有 `crossterm_0_28` 来解决，这更新了传递性 `lru` 从 `0.12.5` 到 `0.16.3`。`cargo build --manifest-path ecc2/Cargo.toml` 仍然通过。
* 2026-04-01: `#834` 的安全核心被直接移植到 `main`，而不是整体合并 PR。这包括更严格的安装计划验证、跳过不受支持模块树的反重力目标过滤、跟踪的英文加简体中文文档的目录同步，以及一个专用的 `catalog:sync` 写入模式。
* 2026-04-01: 仓库目录真相现在在 `36` 个代理、`68` 个命令和 `142` 个技能之间同步，覆盖了跟踪的英文和简体中文文档。
* 2026-04-01: 文档、脚本和测试中的遗留表情符号和非必要符号使用已规范化，以保持 unicode 安全通道绿色，同时不削弱检查本身。
* 2026-04-01: `#834` 的剩余独立部分 `docs/zh-CN/skills/browser-qa/SKILL.md` 被直接移植到仓库中。提交后，`#834` 应作为已被直接移植取代而关闭。
* 2026-04-01: 内容技能清理从 `content-engine`、`crosspost`、`article-writing` 和 `investor-outreach` 开始。新方向是来源优先的语音捕获、明确的反陈词滥调禁令，以及无强制平台角色转换。
* 2026-04-01: `node scripts/ci/check-unicode-safety.js --write` 清理了剩余包含表情符号的 Markdown 文件，包括几个 `remotion-video-creation` 规则文档和一个旧的本地计划注释。
* 2026-04-01: 核心英文仓库表面已转向技能优先的姿态。README、AGENTS、插件元数据和贡献者说明现在将 `skills/` 视为规范，将 `commands/` 视为迁移期间的遗留斜杠入口兼容性。
* 2026-04-01: 后续的 bundle 清理关闭了 `#1080` 和 `#1079`，它们是生成的 `.claude/` bundle PR，复制了命令优先的脚手架，而不是发布规范的 ECC 源代码更改。
* 2026-04-01: 将 `#1078` 的有用核心直接移植到 `main`，但收紧了实现，使得遗留的无 ID 钩子安装在第一次重新安装时就能干净地去重，而不是第二次。为 `hooks/hooks.json` 添加了稳定的钩子 ID，在 `mergeHookEntries()` 中添加了语义回退别名，以及一个覆盖从预 ID 设置升级的回归测试。
* 2026-04-01: 将明显的命令/技能重复折叠成薄的遗留垫片，以便 `skills/` 现在持有 NanoClaw、context-budget、DevFleet、docs lookup、E2E、evals、orchestration、prompt optimization、rules distillation、TDD 和 verification 的维护主体。
* 2026-04-01: 将 `#844` 的独立核心直接移植到 `main` 作为 `skills/ui-demo/SKILL.md`，并将其注册在 `media-generation` 安装模块下，而不是整体合并 PR。
* 2026-04-01: 添加了第一个连接工作流操作符通道作为 ECC 原生技能，而不是将表面保留为原始插件或 API：`workspace-surface-audit`、`customer-billing-ops`、`project-flow-ops` 和 `google-workspace-ops`。这些在新的 `operator-workflows` 安装模块下跟踪。
* 2026-04-01: 将未解决的钩子路径 PR 通道中的真实修复直接移植到活动安装程序中。Claude 安装现在在 `settings.json` 和复制的 `hooks/hooks.json` 中都将 `${CLAUDE_PLUGIN_ROOT}` 替换为具体的安装根目录，这使 PreToolUse/PostToolUse 钩子在插件管理的环境注入之外也能正常工作。
* 2026-04-01: 将 `scripts/sync-ecc-to-codex.sh` 中仅 GNU 的 `grep -P` 解析器替换为用于 Context7 密钥提取的可移植 Node 解析器。添加了源代码级别的回归覆盖，以便 BSD/macOS 同步不会回退到不可移植的解析。
* 2026-04-01: 直接移植后的目标回归套件为绿色：`tests/scripts/install-apply.test.js`、`tests/scripts/sync-ecc-to-codex.test.js` 和 `tests/scripts/codex-hooks.test.js`。
* 2026-04-01: 将 `#1107` 的有用核心直接移植到 `main`，作为仅添加的 Codex 基线合并。`scripts/sync-ecc-to-codex.sh` 现在从 `.codex/config.toml` 填充缺失的非 MCP 默认值，将示例代理角色文件同步到 `~/.codex/agents`，并保留用户配置而不是替换它。添加了对稀疏配置和隐式父表的回归覆盖。
* 2026-04-01: 将 `#1119` 的安全低风险清理直接移植到 `main`，而不是保持一个过时的 CI PR 开放。这包括 `.mjs` eslint 处理、更严格的空值检查、bash-log 测试中的 Windows 主目录覆盖，以及更长的 Trae shell 测试超时。
* 2026-04-01: 添加了 `brand-voice` 作为规范的来源衍生写作风格系统，并将内容通道连接起来，将其视为共享语音真相来源，而不是在技能之间复制部分风格启发式规则。
* 2026-04-01：新增 `connections-optimizer`，作为 X 和 LinkedIn 的优先审查社交图谱重组工作流，包含显式修剪模式、浏览器回退预期以及 Apple Mail 起草指南。
* 2026-04-01：新增 `manim-video`，作为可复用的技术说明通道，并为其预置了一个起始网络图谱场景，使得启动和系统动画不再依赖一次性脚本。
* 2026-04-02：将 `social-graph-ranker` 重新提取为独立原语，因为加权桥接衰减模型在完整线索工作流之外也可复用。`lead-intelligence` 现在指向它以进行规范图谱排序，而非内联承载完整算法说明，而 `connections-optimizer` 仍作为更广泛的算子层，负责修剪、添加和出站审查包。
* 2026-04-02：将相同的整合规则应用于写作通道。`brand-voice` 仍为规范语音系统，而 `content-engine`、`crosspost`、`article-writing` 和 `investor-outreach` 现在仅保留工作流特定指南，而非重复第二个 Affaan/ECC 语音模型或在多处重复完整禁用列表。
* 2026-04-02：根据现有政策，关闭了新的自动生成捆绑包 PR `#1182` 和 `#1183`。生成器输出中的有用想法必须手动移植到规范仓库表面，而非整体合并 `.claude`/捆绑包 PR。
* 2026-04-02：将 `#1164` 中安全的单文件 macOS 观察者修复直接移植到 `main`，作为 `continuous-learning-v2` 懒启动锁定的 POSIX `mkdir` 回退方案，然后关闭该 PR，因其已被直接移植取代。
* 2026-04-02：将 `#1153` 的安全核心直接移植到 `main`：针对编排/文档表面的 markdownlint 清理，以及 `install-apply` / `repair` 测试中的 Windows `USERPROFILE` 和路径规范化修复。安装仓库依赖后的本地验证：`node tests/scripts/install-apply.test.js`、`node tests/scripts/repair.test.js` 和定向 `yarn markdownlint` 均通过。
* 2026-04-02：将 `#1122` 中安全的 Web/前端规则通道直接移植到 `rules/web/`，但调整了 `rules/web/hooks.md`，使其优先使用项目本地工具，并避免远程一次性包执行示例。
* 2026-04-02：将 `#1127` 中的设计质量提醒适配到当前 ECC 钩子架构，包含本地 `scripts/hooks/design-quality-check.js`、Claude `hooks/hooks.json` 接线、Cursor `after-file-edit.js` 接线，以及在 `tests/hooks/design-quality-check.test.js` 中的专用钩子覆盖。
* 2026-04-02：修复了 `16e9b17` 中 `main` 上的 `#1141`。观察者生命周期现在具有会话感知能力，而非纯粹分离：`SessionStart` 写入项目范围的租约，`SessionEnd` 在最终租约消失时移除该租约并停止观察者，`observe.sh` 记录项目活动，`observer-loop.sh` 现在在无租约剩余时因空闲而退出。定向验证通过 `bash -n`、`node tests/hooks/observer-memory.test.js`、`node tests/integration/hooks.test.js`、`node scripts/ci/validate-hooks.js hooks/hooks.json` 和 `node scripts/ci/check-unicode-safety.js`。
* 2026-04-02：通过使 `scripts/lib/utils.js#getHomeDir()` 在回退到 `os.homedir()` 之前遵循显式 `HOME` / `USERPROFILE` 覆盖，修复了 `#1070` 背后剩余的仅 Windows 钩子回归问题。这恢复了 Windows 上钩子集成运行的测试隔离观察者状态路径。在 `tests/lib/utils.test.js` 中添加了回归覆盖。定向验证通过 `node tests/lib/utils.test.js`、`node tests/integration/hooks.test.js`、`node tests/hooks/observer-memory.test.js` 和 `node scripts/ci/check-unicode-safety.js`。
* 2026-04-02：将对 `#1022` 的 NestJS 支持直接移植到 `main`，作为 `skills/nestjs-patterns/SKILL.md`，并将其接入 `framework-language` 安装模块。随后同步了仓库目录（`38` 代理、`72` 命令、`156` 技能），并更新了文档，使 NestJS 不再被列为未填补的框架空白。
* 2026-04-05：发布了 `846ffb7`（`chore: ship v1.10.0 release surface refresh`）。这更新了 README/插件元数据/包版本，同步了显式插件代理清单，更新了过时的星标/复刻/贡献者计数，创建了 `docs/releases/1.10.0/*`，标记并发布了 `v1.10.0`，并在 `#1272` 发布了公告讨论。
* 2026-04-05：在不重放整个分支的情况下，从 `6eba30f` 中抢救出可复用的 Hermes 分支算子技能。添加了 `skills/github-ops`、`skills/knowledge-ops` 和 `skills/hookify-rules`，将其接入安装模块，并重新同步仓库至 `159` 技能。`knowledge-ops` 被明确适配到当前工作区模型：克隆仓库中的实时代码，GitHub/Linear 中的活跃真相，KB/归档层中的更广泛非代码上下文。
* 2026-04-05：修复了 `db6d52e` 中剩余的 OpenCode npm 发布空白。根包现在在 `prepack` 期间构建 `.opencode/dist`，在发布的 tarball 中包含编译后的 OpenCode 插件资产，并带有一个专用回归测试（`tests/scripts/build-opencode.test.js`），以便该包不再仅为该表面提供原始 TypeScript 源代码。
* 2026-04-05：添加了 `skills/council`，从 `#1193` 直接移植了安全的 `code-tour` 通道，并重新同步仓库至 `162` 技能。`code-tour` 保持自包含，仅生成带有真实文件/行锚点的 `.tours/*.tour` 工件；技能内部不假定任何外部运行时或扩展安装。
* 2026-04-05：在部署了 `ECC-Tools/main` 修复 `f615905` 后，关闭了最新的自动生成 ECC 捆绑包 PR 浪潮（`#1275`-`#1281`）。该修复现在阻止仓库级别的问题评论 `/analyze` 请求打开重复的捆绑包 PR，同时仍允许针对不可变的头部 SHA 运行 PR 线程重试分析。
* 2026-04-05：通过将 `agents/seo-specialist.md` 和 `skills/seo/SKILL.md` 直接移植到 `main`，然后将 `skills/seo` 接入 `business-content`，填补了 SEO 空白。这解决了对 SEO 专家的过时 `team-builder` 引用，并在不整体合并过时 PR 的情况下，将公共目录更新至 `39` 个代理和 `163` 个技能。
* 2026-04-05：将 `#1214` 中有用的通用规则增量直接抢救到 `rules/common/coding-style.md` 和 `rules/common/testing.md`（KISS/DRY/YAGNI 提醒、命名约定、代码异味指南和 AAA 风格测试指南），然后关闭了原始的混合删除 PR。该 PR 中的广泛技能移除被有意不重放。
* 2026-04-05：使用 `bf5961e` 修复了 `.github/workflows/monthly-metrics.yml` 中的过时行错误。工作流现在刷新问题 `#1087` 中的当前月份行，而非在月份已存在时提前返回，并且已分发的运行将四月快照更新为当前的星标/复刻/发布计数。
* 2026-04-05：从分叉的 Hermes 分支中恢复有用的成本控制工作流，作为一个小型 ECC 原生算子技能，而非重放该分支。`skills/ecc-tools-cost-audit/SKILL.md` 现已接入 `operator-workflows`，专注于兄弟仓库 `ECC-Tools` 中的 webhook -> 队列 -> 工作者追踪、燃烧控制、配额绕过、高级模型泄漏和重试扇出。
* 2026-04-05：在 `753da37` 中添加了 `skills/council/SKILL.md`，作为 ECC 原生的四语音决策工作流。保留了 PR `#1254` 中有用的协议，但明确移除了影子 `~/.claude/notes` 写入路径，转而使用 `knowledge-ops`、`/save-session` 或在决策增量重要时直接更新 GitHub/Linear。
* 2026-04-05：将 PR `#1243` 中安全的 `globals` 提升直接移植到 `main`，作为委员会通道的一部分，并关闭该 PR，因其已被取代。
* 2026-04-05：在全面审计后关闭了 PR `#1232`。提议的 `skill-scout` 工作流与当前的 `search-first`、`/skill-create` 和 `skill-stocktake` 重叠；如果以后需要专用的市场发现层，应在当前安装/目录模型之上重建，而非作为并行发现路径落地。
* 2026-04-05：将 PR `#1209` 中安全的本地化 README 切换器修复直接移植到 `main`，而非整体合并文档 PR。导航现在在本地化 README 切换器中一致地包含 `Português (Brasil)` 和 `Türkçe`，而较新的本地化正文保持不变。
* 2026-04-05：从 `main` 中移除了过时的 InsAIts 已发布表面。ECC 不再为 `insa-its` 提供外部 Python MCP 入口、可选钩子接线、包装器/监控脚本或当前文档提及；变更日志历史保留，但实时产品表面现在再次完全 ECC 原生。
* 2026-04-05：在不重放整个分支的情况下，抢救出可复用的 Hermes 生成算子工作流通道。添加了六个 ECC 原生顶级技能，取代了旧的嵌套 `skills/hermes-generated/*` 树：`automation-audit-ops`、`email-ops`、`finance-billing-ops`、`messages-ops`、`research-ops` 和 `terminal-ops`。`research-ops` 现在包装了现有的研究栈，而其他五个扩展了 `operator-workflows`，未引入任何外部运行时假设。
* 2026-04-05：添加了 `skills/product-capability` 和 `docs/examples/product-capability-template.md`，作为问题 `#1185` 的规范 PRD 到 SRS 通道。这是 ECC 原生能力契约步骤，介于模糊的产品意图和实现之间，它位于 `business-content` 中，而非衍生出并行规划子系统。
* 2026-04-05：收紧了 `product-lens`，使其不再与新的能力契约通道重叠。`product-lens` 现在明确拥有产品诊断/简要验证，而 `product-capability` 拥有实现就绪的能力计划和 SRS 风格约束。
* 2026-04-05：继续 `#1213` 清理，从导出的清单/文档中移除对已删除 `project-guidelines-example` 技能的过时引用，并将 `continuous-learning` v1 标记为受支持的遗留路径，并明确移交给 `continuous-learning-v2`。
* 2026-04-05：从 `docs/ko-KR` 和 `docs/zh-CN` 中移除了最后一个孤立的本地化 `project-guidelines-example` 文档。模板现在仅存在于 `docs/examples/project-guidelines-template.md` 中，这与当前仓库表面匹配，并避免为已删除的技能提供翻译文档。
* 2026-04-05：添加了 `docs/HERMES-OPENCLAW-MIGRATION.md`，作为问题 `#1051` 的当前公共迁移指南。它将 Hermes/OpenClaw 重新定义为要从中提取的源系统，而非最终运行时，并将调度器、分发器、内存、技能和服务层映射到已存在的 ECC 原生表面和 ECC 2.0 待办事项。
* 2026-04-05：从问题 `#916` 落地了 `skills/agent-sort` 和遗留的 `/agent-sort` 填充程序，作为 ECC 原生选择性安装工作流。它使用具体的仓库证据将代理、技能、命令、规则、钩子和附加组件分类为 DAILY 与 LIBRARY 存储桶，然后将安装更改移交给 `configure-ecc`，而非发明并行安装程序。目录真相现在是 `39` 个代理、`73` 个命令和 `179` 个技能。
* 2026-04-05：将安全的 README-only `#1285` 切片直接移植到 `main` 中，而非合并分支：新增了一个小型的 `Community Projects` 部分，以便下游团队能够链接基于 ECC 构建的公开工作，而无需更改安装、安全或运行时表面。在审查中拒绝了 `#1286`，因为它引入了一个外部第三方 GitHub Action（`hashgraph-online/codex-plugin-scanner`），不符合当前的供应链策略。
* 2026-04-05：通过完整差异重新审计了 `origin/feat/hermes-generated-ops-skills`。该分支仍然不可合并：它删除了当前 ECC 原生表面，回退了打包/安装元数据，并移除了较新的 `main` 内容。继续采用选择性抢救策略，而非分支合并。
* 2026-04-05：从 Hermes 分支中选择性抢救了 `skills/frontend-design`，作为独立的 ECC 原生技能，将其镜像到 `.agents` 中，接入 `framework-language`，并在验证后将目录重新同步至 `180` 个技能。该分支本身仍仅作为参考，直到每个剩余的唯一文件被有意移植或拒绝。
* 2026-04-05：从 Hermes 分支中选择性抢救了 `hookify` 命令包及其支持的 `conversation-analyzer` 代理。`hookify-rules` 已作为规范技能存在；此次传递恢复了面向用户的命令表面（`/hookify`、`/hookify-help`、`/hookify-list`、`/hookify-configure`），而未引入任何外部运行时或分支范围的回归。目录真相现为 `40` 个代理、`77` 条命令和 `180` 个技能。
* 2026-04-05：从 Hermes 分支中选择性抢救了独立的审查/开发包：`review-pr`、`feature-dev` 以及支持的分析器/架构代理（`code-architect`、`code-explorer`、`code-simplifier`、`comment-analyzer`、`pr-test-analyzer`、`silent-failure-hunter`、`type-design-analyzer`）。这为 PR 审查和功能规划添加了 ECC 原生命令表面，而无需合并该分支更广泛的回归。目录真相现为 `47` 个代理、`79` 条命令和 `180` 个技能。
* 2026-04-05：将 `docs/HERMES-SETUP.md` 从 Hermes 分支移植为迁移通道的清理后操作员拓扑文档。这仅是对 `#1051` 的文档支持，并非运行时更改，也不表示 Hermes 分支本身可合并。
* 2026-04-05：完成了对 `origin/feat/hermes-generated-ops-skills` 的有用抢救传递。剩余的唯一文件被明确拒绝：
  * 重复的 git 辅助命令（`commit`、`commit-push-pr`、`clean-gone`）与当前的检查点/发布流程重叠
  * `scripts/hooks/security-reminder*` 新增了一个基于 Python 的钩子路径，当前运行时策略未证明其合理性
  * `skills/oura-health` 和 `skills/pmx-guidelines` 是用户或项目特定的，并非规范的 ECC 表面
  * `docs/releases/2.0.0-preview/*` 是过早的附带产物，应稍后根据当前产品真相重建
  * 嵌套的 `skills/hermes-generated/*` 已被已移植到 `main` 的顶层 ECC 原生操作员技能取代
* 2026-04-08：修复了 `#1327` 中报告的命令导出回归问题，方法是在 `agent.yaml` 中恢复规范的 `commands:` 部分，并添加 `tests/ci/agent-yaml-surface.test.js` 以强制 YAML 导出表面与真实的 `commands/` 目录之间完全一致。通过完整的仓库测试扫描验证：`1764/1764` 通过。
