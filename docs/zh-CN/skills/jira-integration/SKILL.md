---
name: jira-integration
description: 在检索Jira工单、分析需求、更新工单状态、添加评论或转换问题时使用此技能。通过MCP或直接REST调用提供Jira API模式。
origin: ECC
---

# Jira 集成技能

直接从你的 AI 编码工作流中检索、分析和更新 Jira 工单。支持 **基于 MCP**（推荐）和 **直接 REST API** 两种方法。

## 何时激活

* 获取 Jira 工单以理解需求
* 从工单中提取可测试的验收标准
* 向 Jira 问题添加进度评论
* 转换工单状态（待办 → 进行中 → 已完成）
* 将合并请求或分支链接到 Jira 问题
* 通过 JQL 查询搜索问题

## 先决条件

### 选项 A: MCP 服务器（推荐）

安装 `mcp-atlassian` MCP 服务器。这将 Jira 工具直接暴露给你的 AI 代理。

**要求：**

* Python 3.10+
* `uvx`（来自 `uv`），通过你的包管理器或官方 `uv` 安装文档安装

**添加到你的 MCP 配置**（例如，`~/.claude.json` → `mcpServers`）：

```json
{
  "jira": {
    "command": "uvx",
    "args": ["mcp-atlassian==0.21.0"],
    "env": {
      "JIRA_URL": "https://YOUR_ORG.atlassian.net",
      "JIRA_EMAIL": "your.email@example.com",
      "JIRA_API_TOKEN": "your-api-token"
    },
    "description": "Jira issue tracking — search, create, update, comment, transition"
  }
}
```

> **安全提示：** 切勿硬编码密钥。优先在系统环境（或密钥管理器）中设置 `JIRA_URL`、`JIRA_EMAIL` 和 `JIRA_API_TOKEN`。仅将 MCP `env` 块用于本地、未提交的配置文件。

**获取 Jira API 令牌：**

1. 访问 <https://id.atlassian.com/manage-profile/security/api-tokens>
2. 点击 **创建 API 令牌**
3. 复制令牌——将其存储在环境中，切勿存储在源代码中

### 选项 B: 直接 REST API

如果 MCP 不可用，则通过 `curl` 或辅助脚本直接使用 Jira REST API v3。

**必需的环境变量：**

| 变量 | 描述 |
|----------|-------------|
| `JIRA_URL` | 你的 Jira 实例 URL（例如，`https://yourorg.atlassian.net`） |
| `JIRA_EMAIL` | 你的 Atlassian 账户邮箱 |
| `JIRA_API_TOKEN` | 来自 id.atlassian.com 的 API 令牌 |

将这些存储在 shell 环境、密钥管理器或未跟踪的本地环境文件中。不要将它们提交到仓库。

## MCP 工具参考

当配置了 `mcp-atlassian` MCP 服务器时，以下工具可用：

| 工具 | 用途 | 示例 |
|------|---------|---------|
| `jira_search` | JQL 查询 | `project = PROJ AND status = "In Progress"` |
| `jira_get_issue` | 通过键获取完整问题详情 | `PROJ-1234` |
| `jira_create_issue` | 创建问题（任务、缺陷、故事、史诗） | 新建缺陷报告 |
| `jira_update_issue` | 更新字段（摘要、描述、经办人） | 更改经办人 |
| `jira_transition_issue` | 更改状态 | 移至“评审中” |
| `jira_add_comment` | 添加评论 | 进度更新 |
| `jira_get_sprint_issues` | 列出冲刺中的问题 | 活跃冲刺评审 |
| `jira_create_issue_link` | 链接问题（阻塞、关联到） | 依赖关系跟踪 |
| `jira_get_issue_development_info` | 查看链接的 PR、分支、提交 | 开发上下文 |

> **提示：** 在转换状态前，始终调用 `jira_get_transitions`——转换 ID 因项目工作流而异。

## 直接 REST API 参考

### 获取工单

```bash
curl -s -u "$JIRA_EMAIL:$JIRA_API_TOKEN" \
  -H "Content-Type: application/json" \
  "$JIRA_URL/rest/api/3/issue/PROJ-1234" | jq '{
    key: .key,
    summary: .fields.summary,
    status: .fields.status.name,
    priority: .fields.priority.name,
    type: .fields.issuetype.name,
    assignee: .fields.assignee.displayName,
    labels: .fields.labels,
    description: .fields.description
  }'
```

### 获取评论

```bash
curl -s -u "$JIRA_EMAIL:$JIRA_API_TOKEN" \
  -H "Content-Type: application/json" \
  "$JIRA_URL/rest/api/3/issue/PROJ-1234?fields=comment" | jq '.fields.comment.comments[] | {
    author: .author.displayName,
    created: .created[:10],
    body: .body
  }'
```

### 添加评论

```bash
curl -s -X POST -u "$JIRA_EMAIL:$JIRA_API_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "body": {
      "version": 1,
      "type": "doc",
      "content": [{
        "type": "paragraph",
        "content": [{"type": "text", "text": "Your comment here"}]
      }]
    }
  }' \
  "$JIRA_URL/rest/api/3/issue/PROJ-1234/comment"
```

