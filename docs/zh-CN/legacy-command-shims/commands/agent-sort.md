---
description: 用于 agent-sort 技能的旧版斜杠入口填充程序。建议直接使用该技能。
---

# 代理分类（旧版兼容层）

仅当您仍调用 `/agent-sort` 时使用此功能。维护的工作流位于 `skills/agent-sort/SKILL.md`。

## 标准接口

* 优先直接使用 `agent-sort` 技能。
* 保留此文件仅作为兼容性入口点。

## 参数

`$ARGUMENTS`

## 委派

应用 `agent-sort` 技能。

* 使用具体仓库证据对 ECC 表面进行分类。
* 将结果限定为 DAILY 或 LIBRARY。
* 若后续需要安装变更，请转交至 `configure-ecc`，而非在此重新实现安装逻辑。
