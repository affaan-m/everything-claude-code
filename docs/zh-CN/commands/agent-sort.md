---
description: 用于agent-sort技能的旧版斜杠入口垫片。建议直接使用该技能。
---

# Agent Sort（旧版兼容层）

仅当您仍调用 `/agent-sort` 时使用此工作流。维护中的工作流位于 `skills/agent-sort/SKILL.md`。

## 规范使用方式

* 首选直接使用 `agent-sort` 技能。
* 仅将此文件保留为兼容性入口点。

## 参数

`$ARGUMENTS`

## 委托处理

应用 `agent-sort` 技能。

* 依据具体的仓库证据对 ECC 表面进行分类。
* 将结果限定为 DAILY 与 LIBRARY。
* 若后续需要安装变更，请转交给 `configure-ecc`，而非在此处重新实现安装逻辑。
