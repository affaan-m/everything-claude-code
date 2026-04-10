---
name: code-tour
description: 创建 CodeTour `.tour` 文件——针对特定角色、分步进行的演练，包含真实文件和行锚点。用于入职导览、架构演练、PR 导览、RCA 导览以及结构化的“解释其工作原理”请求。
origin: ECC
---

# 代码导览

创建 **CodeTour** `.tour` 文件，用于代码库的逐步讲解，可直接打开真实文件和行范围。导览文件存放在 `.tours/` 中，专为 CodeTour 格式设计，而非临时性的 Markdown 笔记。

一个好的导览是为特定读者讲述的故事：

* 他们正在看什么
* 为什么它很重要
* 接下来他们应该遵循什么路径

仅创建 `.tour` JSON 文件。不要将此技能用于修改源代码。

## 何时使用

在以下情况使用此技能：

* 用户要求进行代码导览、入职导览、架构讲解或 PR 导览
* 用户说“解释 X 如何工作”并希望得到一个可重复使用的引导性产物
* 用户希望为新工程师或评审者提供一条快速上手的路径
* 任务更适合通过引导式序列而非扁平化摘要来完成

示例：

* 新维护者入职
* 某个服务或包的架构导览
* 以变更文件为锚点的 PR 评审逐步讲解
* 展示故障路径的根因分析导览
* 关于信任边界和关键检查的安全评审导览

## 何时不使用

| 替代代码导览的情况 | 使用 |
| --- | --- |
| 聊天中的一次性解释已足够 | 直接回答 |
| 用户需要散文式文档，而非 `.tour` 产物 | `documentation-lookup` 或仓库文档编辑 |
| 任务是实现或重构 | 执行实现工作 |
| 任务是不需要导览产物的宽泛代码库入职 | `codebase-onboarding` |

## 工作流程

### 1. 探索

在编写任何内容之前先探索仓库：

* README 和包/应用的入口点
* 文件夹结构
* 相关的配置文件
* 如果导览以 PR 为重点，则查看变更的文件

在理解代码结构之前，不要开始编写步骤。

### 2. 推断读者

根据请求决定角色和深度。

| 请求类型 | 角色 | 建议深度 |
| --- | --- | --- |
| "onboarding", "new joiner" | `new-joiner` | 9-13 步 |
| "quick tour", "vibe check" | `vibecoder` | 5-8 步 |
| "architecture" | `architect` | 14-18 步 |
| "tour this PR" | `pr-reviewer` | 7-11 步 |
| "why did this break" | `rca-investigator` | 7-11 步 |
| "security review" | `security-reviewer` | 7-11 步 |
| "explain how this feature works" | `feature-explainer` | 7-11 步 |
| "debug this path" | `bug-fixer` | 7-11 步 |

### 3. 读取并验证锚点

每个文件路径和行锚点都必须是真实的：

* 确认文件存在
* 确认行号在有效范围内
* 如果使用选择范围，请验证确切的代码块
* 如果文件易变，优先使用基于模式的锚点

切勿猜测行号。

### 4. 编写 `.tour`

编写时遵循：

```text
.tours/<persona>-<focus>.tour
```

保持路径确定性和可读性。

### 5. 验证

在完成之前：

* 每个引用的路径都存在
* 每个行或选择范围都是有效的
* 第一步锚定到真实的文件或目录
* 导览讲述的是一个连贯的故事，而非文件列表

## 步骤类型

### 内容

谨慎使用，通常仅用于结束步骤：

```json
{ "title": "Next Steps", "description": "You can now trace the request path end to end." }
```

不要将第一步设为纯内容步骤。

### 目录

用于引导读者了解模块：

```json
{ "directory": "src/services", "title": "Service Layer", "description": "The core orchestration logic lives here." }
```

### 文件 + 行

这是默认的步骤类型：

```json
{ "file": "src/auth/middleware.ts", "line": 42, "title": "Auth Gate", "description": "Every protected request passes here first." }
```

### 选择范围

当某个代码块比整个文件更重要时使用：

```json
{
  "file": "src/core/pipeline.ts",
  "selection": {
    "start": { "line": 15, "character": 0 },
    "end": { "line": 34, "character": 0 }
  },
  "title": "Request Pipeline",
  "description": "This block wires validation, auth, and downstream execution."
}
```

### 模式

当精确行号可能漂移时使用：

```json
{ "file": "src/app.ts", "pattern": "export default class App", "title": "Application Entry" }
```

### URI

在有助于理解时，用于 PR、问题或文档：

```json
{ "uri": "https://github.com/org/repo/pull/456", "title": "The PR" }
```

## 编写规则：SMIG

每个描述都应回答：

* **情境**：读者正在看什么
* **机制**：它是如何工作的
* **含义**：为什么它对当前角色很重要
* **陷阱**：聪明的读者可能会错过什么

保持描述简洁、具体，并基于实际代码。

## 叙事结构

除非任务明确需要不同的结构，否则使用以下脉络：

1. 定位
2. 模块概览
3. 核心执行路径
4. 边界情况或陷阱
5. 结束 / 下一步行动

导览应该感觉像一条路径，而不是一份清单。

## 示例

```json
{
  "$schema": "https://aka.ms/codetour-schema",
  "title": "API Service Tour",
  "description": "Walkthrough of the request path for the payments service.",
  "ref": "main",
  "steps": [
    {
      "directory": "src",
      "title": "Source Root",
      "description": "All runtime code for the service starts here."
    },
    {
      "file": "src/server.ts",
      "line": 12,
      "title": "Entry Point",
      "description": "The server boots here and wires middleware before any route is reached."
    },
    {
      "file": "src/routes/payments.ts",
      "line": 8,
      "title": "Payment Routes",
      "description": "Every payments request enters through this router before hitting service logic."
    },
    {
      "title": "Next Steps",
      "description": "You can now follow any payment request end to end with the main anchors in place."
    }
  ]
}
```

## 反模式

| 反模式 | 修正方法 |
| --- | --- |
| 扁平的文件列表 | 用步骤间的依赖关系讲述一个故事 |
| 通用描述 | 命名具体的代码路径或模式 |
| 猜测的锚点 | 首先验证每个文件和行 |
| 快速导览步骤过多 | 果断删减 |
| 第一步是纯内容步骤 | 将第一步锚定到真实的文件或目录 |
| 角色不匹配 | 为实际读者编写，而非通用工程师 |

## 最佳实践

* 根据仓库大小和角色深度保持适当的步骤数量
* 使用目录步骤进行定位，使用文件步骤进行实质性讲解
* 对于 PR 导览，首先覆盖变更的文件
* 对于单体仓库，将范围限定在相关包内，而非遍历所有内容
* 以读者现在可以做什么结束，而非总结回顾

## 相关技能

* `codebase-onboarding`
* `coding-standards`
* `council`
* 官方上游格式：`microsoft/codetour`
