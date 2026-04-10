---
description: dmux-workflows 和 autonomous-agent-harness 的旧版斜杠入口垫片。建议直接使用技能。
---

# 编排命令（旧版兼容层）

仅当您仍调用 `/orchestrate` 时使用此命令。维护中的编排指南位于 `skills/dmux-workflows/SKILL.md` 和 `skills/autonomous-agent-harness/SKILL.md`。

## 规范用法

* 对于并行窗格、工作树和多代理拆分，优先使用 `dmux-workflows`。
* 对于长时间运行的循环、治理、调度和控制平面风格的执行，优先使用 `autonomous-agent-harness`。
* 仅将此文件保留为兼容性入口点。

## 参数

`$ARGUMENTS`

## 委托

应用编排技能，而不是在此处维护第二个工作流规范。

* 对于拆分/并行执行，从 `dmux-workflows` 开始。
* 当用户真正需要的是持久循环、治理或操作员层行为时，引入 `autonomous-agent-harness`。
* 保持交接的结构化，但让技能定义维护中的排序规则。
  安全审查员：\[摘要]

### 已更改的文件

\[列出所有修改的文件]

### 测试结果

\[测试通过/失败摘要]

### 安全状态

\[安全发现]

### 建议

\[批准 / 需要改进 / 已阻止]

````

## 并行执行

对于独立的检查，并行运行代理：

```markdown
### 并行阶段
同时运行：
- code-reviewer（质量）
- security-reviewer（安全）
- architect（设计）

### 合并结果
将输出合并为单一报告
````

对于使用独立 git worktree 的外部 tmux-pane 工作器，请使用 `node scripts/orchestrate-worktrees.js plan.json --execute`。内置的编排模式保持进程内运行；此辅助工具适用于长时间运行或跨测试框架的会话。

当工作器需要查看主检出目录中的脏文件或未跟踪的本地文件时，请在计划文件中添加 `seedPaths`。ECC 仅在 `git worktree add` 之后，将那些选定的路径覆盖到每个工作器的工作树中，这既能保持分支隔离，又能暴露正在处理的本地脚本、计划或文档。

```json
{
  "sessionName": "workflow-e2e",
  "seedPaths": [
    "scripts/orchestrate-worktrees.js",
    "scripts/lib/tmux-worktree-orchestrator.js",
    ".claude/plan/workflow-e2e-test.json"
  ],
  "workers": [
    { "name": "docs", "task": "Update orchestration docs." }
  ]
}
```

要导出实时 tmux/worktree 会话的控制平面快照，请运行：

```bash
node scripts/orchestration-status.js .claude/plan/workflow-visual-proof.json
```

快照包含会话活动、tmux 窗格元数据、工作器状态、目标、已播种的覆盖层以及最近的交接摘要，均以 JSON 格式保存。

## 操作员指挥中心交接

当工作流跨越多个会话、工作树或 tmux 窗格时，请在最终交接内容中附加一个控制平面块：

```markdown
控制平面
-------------
会话：
- 活动会话 ID 或别名
- 每个活动工作线程的分支 + 工作树路径
- 适用时的 tmux 窗格或分离会话名称

差异：
- git 状态摘要
- 已修改文件的 git diff --stat
- 合并/冲突风险说明

审批：
- 待处理的用户审批
- 等待确认的受阻步骤

遥测：
- 最后活动时间戳或空闲信号
- 预估的令牌或成本漂移
- 由钩子或审查器引发的策略事件
```

这使得规划者、实施者、审查者和循环工作器在操作员界面上保持清晰可辨。

## 工作流参数

$ARGUMENTS:

* `feature <description>` - 完整功能工作流
* `bugfix <description>` - 错误修复工作流
* `refactor <description>` - 重构工作流
* `security <description>` - 安全审查工作流
* `custom <agents> <description>` - 自定义代理序列

## 自定义工作流示例

```
/orchestrate 自定义 "architect,tdd-guide,code-reviewer" "重新设计缓存层"
```

## 提示

1. **从规划代理开始**处理复杂功能
2. **始终在合并前包含代码审查代理**
3. 处理认证/支付/个人身份信息时**使用安全审查代理**
4. **保持交接文档简洁** - 关注下一个代理需要什么
5. 如有需要，**在代理之间运行验证**
