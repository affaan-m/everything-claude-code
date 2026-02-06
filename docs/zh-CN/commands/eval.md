# Eval 命令

管理基于评估的开发工作流。

## 用法

`/eval [define|check|report|list] [feature-name]`

## 定义评估

`/eval define feature-name`

创建新的评估定义：

1. 使用模板创建 `.claude/evals/feature-name.md`：

```markdown
## EVAL: 功能名称
创建于: $(date)

### 能力评估
- [ ] [能力 1 的描述]
- [ ] [能力 2 的描述]

### 回归评估
- [ ] [现有行为 1 仍然有效]
- [ ] [现有行为 2 仍然有效]

### 成功标准
- 能力评估的 pass@3 > 90%
- 回归评估的 pass^3 = 100%

```

2. 提示用户填写具体标准

## 检查评估

`/eval check feature-name`

为功能运行评估：

1. 从 `.claude/evals/feature-name.md` 读取评估定义
2. 对于每个能力评估：
   * 尝试验证标准
   * 记录 通过/失败
   * 在 `.claude/evals/feature-name.log` 中记录尝试
3. 对于每个回归评估：
   * 运行相关测试
   * 与基线比较
   * 记录 通过/失败
4. 报告当前状态：

```
EVAL CHECK: feature-name
========================
Capability: X/Y passing
Regression: X/Y passing
Status: IN PROGRESS / READY
```

## 报告评估

`/eval report feature-name`

生成全面的评估报告：

```
EVAL REPORT: feature-name
=========================
Generated: $(date)

CAPABILITY EVALS
----------------
[eval-1]: PASS (pass@1)
[eval-2]: PASS (pass@2) - required retry
[eval-3]: FAIL - see notes

REGRESSION EVALS
----------------
[test-1]: PASS
[test-2]: PASS
[test-3]: PASS

METRICS
-------
Capability pass@1: 67%
Capability pass@3: 100%
Regression pass^3: 100%

NOTES
-----
[Any issues, edge cases, or observations]

RECOMMENDATION
--------------
[SHIP / NEEDS WORK / BLOCKED]
```

## 列出评估

`/eval list`

显示所有评估定义：

```
EVAL DEFINITIONS
================
feature-auth      [3/5 passing] IN PROGRESS
feature-search    [5/5 passing] READY
feature-export    [0/4 passing] NOT STARTED
```

## 参数

$ARGUMENTS:

* `define <name>` - 创建新的评估定义
* `check <name>` - 运行并检查评估
* `report <name>` - 生成完整报告
* `list` - 显示所有评估
* `clean` - 删除旧的评估日志（保留最近 10 次运行）
