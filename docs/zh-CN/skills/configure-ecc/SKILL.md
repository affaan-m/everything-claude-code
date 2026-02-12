---
name: configure-ecc
description: Everything Claude Code 的交互式安装程序 — 引导用户选择并安装技能和规则到用户级或项目级目录，验证路径，并可选择性地优化已安装的文件。
---

# 配置 Everything Claude Code (ECC)

一个交互式、分步安装向导，用于 Everything Claude Code 项目。使用 `AskUserQuestion` 引导用户选择性安装技能和规则，然后验证正确性并提供优化。

## 何时激活

* 用户说 "configure ecc"、"install ecc"、"setup everything claude code" 或类似表述
* 用户想要从此项目中选择性安装技能或规则
* 用户想要验证或修复现有的 ECC 安装
* 用户想要为其项目优化已安装的技能或规则

## 先决条件

此技能必须在激活前对 Claude Code 可访问。有两种引导方式：

1. **通过插件**: `/plugin install everything-claude-code` — 插件会自动加载此技能
2. **手动**: 仅将此技能复制到 `~/.claude/skills/configure-ecc/SKILL.md`，然后通过说 "configure ecc" 激活

***

## 步骤 0：克隆 ECC 仓库

在任何安装之前，将最新的 ECC 源代码克隆到 `/tmp`：

```bash
rm -rf /tmp/everything-claude-code
git clone https://github.com/affaan-m/everything-claude-code.git /tmp/everything-claude-code
```

将 `ECC_ROOT=/tmp/everything-claude-code` 设置为所有后续复制操作的源。

如果克隆失败（网络问题等），使用 `AskUserQuestion` 要求用户提供现有 ECC 克隆的本地路径。

***

## 步骤 1：选择安装级别

使用 `AskUserQuestion` 询问用户安装位置：

```
Question: "Where should ECC components be installed?"
Options:
  - "User-level (~/.claude/)" — "Applies to all your Claude Code projects"
  - "Project-level (.claude/)" — "Applies only to the current project"
  - "Both" — "Common/shared items user-level, project-specific items project-level"
```

将选择存储为 `INSTALL_LEVEL`。设置目标目录：

* 用户级别：`TARGET=~/.claude`
* 项目级别：`TARGET=.claude`（相对于当前项目根目录）
* 两者：`TARGET_USER=~/.claude`，`TARGET_PROJECT=.claude`

如果目标目录不存在，则创建它们：

```bash
mkdir -p $TARGET/skills $TARGET/rules
```

***

## 步骤 2：选择并安装技能

### 2a：选择技能类别

共有 27 项技能，分为 4 个类别。使用 `AskUserQuestion` 和 `multiSelect: true`：

```
Question: "Which skill categories do you want to install?"
Options:
  - "Framework & Language" — "Django, Spring Boot, Go, Python, Java, Frontend, Backend patterns"
  - "Database" — "PostgreSQL, ClickHouse, JPA/Hibernate patterns"
  - "Workflow & Quality" — "TDD, verification, learning, security review, compaction"
  - "All skills" — "Install every available skill"
```

### 2b：确认单项技能

对于每个选定的类别，打印下面的完整技能列表，并要求用户确认或取消选择特定的技能。如果列表超过 4 项，将列表打印为文本，并使用 `AskUserQuestion`，提供一个 "安装所有列出项" 的选项，以及一个 "其他" 选项供用户粘贴特定名称。

**类别：框架与语言（16 项技能）**

