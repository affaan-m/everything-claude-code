---
description: 代码审查 — 本地未提交的更改或 GitHub PR（传递 PR 编号/URL 以进入 PR 模式）
argument-hint: [pr-number | pr-url | blank for local review]
---

# 代码审查

> PR 审查模式改编自 Wirasm 的 PRPs-agentic-eng。属于 PRP 工作流系列的一部分。

**输入**: $ARGUMENTS

***

## 模式选择

如果 `$ARGUMENTS` 包含 PR 编号、PR URL 或 `--pr`：
→ 跳转到下面的 **PR 审查模式**。

否则：
→ 使用 **本地审查模式**。

***

## 本地审查模式

对未提交的更改进行全面的安全性和质量审查。

### 阶段 1 — 收集

```bash
git diff --name-only HEAD
```

如果没有更改的文件，停止："Nothing to review."

### 阶段 2 — 审查

完整读取每个更改的文件。检查：

**安全问题（严重）：**

* 硬编码的凭据、API 密钥、令牌
* SQL 注入漏洞
* XSS 漏洞
* 缺少输入验证
* 不安全的依赖项
* 路径遍历风险

**代码质量（高）：**

* 函数长度超过 50 行
* 文件长度超过 800 行
* 嵌套深度超过 4 层
* 缺少错误处理
* `console.log` 语句
* `TODO`/`FIXME` 注释
* 公共 API 缺少 JSDoc

**最佳实践（中）：**

* 可变模式（应使用不可变模式）
* 代码/注释中使用表情符号
* 新代码缺少测试
* 无障碍性问题（a11y）

### 阶段 3 — 报告

生成报告，包含：

* 严重性：CRITICAL, HIGH, MEDIUM, LOW
* 文件位置和行号
* 问题描述
* 建议的修复方法

如果发现 CRITICAL 或 HIGH 问题，则阻止提交。
绝不批准存在安全漏洞的代码。

***

## PR 审查模式

全面的 GitHub PR 审查 — 获取差异、读取完整文件、运行验证、发布审查。

### 阶段 1 — 获取

解析输入以确定 PR：

| 输入 | 操作 |
|---|---|
| 编号 (例如 `42`) | 用作 PR 编号 |
| URL (`github.com/.../pull/42`) | 提取 PR 编号 |
| 分支名称 | 通过 `gh pr list --head <branch>` 查找 PR |

```bash
gh pr view <NUMBER> --json number,title,body,author,baseRefName,headRefName,changedFiles,additions,deletions
gh pr diff <NUMBER>
```

如果未找到 PR，则停止并报错。存储 PR 元数据供后续阶段使用。

### 阶段 2 — 上下文

构建审查上下文：

1. **项目规则** — 读取 `CLAUDE.md`、`.claude/docs/` 以及任何贡献指南
2. **PRP 工件** — 检查 `.claude/PRPs/reports/` 和 `.claude/PRPs/plans/` 以获取与此 PR 相关的实现上下文
3. **PR 意图** — 解析 PR 描述以了解目标、关联的问题、测试计划
4. **更改的文件** — 列出所有修改的文件并按类型分类（源代码、测试、配置、文档）

### 阶段 3 — 审查

**完整**读取每个更改的文件（不仅仅是差异块 — 需要周围的上下文）。

对于 PR 审查，获取 PR 头部修订版本下的完整文件内容：

```bash
gh pr diff <NUMBER> --name-only | while IFS= read -r file; do
  gh api "repos/{owner}/{repo}/contents/$file?ref=<head-branch>" --jq '.content' | base64 -d
done
```

在 7 个类别中应用审查清单：

| 类别 | 检查内容 |
|---|---|
| **正确性** | 逻辑错误、差一错误、空值处理、边界情况、竞态条件 |
| **类型安全** | 类型不匹配、不安全的类型转换、`any` 的使用、缺少泛型 |
| **模式合规性** | 符合项目约定（命名、文件结构、错误处理、导入） |
| **安全性** | 注入、身份验证漏洞、密钥暴露、SSRF、路径遍历、XSS |
| **性能** | N+1 查询、缺少索引、无限循环、内存泄漏、大负载 |
| **完整性** | 缺少测试、缺少错误处理、不完整的迁移、缺少文档 |
| **可维护性** | 死代码、魔法数字、深层嵌套、不清晰的命名、缺少类型 |

为每个发现分配严重性：

| 严重性 | 含义 | 操作 |
|---|---|---|
| **CRITICAL** | 安全漏洞或数据丢失风险 | 合并前必须修复 |
| **HIGH** | 可能导致问题的错误或逻辑错误 | 合并前应修复 |
| **MEDIUM** | 代码质量问题或缺少最佳实践 | 建议修复 |
| **LOW** | 风格细节或次要建议 | 可选 |

