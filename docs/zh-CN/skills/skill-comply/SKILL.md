---
name: skill-comply
description: 可视化技能、规则和代理定义是否被实际遵循——自动生成3种提示严格度级别的场景，运行代理，对行为序列进行分类，并以完整的工具调用时间线报告合规率
origin: ECC
tools: Read, Bash
---

# skill-comply: 自动化合规性度量

通过以下方式度量编码代理是否实际遵循技能、规则或代理定义：

1. 从任何 .md 文件自动生成预期的行为序列（规范）
2. 自动生成提示严格度递减的场景（支持性 → 中立 → 竞争性）
3. 运行 `claude -p` 并通过 stream-json 捕获工具调用追踪
4. 使用 LLM（而非正则表达式）根据规范步骤对工具调用进行分类
5. 确定性地检查时间顺序
6. 生成包含规范、提示和时间线的自包含报告

## 支持的目标

* **技能** (`skills/*/SKILL.md`)：工作流技能，如搜索优先、TDD 指南
* **规则** (`rules/common/*.md`)：强制性规则，如 testing.md、security.md、git-workflow.md
* **代理定义** (`agents/*.md`)：代理是否在预期时被调用（内部工作流验证暂不支持）

## 何时激活

* 用户运行 `/skill-comply <path>`
* 用户询问“这条规则是否真的被遵循了？”
* 添加新规则/技能后，用于验证代理合规性
* 作为质量维护的一部分定期执行

## 用法

```bash
# Full run
uv run python -m scripts.run ~/.claude/rules/common/testing.md

# Dry run (no cost, spec + scenarios only)
uv run python -m scripts.run --dry-run ~/.claude/skills/search-first/SKILL.md

# Custom models
uv run python -m scripts.run --gen-model haiku --model sonnet <path>
```

## 关键概念：提示独立性

度量一项技能/规则是否被遵循，即使提示没有明确支持它。

## 报告内容

报告是自包含的，包括：

1. 预期的行为序列（自动生成的规范）
2. 场景提示（每个严格度级别下询问的内容）
3. 每个场景的合规性分数
4. 带有 LLM 分类标签的工具调用时间线

### 高级（可选）

对于熟悉钩子的用户，报告还包括针对合规性低的步骤的钩子提升建议。这是信息性的——主要价值在于合规性可见性本身。