| 技能 | 描述 |
|-------|-------------|
| `backend-patterns` | Node.js/Express/Next.js 的后端架构、API 设计、服务器端最佳实践 |
| `coding-standards` | TypeScript、JavaScript、React、Node.js 的通用编码标准 |
| `django-patterns` | Django 架构、使用 DRF 的 REST API、ORM、缓存、信号、中间件 |
| `django-security` | Django 安全：身份验证、CSRF、SQL 注入、XSS 防护 |
| `django-tdd` | 使用 pytest-django、factory\_boy、模拟、覆盖率的 Django 测试 |
| `django-verification` | Django 验证循环：迁移、代码检查、测试、安全扫描 |
| `frontend-patterns` | React、Next.js、状态管理、性能、UI 模式 |
| `golang-patterns` | 地道的 Go 模式、健壮 Go 应用程序的约定 |
| `golang-testing` | Go 测试：表格驱动测试、子测试、基准测试、模糊测试 |
| `java-coding-standards` | Spring Boot 的 Java 编码标准：命名、不可变性、Optional、流 |
| `python-patterns` | Pythonic 惯用法、PEP 8、类型提示、最佳实践 |
| `python-testing` | 使用 pytest、TDD、夹具、模拟、参数化的 Python 测试 |
| `springboot-patterns` | Spring Boot 架构、REST API、分层服务、缓存、异步 |
| `springboot-security` | Spring Security：身份验证/授权、验证、CSRF、密钥、速率限制 |
| `springboot-tdd` | 使用 JUnit 5、Mockito、MockMvc、Testcontainers 的 Spring Boot TDD |
| `springboot-verification` | Spring Boot 验证：构建、静态分析、测试、安全扫描 |

**类别：数据库（3 项技能）**

| 技能 | 描述 |
|-------|-------------|
| `clickhouse-io` | ClickHouse 模式、查询优化、分析、数据工程 |
| `jpa-patterns` | JPA/Hibernate 实体设计、关系、查询优化、事务 |
| `postgres-patterns` | PostgreSQL 查询优化、模式设计、索引、安全 |

**类别：工作流与质量（8 项技能）**

| 技能 | 描述 |
|-------|-------------|
| `continuous-learning` | 从会话中自动提取可重用模式作为习得技能 |
| `continuous-learning-v2` | 基于本能的学习，带有置信度评分，演变为技能/命令/代理 |
| `eval-harness` | 用于评估驱动开发 (EDD) 的正式评估框架 |
| `iterative-retrieval` | 用于子代理上下文问题的渐进式上下文优化 |
| `security-review` | 安全检查清单：身份验证、输入、密钥、API、支付功能 |
| `strategic-compact` | 在逻辑间隔处建议手动上下文压缩 |
| `tdd-workflow` | 强制要求 TDD，覆盖率 80% 以上：单元测试、集成测试、端到端测试 |
| `verification-loop` | 验证和质量循环模式 |

**独立技能**

| 技能 | 描述 |
|-------|-------------|
| `project-guidelines-example` | 用于创建项目特定技能的模板 |

### 2c：执行安装

对于每个选定的技能，复制整个技能目录：

```bash
cp -r $ECC_ROOT/skills/<skill-name> $TARGET/skills/
```

注意：`continuous-learning` 和 `continuous-learning-v2` 有额外的文件（config.json、钩子、脚本）——确保复制整个目录，而不仅仅是 SKILL.md。

***

## 步骤 3：选择并安装规则

使用 `AskUserQuestion` 和 `multiSelect: true`：

```
Question: "Which rule sets do you want to install?"
Options:
  - "Common rules (Recommended)" — "Language-agnostic principles: coding style, git workflow, testing, security, etc. (8 files)"
  - "TypeScript/JavaScript" — "TS/JS patterns, hooks, testing with Playwright (5 files)"
  - "Python" — "Python patterns, pytest, black/ruff formatting (5 files)"
  - "Go" — "Go patterns, table-driven tests, gofmt/staticcheck (5 files)"
```

执行安装：

```bash
# Common rules (flat copy into rules/)
cp -r $ECC_ROOT/rules/common/* $TARGET/rules/

# Language-specific rules (flat copy into rules/)
cp -r $ECC_ROOT/rules/typescript/* $TARGET/rules/   # if selected
cp -r $ECC_ROOT/rules/python/* $TARGET/rules/        # if selected
cp -r $ECC_ROOT/rules/golang/* $TARGET/rules/        # if selected
```

**重要**：如果用户选择了任何特定语言的规则但**没有**选择通用规则，警告他们：

> "特定语言规则扩展了通用规则。不安装通用规则可能导致覆盖不完整。是否也安装通用规则？"

***

## 步骤 4：安装后验证

安装后，执行这些自动化检查：

### 4a：验证文件存在

列出所有已安装的文件并确认它们存在于目标位置：

```bash
ls -la $TARGET/skills/
ls -la $TARGET/rules/
```

### 4b：检查路径引用

扫描所有已安装的 `.md` 文件中的路径引用：

