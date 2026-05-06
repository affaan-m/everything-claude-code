---
description: 用于 dmux-workflows 和 autonomous-agent-harness 的旧版斜杠入口填充程序。建议直接使用技能。
---

# 编排命令（旧版兼容层）

仅在你仍调用 `/orchestrate` 时使用此命令。维护中的编排指南位于 `skills/dmux-workflows/SKILL.md` 和 `skills/autonomous-agent-harness/SKILL.md`。

## 标准接口

* 对于并行面板、工作树和多代理拆分，优先使用 `dmux-workflows`。
* 对于长时间运行的循环、治理、调度和控制平面风格执行，优先使用 `autonomous-agent-harness`。
* 保留此文件仅作为兼容性入口点。

## 参数

`$ARGUMENTS`

## 委派

在此处应用编排技能，而不是维护第二个工作流规范。

* 对于拆分/并行执行，从 `dmux-workflows` 开始。
* 当用户真正需要持久循环、治理或操作员层行为时，引入 `autonomous-agent-harness`。
* 保持交接结构化，但让技能定义维护中的排序规则。
  安全审查员：\[摘要]

### 修改的文件

\[列出所有修改的文件]

### 测试结果

\[测试通过/失败摘要]

### 安全状态

\[安全发现]

### 建议

\[发布 / 需要改进 / 阻塞]

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

对于具有独立 git 工作树的外部 tmux 面板工作进程，使用 `node scripts/orchestrate-worktrees.js plan.json --execute`。内置编排模式保持进程内运行；辅助程序用于长时间运行或跨框架会话。

当工作进程需要查看主检出中的脏文件或未跟踪的本地文件时，将 `seedPaths` 添加到计划文件中。ECC 仅在 `git worktree add` 之后将选定的路径覆盖到每个工作进程的工作树中，这保持了分支隔离，同时仍暴露进行中的本地脚本、计划或文档。

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

要为活动的 tmux/工作树会话导出控制平面快照，请运行：

```bash
node scripts/orchestration-status.js .claude/plan/workflow-visual-proof.json
```

快照以 JSON 形式包含会话活动、tmux 面板元数据、工作进程状态、目标、种子覆盖和最近的交接摘要。

## 操作员命令中心交接

当工作流跨越多个会话、工作树或 tmux 面板时，将控制平面块附加到最终交接中：

```markdown
控制平面
---------
会话：
- 活跃会话 ID 或别名
- 每个活跃工作者的分支 + 工作树路径
- 适用的 tmux 窗格或分离会话名称

差异：
- git 状态摘要
- 已修改文件的 git diff --stat
- 合并/冲突风险说明

审批：
- 待处理的用户审批
- 等待确认的阻塞步骤

遥测：
- 最后活动时间戳或空闲信号
- 预估的令牌或成本漂移
- 钩子或审查者触发的策略事件
```

这使规划者、实现者、审查者和循环工作进程在操作员界面上保持清晰可读。

## 工作流参数

$ARGUMENTS:

* `feature <description>` - 完整功能工作流
* `bugfix <description>` - 错误修复工作流
* `refactor <description>` - 重构工作流
* `security <description>` - 安全审查工作流
* `custom <agents> <description>` - 自定义代理序列

## 自定义工作流示例

```
/orchestrate custom "architect,tdd-guide,code-reviewer" "重新设计缓存层"
```

## 提示

1. **从规划者开始** 处理复杂功能
2. **始终包含代码审查者** 在合并前
3. **使用安全审查者** 处理认证/支付/PII
4. **保持交接简洁** - 专注于下一个代理需要的内容
5. **在代理之间运行验证** 如果需要