### 阶段 4 — 验证

运行可用的验证命令：

根据配置文件（`package.json`、`Cargo.toml`、`go.mod`、`pyproject.toml` 等）检测项目类型，然后运行相应的命令：

**Node.js / TypeScript** (有 `package.json`)：

```bash
npm run typecheck 2>/dev/null || npx tsc --noEmit 2>/dev/null  # Type check
npm run lint                                                    # Lint
npm test                                                        # Tests
npm run build                                                   # Build
```

**Rust** (有 `Cargo.toml`)：

```bash
cargo clippy -- -D warnings  # Lint
cargo test                   # Tests
cargo build                  # Build
```

**Go** (有 `go.mod`)：

```bash
go vet ./...    # Lint
go test ./...   # Tests
go build ./...  # Build
```

**Python** (有 `pyproject.toml` / `setup.py`)：

```bash
pytest  # Tests
```

仅运行适用于检测到的项目类型的命令。记录每个命令的通过/失败情况。

### 阶段 5 — 决定

根据发现形成建议：

| 条件 | 决定 |
|---|---|
| 零个 CRITICAL/HIGH 问题，验证通过 | **APPROVE** |
| 仅有 MEDIUM/LOW 问题，验证通过 | **APPROVE** 并附带评论 |
| 有任何 HIGH 问题或验证失败 | **REQUEST CHANGES** |
| 有任何 CRITICAL 问题 | **BLOCK** — 合并前必须修复 |

特殊情况：

* 草稿 PR → 始终使用 **COMMENT**（不批准/阻止）
* 仅文档/配置更改 → 更轻量的审查，专注于正确性
* 显式的 `--approve` 或 `--request-changes` 标志 → 覆盖决定（但仍报告所有发现）

### 阶段 6 — 报告

在 `.claude/PRPs/reviews/pr-<NUMBER>-review.md` 处创建审查工件：

```markdown
# PR 审查： #<NUMBER> — <TITLE>

**审查人**： <date>
**作者**： <author>
**分支**： <head> → <base>
**决定**： 批准 | 请求修改 | 阻止

## 摘要
<1-2 句总体评估>

## 发现

### 严重
<发现项或"无">

### 高
<发现项或"无">

### 中
<发现项或"无">

### 低
<发现项或"无">

## 验证结果

| 检查项 | 结果 |
|---|---|
| 类型检查 | 通过 / 失败 / 已跳过 |
| 代码规范检查 | 通过 / 失败 / 已跳过 |
| 测试 | 通过 / 失败 / 已跳过 |
| 构建 | 通过 / 失败 / 已跳过 |

## 已审查文件
<文件列表，附带变更类型：新增/修改/删除>
```

### 阶段 7 — 发布

将审查发布到 GitHub：

```bash
# If APPROVE
gh pr review <NUMBER> --approve --body "<summary of review>"

# If REQUEST CHANGES
gh pr review <NUMBER> --request-changes --body "<summary with required fixes>"

# If COMMENT only (draft PR or informational)
gh pr review <NUMBER> --comment --body "<summary>"
```

对于特定行的内联评论，使用 GitHub 审查评论 API：

```bash
gh api "repos/{owner}/{repo}/pulls/<NUMBER>/comments" \
  -f body="<comment>" \
  -f path="<file>" \
  -F line=<line-number> \
  -f side="RIGHT" \
  -f commit_id="$(gh pr view <NUMBER> --json headRefOid --jq .headRefOid)"
```

或者，一次性发布包含多个内联评论的单个审查：

```bash
gh api "repos/{owner}/{repo}/pulls/<NUMBER>/reviews" \
  -f event="COMMENT" \
  -f body="<overall summary>" \
  --input comments.json  # [{"path": "file", "line": N, "body": "comment"}, ...]
```

### 阶段 8 — 输出

向用户报告：

```
PR #<编号>: <标题>
决策: <批准|请求修改|阻止>

问题: <critical_count> 个严重，<high_count> 个高，<medium_count> 个中，<low_count> 个低
验证: <pass_count>/<total_count> 项检查通过

产物:
  审查: .claude/PRPs/reviews/pr-<编号>-review.md
  GitHub: <PR URL>

后续步骤:
  - <基于决策的情境建议>
```

***

## 边缘情况

* **没有 `gh` CLI**：回退到仅本地审查（读取差异，跳过 GitHub 发布）。警告用户。
* **分支偏离**：建议在审查前进行 `git fetch origin && git rebase origin/<base>`。
* **大型 PR (>50 个文件)**：警告审查范围。首先关注源代码更改，然后是测试，最后是配置/文档。
