# 命令快速参考

> 全局安装 59 个斜杠命令。在任何 Claude Code 会话中输入 `/` 即可调用。

***

## 核心工作流

| 命令 | 功能说明 |
|---------|-------------|
| `/plan` | 重述需求、评估风险、编写分步实施计划 — **等待您确认后才修改代码** |
| `/tdd` | 强制执行测试驱动开发：搭建接口 → 编写失败测试 → 实现 → 验证 80%+ 覆盖率 |
| `/code-review` | 对变更文件进行全面代码质量、安全性和可维护性审查 |
| `/build-fix` | 检测并修复构建错误 — 自动委派给相应的构建修复代理 |
| `/verify` | 运行完整验证循环：构建 → 代码检查 → 测试 → 类型检查 |
| `/quality-gate` | 对照项目标准进行质量门禁检查 |

***

## 测试

| 命令 | 功能说明 |
|---------|-------------|
| `/tdd` | 通用 TDD 工作流（任何语言） |
| `/e2e` | 生成并运行 Playwright 端到端测试，捕获截图/视频/追踪 |
| `/test-coverage` | 报告测试覆盖率，识别覆盖缺口 |
| `/go-test` | Go 语言的 TDD 工作流（表格驱动，使用 `go test -cover` 达到 80%+ 覆盖率） |
| `/kotlin-test` | Kotlin 的 TDD（Kotest + Kover） |
| `/rust-test` | Rust 的 TDD（cargo test，集成测试） |
| `/cpp-test` | C++ 的 TDD（GoogleTest + gcov/lcov） |

***

## 代码审查

| 命令 | 功能说明 |
|---------|-------------|
| `/code-review` | 通用代码审查 |
| `/python-review` | Python — PEP 8、类型提示、安全性、惯用模式 |
| `/go-review` | Go — 惯用模式、并发安全、错误处理 |
| `/kotlin-review` | Kotlin — 空安全、协程安全、整洁架构 |
| `/rust-review` | Rust — 所有权、生命周期、unsafe 使用 |
| `/cpp-review` | C++ — 内存安全、现代惯用法、并发 |

***

## 构建修复

| 命令 | 功能说明 |
|---------|-------------|
| `/build-fix` | 自动检测语言并修复构建错误 |
| `/go-build` | 修复 Go 构建错误和 `go vet` 警告 |
| `/kotlin-build` | 修复 Kotlin/Gradle 编译器错误 |
| `/rust-build` | 修复 Rust 构建 + 借用检查器问题 |
| `/cpp-build` | 修复 C++ CMake 和链接器问题 |
| `/gradle-build` | 修复 Android / KMP 的 Gradle 错误 |

***

## 规划与架构

| 命令 | 功能说明 |
|---------|-------------|
| `/plan` | 带风险评估的实施计划 |
| `/multi-plan` | 多模型协作规划 |
| `/multi-workflow` | 多模型协作开发 |
| `/multi-backend` | 后端聚焦的多模型开发 |
| `/multi-frontend` | 前端聚焦的多模型开发 |
| `/multi-execute` | 多模型协作执行 |
| `/orchestrate` | tmux/worktree 多代理编排指南 |
| `/devfleet` | 通过 DevFleet 编排并行 Claude Code 代理 |

***

## 会话管理

| 命令 | 功能说明 |
|---------|-------------|
| `/save-session` | 将当前会话状态保存到 `~/.claude/session-data/` |
| `/resume-session` | 从规范会话存储中加载最近保存的会话，并从中断处继续 |
| `/sessions` | 浏览、搜索和管理会话历史（使用 `~/.claude/session-data/` 中的别名，并兼容读取 `~/.claude/sessions/` 中的旧数据） |
| `/checkpoint` | 在当前会话中标记检查点 |
| `/aside` | 快速回答一个旁路问题，不丢失当前任务上下文 |
| `/context-budget` | 分析上下文窗口使用情况 — 查找令牌开销，进行优化 |

***

## 学习与改进

| 命令 | 功能说明 |
|---------|-------------|
| `/learn` | 从当前会话中提取可复用的模式 |
| `/learn-eval` | 提取模式 + 保存前自我评估质量 |
| `/evolve` | 分析已学习的直觉，建议演进的技能结构 |
| `/promote` | 将项目范围的直觉提升到全局范围 |
| `/instinct-status` | 显示所有已学习的直觉（项目 + 全局），附带置信度评分 |
| `/instinct-export` | 将直觉导出到文件 |
| `/instinct-import` | 从文件或 URL 导入直觉 |
| `/skill-create` | 分析本地 git 历史 → 生成可复用的技能 |
| `/skill-health` | 技能组合健康仪表板，附带分析 |
| `/rules-distill` | 扫描技能，提取跨领域原则，提炼为规则 |

***

## 重构与清理

| 命令 | 功能说明 |
|---------|-------------|
| `/refactor-clean` | 移除死代码，合并重复项，清理结构 |
| `/prompt-optimize` | 分析草稿提示词，输出优化后的 ECC 增强版本 |

***

## 文档与研究

| 命令 | 功能说明 |
|---------|-------------|
| `/docs` | 通过 Context7 查找当前库/API 文档 |
| `/update-docs` | 更新项目文档 |
| `/update-codemaps` | 为代码库重新生成代码映射 |

***

## 循环与自动化

| 命令 | 功能说明 |
|---------|-------------|
| `/loop-start` | 按时间间隔启动循环代理循环 |
| `/loop-status` | 检查运行中循环的状态 |
| `/claw` | 启动 NanoClaw v2 — 持久化 REPL，支持模型路由、技能热加载、分支和指标 |

***

## 项目与基础设施

| 命令 | 功能说明 |
|---------|-------------|
| `/projects` | 列出已知项目及其直觉统计信息 |
| `/harness-audit` | 审计代理工具配置的可靠性和成本 |
| `/eval` | 运行评估工具 |
| `/model-route` | 将任务路由到合适的模型（Haiku / Sonnet / Opus） |
| `/pm2` | PM2 进程管理器初始化 |
| `/setup-pm` | 配置包管理器（npm / pnpm / yarn / bun） |

***

## 快速决策指南

```
开始新功能？                    → 先 /plan，再 /tdd
刚写完代码？                    → /code-review
构建失败？                      → /build-fix
需要实时文档？                  → /docs <library>
会话即将结束？                  → /save-session 或 /learn-eval
次日继续？                      → /resume-session
上下文过重？                    → /context-budget 然后 /checkpoint
想提取所学内容？                → /learn-eval 然后 /evolve
重复执行任务？                  → /loop-start
```
