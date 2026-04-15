---
name: git-workflow
description: Git工作流模式，包括分支策略、提交规范、合并与变基、冲突解决，以及适用于各种规模团队的协作开发最佳实践。
origin: ECC
---

# Git 工作流模式

Git 版本控制、分支策略和协作开发的最佳实践。

## 何时启用

* 为新项目设置 Git 工作流
* 决定分支策略（GitFlow、主干开发、GitHub 流）
* 编写提交信息和 PR 描述
* 解决合并冲突
* 管理发布和版本标签
* 向新团队成员介绍 Git 实践

## 分支策略

### GitHub 流（简单，推荐给大多数项目）

最适合持续部署和中小型团队。

```
main (受保护，始终可部署)
  │
  ├── feature/user-auth      → PR → 合并到 main
  ├── feature/payment-flow   → PR → 合并到 main
  └── fix/login-bug          → PR → 合并到 main
```

**规则：**

* `main` 始终可部署
* 从 `main` 创建功能分支
* 准备就绪后开启 Pull Request 进行审查
* 批准且 CI 通过后，合并到 `main`
* 合并后立即部署

### 主干开发（高速度团队）

最适合拥有强大 CI/CD 和功能标志的团队。

```
main (主干)
  │
  ├── 短期功能 (最多1-2天)
  ├── 短期功能
  └── 短期功能
```

**规则：**

* 每个人都提交到 `main` 或非常短命的分支
* 功能标志隐藏未完成的工作
* 合并前 CI 必须通过
* 每天部署多次

### GitFlow（复杂，发布周期驱动）

最适合计划发布和企业项目。

```
main (production releases)
  │
  └── develop (integration branch)
        │
        ├── feature/user-auth
        ├── feature/payment
        │
        ├── release/1.0.0    → merge to main and develop
        │
        └── hotfix/critical  → merge to main and develop
```

**规则：**

* `main` 仅包含生产就绪代码
* `develop` 是集成分支
* 功能分支从 `develop` 创建，合并回 `develop`
* 发布分支从 `develop` 创建，合并到 `main` 和 `develop`
* 热修复分支从 `main` 创建，合并到 `main` 和 `develop`

### 何时使用哪种策略

| 策略 | 团队规模 | 发布节奏 | 最适合 |
|----------|-----------|-----------------|----------|
| GitHub 流 | 任意 | 持续 | SaaS、Web 应用、初创公司 |
| 主干开发 | 5 人以上且有经验 | 每天多次 | 高速度团队、功能标志 |
| GitFlow | 10 人以上 | 计划发布 | 企业、受监管行业 |

## 提交信息

### 约定式提交格式

```
<类型>(<范围>): <主题>

[可选的正文]

[可选的页脚]
```

### 类型

| 类型 | 用于 | 示例 |
|------|---------|---------|
| `feat` | 新功能 | `feat(auth): add OAuth2 login` |
| `fix` | 错误修复 | `fix(api): handle null response in user endpoint` |
| `docs` | 文档 | `docs(readme): update installation instructions` |
| `style` | 格式化，无代码变更 | `style: fix indentation in login component` |
| `refactor` | 代码重构 | `refactor(db): extract connection pool to module` |
| `test` | 添加/更新测试 | `test(auth): add unit tests for token validation` |
| `chore` | 维护任务 | `chore(deps): update dependencies` |
| `perf` | 性能改进 | `perf(query): add index to users table` |
| `ci` | CI/CD 变更 | `ci: add PostgreSQL service to test workflow` |
| `revert` | 还原之前的提交 | `revert: revert "feat(auth): add OAuth2 login"` |

### 好与坏的示例

```
# 不佳：模糊，缺乏上下文
git commit -m "fixed stuff"
git commit -m "updates"
git commit -m "WIP"

# 良好：清晰，具体，解释原因
git commit -m "fix(api): 在 503 Service Unavailable 时重试请求

外部 API 在高峰时段偶尔会返回 503 错误。
添加了指数退避重试逻辑，最多尝试 3 次。

Closes #123"
```

