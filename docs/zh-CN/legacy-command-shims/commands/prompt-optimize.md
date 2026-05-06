---
description: 用于提示优化器技能的旧版斜杠入口填充程序。建议直接使用该技能。
---

# 提示优化（旧版兼容层）

仅当您仍调用 `/prompt-optimize` 时使用此功能。维护的工作流位于 `skills/prompt-optimizer/SKILL.md`。

## 规范接口

* 优先直接使用 `prompt-optimizer` 技能。
* 仅将此文件保留为兼容性入口点。

## 参数

`$ARGUMENTS`

## 委托

应用 `prompt-optimizer` 技能。

* 保持仅提供建议：优化提示，不执行任务。
* 返回推荐的 ECC 组件及可立即运行的提示。
* 如果用户实际需要直接执行，请明确告知并建议其发起常规任务请求，而非停留在兼容层内。
