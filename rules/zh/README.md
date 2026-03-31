# 规则

## 结构

规则按**通用**层和**语言特定**目录组织：

```
rules/
├── common/          # 语言无关的原则（始终安装）
│   ├── coding-style.md
│   ├── git-workflow.md
│   ├── testing.md
│   ├── performance.md
│   ├── patterns.md
│   ├── hooks.md
│   ├── agents.md
│   ├── security.md
│   ├── code-review.md
│   └── development-workflow.md
├── zh/              # 中文翻译版本
│   ├── coding-style.md
│   ├── git-workflow.md
│   ├── testing.md
│   ├── performance.md
│   ├── patterns.md
│   ├── hooks.md
│   ├── agents.md
│   ├── security.md
│   ├── code-review.md
│   └── development-workflow.md
├── typescript/      # TypeScript/JavaScript 特定
├── python/          # Python 特定
├── golang/          # Go 特定
├── swift/           # Swift 特定
└── php/             # PHP 特定
```

- **common/** 包含通用原则 — 无语言特定的代码示例。
- **zh/** 包含 common 目录的中文翻译版本。
- **语言目录** 扩展通用规则，包含框架特定的模式、工具和代码示例。每个文件引用其对应的通用版本。

## 安装

### 选项 1：安装脚本（推荐）

```bash
# 安装通用 + 一个或多个语言特定的规则集
./install.sh typescript
./install.sh python
./install.sh golang
./install.sh swift
./install.sh php

# 同时安装多种语言
./install.sh typescript python
```

### 选项 2：手动安装

> **重要提示：** 复制整个目录 — 不要使用 `/*` 展开。
> 通用和语言特定目录包含同名文件。
> 将它们展开到一个目录会导致语言特定文件覆盖通用规则，
> 并破坏语言特定文件使用的 `../common/` 相对引用。

```bash
# 创建目标目录
mkdir -p ~/.claude/rules

# 安装通用规则（所有项目必需）
cp -r rules/common ~/.claude/rules/common

# 安装中文翻译版本（可选）
cp -r rules/zh ~/.claude/rules/zh

# 根据项目技术栈安装语言特定规则
cp -r rules/typescript ~/.claude/rules/typescript
cp -r rules/python ~/.claude/rules/python
cp -r rules/golang ~/.claude/rules/golang
cp -r rules/swift ~/.claude/rules/swift
cp -r rules/php ~/.claude/rules/php
```

## 规则 vs 技能

- **规则** 定义广泛适用的标准、约定和检查清单（如"80% 测试覆盖率"、"禁止硬编码密钥"）。
- **技能**（`skills/` 目录）为特定任务提供深入、可操作的参考材料（如 `python-patterns`、`golang-testing`）。

语言特定的规则文件在适当的地方引用相关技能。规则告诉你*做什么*；技能告诉你*怎么做*。

## 规则优先级

当语言特定规则与通用规则冲突时，**语言特定规则优先**（特定覆盖通用）。这遵循标准的分层配置模式（类似于 CSS 特异性或 `.gitignore` 优先级）。

- `rules/common/` 定义适用于所有项目的通用默认值。
- `rules/golang/`、`rules/python/`、`rules/swift/`、`rules/php/`、`rules/typescript/` 等在语言习惯不同时覆盖这些默认值。
- `rules/zh/` 是通用规则的中文翻译，与英文版本内容一致。

### 示例

`common/coding-style.md` 推荐不可变性作为默认原则。语言特定的 `golang/coding-style.md` 可以覆盖这一点：

> 惯用的 Go 使用指针接收器进行结构体变更 — 参见 [common/coding-style.md](../common/coding-style.md) 了解通用原则，但这里首选符合 Go 习惯的变更方式。

### 带覆盖说明的通用规则

`rules/common/` 中可能被语言特定文件覆盖的规则会被标记：

> **语言说明**：此规则可能会被语言特定规则覆盖；对于某些语言，该模式可能并不符合惯用写法。
