---
name: continuous-learning-v2
description: 基于本能的学习系统，通过钩子观察会话，创建具有置信度评分的原子本能，并将其演化为技能/命令/代理。
version: 2.0.0
---

# 持续学习 v2 - 基于本能的架构

一个高级学习系统，通过原子化的“本能”——带有置信度评分的小型习得行为——将你的 Claude Code 会话转化为可重用的知识。

## v2 的新特性

| 特性 | v1 | v2 |
|---------|----|----|
| 观察 | 停止钩子（会话结束） | 工具使用前/后（100% 可靠） |
| 分析 | 主上下文 | 后台代理（Haiku） |
| 粒度 | 完整技能 | 原子化的“本能” |
| 置信度 | 无 | 0.3-0.9 加权 |
| 演进 | 直接到技能 | 本能 → 聚类 → 技能/命令/代理 |
| 共享 | 无 | 导出/导入本能 |

## 本能模型

一个本能是一个小型习得行为：

```yaml
---
id: prefer-functional-style
trigger: "when writing new functions"
confidence: 0.7
domain: "code-style"
source: "session-observation"
---

# Prefer Functional Style

## Action
Use functional patterns over classes when appropriate.

## Evidence
- Observed 5 instances of functional pattern preference
- User corrected class-based approach to functional on 2025-01-15
```

**属性：**

* **原子性** — 一个触发条件，一个动作
* **置信度加权** — 0.3 = 尝试性的，0.9 = 近乎确定
* **领域标记** — 代码风格、测试、git、调试、工作流等
* **证据支持** — 追踪是哪些观察创建了它

## 工作原理

```
Session Activity
      │
      │ Hooks capture prompts + tool use (100% reliable)
      ▼
┌─────────────────────────────────────────┐
│         observations.jsonl              │
│   (prompts, tool calls, outcomes)       │
└─────────────────────────────────────────┘
      │
      │ Observer agent reads (background, Haiku)
      ▼
┌─────────────────────────────────────────┐
│          PATTERN DETECTION              │
│   • User corrections → instinct         │
│   • Error resolutions → instinct        │
│   • Repeated workflows → instinct       │
└─────────────────────────────────────────┘
      │
      │ Creates/updates
      ▼
┌─────────────────────────────────────────┐
│         instincts/personal/             │
│   • prefer-functional.md (0.7)          │
│   • always-test-first.md (0.9)          │
│   • use-zod-validation.md (0.6)         │
└─────────────────────────────────────────┘
      │
      │ /evolve clusters
      ▼
┌─────────────────────────────────────────┐
│              evolved/                   │
│   • commands/new-feature.md             │
│   • skills/testing-workflow.md          │
│   • agents/refactor-specialist.md       │
└─────────────────────────────────────────┘
```

## 快速开始

### 1. 启用观察钩子

添加到你的 `~/.claude/settings.json` 中。

**如果作为插件安装**（推荐）：

```json
{
  "hooks": {
    "PreToolUse": [{
      "matcher": "*",
      "hooks": [{
        "type": "command",
        "command": "${CLAUDE_PLUGIN_ROOT}/skills/continuous-learning-v2/hooks/observe.sh pre"
      }]
    }],
    "PostToolUse": [{
      "matcher": "*",
      "hooks": [{
        "type": "command",
        "command": "${CLAUDE_PLUGIN_ROOT}/skills/continuous-learning-v2/hooks/observe.sh post"
      }]
    }]
  }
}
```

**如果手动安装**到 `~/.claude/skills`：

```json
{
  "hooks": {
    "PreToolUse": [{
      "matcher": "*",
      "hooks": [{
        "type": "command",
        "command": "~/.claude/skills/continuous-learning-v2/hooks/observe.sh pre"
      }]
    }],
    "PostToolUse": [{
      "matcher": "*",
      "hooks": [{
        "type": "command",
        "command": "~/.claude/skills/continuous-learning-v2/hooks/observe.sh post"
      }]
    }]
  }
}
```

### 2. 初始化目录结构

Python CLI 会自动创建这些目录，但你也可以手动创建：

