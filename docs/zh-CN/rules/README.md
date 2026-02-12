# 规则

## 结构

规则被组织为一个**通用**层加上**语言特定**的目录：

```
rules/
├── common/          # Language-agnostic principles (always install)
│   ├── coding-style.md
│   ├── git-workflow.md
│   ├── testing.md
│   ├── performance.md
│   ├── patterns.md
│   ├── hooks.md
│   ├── agents.md
│   └── security.md
├── typescript/      # TypeScript/JavaScript specific
├── python/          # Python specific
└── golang/          # Go specific
```

* **common/** 包含通用原则 —— 没有语言特定的代码示例。
* **语言目录** 通过框架特定的模式、工具和代码示例来扩展通用规则。每个文件都引用其对应的通用文件。

## 安装

### 选项 1：安装脚本（推荐）

```bash
# Install common + one or more language-specific rule sets
./install.sh typescript
./install.sh python
./install.sh golang

# Install multiple languages at once
./install.sh typescript python
```

### 选项 2：手动安装

> **重要提示：** 复制整个目录 —— 不要使用 `/*` 将其扁平化。
> 通用目录和语言特定目录包含同名的文件。
> 将它们扁平化到一个目录会导致语言特定的文件覆盖通用规则，并破坏语言特定文件使用的相对 `../common/` 引用。

```bash
# Install common rules (required for all projects)
cp -r rules/common ~/.claude/rules/common

# Install language-specific rules based on your project's tech stack
cp -r rules/typescript ~/.claude/rules/typescript
cp -r rules/python ~/.claude/rules/python
cp -r rules/golang ~/.claude/rules/golang

# Attention ! ! ! Configure according to your actual project requirements; the configuration here is for reference only.
```

## 规则与技能

* **规则** 定义广泛适用的标准、约定和检查清单（例如，“80% 的测试覆盖率”、“没有硬编码的密钥”）。
* **技能**（`skills/` 目录）为特定任务提供深入、可操作的参考材料（例如，`python-patterns`，`golang-testing`）。

语言特定的规则文件会在适当的地方引用相关的技能。规则告诉你*要做什么*；技能告诉你*如何去做*。

## 添加新语言

要添加对新语言的支持（例如，`rust/`）：

1. 创建一个 `rules/rust/` 目录
2. 添加扩展通用规则的文件：
   * `coding-style.md` —— 格式化工具、习惯用法、错误处理模式
   * `testing.md` —— 测试框架、覆盖率工具、测试组织
   * `patterns.md` —— 语言特定的设计模式
   * `hooks.md` —— 用于格式化工具、代码检查器、类型检查器的 PostToolUse 钩子
   * `security.md` —— 密钥管理、安全扫描工具
3. 每个文件应以以下内容开头：
   ```
   > 此文件通过 <语言> 特定内容扩展了 [common/xxx.md](../common/xxx.md)。
   ```
4. 如果现有技能可用，则引用它们，或者在 `skills/` 下创建新的技能。
