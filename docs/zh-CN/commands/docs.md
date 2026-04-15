---
description: 用于文档查找技能的旧版斜杠入口垫片。建议直接使用该技能。
---

# Docs 命令（旧版兼容层）

仅在你仍需要使用 `/docs` 时使用此命令。维护中的工作流程位于 `skills/documentation-lookup/SKILL.md`。

## 规范使用方式

* 优先直接使用 `documentation-lookup` 技能。
* 仅将此文件保留为兼容性入口点。

## 参数

`$ARGUMENTS`

## 委托处理

应用 `documentation-lookup` 技能。

* 如果库或问题缺失，请询问缺失的部分。
* 通过 Context7 使用实时文档，而非训练数据。
* 仅返回当前答案和所需的最少代码/示例表面。
