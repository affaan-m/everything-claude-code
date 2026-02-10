# Everything Claude Code

[![Stars](https://img.shields.io/github/stars/affaan-m/everything-claude-code?style=flat)](https://github.com/affaan-m/everything-claude-code/stargazers)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
![Shell](https://img.shields.io/badge/-Shell-4EAA25?logo=gnu-bash&logoColor=white)
![TypeScript](https://img.shields.io/badge/-TypeScript-3178C6?logo=typescript&logoColor=white)
![Python](https://img.shields.io/badge/-Python-3776AB?logo=python&logoColor=white)
![Go](https://img.shields.io/badge/-Go-00ADD8?logo=go&logoColor=white)
![Java](https://img.shields.io/badge/-Java-ED8B00?logo=openjdk&logoColor=white)
![Markdown](https://img.shields.io/badge/-Markdown-000000?logo=markdown&logoColor=white)

---

<div align="center">

**🌐 Language / 语言 / 語言**

[**English**](README.md) | [简体中文](README.zh-CN.md) | [繁體中文](docs/zh-TW/README.md)

</div>

---

**来自 Anthropic 黑客马拉松获胜者的完整 Claude Code 配置集合。**

生产级代理、技能、钩子、命令、规则和 MCP 配置，经过 10 多个月构建真实产品的密集日常使用而演化。

---

## 指南

这个仓库只包含原始代码。指南解释了一切。

<table>
<tr>
<td width="50%">
<a href="https://x.com/affaanmustafa/status/2012378465664745795">
<img src="https://github.com/user-attachments/assets/1a471488-59cc-425b-8345-5245c7efbcef" alt="The Shorthand Guide to Everything Claude Code" />
</a>
</td>
<td width="50%">
<a href="https://x.com/affaanmustafa/status/2014040193557471352">
<img src="https://github.com/user-attachments/assets/c9ca43bc-b149-427f-b551-af6840c368f0" alt="The Longform Guide to Everything Claude Code" />
</a>
</td>
</tr>
<tr>
<td align="center"><b>精简指南</b><br/>设置、基础、理念。<b>先读这个。</b></td>
<td align="center"><b>详细指南</b><br/>Token 优化、内存持久化、评估、并行化。</td>
</tr>
</table>

| 主题 | 你将学到什么 |
|-------|-------------------|
| Token 优化 | 模型选择、系统提示精简、后台进程 |
| 内存持久化 | 自动跨会话保存/加载上下文的钩子 |
| 持续学习 | 从会话中自动提取模式到可重用的技能 |
| 验证循环 | 检查点 vs 持续评估、评分器类型、pass@k 指标 |
| 并行化 | Git worktrees、级联方法、何时扩展实例 |
| 子代理编排 | 上下文问题、迭代检索模式 |

---

## What's New

### v1.4.1 — Bug Fix (2026年2月)

- **修复直觉导入内容丢失** — `parse_instinct_file()` 在 `/instinct-import` 期间静默删除了 frontmatter 之后的所有内容（Action、Evidence、Examples 部分）。由社区贡献者 @ericcai0814 修复 ([#148](https://github.com/affaan-m/everything-claude-code/issues/148), [#161](https://github.com/affaan-m/everything-claude-code/pull/161))

### v1.4.0 — 多语言规则、安装向导 & PM2 (2026年2月)

- **交互式安装向导** — 新增 `configure-ecc` 技能提供引导式设置，支持合并/覆盖检测
- **PM2 & 多代理编排** — 6 个新命令 (`/pm2`、`/multi-plan`、`/multi-execute`、`/multi-backend`、`/multi-frontend`、`/multi-workflow`) 用于管理复杂的多服务工作流
- **多语言规则架构** — 规则从扁平文件重构为 `common/` + `typescript/` + `python/` + `golang/` 目录结构。仅安装你需要的语言规则
- **中文翻译** — 完整翻译所有代理、命令、技能和规则（80+ 文件）
- **GitHub Sponsors 支持** — 通过 GitHub Sponsors 赞助项目
- **增强的 CONTRIBUTING.md** — 每种贡献类型的详细 PR 模板

### v1.3.0 — OpenCode 插件支持 (2026年2月)

- **完整的 OpenCode 集成** — 通过 OpenCode 的插件系统（20+ 事件类型）支持 12 个代理、24 个命令、16 个技能和钩子
- **3 个原生自定义工具** — run-tests、check-coverage、security-audit
- **LLM 文档** — 用于全面 OpenCode 文档的 `llms.txt`

### v1.2.0 — 统一命令与技能 (2026年2月)

- **Python/Django 支持** — Django 模式、安全、TDD 和验证技能
- **Java Spring Boot 技能** — Spring Boot 的模式、安全、TDD 和验证
- **会话管理** — `/sessions` 命令用于会话历史
- **持续学习 v2** — 基于直觉的学习，具有置信度评分、导入/导出、演化

完整更新日志请参阅 [Releases](https://github.com/affaan-m/everything-claude-code/releases)。

---

## 🚀 快速开始

在 2 分钟内快速上手：

### 第一步：安装插件

```bash
# 添加市场
/plugin marketplace add affaan-m/everything-claude-code

# 安装插件
/plugin install everything-claude-code@everything-claude-code
```

### 第二步：安装规则（必需）

> ⚠️ **重要提示：** Claude Code 插件无法自动分发 `rules`，需要手动安装：

```bash
# 首先克隆仓库
git clone https://github.com/affaan-m/everything-claude-code.git

# 安装通用规则（必需）
cp -r everything-claude-code/rules/common/* ~/.claude/rules/

# 安装特定语言规则（选择你的技术栈）
cp -r everything-claude-code/rules/typescript/* ~/.claude/rules/
cp -r everything-claude-code/rules/python/* ~/.claude/rules/
cp -r everything-claude-code/rules/golang/* ~/.claude/rules/
```

### 第三步：开始使用

```bash
# 尝试一个命令
/plan "添加用户认证"

# 查看可用命令
/plugin list everything-claude-code@everything-claude-code
```

✨ **完成！** 你现在可以使用 15+ 代理、30+ 技能和 30+ 命令。

---

## 🌐 跨平台支持

此插件现在完全支持 **Windows、macOS 和 Linux**。所有钩子和脚本都已用 Node.js 重写，以实现最大的兼容性。

### 包管理器检测

插件自动检测你首选的包管理器（npm、pnpm、yarn 或 bun），优先级如下：

1. **环境变量**: `CLAUDE_PACKAGE_MANAGER`
2. **项目配置**: `.claude/package-manager.json`
3. **package.json**: `packageManager` 字段
4. **锁文件**: 从 package-lock.json、yarn.lock、pnpm-lock.yaml 或 bun.lockb 检测
5. **全局配置**: `~/.claude/package-manager.json`
6. **回退**: 第一个可用的包管理器

要设置你首选的包管理器：

```bash
# 通过环境变量
export CLAUDE_PACKAGE_MANAGER=pnpm

# 通过全局配置
node scripts/setup-package-manager.js --global pnpm

# 通过项目配置
node scripts/setup-package-manager.js --project bun

# 检测当前设置
node scripts/setup-package-manager.js --detect
```

或在 Claude Code 中使用 `/setup-pm` 命令。

---

## 📦 里面有什么

这个仓库是一个 **Claude Code 插件** - 直接安装或手动复制组件。

```
everything-claude-code/
|-- .claude-plugin/   # 插件和市场清单
|   |-- plugin.json         # 插件元数据和组件路径
|   |-- marketplace.json    # /plugin marketplace add 的市场目录
|
|-- agents/           # 用于委托的专业子代理
|   |-- planner.md           # 功能实现规划
|   |-- architect.md         # 系统设计决策
|   |-- tdd-guide.md         # 测试驱动开发
|   |-- code-reviewer.md     # 质量和安全审查
|   |-- security-reviewer.md # 漏洞分析
|   |-- build-error-resolver.md
|   |-- e2e-runner.md        # Playwright E2E 测试
|   |-- refactor-cleaner.md  # 死代码清理
|   |-- doc-updater.md       # 文档同步
|   |-- go-reviewer.md       # Go 代码审查
|   |-- go-build-resolver.md # Go 构建错误解决
|   |-- python-reviewer.md   # Python 代码审查（新增）
|   |-- database-reviewer.md # 数据库/Supabase 审查（新增）
|
|-- skills/           # 工作流定义和领域知识
|   |-- coding-standards/           # 语言最佳实践
|   |-- backend-patterns/           # API、数据库、缓存模式
|   |-- frontend-patterns/          # React、Next.js 模式
|   |-- continuous-learning/        # 从会话中自动提取模式（详细指南）
|   |-- continuous-learning-v2/     # 基于直觉的学习与置信度评分
|   |-- iterative-retrieval/        # 子代理的渐进式上下文细化
|   |-- strategic-compact/          # 手动压缩建议（详细指南）
|   |-- tdd-workflow/               # TDD 方法论
|   |-- security-review/            # 安全检查清单
|   |-- eval-harness/               # 验证循环评估（详细指南）
|   |-- verification-loop/          # 持续验证（详细指南）
|   |-- golang-patterns/            # Go 惯用语和最佳实践
|   |-- golang-testing/             # Go 测试模式、TDD、基准测试
|   |-- django-patterns/            # Django 模式、模型、视图（新增）
|   |-- django-security/            # Django 安全最佳实践（新增）
|   |-- django-tdd/                 # Django TDD 工作流（新增）
|   |-- django-verification/        # Django 验证循环（新增）
|   |-- python-patterns/            # Python 惯用语和最佳实践（新增）
|   |-- python-testing/             # Python pytest 测试（新增）
|   |-- springboot-patterns/        # Java Spring Boot 模式（新增）
|   |-- springboot-security/        # Spring Boot 安全（新增）
|   |-- springboot-tdd/             # Spring Boot TDD（新增）
|   |-- springboot-verification/    # Spring Boot 验证（新增）
|   |-- configure-ecc/              # 交互式安装向导（新增）
|
|-- commands/         # 用于快速执行的斜杠命令
|   |-- tdd.md              # /tdd - 测试驱动开发
|   |-- plan.md             # /plan - 实现规划
|   |-- e2e.md              # /e2e - E2E 测试生成
|   |-- code-review.md      # /code-review - 质量审查
|   |-- build-fix.md        # /build-fix - 修复构建错误
|   |-- refactor-clean.md   # /refactor-clean - 死代码移除
|   |-- learn.md            # /learn - 会话中提取模式（详细指南）
|   |-- checkpoint.md       # /checkpoint - 保存验证状态（详细指南）
|   |-- verify.md           # /verify - 运行验证循环（详细指南）
|   |-- setup-pm.md         # /setup-pm - 配置包管理器
|   |-- go-review.md        # /go-review - Go 代码审查
|   |-- go-test.md          # /go-test - Go TDD 工作流
|   |-- go-build.md         # /go-build - 修复 Go 构建错误
|   |-- skill-create.md     # /skill-create - 从 git 历史生成技能
|   |-- instinct-status.md  # /instinct-status - 查看学习的直觉
|   |-- instinct-import.md  # /instinct-import - 导入直觉
|   |-- instinct-export.md  # /instinct-export - 导出直觉
|   |-- evolve.md           # /evolve - 将直觉聚类到技能中
|   |-- pm2.md              # /pm2 - PM2 服务生命周期管理（新增）
|   |-- multi-plan.md       # /multi-plan - 多代理任务分解（新增）
|   |-- multi-execute.md    # /multi-execute - 编排的多代理工作流（新增）
|   |-- multi-backend.md    # /multi-backend - 后端多服务编排（新增）
|   |-- multi-frontend.md   # /multi-frontend - 前端多服务编排（新增）
|   |-- multi-workflow.md   # /multi-workflow - 通用多服务工作流（新增）
|
|-- rules/            # 始终遵循的指南（复制到 ~/.claude/rules/）
|   |-- README.md            # 结构概述和安装指南
|   |-- common/              # 语言无关的原则
|   |   |-- coding-style.md    # 不可变性、文件组织
|   |   |-- git-workflow.md    # 提交格式、PR 流程
|   |   |-- testing.md         # TDD、80% 覆盖率要求
|   |   |-- performance.md     # 模型选择、上下文管理
|   |   |-- patterns.md        # 设计模式、骨架项目
|   |   |-- hooks.md           # 钩子架构、TodoWrite
|   |   |-- agents.md          # 何时委托给子代理
|   |   |-- security.md        # 强制性安全检查
|   |-- typescript/          # TypeScript/JavaScript 专用
|   |-- python/              # Python 专用
|   |-- golang/              # Go 专用
|
|-- hooks/            # 基于触发器的自动化
|   |-- hooks.json                # 所有钩子配置（PreToolUse、PostToolUse、Stop 等）
|   |-- memory-persistence/       # 会话生命周期钩子（详细指南）
|   |-- strategic-compact/        # 压缩建议（详细指南）
|
|-- scripts/          # 跨平台 Node.js 脚本
|   |-- lib/                     # 共享工具
|   |   |-- utils.js             # 跨平台文件/路径/系统工具
|   |   |-- package-manager.js   # 包管理器检测和选择
|   |-- hooks/                   # 钩子实现
|   |   |-- session-start.js     # 会话开始时加载上下文
|   |   |-- session-end.js       # 会话结束时保存状态
|   |   |-- pre-compact.js       # 压缩前状态保存
|   |   |-- suggest-compact.js   # 战略性压缩建议
|   |   |-- evaluate-session.js  # 从会话中提取模式
|   |-- setup-package-manager.js # 交互式 PM 设置
|
|-- tests/            # 测试套件
|   |-- lib/                     # 库测试
|   |-- hooks/                   # 钩子测试
|   |-- run-all.js               # 运行所有测试
|
|-- contexts/         # 动态系统提示注入上下文（详细指南）
|   |-- dev.md              # 开发模式上下文
|   |-- review.md           # 代码审查模式上下文
|   |-- research.md         # 研究/探索模式上下文
|
|-- examples/         # 示例配置和会话
|   |-- CLAUDE.md           # 示例项目级配置
|   |-- user-CLAUDE.md      # 示例用户级配置
|
|-- mcp-configs/      # MCP 服务器配置
|   |-- mcp-servers.json    # GitHub、Supabase、Vercel、Railway 等
|
|-- marketplace.json  # 自托管市场配置（用于 /plugin marketplace add）
```

---

## 🛠️ 生态系统工具

### 技能创建器

两种从你的仓库生成 Claude Code 技能的方法：

#### 选项 A：本地分析（内置）

使用 `/skill-create` 命令进行本地分析，无需外部服务：

```bash
/skill-create                    # 分析当前仓库
/skill-create --instincts        # 还为 continuous-learning 生成直觉
```

这在本地分析你的 git 历史并生成 SKILL.md 文件。

#### 选项 B：GitHub 应用（高级）

用于高级功能（10k+ 提交、自动 PR、团队共享）：

[安装 GitHub 应用](https://github.com/apps/skill-creator) | [ecc.tools](https://ecc.tools)

```bash
# 在任何问题上评论：
/skill-creator analyze

# 或在推送到默认分支时自动触发
```

两个选项都创建：
- **SKILL.md 文件** - 可直接用于 Claude Code 的技能
- **直觉集合** - 用于 continuous-learning-v2
- **模式提取** - 从你的提交历史中学习

### 🧠 持续学习 v2

基于直觉的学习系统自动学习你的模式：

```bash
/instinct-status        # 显示带有置信度的学习直觉
/instinct-import <file> # 从他人导入直觉
/instinct-export        # 导出你的直觉以供分享
/evolve                 # 将相关直觉聚类到技能中
```

完整文档见 `skills/continuous-learning-v2/`。

---

## 📋 系统要求

### Claude Code CLI 版本

**最低版本：v2.1.0 或更高版本**

此插件需要 Claude Code CLI v2.1.0+，因为插件系统处理钩子的方式发生了变化。

检查你的版本：
```bash
claude --version
```

### 重要：钩子自动加载行为

> ⚠️ **贡献者注意：** 当钩子文件位于默认位置 `hooks/hooks.json` 时，请不要在 `.claude-plugin/plugin.json` 中添加指向该位置的 `"hooks"` 字段。

Claude Code v2.1+ 会**自动加载**任何已安装插件中的 `hooks/hooks.json`。

**注意事项：**
- 如果 `hooks` 字段指向默认位置 `hooks/hooks.json`，会导致重复检测错误
- `hooks` 字段对于**自定义路径**（字符串/数组）或**内联钩子配置**（对象）仍然有效

重复检测错误示例：

```
Duplicate hooks file detected: ./hooks/hooks.json resolves to already-loaded file
```

**历史记录：** 这在此仓库中导致了多次修复/回退循环 ([#29](https://github.com/affaan-m/everything-claude-code/issues/29), [#52](https://github.com/affaan-m/everything-claude-code/issues/52), [#103](https://github.com/affaan-m/everything-claude-code/issues/103))。该行为在 Claude Code 版本之间发生了变化，导致混淆。我们现在有回归测试来防止这种情况被重新引入。

---

## 📥 安装

### 选项 1：作为插件安装（推荐）

使用此仓库的最简单方法 - 作为 Claude Code 插件安装：

```bash
# 将此仓库添加为市场
/plugin marketplace add affaan-m/everything-claude-code

# 安装插件
/plugin install everything-claude-code@everything-claude-code
```

或直接添加到你的 `~/.claude/settings.json`：

```json
{
  "extraKnownMarketplaces": {
    "everything-claude-code": {
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

这让你可以立即访问所有命令、代理、技能和钩子。

> **注意：** Claude Code 插件系统不支持通过插件分发 `rules`（[上游限制](https://code.claude.com/docs/en/plugins-reference)）。你需要手动安装规则：
>
> ```bash
> # 首先克隆仓库
> git clone https://github.com/affaan-m/everything-claude-code.git
>
> # 选项 A：用户级规则（应用于所有项目）
> cp -r everything-claude-code/rules/common/* ~/.claude/rules/
> cp -r everything-claude-code/rules/typescript/* ~/.claude/rules/   # 选择你的技术栈
> cp -r everything-claude-code/rules/python/* ~/.claude/rules/
> cp -r everything-claude-code/rules/golang/* ~/.claude/rules/
>
> # 选项 B：项目级规则（仅应用于当前项目）
> mkdir -p .claude/rules
> cp -r everything-claude-code/rules/common/* .claude/rules/
> cp -r everything-claude-code/rules/typescript/* .claude/rules/     # 选择你的技术栈
> ```

---

### 🔧 选项 2：手动安装

如果你希望对安装的内容进行手动控制：

```bash
# 克隆仓库
git clone https://github.com/affaan-m/everything-claude-code.git

# 将代理复制到你的 Claude 配置
cp everything-claude-code/agents/*.md ~/.claude/agents/

# 复制规则（通用 + 特定语言）
cp -r everything-claude-code/rules/common/* ~/.claude/rules/
cp -r everything-claude-code/rules/typescript/* ~/.claude/rules/   # 选择你的技术栈
cp -r everything-claude-code/rules/python/* ~/.claude/rules/
cp -r everything-claude-code/rules/golang/* ~/.claude/rules/

# 复制命令
cp everything-claude-code/commands/*.md ~/.claude/commands/

# 复制技能
cp -r everything-claude-code/skills/* ~/.claude/skills/
```

#### 将钩子添加到 settings.json

将 `hooks/hooks.json` 中的钩子复制到你的 `~/.claude/settings.json`。

#### 配置 MCP

将所需的 MCP 服务器从 `mcp-configs/mcp-servers.json` 复制到你的 `~/.claude.json`。

**重要：** 将 `YOUR_*_HERE` 占位符替换为你的实际 API 密钥。

---

## 🎯 关键概念

### 代理

子代理以有限范围处理委托的任务。示例：

```markdown
---
name: code-reviewer
description: 审查代码的质量、安全性和可维护性
tools: ["Read", "Grep", "Glob", "Bash"]
model: opus
---

你是一名高级代码审查员...
```

### 技能

技能是由命令或代理调用的工作流定义：

```markdown
# TDD 工作流

1. 首先定义接口
2. 编写失败的测试（RED）
3. 实现最少的代码（GREEN）
4. 重构（IMPROVE）
5. 验证 80%+ 的覆盖率
```

### 钩子

钩子在工具事件时触发。示例 - 警告 console.log：

```json
{
  "matcher": "tool == \"Edit\" && tool_input.file_path matches \"\\\\.(ts|tsx|js|jsx)$\"",
  "hooks": [{
    "type": "command",
    "command": "#!/bin/bash\ngrep -n 'console\\.log' \"$file_path\" && echo '[Hook] 移除 console.log' >&2"
  }]
}
```

### 规则

规则是始终遵循的指南，组织为 `common/`（语言无关）+ 特定语言目录：

```
rules/
  common/          # 通用原则（始终安装）
  typescript/      # TS/JS 特定模式和工具
  python/          # Python 特定模式和工具
  golang/          # Go 特定模式和工具
```

详见 [`rules/README.md`](rules/README.md) 了解安装和结构详情。

---

## 🧪 运行测试

插件包含一个全面的测试套件：

```bash
# 运行所有测试
node tests/run-all.js

# 运行单个测试文件
node tests/lib/utils.test.js
node tests/lib/package-manager.test.js
node tests/hooks/hooks.test.js
```

---

## 🤝 贡献

**欢迎并鼓励贡献。**

这个仓库旨在成为社区资源。如果你有：
- 有用的代理或技能
- 聪明的钩子
- 更好的 MCP 配置
- 改进的规则

请贡献！请参阅 [CONTRIBUTING.md](CONTRIBUTING.md) 了解指南。

### 贡献想法

- 特定语言的技能（Rust、C#、Swift、Kotlin）- Go、Python、Java 已包含
- 特定框架的配置（Rails、Laravel、FastAPI、NestJS）- Django、Spring Boot 已包含
- DevOps 代理（Kubernetes、Terraform、AWS、Docker）
- 测试策略（不同框架、视觉回归）
- 特定领域的知识（ML、数据工程、移动）

---

## 🔌 OpenCode 支持

ECC 提供**完整的 OpenCode 支持**，包括插件和钩子。

### 快速开始

```bash
# 安装 OpenCode
npm install -g opencode

# 在仓库根目录运行
opencode
```

配置会从 `.opencode/opencode.json` 自动检测。

### 功能对等

| 功能 | Claude Code | OpenCode | 状态 |
|---------|-------------|----------|--------|
| 代理 | ✅ 14 个代理 | ✅ 12 个代理 | **Claude Code 领先** |
| 命令 | ✅ 30 个命令 | ✅ 24 个命令 | **Claude Code 领先** |
| 技能 | ✅ 28 个技能 | ✅ 16 个技能 | **Claude Code 领先** |
| 钩子 | ✅ 3 个阶段 | ✅ 20+ 事件 | **OpenCode 更多！** |
| 规则 | ✅ 8 条规则 | ✅ 8 条规则 | **完全对等** |
| MCP 服务器 | ✅ 完整 | ✅ 完整 | **完全对等** |
| 自定义工具 | ✅ 通过钩子 | ✅ 原生支持 | **OpenCode 更好** |

### 通过插件支持钩子

OpenCode 的插件系统比 Claude Code 更复杂，有 20+ 事件类型：

| Claude Code 钩子 | OpenCode 插件事件 |
|-----------------|----------------------|
| PreToolUse | `tool.execute.before` |
| PostToolUse | `tool.execute.after` |
| Stop | `session.idle` |
| SessionStart | `session.created` |
| SessionEnd | `session.deleted` |

**额外的 OpenCode 事件**：`file.edited`、`file.watcher.updated`、`message.updated`、`lsp.client.diagnostics`、`tui.toast.show` 等。

### 可用命令（24 个）

| 命令 | 描述 |
|---------|-------------|
| `/plan` | 创建实现计划 |
| `/tdd` | 强制执行 TDD 工作流 |
| `/code-review` | 审查代码更改 |
| `/security` | 运行安全审查 |
| `/build-fix` | 修复构建错误 |
| `/e2e` | 生成 E2E 测试 |
| `/refactor-clean` | 移除死代码 |
| `/orchestrate` | 多代理工作流 |
| `/learn` | 从会话中提取模式 |
| `/checkpoint` | 保存验证状态 |
| `/verify` | 运行验证循环 |
| `/eval` | 根据标准评估 |
| `/update-docs` | 更新文档 |
| `/update-codemaps` | 更新代码地图 |
| `/test-coverage` | 分析覆盖率 |
| `/go-review` | Go 代码审查 |
| `/go-test` | Go TDD 工作流 |
| `/go-build` | 修复 Go 构建错误 |
| `/skill-create` | 从 git 生成技能 |
| `/instinct-status` | 查看学习的直觉 |
| `/instinct-import` | 导入直觉 |
| `/instinct-export` | 导出直觉 |
| `/evolve` | 将直觉聚类到技能中 |
| `/setup-pm` | 配置包管理器 |

### 插件安装

**选项 1：直接使用**
```bash
cd everything-claude-code
opencode
```

**选项 2：作为 npm 包安装**
```bash
npm install opencode-ecc
```

然后添加到你的 `opencode.json`：
```json
{
  "plugin": ["opencode-ecc"]
}
```

### 文档

- **迁移指南**：`.opencode/MIGRATION.md`
- **OpenCode 插件 README**：`.opencode/README.md`
- **合并的规则**：`.opencode/instructions/INSTRUCTIONS.md`
- **LLM 文档**：`llms.txt`（完整的 OpenCode 文档供 LLM 使用）

---

## 📖 背景

自实验性推出以来，我一直在使用 Claude Code。2025 年 9 月，与 [@DRodriguezFX](https://x.com/DRodriguezFX) 一起使用 Claude Code 构建 [zenith.chat](https://zenith.chat)，赢得了 Anthropic x Forum Ventures 黑客马拉松。

这些配置在多个生产应用中经过了实战测试。

---

## ⚠️ 重要说明

### 上下文窗口管理

**关键：** 不要一次启用所有 MCP。如果启用了太多工具，你的 200k 上下文窗口可能会缩小到 70k。

经验法则：
- 配置 20-30 个 MCP
- 每个项目保持启用少于 10 个
- 活动工具少于 80 个

在项目配置中使用 `disabledMcpServers` 来禁用未使用的。

### 定制化

这些配置适用于我的工作流。你应该：
1. 从适合你的开始
2. 为你的技术栈进行修改
3. 删除你不使用的
4. 添加你自己的模式

---

## 🌟 Star 历史

[![Star History Chart](https://api.star-history.com/svg?repos=affaan-m/everything-claude-code&type=Date)](https://star-history.com/#affaan-m/everything-claude-code&Date)

---

## 🔗 链接

- **精简指南（从这里开始）：** [The Shorthand Guide to Everything Claude Code](https://x.com/affaanmustafa/status/2012378465664745795)
- **详细指南（高级）：** [The Longform Guide to Everything Claude Code](https://x.com/affaanmustafa/status/2014040193557471352)
- **关注：** [@affaanmustafa](https://x.com/affaanmustafa)
- **zenith.chat:** [zenith.chat](https://zenith.chat)

---

## 📄 许可证

MIT - 自由使用，根据需要修改，如果可以请回馈。

---

**如果这个仓库有帮助，请给它一个 Star。阅读两个指南。构建一些很棒的东西。**