### 提交信息模板

在仓库根目录创建 `.gitmessage`：

```
# <type>(<scope>): <subject>
# # 类型：feat, fix, docs, style, refactor, test, chore, perf, ci, revert
# 作用域：api, ui, db, auth, 等
# 主题：使用祈使语气，不加句号，最多50个字符
#
# [可选正文] - 解释原因，而非内容
# [可选页脚] - 重大变更，关闭 #issue
```

通过以下命令启用：`git config commit.template .gitmessage`

## 合并与变基

### 合并（保留历史）

```bash
# Creates a merge commit
git checkout main
git merge feature/user-auth

# Result:
# *   merge commit
# |\
# | * feature commits
# |/
# * main commits
```

**在以下情况使用：**

* 将功能分支合并到 `main`
* 你想保留确切的历史记录
* 有多人在该分支上工作
* 该分支已被推送，其他人可能基于它进行了工作

### 变基（线性历史）

```bash
# Rewrites feature commits onto target branch
git checkout feature/user-auth
git rebase main

# Result:
# * feature commits (rewritten)
# * main commits
```

**在以下情况使用：**

* 用最新的 `main` 更新你的本地功能分支
* 你想要线性、整洁的历史记录
* 该分支仅为本地分支（未推送）
* 你是唯一在该分支上工作的人

### 变基工作流

```bash
# Update feature branch with latest main (before PR)
git checkout feature/user-auth
git fetch origin
git rebase origin/main

# Fix any conflicts
# Tests should still pass

# Force push (only if you're the only contributor)
git push --force-with-lease origin feature/user-auth
```

### 何时不应变基

```
# 绝对不要对以下分支进行 rebase：
- 已推送到共享仓库的分支
- 其他人已基于其进行工作的分支
- 受保护的分支（main、develop）
- 已合并的分支

# 原因：Rebase 会重写历史，破坏他人的工作
```

## Pull Request 工作流

### PR 标题格式

```
<type>(<scope>): <description>

示例：
feat(auth): 为企业用户添加单点登录支持
fix(api): 解决订单处理中的竞态条件问题
docs(api): 为 v2 端点添加 OpenAPI 规范
```

### PR 描述模板

```markdown
## 内容

简要描述本次 PR 所做的事情。

## 原因

解释动机和背景。

## 方式

值得强调的关键实现细节。

## 测试

- [ ] 已添加/更新单元测试
- [ ] 已添加/更新集成测试
- [ ] 已执行手动测试

## 截图（如适用）

UI 变更前后的截图。

## 检查清单

- [ ] 代码遵循项目风格指南
- [ ] 已完成自我审查
- [ ] 为复杂逻辑添加了注释
- [ ] 已更新文档
- [ ] 未引入新的警告
- [ ] 本地测试通过
- [ ] 已关联相关 issue

关闭 #123
```

### 代码审查清单

**审查者：**

* \[ ] 代码是否解决了所述问题？
* \[ ] 是否有未处理的边缘情况？
* \[ ] 代码是否可读且可维护？
* \[ ] 是否有足够的测试？
* \[ ] 是否存在安全问题？
* \[ ] 提交历史是否整洁（如有需要是否已压缩）？

**作者：**

* \[ ] 在请求审查前已完成自我审查
* \[ ] CI 通过（测试、代码检查、类型检查）
* \[ ] PR 大小合理（理想情况 <500 行）
* \[ ] 与单一功能/修复相关
* \[ ] 描述清晰地解释了变更

## 冲突解决

### 识别冲突

```bash
# Check for conflicts before merge
git checkout main
git merge feature/user-auth --no-commit --no-ff

# If conflicts, Git will show:
# CONFLICT (content): Merge conflict in src/auth/login.ts
# Automatic merge failed; fix conflicts and then commit the result.
```

### 解决冲突

