---
description: 文档查找技能的旧版斜杠入口填充程序。建议直接使用该技能。
---

# Docs 命令（旧版兼容层）

仅在你仍使用 `/docs` 时使用此命令。维护的工作流位于 `skills/documentation-lookup/SKILL.md`。

## 规范接口

* 优先直接使用 `documentation-lookup` 技能。
* 仅将此文件保留为兼容性入口点。

## 参数

`$ARGUMENTS`

## 委托

应用 `documentation-lookup` 技能。

* 如果缺少库或问题，请询问缺失部分。
* 通过 Context7 使用实时文档，而非训练数据。
* 仅返回当前答案及所需的最小代码/示例接口。
