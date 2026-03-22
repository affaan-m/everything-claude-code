---
name: instinct-status
description: 展示已学习的本能（项目+全局）并充满信心
command: true
---

# 本能状态命令

显示当前项目学习到的本能以及全局本能，按领域分组。

## 实现

使用插件根路径运行本能 CLI：

```bash
python3 "${CLAUDE_PLUGIN_ROOT}/skills/continuous-learning-v2/scripts/instinct-cli.py" status
```

或者，如果未设置 `CLAUDE_PLUGIN_ROOT`（手动安装），则使用：

```bash
python3 ~/.claude/skills/continuous-learning-v2/scripts/instinct-cli.py status
```

## 用法

```
/instinct-status
```

## 操作步骤

1. 检测当前项目上下文（git remote/路径哈希）
2. 从 `~/.claude/homunculus/projects/<project-id>/instincts/` 读取项目本能
3. 从 `~/.claude/homunculus/instincts/` 读取全局本能
4. 合并并应用优先级规则（当ID冲突时，项目本能覆盖全局本能）
5. 按领域分组显示，包含置信度条和观察统计数据

## 输出格式

```
============================================================
  INSTINCT 状态 - 总计 12
============================================================

  项目: my-app (a1b2c3d4e5f6)
  项目 instincts: 8
  全局 instincts:  4

## 项目范围内 (my-app)
  ### 工作流 (3)
    ███████░░░  70%  grep-before-edit [project]
              触发条件: 当修改代码时

## 全局 (适用于所有项目)
  ### 安全 (2)
    █████████░  85%  validate-user-input [global]
              触发条件: 当处理用户输入时
```
