---
description: claude-devfleet 技能的旧版斜杠入口垫片。建议直接使用该技能。
---

# DevFleet（旧版兼容层）

仅当您仍调用 `/devfleet` 时使用此文件。维护中的工作流位于 `skills/claude-devfleet/SKILL.md`。

## 规范接口

* 优先直接使用 `claude-devfleet` 技能。
* 在命令优先用法退役期间，仅保留此文件作为兼容性入口点。

## 参数

`$ARGUMENTS`

## 委托

应用 `claude-devfleet` 技能。

* 根据用户描述制定计划，展示DAG图，并在获得批准后再执行任务（除非用户已明确要求继续）。
* 对于长时间任务，优先使用轮询状态而非阻塞等待。
* 从结构化任务报告中报告任务ID、变更文件、失败信息及后续步骤。
