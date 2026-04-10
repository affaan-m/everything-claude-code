---
description: Quick commit with natural language file targeting — describe what to commit in plain English
argument-hint: [target description] (blank = all changes)
---

# 智能提交

> 改编自 Wirasm 的 PRPs-agentic-eng。PRP 工作流系列的一部分。

**输入**: $ARGUMENTS

***

## 阶段 1 — 评估

```bash
git status --short
```

如果输出为空 → 停止："没有内容可提交。"

向用户展示变更摘要（新增、修改、删除、未跟踪）。

***

## 阶段 2 — 解释与暂存

解释 `$ARGUMENTS` 以确定要暂存的内容：

| 输入 | 解释 | Git 命令 |
|---|---|---|
| *(空白 / 空)* | 暂存所有内容 | `git add -A` |
| `staged` | 使用已暂存的内容 | *(不执行 git add)* |
| `*.ts` 或 `*.py` 等 | 暂存匹配的通配符模式 | `git add '*.ts'` |
| `except tests` | 暂存所有，然后取消暂存测试文件 | `git add -A && git reset -- '**/*.test.*' '**/*.spec.*' '**/test_*' 2>/dev/null \|\| true` |
| `only new files` | 仅暂存未跟踪文件 | `git ls-files --others --exclude-standard \| grep . && git ls-files --others --exclude-standard \| xargs git add` |
| `the auth changes` | 根据状态/差异解释 — 查找与认证相关的文件 | `git add <matched files>` |
| 特定文件名 | 暂存这些文件 | `git add <files>` |

对于自然语言输入（如"认证相关的更改"），交叉参考 `git status` 的输出和 `git diff` 以识别相关文件。向用户展示你正在暂存哪些文件以及原因。

```bash
git add <determined files>
```

暂存后，验证：

```bash
git diff --cached --stat
```

如果没有任何内容被暂存，停止："没有文件匹配您的描述。"

***

## 阶段 3 — 提交

以祈使语气撰写单行提交信息：

```
{type}: {description}
```

类型：

* `feat` — 新功能或能力
* `fix` — 错误修复
* `refactor` — 不改变行为的代码重构
* `docs` — 文档变更
* `test` — 添加或更新测试
* `chore` — 构建、配置、依赖项
* `perf` — 性能改进
* `ci` — CI/CD 变更

规则：

* 祈使语气（"添加功能"而非"已添加功能"）
* 类型前缀后小写
* 结尾不加句号
* 少于 72 个字符
* 描述**什么**改变了，而不是**如何**改变的

```bash
git commit -m "{type}: {description}"
```

***

## 阶段 4 — 输出

向用户报告：

```
Committed: {hash_short}
Message:   {type}: {description}
Files:     {count} file(s) changed

Next steps:
  - git push           → push to remote
  - /prp-pr            → create a pull request
  - /code-review       → review before pushing
```

***

## 示例

| 您输入 | 发生的情况 |
|---|---|
| `/prp-commit` | 暂存所有内容，自动生成信息 |
| `/prp-commit staged` | 仅提交已暂存的内容 |
| `/prp-commit *.ts` | 暂存所有 TypeScript 文件，提交 |
| `/prp-commit except tests` | 暂存除测试文件外的所有内容 |
| `/prp-commit the database migration` | 从状态中查找数据库迁移文件，暂存它们 |
| `/prp-commit only new files` | 仅暂存未跟踪文件 |
