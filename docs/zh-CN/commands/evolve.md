---
name: evolve
description: 将相关本能聚类为技能、命令或代理
command: true
---

# Evolve 命令

## 实现方式

使用插件根路径运行 instinct CLI：

```bash
python3 "${CLAUDE_PLUGIN_ROOT}/skills/continuous-learning-v2/scripts/instinct-cli.py" evolve [--generate]
```

或者如果 `CLAUDE_PLUGIN_ROOT` 未设置（手动安装）：

```bash
python3 ~/.claude/skills/continuous-learning-v2/scripts/instinct-cli.py evolve [--generate]
```

分析本能并将相关的本能聚合成更高层次的结构：

* **命令**：当本能描述用户调用的操作时
* **技能**：当本能描述自动触发的行为时
* **代理**：当本能描述复杂的、多步骤的流程时

## 使用方法

```
/evolve                    # Analyze all instincts and suggest evolutions
/evolve --domain testing   # Only evolve instincts in testing domain
/evolve --dry-run          # Show what would be created without creating
/evolve --threshold 5      # Require 5+ related instincts to cluster
```

## 演化规则

### → 命令（用户调用）

当本能描述用户会明确请求的操作时：

* 多个关于“当用户要求...”的本能
* 触发器类似“当创建新的 X 时”的本能
* 遵循可重复序列的本能

示例：

* `new-table-step1`: "当添加数据库表时，创建迁移"
* `new-table-step2`: "当添加数据库表时，更新模式"
* `new-table-step3`: "当添加数据库表时，重新生成类型"

→ 创建：`/new-table` 命令

### → 技能（自动触发）

当本能描述应该自动发生的行为时：

* 模式匹配触发器
* 错误处理响应
* 代码风格强制执行

示例：

* `prefer-functional`: "当编写函数时，优先使用函数式风格"
* `use-immutable`: "当修改状态时，使用不可变模式"
* `avoid-classes`: "当设计模块时，避免基于类的设计"

→ 创建：`functional-patterns` 技能

### → 代理（需要深度/隔离）

当本能描述复杂的、多步骤的、受益于隔离的流程时：

* 调试工作流
* 重构序列
* 研究任务

示例：

* `debug-step1`: "当调试时，首先检查日志"
* `debug-step2`: "当调试时，隔离故障组件"
* `debug-step3`: "当调试时，创建最小复现"
* `debug-step4`: "当调试时，用测试验证修复"

→ 创建：`debugger` 代理

## 操作步骤

1. 从 `~/.claude/homunculus/instincts/` 读取所有本能
2. 按以下方式对本能进行分组：
   * 领域相似性
   * 触发器模式重叠
   * 操作序列关联性
3. 对于每个包含 3 个以上相关本能的集群：
   * 确定演化类型（命令/技能/代理）
   * 生成相应的文件
   * 保存到 `~/.claude/homunculus/evolved/{commands,skills,agents}/`
4. 将演化后的结构链接回源本能

## 输出格式

```
🧬 Evolve Analysis
==================

Found 3 clusters ready for evolution:

## Cluster 1: Database Migration Workflow
Instincts: new-table-migration, update-schema, regenerate-types
Type: Command
Confidence: 85% (based on 12 observations)

Would create: /new-table command
Files:
  - ~/.claude/homunculus/evolved/commands/new-table.md

## Cluster 2: Functional Code Style
Instincts: prefer-functional, use-immutable, avoid-classes, pure-functions
Type: Skill
Confidence: 78% (based on 8 observations)

Would create: functional-patterns skill
Files:
  - ~/.claude/homunculus/evolved/skills/functional-patterns.md

## Cluster 3: Debugging Process
Instincts: debug-check-logs, debug-isolate, debug-reproduce, debug-verify
Type: Agent
Confidence: 72% (based on 6 observations)

Would create: debugger agent
Files:
  - ~/.claude/homunculus/evolved/agents/debugger.md

---
Run `/evolve --execute` to create these files.
```

## 标志

* `--execute`: 实际创建演化后的结构（默认为预览）
* `--dry-run`: 仅预览而不创建
* `--domain <name>`: 仅演化指定领域的本能
* `--threshold <n>`: 形成集群所需的最小本能数（默认：3）
* `--type <command|skill|agent>`: 仅创建指定类型

## 生成的文件格式

### 命令

```markdown
---
name: new-table
description: Create a new database table with migration, schema update, and type generation
command: /new-table
evolved_from:
  - new-table-migration
  - update-schema
  - regenerate-types
---

# 新建数据表命令

[基于集群本能生成的内容]

## 步骤
1. ...
2. ...

```

### 技能

```markdown
---
name: functional-patterns
description: 强制执行函数式编程模式
evolved_from:
  - prefer-functional
  - use-immutable
  - avoid-classes
---

# 函数式模式技能

[基于聚类本能生成的内容]

```

### 代理

```markdown
---
name: debugger
description: 系统性调试代理
model: sonnet
evolved_from:
  - debug-check-logs
  - debug-isolate
  - debug-reproduce
---

# 调试器代理

[基于聚类本能生成的内容]

```