```bash
# See conflicted files
git status

# View conflict markers in file
# <<<<<<< HEAD
# content from main
# =======
# content from feature branch
# >>>>>>> feature/user-auth

# Option 1: Manual resolution
# Edit file, remove markers, keep correct content

# Option 2: Use merge tool
git mergetool

# Option 3: Accept one side
git checkout --ours src/auth/login.ts    # Keep main version
git checkout --theirs src/auth/login.ts  # Keep feature version

# After resolving, stage and commit
git add src/auth/login.ts
git commit
```

### 冲突预防策略

```bash
# 1. Keep feature branches small and short-lived
# 2. Rebase frequently onto main
git checkout feature/user-auth
git fetch origin
git rebase origin/main

# 3. Communicate with team about touching shared files
# 4. Use feature flags instead of long-lived branches
# 5. Review and merge PRs promptly
```

## 分支管理

### 命名约定

```
# 功能分支
feature/user-authentication
feature/JIRA-123-payment-integration

# 错误修复
fix/login-redirect-loop
fix/456-null-pointer-exception

# 热修复（生产环境问题）
hotfix/critical-security-patch
hotfix/database-connection-leak

# 发布版本
release/1.2.0
release/2024-01-hotfix

# 实验/概念验证
experiment/new-caching-strategy
poc/graphql-migration
```

### 分支清理

```bash
# Delete local branches that are merged
git branch --merged main | grep -v "^\*\|main" | xargs -n 1 git branch -d

# Delete remote-tracking references for deleted remote branches
git fetch -p

# Delete local branch
git branch -d feature/user-auth  # Safe delete (only if merged)
git branch -D feature/user-auth  # Force delete

# Delete remote branch
git push origin --delete feature/user-auth
```

### 储藏工作流

```bash
# Save work in progress
git stash push -m "WIP: user authentication"

# List stashes
git stash list

# Apply most recent stash
git stash pop

# Apply specific stash
git stash apply stash@{2}

# Drop stash
git stash drop stash@{0}
```

## 发布管理

### 语义化版本控制

```
MAJOR.MINOR.PATCH

MAJOR: 重大变更
MINOR: 新功能，向后兼容
PATCH: 错误修复，向后兼容

示例：
1.0.0 → 1.0.1 (补丁：错误修复)
1.0.1 → 1.1.0 (次要：新功能)
1.1.0 → 2.0.0 (主要：重大变更)
```

### 创建发布

```bash
# Create annotated tag
git tag -a v1.2.0 -m "Release v1.2.0

Features:
- Add user authentication
- Implement password reset

Fixes:
- Resolve login redirect issue

Breaking Changes:
- None"

# Push tag to remote
git push origin v1.2.0

# List tags
git tag -l

# Delete tag
git tag -d v1.2.0
git push origin --delete v1.2.0
```

### 变更日志生成

```bash
# Generate changelog from commits
git log v1.1.0..v1.2.0 --oneline --no-merges

# Or use conventional-changelog
npx conventional-changelog -i CHANGELOG.md -s
```

## Git 配置

### 基本配置

```bash
# User identity
git config --global user.name "Your Name"
git config --global user.email "your@email.com"

# Default branch name
git config --global init.defaultBranch main

# Pull behavior (rebase instead of merge)
git config --global pull.rebase true

# Push behavior (push current branch only)
git config --global push.default current

# Auto-correct typos
git config --global help.autocorrect 1

# Better diff algorithm
git config --global diff.algorithm histogram

# Color output
git config --global color.ui auto
```

### 有用的别名

```bash
# Add to ~/.gitconfig
[alias]
    co = checkout
    br = branch
    ci = commit
    st = status
    unstage = reset HEAD --
    last = log -1 HEAD
    visual = log --oneline --graph --all
    amend = commit --amend --no-edit
    wip = commit -m "WIP"
    undo = reset --soft HEAD~1
    contributors = shortlog -sn
```

### Gitignore 模式

