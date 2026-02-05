---
name: instinct-export
description: 导出本能，与团队成员或其他项目共享
command: /instinct-export
---

# 本能导出命令

将本能导出为可共享的格式。非常适合：

* 与团队成员分享
* 转移到新机器
* 贡献给项目约定

## 用法

```
/instinct-export                           # Export all personal instincts
/instinct-export --domain testing          # Export only testing instincts
/instinct-export --min-confidence 0.7      # Only export high-confidence instincts
/instinct-export --output team-instincts.yaml
```

## 操作步骤

1. 从 `~/.claude/homunculus/instincts/personal/` 读取本能
2. 根据标志进行筛选
3. 剥离敏感信息：
   * 移除会话 ID
   * 移除文件路径（仅保留模式）
   * 移除早于“上周”的时间戳
4. 生成导出文件

## 输出格式

创建一个 YAML 文件：

```yaml
# Instincts Export
# Generated: 2025-01-22
# Source: personal
# Count: 12 instincts

version: "2.0"
exported_by: "continuous-learning-v2"
export_date: "2025-01-22T10:30:00Z"

instincts:
  - id: prefer-functional-style
    trigger: "when writing new functions"
    action: "Use functional patterns over classes"
    confidence: 0.8
    domain: code-style
    observations: 8

  - id: test-first-workflow
    trigger: "when adding new functionality"
    action: "Write test first, then implementation"
    confidence: 0.9
    domain: testing
    observations: 12

  - id: grep-before-edit
    trigger: "when modifying code"
    action: "Search with Grep, confirm with Read, then Edit"
    confidence: 0.7
    domain: workflow
    observations: 6
```

## 隐私考虑

导出内容包括：

* ✅ 触发模式
* ✅ 操作
* ✅ 置信度分数
* ✅ 领域
* ✅ 观察计数

导出内容不包括：

* ❌ 实际代码片段
* ❌ 文件路径
* ❌ 会话记录
* ❌ 个人标识符

## 标志

* `--domain <name>`：仅导出指定领域
* `--min-confidence <n>`：最低置信度阈值（默认：0.3）
* `--output <file>`：输出文件路径（默认：instincts-export-YYYYMMDD.yaml）
* `--format <yaml|json|md>`：输出格式（默认：yaml）
* `--include-evidence`：包含证据文本（默认：排除）
