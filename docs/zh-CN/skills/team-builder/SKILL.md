---
name: team-builder
description: 用于组合和派遣并行团队的交互式代理选择器
origin: community
---

# 团队构建器

用于按需浏览和组合智能体团队的交互式菜单。适用于扁平化或按领域子目录组织的智能体集合。

## 使用场景

* 你拥有多个智能体角色（markdown 文件），并希望为某项任务选择使用哪些智能体
* 你希望从不同领域（例如，安全 + SEO + 架构）临时组建一个团队
* 你希望在决定前先浏览有哪些可用的智能体

## 前提条件

智能体文件必须是包含角色提示（身份、规则、工作流程、交付物）的 markdown 文件。第一个 `# Heading` 用作智能体名称，第一段用作描述。

支持扁平化和子目录两种布局：

**子目录布局** — 领域从文件夹名称推断：

```
agents/
├── engineering/
│   ├── security-engineer.md
│   └── software-architect.md
├── marketing/
│   └── seo-specialist.md
└── sales/
    └── discovery-coach.md
```

**扁平化布局** — 领域从共享的文件名前缀推断。当 2 个或更多文件共享同一前缀时，该前缀被视为一个领域。具有唯一前缀的文件归入 "General" 类别。注意：算法在第一个 `-` 处分割，因此多单词领域（例如 `product-management`）应使用子目录布局：

```
agents/
├── engineering-security-engineer.md
├── engineering-software-architect.md
├── marketing-seo-specialist.md
├── marketing-content-strategist.md
├── sales-discovery-coach.md
└── sales-outbound-strategist.md
```

## 配置

代理通过两种方法被发现，按代理名称合并并去重：

1. **`claude agents` 命令**（主要方式）—— 运行 `claude agents` 以获取 CLI 已知的所有代理，包括用户代理、插件代理（例如 `everything-claude-code:architect`）和内置代理。这会自动涵盖 ECC 市场安装，无需任何路径配置。
2. **文件通配符**（备用方式，用于读取代理内容）—— 代理 Markdown 文件从以下位置读取：
   * `./agents/**/*.md` + `./agents/*.md` —— 项目本地代理
   * `~/.claude/agents/**/*.md` + `~/.claude/agents/*.md` —— 全局用户代理

当名称冲突时，较早的来源具有优先权：用户代理 > 插件代理 > 内置代理。如果用户指定了自定义路径，则可以使用自定义路径代替。

## 工作原理

### 步骤 1：发现可用智能体

运行 `claude agents` 以获取完整的代理列表。解析每一行：

* **插件代理** 以 `plugin-name:` 为前缀（例如，`everything-claude-code:security-reviewer`）。使用 `:` 之后的部分作为代理名称，并将插件名称作为域。
* **用户代理** 没有前缀。从 `~/.claude/agents/` 或 `./agents/` 读取相应的 Markdown 文件以提取名称和描述。
* **内置代理**（例如，`Explore`、`Plan`）会被跳过，除非用户明确要求包含它们。

对于从 Markdown 文件加载的用户代理：

* **子目录布局：** 从父文件夹名称提取领域
* **扁平化布局：** 收集所有文件名前缀（第一个 `-` 之前的文本）。一个前缀只有在出现在 2 个或更多文件名中时才符合领域资格（例如，`engineering-security-engineer.md` 和 `engineering-software-architect.md` 都以 `engineering` 开头 → Engineering 领域）。具有唯一前缀的文件（例如 `code-reviewer.md`, `tdd-guide.md`）归入 "General" 类别
* 从第一个 `# Heading` 提取智能体名称。如果未找到标题，则从文件名派生名称（去除 `.md`，用空格替换连字符，并转换为标题大小写）
* 从标题后的第一段提取一行摘要

如果在运行 `claude agents` 并探测文件位置后未找到任何代理，请通知用户：“未找到代理。运行 `claude agents` 以验证您的设置。”然后停止。

### 步骤 2：呈现领域菜单

```
可用的代理领域：
1. 工程领域 — 软件架构师、安全工程师
2. 市场营销 — SEO专家
3. 销售领域 — 发现教练、外拓策略师

请选择领域或指定具体代理（例如："1,3" 或 "security + seo"）：
```

* 跳过智能体数量为零的领域（空目录）
* 显示每个领域的智能体数量

### 步骤 3：处理选择

接受灵活的输入：

* 数字："1,3" 选择 Engineering 和 Sales 中的所有智能体
* 名称："security + seo" 对发现的智能体进行模糊匹配
* "all from engineering" 选择该领域中的每个智能体

如果选择的智能体超过 5 个，则按字母顺序列出它们，并要求用户缩小范围："您选择了 N 个智能体（最多 5 个）。请选择保留哪些，或说 'first 5' 以使用按字母顺序排列的前五个。"

确认选择：

```
选定：安全工程师 + SEO专家  
他们应该专注于什么任务？（描述任务）
```

### 步骤 4：并行启动智能体

1. 读取每个所选智能体的 markdown 文件
2. 如果尚未提供，则提示输入任务描述
3. 使用 Agent 工具并行启动所有智能体：
   * `subagent_type: "general-purpose"`
   * `prompt: "{agent file content}\n\nTask: {task description}"`
   * 每个智能体独立运行 — 不需要智能体间通信
4. 如果某个智能体失败（错误、超时或输出为空），则在内联中注明失败（例如，"Security Engineer: failed — \[原因]"）并继续处理成功智能体的结果

### 步骤 5：综合结果

收集所有输出并呈现统一的报告：

* 按智能体分组的结果
* 综合部分重点突出：
  * 各智能体间的共识
  * 建议之间的冲突或矛盾
  * 建议的后续步骤

如果只选择了一个智能体，则跳过综合部分，直接呈现输出。

## 规则

* **仅限动态发现。** 切勿硬编码智能体列表。目录中的新文件会自动出现在菜单中。
* **每个团队最多 5 个智能体。** 超过 5 个会产生收益递减和过多的令牌使用。在选择时强制执行。
* **并行分发。** 所有智能体同时运行 — 使用 Agent 工具的并行调用模式。
* **并行 Agent 调用，而非 TeamCreate。** 此技能使用并行 Agent 工具调用来处理独立工作。只有当智能体需要辩论或相互回应时，才需要 TeamCreate（一个用于多智能体对话的 Claude Code 工具）。

## 示例

```
User: team builder

Claude:
可用代理领域：
1. 工程 (2) — 软件架构师，安全工程师
2. 市场营销 (1) — SEO专家
3. 销售 (4) — 探索教练，外拓策略师，提案策略师，销售工程师
4. 支持 (1) — 执行摘要

选择领域或指定具体代理：

User: security + seo

Claude:
已选择：安全工程师 + SEO专家
他们应该处理什么任务？

User: 在发布前审查我的 Next.js 电商网站

[两个代理并行启动，各自将他们的专长应用于代码库]

Claude:
## 安全工程师发现
- [发现内容...]

## SEO专家发现
- [发现内容...]

## 综合分析
双方代理均同意：[...]
冲突点：安全建议的CSP阻止内联样式，SEO需要内联模式标记。解决方案：[...]
后续步骤：[...]
```