```gitignore
# Dependencies
node_modules/
vendor/

# Build outputs
dist/
build/
*.o
*.exe

# Environment files
.env
.env.local
.env.*.local

# IDE
.idea/
.vscode/
*.swp
*.swo

# OS files
.DS_Store
Thumbs.db

# Logs
*.log
logs/

# Test coverage
coverage/

# Cache
.cache/
*.tsbuildinfo
```

## 常见工作流

### 开始新功能

```bash
# 1. Update main branch
git checkout main
git pull origin main

# 2. Create feature branch
git checkout -b feature/user-auth

# 3. Make changes and commit
git add .
git commit -m "feat(auth): implement OAuth2 login"

# 4. Push to remote
git push -u origin feature/user-auth

# 5. Create Pull Request on GitHub/GitLab
```

### 用新变更更新 PR

```bash
# 1. Make additional changes
git add .
git commit -m "feat(auth): add error handling"

# 2. Push updates
git push origin feature/user-auth
```

### 同步 Fork 与上游仓库

```bash
# 1. Add upstream remote (once)
git remote add upstream https://github.com/original/repo.git

# 2. Fetch upstream
git fetch upstream

# 3. Merge upstream/main into your main
git checkout main
git merge upstream/main

# 4. Push to your fork
git push origin main
```

### 撤销错误

```bash
# Undo last commit (keep changes)
git reset --soft HEAD~1

# Undo last commit (discard changes)
git reset --hard HEAD~1

# Undo last commit pushed to remote
git revert HEAD
git push origin main

# Undo specific file changes
git checkout HEAD -- path/to/file

# Fix last commit message
git commit --amend -m "New message"

# Add forgotten file to last commit
git add forgotten-file
git commit --amend --no-edit
```

## Git 钩子

### 预提交钩子

```bash
#!/bin/bash
# .git/hooks/pre-commit

# Run linting
npm run lint || exit 1

# Run tests
npm test || exit 1

# Check for secrets
if git diff --cached | grep -E '(password|api_key|secret)'; then
    echo "Possible secret detected. Commit aborted."
    exit 1
fi
```

### 预推送钩子

```bash
#!/bin/bash
# .git/hooks/pre-push

# Run full test suite
npm run test:all || exit 1

# Check for console.log statements
if git diff origin/main | grep -E 'console\.log'; then
    echo "Remove console.log statements before pushing."
    exit 1
fi
```

## 反模式

```
# BAD: 直接提交到 main 分支
git checkout main
git commit -m "fix bug"

# GOOD: 使用功能分支和 PR

# BAD: 提交密钥
git add .env  # 包含 API 密钥

# GOOD: 添加到 .gitignore，使用环境变量

# BAD: 巨型 PR（1000+ 行）
# GOOD: 拆分为更小、专注的 PR

# BAD: "更新" 类提交信息
git commit -m "update"
git commit -m "fix"

# GOOD: 描述性信息
git commit -m "fix(auth): 修复登录后的重定向循环"

# BAD: 重写公共历史
git push --force origin main

# GOOD: 对公共分支使用 revert
git revert HEAD

# BAD: 长期存在的功能分支（数周/数月）
# GOOD: 保持分支短期（数天），频繁变基

# BAD: 提交生成的文件
git add dist/
git add node_modules/

# GOOD: 添加到 .gitignore
```

## 快速参考

| 任务 | 命令 |
|------|---------|
| 创建分支 | `git checkout -b feature/name` |
| 切换分支 | `git checkout branch-name` |
| 删除分支 | `git branch -d branch-name` |
| 合并分支 | `git merge branch-name` |
| 变基分支 | `git rebase main` |
| 查看历史 | `git log --oneline --graph` |
| 查看变更 | `git diff` |
| 暂存变更 | `git add .` 或 `git add -p` |
| 提交 | `git commit -m "message"` |
| 推送 | `git push origin branch-name` |
| 拉取 | `git pull origin branch-name` |
| 储藏 | `git stash push -m "message"` |
| 撤销上次提交 | `git reset --soft HEAD~1` |
| 还原提交 | `git revert HEAD` |
