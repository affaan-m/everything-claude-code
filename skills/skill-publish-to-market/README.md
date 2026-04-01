# skill-publish-to-market

> 一条命令，将技能发布到 4 个市场平台。

## 功能概述

告诉你的 AI agent "发布这个技能到 GitHub 和 ClawHub"，它会自动完成全部流程：质量检查、Token 验证、平台适配、API 调用、PR 创建、失败重试、结果汇报。

### 支持平台

| 平台 | 发布方式 | 说明 |
|------|---------|------|
| **ClawHub** | HTTP API | 直接发布，支持版本管理和冲突自动解决 |
| **Anthropic Skills** | GitHub PR | Fork + 创建分支 + 提交 PR 到 `anthropics/skills` |
| **ECC Community** | GitHub PR | Fork + 创建分支 + 提交 PR 到 `affaan-m/everything-claude-code` |
| **skills.sh** | GitHub API | 上传文件到 skills.sh 仓库 |

## 快速上手

### 第 1 步：获取 Token

**GitHub PAT:**
1. 打开 https://github.com/settings/tokens/new
2. 备注填写 "Skill Publisher"
3. 有效期选择 90 天（推荐）
4. 勾选权限：`repo`（完整）+ `workflow`
5. 点击 "Generate token" -> 立即复制（只显示一次）

**ClawHub Token:**
1. 打开 https://clawhub.ai 并登录
2. 进入 Settings -> API Tokens
3. 点击 "Create Token"，命名为 "skill-publish"
4. 复制 Token（以 `clh_` 开头）

### 第 2 步：安装技能

```bash
# Claude Code
cp -r skill-publish-to-market/ ~/.claude/skills/skill-publish-to-market/

# 或从 ClawHub 安装
clawhub install skill-publish-to-market
```

### 第 3 步：使用

```
你: "请把 ./my-skill 发布到所有平台"
AI: （检查质量 -> 收集 Token -> 验证 -> 发布到 4 个平台 -> 汇报结果）
```

## Token 获取教程

### GitHub Personal Access Token (PAT)

GitHub PAT 用于向 Anthropic Skills、ECC Community、skills.sh 三个平台提交 PR 或上传文件。

1. 打开 https://github.com/settings/tokens/new
2. **Note** 填写：`Skill Publisher`
3. **Expiration** 选择：90 days（推荐）
4. **Select scopes** 勾选：
   - `repo` -- 完整仓库访问权限（用于 Fork、创建分支、提交文件、创建 PR）
   - `workflow` -- 工作流权限（部分仓库的 PR 需要）
5. 点击 **Generate token**
6. 立即复制 Token（页面刷新后无法再次查看）

### ClawHub Token

ClawHub Token 用于通过 HTTP API 直接发布技能到 ClawHub 市场。

1. 打开 https://clawhub.ai 并登录
2. 进入 **Settings** -> **API Tokens**
3. 点击 **Create Token**，名称填写 `skill-publish`
4. 复制生成的 Token（以 `clh_` 开头）
5. Token 权限包括：技能发布、版本管理

## 使用示例

### 发布单个技能到所有平台
```
"请把 ~/.claude/skills/flyai-search-cheap-flights 发布到所有平台"
```

### 批量发布技能
```
"批量发布 ./skills/ 目录下的所有技能"
```

### 发布到指定平台
```
"把这个技能只发布到 ClawHub，slug 前缀用 cs-"
```

### 重试失败的平台
```
"retry anthropic"
```

### 查看 PR 状态
```
"status"
```

## 文件结构

```
skill-publish-to-market/
  SKILL.md                      # 技能主文件（agent 执行逻辑）
  README.md                     # 说明文档（人类阅读）
  references/
    templates.md                # 4 个平台的 API 请求模板
    playbooks.md                # 平台特定的发布场景
    fallbacks.md                # 错误恢复策略
    runbook.md                  # 执行日志格式
```

## 兼容性

