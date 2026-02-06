---
name: instinct-import
description: 从队友、技能创建者或其他来源导入本能
command: true
---

# 本能导入命令

## 实现

使用插件根路径运行本能 CLI：

```bash
python3 "${CLAUDE_PLUGIN_ROOT}/skills/continuous-learning-v2/scripts/instinct-cli.py" import <file-or-url> [--dry-run] [--force] [--min-confidence 0.7]
```

或者，如果 `CLAUDE_PLUGIN_ROOT` 未设置（手动安装）：

```bash
python3 ~/.claude/skills/continuous-learning-v2/scripts/instinct-cli.py import <file-or-url>
```

从以下来源导入本能：

* 队友的导出
* 技能创建器（仓库分析）
* 社区集合
* 之前的机器备份

## 用法

```
/instinct-import team-instincts.yaml
/instinct-import https://github.com/org/repo/instincts.yaml
/instinct-import --from-skill-creator acme/webapp
```

## 执行步骤

1. 获取本能文件（本地路径或 URL）
2. 解析并验证格式
3. 检查与现有本能的重复项
4. 合并或添加新本能
5. 保存到 `~/.claude/homunculus/instincts/inherited/`

## 导入过程

```
📥 Importing instincts from: team-instincts.yaml
================================================

Found 12 instincts to import.

Analyzing conflicts...

## New Instincts (8)
These will be added:
  ✓ use-zod-validation (confidence: 0.7)
  ✓ prefer-named-exports (confidence: 0.65)
  ✓ test-async-functions (confidence: 0.8)
  ...

## Duplicate Instincts (3)
Already have similar instincts:
  ⚠️ prefer-functional-style
     Local: 0.8 confidence, 12 observations
     Import: 0.7 confidence
     → Keep local (higher confidence)

  ⚠️ test-first-workflow
     Local: 0.75 confidence
     Import: 0.9 confidence
     → Update to import (higher confidence)

## Conflicting Instincts (1)
These contradict local instincts:
  ❌ use-classes-for-services
     Conflicts with: avoid-classes
     → Skip (requires manual resolution)

---
Import 8 new, update 1, skip 3?
```

## 合并策略

### 针对重复项

当导入一个与现有本能匹配的本能时：

* **置信度高的胜出**：保留置信度更高的那个
* **合并证据**：合并观察计数
* **更新时间戳**：标记为最近已验证

### 针对冲突

当导入一个与现有本能相矛盾的本能时：

* **默认跳过**：不导入冲突的本能
* **标记待审**：将两者都标记为需要注意
* **手动解决**：由用户决定保留哪个

## 来源追踪

导入的本能被标记为：

```yaml
source: "inherited"
imported_from: "team-instincts.yaml"
imported_at: "2025-01-22T10:30:00Z"
original_source: "session-observation"  # or "repo-analysis"
```

## 技能创建器集成

从技能创建器导入时：

```
/instinct-import --from-skill-creator acme/webapp
```

这会获取从仓库分析生成的本能：

* 来源：`repo-analysis`
* 更高的初始置信度（0.7+）
* 链接到源仓库

## 标志

* `--dry-run`：预览而不导入
* `--force`：即使存在冲突也导入
* `--merge-strategy <higher|local|import>`：如何处理重复项
* `--from-skill-creator <owner/repo>`：从技能创建器分析导入
* `--min-confidence <n>`：仅导入高于阈值的本能

## 输出

导入后：

```
✅ Import complete!

Added: 8 instincts
Updated: 1 instinct
Skipped: 3 instincts (2 duplicates, 1 conflict)

New instincts saved to: ~/.claude/homunculus/instincts/inherited/

Run /instinct-status to see all instincts.
```
