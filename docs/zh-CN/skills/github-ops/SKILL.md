---
name: github-ops
description: GitHub 仓库操作、自动化和管理的功能。使用 gh CLI 进行问题分类、PR 管理、CI/CD 操作、发布管理和安全监控。当用户想要管理 GitHub 问题、PR、CI 状态、发布、贡献者、陈旧项目或任何超出简单 git 命令的 GitHub 操作任务时使用。
origin: ECC
---

# GitHub 操作

管理 GitHub 仓库，重点关注社区健康、CI 可靠性和贡献者体验。

## 何时激活

* 处理议题（分类、打标签、回复、去重）
* 管理 PR（审查状态、CI 检查、陈旧 PR、合并就绪状态）
* 调试 CI/CD 故障
* 准备发布和更新日志
* 监控 Dependabot 和安全警报
* 管理开源项目的贡献者体验
* 用户提及“检查 GitHub”、“处理议题”、“审查 PR”、“合并”、“发布”、“CI 坏了”

## 工具要求

* **gh CLI** 用于所有 GitHub API 操作
* 通过 `gh auth login` 配置仓库访问权限

## 议题处理

按类型和优先级对每个议题进行分类：

**类型：** bug, feature-request, question, documentation, enhancement, duplicate, invalid, good-first-issue

**优先级：** critical (破坏性/安全性), high (重大影响), medium (锦上添花), low (表面问题)

### 处理流程

1. 阅读议题标题、正文和评论
2. 检查是否与现有议题重复（按关键词搜索）
3. 通过 `gh issue edit --add-label` 应用适当的标签
4. 对于问题：起草并发布有帮助的回复
5. 对于需要更多信息的 bug：请求提供复现步骤
6. 对于新手友好议题：添加 `good-first-issue` 标签
7. 对于重复议题：评论并附上原始议题链接，添加 `duplicate` 标签

```bash
# Search for potential duplicates
gh issue list --search "keyword" --state all --limit 20

# Add labels
gh issue edit <number> --add-label "bug,high-priority"

# Comment on issue
gh issue comment <number> --body "Thanks for reporting. Could you share reproduction steps?"
```

## PR 管理

### 审查清单

1. 检查 CI 状态：`gh pr checks <number>`
2. 检查是否可合并：`gh pr view <number> --json mergeable`
3. 检查存在时间和最后活动
4. 标记超过 5 天未审查的 PR
5. 对于社区 PR：确保它们包含测试并遵循约定

### 陈旧策略

* 超过 14 天无活动的议题：添加 `stale` 标签，评论询问更新
* 超过 7 天无活动的 PR：评论询问是否仍在进行
* 超过 30 天无回应的陈旧议题自动关闭（添加 `closed-stale` 标签）

```bash
# Find stale issues (no activity in 14+ days)
gh issue list --label "stale" --state open

# Find PRs with no recent activity
gh pr list --json number,title,updatedAt --jq '.[] | select(.updatedAt < "2026-03-01")'
```

## CI/CD 操作

当 CI 失败时：

1. 检查工作流运行：`gh run view <run-id> --log-failed`
2. 识别失败的步骤
3. 检查是偶发性测试失败还是真实故障
4. 对于真实故障：识别根本原因并建议修复方案
5. 对于偶发性测试：记录模式以供未来调查

```bash
# List recent failed runs
gh run list --status failure --limit 10

# View failed run logs
gh run view <run-id> --log-failed

# Re-run a failed workflow
gh run rerun <run-id> --failed
```

## 发布管理

准备发布时：

1. 检查主分支上所有 CI 是否通过
2. 审查未发布的更改：`gh pr list --state merged --base main`
3. 根据 PR 标题生成更新日志
4. 创建发布：`gh release create`

```bash
# List merged PRs since last release
gh pr list --state merged --base main --search "merged:>2026-03-01"

# Create a release
gh release create v1.2.0 --title "v1.2.0" --generate-notes

# Create a pre-release
gh release create v1.3.0-rc1 --prerelease --title "v1.3.0 Release Candidate 1"
```

## 安全监控

```bash
# Check Dependabot alerts
gh api repos/{owner}/{repo}/dependabot/alerts --jq '.[].security_advisory.summary'

# Check secret scanning alerts
gh api repos/{owner}/{repo}/secret-scanning/alerts --jq '.[].state'

# Review and auto-merge safe dependency bumps
gh pr list --label "dependencies" --json number,title
```

* 审查并自动合并安全的依赖项更新
* 立即标记任何严重/高危严重性警报
* 每周至少检查一次新的 Dependabot 警报

## 质量门禁

在完成任何 GitHub 操作任务之前，确保：

* 所有已处理的议题都已打上适当的标签
* 没有超过 7 天未审查或评论的 PR
* CI 故障已得到调查（不仅仅是重新运行）
* 发布包含准确的更新日志
* 安全警报已得到确认和跟踪
