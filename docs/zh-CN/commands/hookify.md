---
description: 创建钩子以防止对话分析或明确指令中的不良行为
---

通过分析对话模式或明确的用户指令，创建钩子规则以防止不需要的 Claude Code 行为。

## 用法

`/hookify [description of behavior to prevent]`

如果未提供参数，则分析当前对话以找出值得防止的行为。

## 工作流程

### 步骤 1：收集行为信息

* 有参数时：解析用户对不需要行为的描述
* 无参数时：使用 `conversation-analyzer` 代理来查找：
  * 明确的纠正
  * 对重复错误的沮丧反应
  * 被还原的更改
  * 重复出现的类似问题

### 步骤 2：展示发现

向用户展示：

* 行为描述
* 建议的事件类型
* 建议的模式或匹配器
* 建议的操作

### 步骤 3：生成规则文件

对于每条批准的规则，在 `.claude/hookify.{name}.local.md` 处创建一个文件：

```yaml
---
name: rule-name
enabled: true
event: bash|file|stop|prompt|all
action: block|warn
pattern: "regex pattern"
---
Message shown when rule triggers.
```

### 步骤 4：确认

报告已创建的规则，以及如何使用 `/hookify-list` 和 `/hookify-configure` 来管理它们。
