---
description: 用于nanoclaw-repl技能的旧版斜杠入口垫片。建议直接使用该技能。
---

# Claw 命令（旧版适配层）

仅在出于肌肉记忆仍想使用 `/claw` 时使用此命令。维护中的实现位于 `skills/nanoclaw-repl/SKILL.md`。

## 规范使用方式

* 优先直接使用 `nanoclaw-repl` 技能。
* 仅将此文件作为兼容性入口点保留，同时逐步淘汰命令优先的使用方式。

## 参数

`$ARGUMENTS`

## 委托处理

应用 `nanoclaw-repl` 技能，并将响应重点放在操作或扩展 `scripts/claw.js` 上。

* 如果用户想要运行它，使用 `node scripts/claw.js` 或 `npm run claw`。
* 如果用户想要扩展它，请保持其零依赖和基于 Markdown 的会话模型。
* 如果请求实际上是关于长期运行编排而非 NanoClaw 本身，则重定向到 `dmux-workflows` 或 `autonomous-agent-harness`。
