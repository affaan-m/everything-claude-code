# Git 工作流程

## 提交信息格式

```
<type>: <description>

<optional body>
```

类型：feat, fix, refactor, docs, test, chore, perf, ci

注意：通过 ~/.claude/settings.json 全局禁用了归因。

## 拉取请求工作流程

创建 PR 时：

1. 分析完整的提交历史（不仅仅是最近一次提交）
2. 使用 `git diff [base-branch]...HEAD` 查看所有更改
3. 起草全面的 PR 摘要
4. 包含带有 TODO 的测试计划
5. 如果是新分支，使用 `-u` 标志推送

## 功能实现工作流程

1. **先做计划**
   * 使用 **planner** 代理创建实施计划
   * 识别依赖项和风险
   * 分解为多个阶段

2. **TDD 方法**
   * 使用 **tdd-guide** 代理
   * 先写测试（RED）
   * 实现代码以通过测试（GREEN）
   * 重构（IMPROVE）
   * 验证 80%+ 的覆盖率

3. **代码审查**
   * 编写代码后立即使用 **code-reviewer** 代理
   * 解决 CRITICAL 和 HIGH 级别的问题
   * 尽可能修复 MEDIUM 级别的问题

4. **提交与推送**
   * 详细的提交信息
   * 遵循约定式提交格式
