# 编排命令

用于复杂任务的顺序代理工作流。

## 使用

`/orchestrate [workflow-type] [task-description]`

## 工作流类型

### feature

完整功能实现工作流：

```
planner -> tdd-guide -> code-reviewer -> security-reviewer
```

### bugfix

错误调查与修复工作流：

```
explorer -> tdd-guide -> code-reviewer
```

### refactor

安全重构工作流：

```
architect -> code-reviewer -> tdd-guide
```

### security

安全审查工作流：

```
security-reviewer -> code-reviewer -> architect
```

## 执行模式

针对工作流中的每个代理：

1. 使用来自上一个代理的上下文**调用代理**
2. 将输出收集为结构化的交接文档
3. 将文档**传递给链中的下一个代理**
4. 将结果**汇总**到最终报告中

## 交接文档格式

在代理之间，创建交接文档：

```markdown
## 交接：[前一位代理人] -> [下一位代理人]

### 背景
[已完成工作的总结]

### 发现
[关键发现或决定]

### 已修改的文件
[已触及的文件列表]

### 待解决的问题
[留给下一位代理人的未决事项]

### 建议
[建议的后续步骤]

```

## 示例：功能工作流

```
/orchestrate feature "Add user authentication"
```

执行：

1. **规划代理**
   * 分析需求
   * 创建实施计划
   * 识别依赖项
   * 输出：`HANDOFF: planner -> tdd-guide`

2. **TDD 指导代理**
   * 读取规划交接文档
   * 先编写测试
   * 实施代码以通过测试
   * 输出：`HANDOFF: tdd-guide -> code-reviewer`

3. **代码审查代理**
   * 审查实现
   * 检查问题
   * 提出改进建议
   * 输出：`HANDOFF: code-reviewer -> security-reviewer`

4. **安全审查代理**
   * 安全审计
   * 漏洞检查
   * 最终批准
   * 输出：最终报告

## 最终报告格式

```
ORCHESTRATION REPORT
====================
Workflow: feature
Task: Add user authentication
Agents: planner -> tdd-guide -> code-reviewer -> security-reviewer

SUMMARY
-------
[One paragraph summary]

AGENT OUTPUTS
-------------
Planner: [summary]
TDD Guide: [summary]
Code Reviewer: [summary]
Security Reviewer: [summary]

FILES CHANGED
-------------
[List all files modified]

TEST RESULTS
------------
[Test pass/fail summary]

SECURITY STATUS
---------------
[Security findings]

RECOMMENDATION
--------------
[SHIP / NEEDS WORK / BLOCKED]
```

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

```

## 参数

$ARGUMENTS:

* `feature <description>` - 完整功能工作流
* `bugfix <description>` - 错误修复工作流
* `refactor <description>` - 重构工作流
* `security <description>` - 安全审查工作流
* `custom <agents> <description>` - 自定义代理序列

## 自定义工作流示例

```
/orchestrate custom "architect,tdd-guide,code-reviewer" "Redesign caching layer"
```

## 提示

1. **从规划代理开始**处理复杂功能
2. **始终在合并前包含代码审查代理**
3. 处理认证/支付/个人身份信息时**使用安全审查代理**
4. **保持交接文档简洁** - 关注下一个代理需要什么
5. 如有需要，**在代理之间运行验证**