```bash
grep -rn "~/.claude/" $TARGET/skills/ $TARGET/rules/
grep -rn "../common/" $TARGET/rules/
grep -rn "skills/" $TARGET/skills/
```

**对于项目级别安装**，标记任何对 `~/.claude/` 路径的引用：

* 如果技能引用 `~/.claude/settings.json` — 这通常没问题（设置始终是用户级别的）
* 如果技能引用 `~/.claude/skills/` 或 `~/.claude/rules/` — 如果仅安装在项目级别，这可能损坏
* 如果技能通过名称引用另一项技能 — 检查被引用的技能是否也已安装

### 4c：检查技能间的交叉引用

有些技能会引用其他技能。验证这些依赖关系：

* `django-tdd` 可能引用 `django-patterns`
* `springboot-tdd` 可能引用 `springboot-patterns`
* `continuous-learning-v2` 引用 `~/.claude/homunculus/` 目录
* `python-testing` 可能引用 `python-patterns`
* `golang-testing` 可能引用 `golang-patterns`
* 特定语言规则引用其 `common/` 对应项

### 4d：报告问题

对于发现的每个问题，报告：

1. **文件**：包含问题引用的文件
2. **行号**：行号
3. **问题**：哪里出错了（例如，"引用了 ~/.claude/skills/python-patterns 但 python-patterns 未安装"）
4. **建议的修复**：该怎么做（例如，"安装 python-patterns 技能" 或 "将路径更新为 .claude/skills/"）

***

## 步骤 5：优化已安装文件（可选）

使用 `AskUserQuestion`：

```
Question: "Would you like to optimize the installed files for your project?"
Options:
  - "Optimize skills" — "Remove irrelevant sections, adjust paths, tailor to your tech stack"
  - "Optimize rules" — "Adjust coverage targets, add project-specific patterns, customize tool configs"
  - "Optimize both" — "Full optimization of all installed files"
  - "Skip" — "Keep everything as-is"
```

### 如果优化技能：

1. 读取每个已安装的 SKILL.md
2. 询问用户其项目的技术栈是什么（如果尚不清楚）
3. 对于每项技能，建议删除无关部分
4. 在安装目标处就地编辑 SKILL.md 文件（**不是**源仓库）
5. 修复在步骤 4 中发现的任何路径问题

### 如果优化规则：

1. 读取每个已安装的规则 .md 文件
2. 询问用户的偏好：
   * 测试覆盖率目标（默认 80%）
   * 首选的格式化工具
   * Git 工作流约定
   * 安全要求
3. 在安装目标处就地编辑规则文件

**关键**：只修改安装目标（`$TARGET/`）中的文件，**绝不**修改源 ECC 仓库（`$ECC_ROOT/`）中的文件。

***

## 步骤 6：安装摘要

从 `/tmp` 清理克隆的仓库：

```bash
rm -rf /tmp/everything-claude-code
```

然后打印摘要报告：

```
## ECC Installation Complete

### Installation Target
- Level: [user-level / project-level / both]
- Path: [target path]

### Skills Installed ([count])
- skill-1, skill-2, skill-3, ...

### Rules Installed ([count])
- common (8 files)
- typescript (5 files)
- ...

### Verification Results
- [count] issues found, [count] fixed
- [list any remaining issues]

### Optimizations Applied
- [list changes made, or "None"]
```

***

## 故障排除

### "Claude Code 未获取技能"

* 验证技能目录包含一个 `SKILL.md` 文件（不仅仅是松散的 .md 文件）
* 对于用户级别：检查 `~/.claude/skills/<skill-name>/SKILL.md` 是否存在
* 对于项目级别：检查 `.claude/skills/<skill-name>/SKILL.md` 是否存在

### "规则不工作"

* 规则是平面文件，不在子目录中：`$TARGET/rules/coding-style.md`（正确）对比 `$TARGET/rules/common/coding-style.md`（对于平面安装不正确）
* 安装规则后重启 Claude Code

### "项目级别安装后出现路径引用错误"

* 有些技能假设 `~/.claude/` 路径。运行步骤 4 验证来查找并修复这些问题。
* 对于 `continuous-learning-v2`，`~/.claude/homunculus/` 目录始终是用户级别的 — 这是预期的，不是错误。
