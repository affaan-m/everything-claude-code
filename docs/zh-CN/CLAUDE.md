# CLAUDE.md

本文件为 Claude Code (claude.ai/code) 处理此仓库代码时提供指导。

## 项目概述

这是一个 **Claude Code 插件** - 一个包含生产就绪的代理、技能、钩子、命令、规则和 MCP 配置的集合。该项目提供了使用 Claude Code 进行软件开发的经验证的工作流。

## 运行测试

```bash
# Run all tests
node tests/run-all.js

# Run individual test files
node tests/lib/utils.test.js
node tests/lib/package-manager.test.js
node tests/hooks/hooks.test.js
```

## 架构

项目组织为以下几个核心组件：

* **agents/** - 用于委派的专业化子代理（规划器、代码审查员、TDD 指南等）
* **skills/** - 工作流定义和领域知识（编码标准、模式、测试）
* **commands/** - 由用户调用的斜杠命令（/tdd, /plan, /e2e 等）
* **hooks/** - 基于触发的自动化（会话持久化、工具前后钩子）
* **rules/** - 始终遵循的指南（安全、编码风格、测试要求）
* **mcp-configs/** - 用于外部集成的 MCP 服务器配置
* **scripts/** - 用于钩子和设置的跨平台 Node.js 工具
* **tests/** - 脚本和工具的测试套件

## 关键命令

* `/tdd` - 测试驱动开发工作流
* `/plan` - 实施规划
* `/e2e` - 生成并运行端到端测试
* `/code-review` - 质量审查
* `/build-fix` - 修复构建错误
* `/learn` - 从会话中提取模式
* `/skill-create` - 从 git 历史记录生成技能

## 开发说明

* 包管理器检测：npm、pnpm、yarn、bun（可通过 `CLAUDE_PACKAGE_MANAGER` 环境变量或项目配置进行配置）
* 跨平台支持：通过 Node.js 脚本支持 Windows、macOS、Linux
* 智能体格式：采用带 YAML 前言的 Markdown（包含名称、描述、工具、模型）
* 技能格式：采用带明确章节的 Markdown（包含使用时机、工作原理、示例）
* 技能存放位置：精选技能存放于 skills/ 目录；生成/导入的技能存放于 ~/.claude/skills/ 目录。详见 docs/SKILL-PLACEMENT-POLICY.md
* 钩子格式：采用带匹配器条件和命令/通知钩子的 JSON

## 贡献

遵循 CONTRIBUTING.md 中的格式：

* 代理：带有前言的 Markdown（名称、描述、工具、模型）
* 技能：清晰的章节（何时使用、如何工作、示例）
* 命令：带有描述前言的 Markdown
* 钩子：带有匹配器和钩子数组的 JSON

文件命名：小写字母并用连字符连接（例如 `python-reviewer.md`, `tdd-workflow.md`）

## 技能

处理相关文件时请使用以下技能：

| 文件 | 技能 |
|---------|-------|
| `README.md` | `/readme` |
| `.github/workflows/*.yml` | `/ci-workflow` |

生成子智能体时，请务必将相应技能中的约定规则传入智能体提示词。
