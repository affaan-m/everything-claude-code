---
name: safety-guard
description: 使用此技能可在生产系统上工作或自主运行代理时防止破坏性操作。
origin: ECC
---

# 安全防护 — 防止破坏性操作

## 使用时机

* 在生产系统上工作时
* 当代理程序自主运行时（全自动模式）
* 当您希望将编辑限制在特定目录时
* 在敏感操作期间（迁移、部署、数据变更）

## 工作原理

三种防护模式：

### 模式 1：谨慎模式

在执行前拦截破坏性命令并发出警告：

```
监控模式：
- rm -rf（特别是针对 /、~ 或项目根目录）
- git push --force
- git reset --hard
- git checkout .（丢弃所有更改）
- DROP TABLE / DROP DATABASE
- docker system prune
- kubectl delete
- chmod 777
- sudo rm
- npm publish（意外发布）
- 任何带有 --no-verify 参数的命令
```

检测到时：显示命令的作用，请求确认，建议更安全的替代方案。

### 模式 2：冻结模式

将文件编辑锁定到特定的目录树：

```
/safety-guard freeze src/components/
```

任何在 `src/components/` 之外的写入/编辑操作都会被阻止并给出解释。当您希望代理专注于某个区域而不触及无关代码时非常有用。

### 模式 3：防护模式（谨慎 + 冻结组合）

两种防护同时生效。为自主代理提供最大安全性。

```
/safety-guard guard --dir src/api/ --allow-read-all
```

代理可以读取任何内容，但只能写入到 `src/api/`。破坏性命令在所有地方都会被阻止。

### 解锁

```
/safety-guard off
```

## 实现方式

使用 PreToolUse 钩子来拦截 Bash、Write、Edit 和 MultiEdit 工具调用。在执行前根据活动规则检查命令/路径。

## 集成

* 默认对 `codex -a never` 会话启用
* 与 ECC 2.0 中的可观测性风险评分配对使用
* 将所有被阻止的操作记录到 `~/.claude/safety-guard.log`
