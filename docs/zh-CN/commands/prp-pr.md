---
description: Create a GitHub PR from current branch with unpushed commits — discovers templates, analyzes changes, pushes
argument-hint: [base-branch] (default: main)
---

# 创建拉取请求

> 改编自 Wirasm 的 PRPs-agentic-eng。PRP 工作流系列的一部分。

**输入**：`$ARGUMENTS` — 可选，可能包含一个基础分支名称和/或标志（例如，`--draft`）。

**解析 `$ARGUMENTS`**：

* 提取任何已识别的标志（`--draft`）
* 将剩余的非标志文本视为基础分支名称
* 如果未指定，默认基础分支为 `main`

***

## 阶段 1 — 验证

检查先决条件：

```bash
git branch --show-current
git status --short
git log origin/<base>..HEAD --oneline
```

| 检查项 | 条件 | 失败时的操作 |
|---|---|---|
| 不在基础分支上 | 当前分支 ≠ 基础分支 | 停止："请先切换到功能分支。" |
| 工作目录干净 | 没有未提交的更改 | 警告："您有未提交的更改。请先提交或储藏。使用 `/prp-commit` 进行提交。" |
| 有领先的提交 | `git log origin/<base>..HEAD` 不为空 | 停止："没有领先于 `<base>` 的提交。无需创建 PR。" |
| 没有已存在的 PR | `gh pr list --head <branch> --json number` 为空 | 停止："PR 已存在：#<编号>。使用 `gh pr view <number> --web` 打开它。" |

如果所有检查通过，继续。

***

## 阶段 2 — 发现

### PR 模板

按顺序搜索 PR 模板：

1. `.github/PULL_REQUEST_TEMPLATE/` 目录 — 如果存在，列出文件并让用户选择（或使用 `default.md`）
2. `.github/PULL_REQUEST_TEMPLATE.md`
3. `.github/pull_request_template.md`
4. `docs/pull_request_template.md`

如果找到，读取它并使用其结构作为 PR 正文。

### 提交分析

```bash
git log origin/<base>..HEAD --format="%h %s" --reverse
```

分析提交以确定：

* **PR 标题**：使用带有类型前缀的约定式提交格式 — `feat: ...`、`fix: ...` 等。
  * 如果存在多种类型，使用占主导地位的类型
  * 如果是单个提交，直接使用其提交信息
* **变更摘要**：按类型/领域对提交进行分组

### 文件分析

```bash
git diff origin/<base>..HEAD --stat
git diff origin/<base>..HEAD --name-only
```

对更改的文件进行分类：源代码、测试、文档、配置、迁移。

### PRP 工件

检查相关的 PRP 工件：

* `.claude/PRPs/reports/` — 实施报告
* `.claude/PRPs/plans/` — 已执行的计划
* `.claude/PRPs/prds/` — 相关的 PRD

如果存在，在 PR 正文中引用这些内容。

***

## 阶段 3 — 推送

```bash
git push -u origin HEAD
```

如果推送因分支偏离而失败：

```bash
git fetch origin
git rebase origin/<base>
git push -u origin HEAD
```

如果变基发生冲突，停止并通知用户。

***

## 阶段 4 — 创建

### 使用模板

如果在阶段 2 找到了 PR 模板，则使用提交和文件分析来填充每个部分。保留所有模板部分 — 如果不适用，将部分留为 "N/A" 而不是删除它们。

### 无模板

使用此默认格式：

```markdown
## 摘要

<1-2 句话描述此 PR 的作用及原因>

## 变更内容

<bulleted list of changes grouped by area>

## 变更文件

<table or list of changed files with change type: Added/Modified/Deleted>

## 测试

<描述如何测试变更，或“需要测试”>

## 相关问题

<使用 Closes/Fixes/Relates to #N 链接相关问题，或“无”>
```

### 创建 PR

```bash
gh pr create \
  --title "<PR title>" \
  --base <base-branch> \
  --body "<PR body>"
  # Add --draft if the --draft flag was parsed from $ARGUMENTS
```

***

## 阶段 5 — 验证

```bash
gh pr view --json number,url,title,state,baseRefName,headRefName,additions,deletions,changedFiles
gh pr checks --json name,status,conclusion 2>/dev/null || true
```

***

## 阶段 6 — 输出

向用户报告：

```
PR #<编号>: <标题>
URL: <网址>
分支: <head> → <base>
变更: +<新增行数> -<删除行数>，涉及 <changedFiles> 个文件

CI 检查: <状态摘要或"pending"或"none configured">

引用的制品:
  - <PR 正文中链接的任何 PRP 报告/计划>

后续步骤:
  - gh pr view <编号> --web   → 在浏览器中打开
  - /code-review <编号>       → 审查该 PR
  - gh pr merge <编号>        → 准备就绪后合并
```

***

## 边缘情况

* **没有 `gh` CLI**：停止并提示："需要 GitHub CLI (`gh`)。安装：<https://cli.github.com/>"
* **未认证**：停止并提示："请先运行 `gh auth login`。"
* **需要强制推送**：如果远程分支已偏离且已执行变基，使用 `git push --force-with-lease`（切勿使用 `--force`）。
* **多个 PR 模板**：如果 `.github/PULL_REQUEST_TEMPLATE/` 有多个文件，列出它们并让用户选择。
* **大型 PR (>20 个文件)**：警告 PR 规模。如果变更在逻辑上可分离，建议拆分。
