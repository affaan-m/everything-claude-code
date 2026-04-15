---
name: autonomous-agent-harness
description: 将Claude Code转换为一个具有持久记忆、计划操作、计算机使用和任务队列的全自主代理系统。通过利用Claude Code的原生crons、dispatch、MCP工具和记忆，取代独立的代理框架（如Hermes、AutoGPT）。适用于用户需要持续自主操作、计划任务或自引导代理循环的场景。
origin: ECC
---

# 自主代理框架

仅使用原生功能和 MCP 服务器，将 Claude Code 转变为持久、自我导向的代理系统。

## 何时激活

* 用户需要一个持续运行或按计划运行的代理
* 设置定期触发的自动化工作流
* 构建一个能在不同会话间记住上下文的个人 AI 助手
* 用户说“每天运行这个”、“定期检查这个”、“持续监控”
* 想要复制 Hermes、AutoGPT 或类似自主代理框架的功能
* 需要结合计划执行的计算机使用

## 架构

```
┌──────────────────────────────────────────────────────────────┐
│                    Claude 代码运行时                          │
│                                                              │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌─────────────┐ │
│  │  定时任务 │  │  调度    │  │  内存    │  │   计算机    │ │
│  │  计划任务 │  │  远程    │  │  存储    │  │   使用      │ │
│  │          │  │  代理    │  │          │  │             │ │
│  └────┬─────┘  └────┬─────┘  └────┬─────┘  └──────┬──────┘ │
│       │              │             │                │        │
│       ▼              ▼             ▼                ▼        │
│  ┌──────────────────────────────────────────────────────┐    │
│  │              ECC 技能 + 代理层                        │    │
│  │                                                      │    │
│  │  skills/     agents/     commands/     hooks/        │    │
│  └──────────────────────────────────────────────────────┘    │
│       │              │             │                │        │
│       ▼              ▼             ▼                ▼        │
│  ┌──────────────────────────────────────────────────────┐    │
│  │              MCP 服务器层                            │    │
│  │                                                      │    │
│  │  memory    github    exa    supabase    browser-use  │    │
│  └──────────────────────────────────────────────────────┘    │
└──────────────────────────────────────────────────────────────┘
```

## 核心组件

### 1. 持久化内存

使用 Claude Code 的内置内存系统，并通过 MCP 内存服务器增强以处理结构化数据。

**内置内存** (`~/.claude/projects/*/memory/`)：

* 用户偏好、反馈、项目上下文
* 存储为带有 frontmatter 的 markdown 文件
* 在会话开始时自动加载

**MCP 内存服务器**（结构化知识图谱）：

* 实体、关系、观察结果
* 可查询的图结构
* 跨会话持久化

**内存模式：**

```
# 短期：当前会话上下文
使用 TodoWrite 进行会话内任务跟踪

# 中期：项目记忆文件
写入 ~/.claude/projects/*/memory/ 以实现跨会话回忆

# 长期：MCP 知识图谱
使用 mcp__memory__create_entities 创建永久性结构化数据
使用 mcp__memory__create_relations 进行关系映射
使用 mcp__memory__add_observations 为已知实体添加新事实
```

### 2. 计划操作（Cron）

使用 Claude Code 的计划任务来创建循环执行的代理操作。

**设置 cron：**

```
# 通过 MCP 工具
mcp__scheduled-tasks__create_scheduled_task({
  name: "daily-pr-review",
  schedule: "0 9 * * 1-5",  # 工作日 9 点
  prompt: "审查 affaan-m/everything-claude-code 中所有开放的 PR。对于每个 PR：检查 CI 状态，审查变更，标记问题。将摘要发布到 memory。",
  project_dir: "/path/to/repo"
})

# 通过 claude -p (编程模式)
echo "审查开放的 PR 并总结" | claude -p --project /path/to/repo
```

**有用的 cron 模式：**

| 模式 | 计划 | 用例 |
|---------|----------|----------|
| 每日站会 | `0 9 * * 1-5` | 审查 PR、问题、部署状态 |
| 每周回顾 | `0 10 * * 1` | 代码质量指标、测试覆盖率 |
| 每小时监控 | `0 * * * *` | 生产环境健康状态、错误率检查 |
| 夜间构建 | `0 2 * * *` | 运行完整测试套件、安全扫描 |
| 会前准备 | `*/30 * * * *` | 为即将到来的会议准备上下文 |

### 3. 调度 / 远程代理

为事件驱动的工作流远程触发 Claude Code 代理。

**调度模式：**

