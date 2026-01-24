# Orchestrate 命令

用于复杂任务的顺序代理工作流。

## 用法

`/orchestrate [工作流类型] [任务描述]`

## 工作流类型

### feature
完整的功能实现工作流：
```
planner -> tdd-guide -> code-reviewer -> security-reviewer
```

### bugfix
Bug 调查和修复工作流：
```
explorer -> tdd-guide -> code-reviewer
```

### refactor
安全重构工作流：
```
architect -> code-reviewer -> tdd-guide
```

### security
安全专项审查：
```
security-reviewer -> code-reviewer -> architect
```

## 执行模式

对于工作流中的每个代理：

1. **调用代理**，提供上一个代理的上下文
2. **收集输出**作为结构化交接文档
3. **传递给下一个代理**
4. **汇总结果**到最终报告

## 交接文档格式

代理之间创建交接文档：

```markdown
## 交接：[上一个代理] -> [下一个代理]

### 上下文
[已完成工作的摘要]

### 发现
[关键发现或决策]

### 修改的文件
[已修改的文件列表]

### 待解决问题
[留给下一个代理的未解决事项]

### 建议
[建议的后续步骤]
```

## 示例：功能工作流

```
/orchestrate feature "添加用户认证"
```

执行：

1. **Planner 代理**
   - 分析需求
   - 创建实现计划
   - 识别依赖关系
   - 输出：`交接：planner -> tdd-guide`

2. **TDD Guide 代理**
   - 读取 planner 的交接文档
   - 先编写测试
   - 实现以通过测试
   - 输出：`交接：tdd-guide -> code-reviewer`

3. **Code Reviewer 代理**
   - 审查实现
   - 检查问题
   - 建议改进
   - 输出：`交接：code-reviewer -> security-reviewer`

4. **Security Reviewer 代理**
   - 安全审计
   - 漏洞检查
   - 最终批准
   - 输出：最终报告

## 最终报告格式

```
编排报告
====================
工作流：feature
任务：添加用户认证
代理：planner -> tdd-guide -> code-reviewer -> security-reviewer

摘要
-------
[一段摘要]

代理输出
-------------
Planner：[摘要]
TDD Guide：[摘要]
Code Reviewer：[摘要]
Security Reviewer：[摘要]

修改的文件
-------------
[列出所有修改的文件]

测试结果
------------
[测试通过/失败摘要]

安全状态
---------------
[安全发现]

建议
--------------
[可发布 / 需要改进 / 阻塞]
```

## 并行执行

对于独立检查，并行运行代理：

```markdown
### 并行阶段
同时运行：
- code-reviewer（质量）
- security-reviewer（安全）
- architect（设计）

### 合并结果
将输出合并到单个报告中
```

## 参数

$ARGUMENTS：
- `feature <描述>` - 完整功能工作流
- `bugfix <描述>` - Bug 修复工作流
- `refactor <描述>` - 重构工作流
- `security <描述>` - 安全审查工作流
- `custom <代理> <描述>` - 自定义代理序列

## 自定义工作流示例

```
/orchestrate custom "architect,tdd-guide,code-reviewer" "重新设计缓存层"
```

## 技巧

1. **复杂功能从 planner 开始**
2. **合并前始终包含 code-reviewer**
3. **对认证/支付/PII 使用 security-reviewer**
4. **保持交接简洁** - 专注于下一个代理需要的内容
5. **必要时在代理之间运行验证**
