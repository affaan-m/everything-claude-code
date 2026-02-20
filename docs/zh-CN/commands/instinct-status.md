---
name: instinct-status
description: 显示所有已学习的本能及其置信水平
command: true
---

# 本能状态命令

显示所有已学习的本能及其置信度分数，按领域分组。

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
/instinct-status --domain code-style
/instinct-status --low-confidence
```

## 操作步骤

1. 从 `~/.claude/homunculus/instincts/personal/` 读取所有本能文件
2. 从 `~/.claude/homunculus/instincts/inherited/` 读取继承的本能
3. 按领域分组显示它们，并带有置信度条

## 输出格式

```
📊 Instinct Status
==================

## Code Style (4 instincts)

### prefer-functional-style
Trigger: when writing new functions
Action: Use functional patterns over classes
Confidence: ████████░░ 80%
Source: session-observation | Last updated: 2025-01-22

### use-path-aliases
Trigger: when importing modules
Action: Use @/ path aliases instead of relative imports
Confidence: ██████░░░░ 60%
Source: repo-analysis (github.com/acme/webapp)

## Testing (2 instincts)

### test-first-workflow
Trigger: when adding new functionality
Action: Write test first, then implementation
Confidence: █████████░ 90%
Source: session-observation

## Workflow (3 instincts)

### grep-before-edit
Trigger: when modifying code
Action: Search with Grep, confirm with Read, then Edit
Confidence: ███████░░░ 70%
Source: session-observation

---
Total: 9 instincts (4 personal, 5 inherited)
Observer: Running (last analysis: 5 min ago)
```

## 标志

* `--domain <name>`：按领域过滤（code-style、testing、git 等）
* `--low-confidence`：仅显示置信度 < 0.5 的本能
* `--high-confidence`：仅显示置信度 >= 0.7 的本能
* `--source <type>`：按来源过滤（session-observation、repo-analysis、inherited）
* `--json`：以 JSON 格式输出，供编程使用