```bash
# Trigger from CI/CD
curl -X POST "https://api.anthropic.com/dispatch" \
  -H "Authorization: Bearer $ANTHROPIC_API_KEY" \
  -d '{"prompt": "Build failed on main. Diagnose and fix.", "project": "/repo"}'

# Trigger from webhook
# GitHub webhook → dispatch → Claude agent → fix → PR

# Trigger from another agent
claude -p "Analyze the output of the security scan and create issues for findings"
```

### 4. 计算机使用

利用 Claude 的 computer-use MCP 进行物理世界交互。

**能力：**

* 浏览器自动化（导航、点击、填写表单、截图）
* 桌面控制（打开应用、输入、鼠标控制）
* 超越 CLI 的文件系统操作

**在框架内的用例：**

* Web UI 的自动化测试
* 表单填写和数据录入
* 基于截图的监控
* 多应用工作流

### 5. 任务队列

管理一个能跨越会话边界持久存在的任务队列。

**实现：**

```
# 通过记忆实现任务持久化
将任务队列写入 ~/.claude/projects/*/memory/task-queue.md

# 任务格式
---
name: task-queue
type: project
description: 用于自主操作的持久化任务队列
---

## 活跃任务
- [ ] PR #123: 如果 CI 通过则审查并批准
- [ ] 监控部署：在 2 小时内每 30 分钟检查一次 /health
- [ ] 调研：在 AI 工具领域寻找 5 个潜在客户

## 已完成
- [x] 每日站会：审查了 3 个 PR，2 个 issue
```

## 替代 Hermes

| Hermes 组件 | ECC 等效方案 | 如何实现 |
|------------------|---------------|-----|
| 网关/路由器 | Claude Code 调度 + crons | 计划任务触发代理会话 |
| 内存系统 | Claude 内存 + MCP 内存服务器 | 内置持久化 + 知识图谱 |
| 工具注册表 | MCP 服务器 | 动态加载的工具提供者 |
| 编排 | ECC 技能 + 代理 | 技能定义指导代理行为 |
| 计算机使用 | computer-use MCP | 原生浏览器和桌面控制 |
| 上下文管理器 | 会话管理 + 内存 | ECC 2.0 会话生命周期 |
| 任务队列 | 内存持久化的任务列表 | TodoWrite + 内存文件 |

## 设置指南

### 步骤 1：配置 MCP 服务器

确保 `~/.claude.json` 中包含以下内容：

```json
{
  "mcpServers": {
    "memory": {
      "command": "npx",
      "args": ["-y", "@anthropic/memory-mcp-server"]
    },
    "scheduled-tasks": {
      "command": "npx",
      "args": ["-y", "@anthropic/scheduled-tasks-mcp-server"]
    },
    "computer-use": {
      "command": "npx",
      "args": ["-y", "@anthropic/computer-use-mcp-server"]
    }
  }
}
```

### 步骤 2：创建基础 Crons

```bash
# Daily morning briefing
claude -p "Create a scheduled task: every weekday at 9am, review my GitHub notifications, open PRs, and calendar. Write a morning briefing to memory."

# Continuous learning
claude -p "Create a scheduled task: every Sunday at 8pm, extract patterns from this week's sessions and update the learned skills."
```

### 步骤 3：初始化内存图谱

```bash
# Bootstrap your identity and context
claude -p "Create memory entities for: me (user profile), my projects, my key contacts. Add observations about current priorities."
```

### 步骤 4：启用计算机使用（可选）

授予 computer-use MCP 必要的权限以进行浏览器和桌面控制。

## 示例工作流

### 自主 PR 审查器

```
Cron: 工作时间内每30分钟执行一次
1. 检查关注仓库中的新PR
2. 对于每个新PR：
   - 本地拉取分支
   - 运行测试
   - 与代码审查代理一起审查变更
   - 通过GitHub MCP发布审查评论
3. 使用审查状态更新记忆
```

### 个人研究代理

```
Cron: 每天上午 6 点
1. 检查内存中保存的搜索查询
2. 为每个查询运行 Exa 搜索
3. 总结新发现
4. 与昨天的结果进行比较
5. 将摘要写入内存
6. 标记高优先级项目以供早晨审查
```

### 会议准备代理

```
触发条件：每个日历事件开始前 30 分钟
1. 读取日历事件详情
2. 在记忆中搜索与会者的背景信息
3. 拉取最近与与会者的电子邮件/Slack 对话
4. 准备讨论要点和议程建议
5. 将准备文档写入记忆
```

## 约束

* Cron 任务在隔离的会话中运行——除非通过内存，否则它们不与交互式会话共享上下文。
* 计算机使用需要明确的权限授予。不要假设拥有访问权限。
* 远程调度可能存在速率限制。设计 cron 时应采用适当的间隔。
* 内存文件应保持简洁。归档旧数据，而不是让文件无限增长。
* 始终验证计划任务是否成功完成。在 cron 提示中添加错误处理。
