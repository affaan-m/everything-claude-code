---
name: search-first
description: 研究优先于编码的工作流程。在编写自定义代码之前，搜索现有的工具、库和模式。调用研究员代理。
origin: ECC
---

# /search-first — 编码前先研究

系统化“在实现之前先寻找现有解决方案”的工作流程。

## 触发时机

在以下情况使用此技能：

* 开始一项很可能已有解决方案的新功能
* 添加依赖项或集成
* 用户要求“添加 X 功能”而你准备开始编写代码
* 在创建新的实用程序、助手或抽象之前

## 工作流程

```
┌─────────────────────────────────────────────┐
│  1. NEED ANALYSIS                           │
│     Define what functionality is needed      │
│     Identify language/framework constraints  │
├─────────────────────────────────────────────┤
│  2. PARALLEL SEARCH (researcher agent)      │
│     ┌──────────┐ ┌──────────┐ ┌──────────┐  │
│     │  npm /   │ │  MCP /   │ │  GitHub / │  │
│     │  PyPI    │ │  Skills  │ │  Web      │  │
│     └──────────┘ └──────────┘ └──────────┘  │
├─────────────────────────────────────────────┤
│  3. EVALUATE                                │
│     Score candidates (functionality, maint, │
│     community, docs, license, deps)         │
├─────────────────────────────────────────────┤
│  4. DECIDE                                  │
│     ┌─────────┐  ┌──────────┐  ┌─────────┐  │
│     │  Adopt  │  │  Extend  │  │  Build   │  │
│     │ as-is   │  │  /Wrap   │  │  Custom  │  │
│     └─────────┘  └──────────┘  └─────────┘  │
├─────────────────────────────────────────────┤
│  5. IMPLEMENT                               │
│     Install package / Configure MCP /       │
│     Write minimal custom code               │
└─────────────────────────────────────────────┘
```

## 决策矩阵

| 信号 | 行动 |
|--------|--------|
| 完全匹配，维护良好，MIT/Apache 许可证 | **采纳** — 直接安装并使用 |
| 部分匹配，基础良好 | **扩展** — 安装 + 编写薄封装层 |
| 多个弱匹配 | **组合** — 组合 2-3 个小包 |
| 未找到合适的 | **构建** — 编写自定义代码，但需基于研究 |

## 使用方法

### 快速模式（内联）

在编写实用程序或添加功能之前，在脑中过一遍：

1. 这是常见问题吗？ → 搜索 npm/PyPI
2. 有相关的 MCP 吗？ → 检查 `~/.claude/settings.json` 并搜索
3. 有相关的技能吗？ → 检查 `~/.claude/skills/`
4. 有 GitHub 模板吗？ → 搜索 GitHub

### 完整模式（代理）

对于非平凡的功能，启动研究员代理：

```
Task(subagent_type="general-purpose", prompt="
  Research existing tools for: [DESCRIPTION]
  Language/framework: [LANG]
  Constraints: [ANY]

  Search: npm/PyPI, MCP servers, Claude Code skills, GitHub
  Return: Structured comparison with recommendation
")
```

## 按类别搜索快捷方式

### 开发工具

* Linting → `eslint`, `ruff`, `textlint`, `markdownlint`
* Formatting → `prettier`, `black`, `gofmt`
* Testing → `jest`, `pytest`, `go test`
* Pre-commit → `husky`, `lint-staged`, `pre-commit`

### AI/LLM 集成

* Claude SDK → 使用 Context7 获取最新文档
* 提示词管理 → 检查 MCP 服务器
* 文档处理 → `unstructured`, `pdfplumber`, `mammoth`

### 数据与 API

* HTTP 客户端 → `httpx` (Python), `ky`/`got` (Node)
* 验证 → `zod` (TS), `pydantic` (Python)
* 数据库 → 首先检查是否有 MCP 服务器

### 内容与发布

* Markdown 处理 → `remark`, `unified`, `markdown-it`
* 图片优化 → `sharp`, `imagemin`

## 集成点

### 与规划器代理

规划器应在阶段 1（架构评审）之前调用研究员：

* 研究员识别可用的工具
* 规划器将它们纳入实施计划
* 避免在计划中“重新发明轮子”

### 与架构师代理

架构师应向研究员咨询：

* 技术栈决策
* 集成模式发现
* 现有参考架构

### 与迭代检索技能

结合进行渐进式发现：

* 循环 1：广泛搜索 (npm, PyPI, MCP)
* 循环 2：详细评估顶级候选方案
* 循环 3：测试与项目约束的兼容性

## 示例

### 示例 1：“添加死链检查”

```
Need: Check markdown files for broken links
Search: npm "markdown dead link checker"
Found: textlint-rule-no-dead-link (score: 9/10)
Action: ADOPT — npm install textlint-rule-no-dead-link
Result: Zero custom code, battle-tested solution
```

### 示例 2：“添加 HTTP 客户端包装器”

```
Need: Resilient HTTP client with retries and timeout handling
Search: npm "http client retry", PyPI "httpx retry"
Found: got (Node) with retry plugin, httpx (Python) with built-in retry
Action: ADOPT — use got/httpx directly with retry config
Result: Zero custom code, production-proven libraries
```

### 示例 3：“添加配置文件 linter”

```
Need: Validate project config files against a schema
Search: npm "config linter schema", "json schema validator cli"
Found: ajv-cli (score: 8/10)
Action: ADOPT + EXTEND — install ajv-cli, write project-specific schema
Result: 1 package + 1 schema file, no custom validation logic
```

## 反模式

* **直接跳转到编码**：不检查是否存在就编写实用程序
* **忽略 MCP**：不检查 MCP 服务器是否已提供该能力
* **过度定制**：对库进行如此厚重的包装以至于失去了其优势
* **依赖项膨胀**：为了一个小功能安装一个庞大的包
