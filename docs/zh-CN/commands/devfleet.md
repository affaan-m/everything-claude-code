---
description: 用于claude-devfleet技能的旧版斜杠入口垫片。建议直接使用该技能。
---

# DevFleet（旧版适配层）

仅在你仍调用 `/devfleet` 时使用此工作流。维护中的工作流位于 `skills/claude-devfleet/SKILL.md`。

## 规范使用方式

* 优先直接使用 `claude-devfleet` 技能。
* 仅将此文件保留为兼容性入口点，同时逐步淘汰命令优先的使用方式。

## 参数

`$ARGUMENTS`

## 委托执行

应用 `claude-devfleet` 技能。

* 根据用户描述制定计划，展示 DAG，并在派发前获取批准，除非用户已明确指示继续执行。
* 对于长时间任务，优先选择轮询状态而非阻塞等待。
* 从结构化的任务报告中汇报任务 ID、已更改的文件、失败情况以及后续步骤。