```bash
mkdir -p ~/.claude/homunculus/{instincts/{personal,inherited},evolved/{agents,skills,commands}}
touch ~/.claude/homunculus/observations.jsonl
```

### 3. 使用本能命令

```bash
/instinct-status     # Show learned instincts with confidence scores
/evolve              # Cluster related instincts into skills/commands
/instinct-export     # Export instincts for sharing
/instinct-import     # Import instincts from others
```

## 命令

| 命令 | 描述 |
|---------|-------------|
| `/instinct-status` | 显示所有已习得的本能及其置信度 |
| `/evolve` | 将相关本能聚类为技能/命令 |
| `/instinct-export` | 导出本能用于共享 |
| `/instinct-import <file>` | 从他人处导入本能 |

## 配置

编辑 `config.json`：

```json
{
  "version": "2.0",
  "observation": {
    "enabled": true,
    "store_path": "~/.claude/homunculus/observations.jsonl",
    "max_file_size_mb": 10,
    "archive_after_days": 7
  },
  "instincts": {
    "personal_path": "~/.claude/homunculus/instincts/personal/",
    "inherited_path": "~/.claude/homunculus/instincts/inherited/",
    "min_confidence": 0.3,
    "auto_approve_threshold": 0.7,
    "confidence_decay_rate": 0.05
  },
  "observer": {
    "enabled": true,
    "model": "haiku",
    "run_interval_minutes": 5,
    "patterns_to_detect": [
      "user_corrections",
      "error_resolutions",
      "repeated_workflows",
      "tool_preferences"
    ]
  },
  "evolution": {
    "cluster_threshold": 3,
    "evolved_path": "~/.claude/homunculus/evolved/"
  }
}
```

## 文件结构

```
~/.claude/homunculus/
├── identity.json           # Your profile, technical level
├── observations.jsonl      # Current session observations
├── observations.archive/   # Processed observations
├── instincts/
│   ├── personal/           # Auto-learned instincts
│   └── inherited/          # Imported from others
└── evolved/
    ├── agents/             # Generated specialist agents
    ├── skills/             # Generated skills
    └── commands/           # Generated commands
```

## 与技能创建器的集成

当你使用 [技能创建器 GitHub 应用](https://skill-creator.app) 时，它现在会生成**两者**：

* 传统的 SKILL.md 文件（用于向后兼容）
* 本能集合（用于 v2 学习系统）

来自仓库分析的本能带有 `source: "repo-analysis"` 标记，并包含源仓库 URL。

## 置信度评分

置信度随时间演变：

| 分数 | 含义 | 行为 |
|-------|---------|----------|
| 0.3 | 尝试性的 | 建议但不强制执行 |
| 0.5 | 中等的 | 相关时应用 |
| 0.7 | 强烈的 | 自动批准应用 |
| 0.9 | 近乎确定的 | 核心行为 |

**置信度增加**当：

* 模式被反复观察到
* 用户未纠正建议的行为
* 来自其他来源的相似本能一致

**置信度降低**当：

* 用户明确纠正该行为
* 长时间未观察到该模式
* 出现矛盾证据

## 为什么用钩子而非技能进行观察？

> “v1 依赖技能进行观察。技能是概率性的——它们基于 Claude 的判断，大约有 50-80% 的概率触发。”

钩子**100% 触发**，是确定性的。这意味着：

* 每次工具调用都被观察到
* 不会错过任何模式
* 学习是全面的

## 向后兼容性

v2 与 v1 完全兼容：

* 现有的 `~/.claude/skills/learned/` 技能仍然有效
* 停止钩子仍然运行（但现在也输入到 v2）
* 渐进式迁移路径：并行运行两者

## 隐私

* 观察数据**保留在**你的本地机器上
* 只有**本能**（模式）可以被导出
* 不会共享实际的代码或对话内容
* 你控制导出的内容

## 相关链接

* [技能创建器](https://skill-creator.app) - 从仓库历史生成本能
* [Homunculus](https://github.com/humanplane/homunculus) - v2 架构的灵感来源
* [长文指南](https://x.com/affaanmustafa/status/2014040193557471352) - 持续学习部分

***

*基于本能的学习：一次一个观察，教会 Claude 你的模式。*