### 转换工单状态

```bash
# 1. Get available transitions
curl -s -u "$JIRA_EMAIL:$JIRA_API_TOKEN" \
  "$JIRA_URL/rest/api/3/issue/PROJ-1234/transitions" | jq '.transitions[] | {id, name: .name}'

# 2. Execute transition (replace TRANSITION_ID)
curl -s -X POST -u "$JIRA_EMAIL:$JIRA_API_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"transition": {"id": "TRANSITION_ID"}}' \
  "$JIRA_URL/rest/api/3/issue/PROJ-1234/transitions"
```

### 使用 JQL 搜索

```bash
curl -s -G -u "$JIRA_EMAIL:$JIRA_API_TOKEN" \
  --data-urlencode "jql=project = PROJ AND status = 'In Progress'" \
  "$JIRA_URL/rest/api/3/search"
```

## 分析工单

当为开发或测试自动化检索工单时，提取：

### 1. 可测试的需求

* **功能需求** —— 功能做什么
* **验收标准** —— 必须满足的条件
* **可测试的行为** —— 具体操作和预期结果
* **用户角色** —— 谁使用此功能及其权限
* **数据需求** —— 需要什么数据
* **集成点** —— 涉及的 API、服务或系统

### 2. 需要的测试类型

* **单元测试** —— 单个函数和工具
* **集成测试** —— API 端点和服务交互
* **端到端测试** —— 面向用户的 UI 流程
* **API 测试** —— 端点契约和错误处理

### 3. 边界情况和错误场景

* 无效输入（空、过长、特殊字符）
* 未授权访问
* 网络故障或超时
* 并发用户或竞态条件
* 边界条件
* 缺失或空数据
* 状态转换（后退导航、刷新等）

### 4. 结构化分析输出

```
Ticket: PROJ-1234
Summary: [工单标题]
Status: [当前状态]
Priority: [高/中/低]
Test Types: 单元测试, 集成测试, 端到端测试

Requirements:
1. [需求 1]
2. [需求 2]

Acceptance Criteria:
- [ ] [验收标准 1]
- [ ] [验收标准 2]

Test Scenarios:
- 正常路径: [描述]
- 错误情况: [描述]
- 边界情况: [描述]

Test Data Needed:
- [数据项 1]
- [数据项 2]

Dependencies:
- [依赖项 1]
- [依赖项 2]
```

## 更新工单

### 何时更新

| 工作流步骤 | Jira 更新 |
|---|---|
| 开始工作 | 转换到“进行中” |
| 测试编写完成 | 评论附带测试覆盖率摘要 |
| 分支创建 | 评论附带分支名称 |
| PR/MR 创建 | 评论附带链接，链接问题 |
| 测试通过 | 评论附带结果摘要 |
| PR/MR 合并 | 转换到“已完成”或“评审中” |

### 评论模板

**开始工作：**

```
开始实施此工单。
分支：feat/PROJ-1234-feature-name
```

**测试已实现：**

```
已实现的自动化测试：

单元测试：
- [测试文件 1] — [覆盖内容]
- [测试文件 2] — [覆盖内容]

集成测试：
- [测试文件] — [覆盖的端点/流程]

所有测试在本地通过。覆盖率：XX%
```

**PR 已创建：**

```
Pull request created:
[PR Title](https://github.com/org/repo/pull/XXX)

Ready for review.
```

**工作完成：**

```
实施完成。

PR 已合并：[链接]
测试结果：全部通过 (X/Y)
覆盖率：XX%
```

## 安全指南

* **切勿硬编码** Jira API 令牌到源代码或技能文件中
* **始终使用** 环境变量或密钥管理器
* **将 `.env` 添加到** 每个项目的 `.gitignore` 中
* 如果令牌在 git 历史记录中暴露，**立即轮换令牌**
* **使用最小权限** 的 API 令牌，范围限定在所需项目
* 在进行 API 调用之前，**验证** 凭据是否已设置——通过清晰的消息快速失败

## 故障排除

| 错误 | 原因 | 修复方法 |
|---|---|---|
| `401 Unauthorized` | 无效或过期的 API 令牌 | 在 id.atlassian.com 重新生成 |
| `403 Forbidden` | 令牌缺少项目权限 | 检查令牌范围和项目访问权限 |
| `404 Not Found` | 错误的工单键或基础 URL | 验证 `JIRA_URL` 和工单键 |
| `spawn uvx ENOENT` | IDE 在 PATH 上找不到 `uvx` | 使用完整路径（例如，`~/.local/bin/uvx`）或在 `~/.zprofile` 中设置 PATH |
| 连接超时 | 网络/VPN 问题 | 检查 VPN 连接和防火墙规则 |

## 最佳实践

* 边做边更新 Jira，而不是最后一次性更新
* 保持评论简洁但信息丰富
* 使用链接而非复制——指向 PR、测试报告和仪表板
* 如果需要他人输入，使用 @提及
* 在开始前检查链接的问题以理解完整的功能范围
* 如果验收标准模糊，在编写代码前请求澄清