| 项目 | 说明 |
|------|------|
| **Agent 兼容** | Claude Code, OpenClaw, Codex, QClaw, ArkClaw, 及所有支持 SKILL.md 的 agent |
| **系统要求** | macOS / Linux（需要 `curl`） |
| **Token 要求** | GitHub PAT（用于 GitHub 平台）+ ClawHub Token（用于 ClawHub） |
| **版本** | 2.0.0 |
| **License** | MIT |

---

# skill-publish-to-market (English)

> One command to publish your skill to 4 platforms.

## Overview

Tell your AI agent "publish this skill to GitHub and ClawHub" and it handles the full pipeline: quality gate, token verification, platform adaptation, API calls, PR creation, partial failure recovery, and result reporting.

### Supported Platforms

| Platform | Method | Description |
|----------|--------|-------------|
| **ClawHub** | HTTP API | Direct publish with version management and conflict auto-resolution |
| **Anthropic Skills** | GitHub PR | Fork + branch + PR to `anthropics/skills` |
| **ECC Community** | GitHub PR | Fork + branch + PR to `affaan-m/everything-claude-code` |
| **skills.sh** | GitHub API | File upload to skills.sh registry |

## Quick Start

### Step 1: Get Your Tokens

**GitHub PAT:**
1. Go to https://github.com/settings/tokens/new
2. Note: "Skill Publisher"
3. Expiration: 90 days (recommended)
4. Select scopes: `repo` (full) + `workflow`
5. Click "Generate token" -> copy immediately (shown only once)

**ClawHub Token:**
1. Go to https://clawhub.ai -> Settings -> API Tokens
2. Click "Create Token", name it "skill-publish"
3. Copy the token (starts with `clh_`)

### Step 2: Install the Skill

```bash
# Claude Code
cp -r skill-publish-to-market/ ~/.claude/skills/skill-publish-to-market/

# Or install from ClawHub
clawhub install skill-publish-to-market
```

### Step 3: Use It

```
You: "publish my skill at ./my-skill to all platforms"
AI: (quality gate -> collects tokens -> verifies -> publishes to 4 platforms -> reports results)
```

## Token Setup Guide

### GitHub Personal Access Token (PAT)

The GitHub PAT is used to submit PRs and upload files to Anthropic Skills, ECC Community, and skills.sh.

1. Go to https://github.com/settings/tokens/new
2. **Note**: `Skill Publisher`
3. **Expiration**: 90 days (recommended)
4. **Select scopes**:
   - `repo` -- full repository access (fork, branch, commit, PR)
   - `workflow` -- workflow permissions (required by some repos)
5. Click **Generate token**
6. Copy the token immediately (cannot be viewed again after leaving the page)

### ClawHub Token

The ClawHub Token is used to publish skills directly via HTTP API to the ClawHub marketplace.

1. Go to https://clawhub.ai and log in
2. Navigate to **Settings** -> **API Tokens**
3. Click **Create Token**, name it `skill-publish`
4. Copy the generated token (starts with `clh_`)
5. Token permissions include: skill publishing, version management

## Usage Examples

### Publish a single skill to all platforms
```
"publish my skill at ~/.claude/skills/flyai-search-cheap-flights to all markets"
```

### Bulk publish skills
```
"bulk publish all skills under ./skills/"
```

### Publish to specific platforms
```
"upload this skill to ClawHub only, use prefix cs-"
```

### Retry a failed platform
```
"retry anthropic"
```

### Check PR status
```
"status"
```

## File Structure

```
skill-publish-to-market/
  SKILL.md                      # Skill definition (agent execution logic)
  README.md                     # Documentation (human-readable)
  references/
    templates.md                # API request templates for all 4 platforms
    playbooks.md                # Platform-specific publishing scenarios
    fallbacks.md                # Error recovery strategies
    runbook.md                  # Execution log schema
```

## Compatibility

| Item | Details |
|------|---------|
| **Agent Support** | Claude Code, OpenClaw, Codex, QClaw, ArkClaw, and all SKILL.md-compatible agents |
| **System Requirements** | macOS / Linux (requires `curl`) |
| **Token Requirements** | GitHub PAT (for GitHub platforms) + ClawHub Token (for ClawHub) |
| **Version** | 2.0.0 |
| **License** | MIT |
