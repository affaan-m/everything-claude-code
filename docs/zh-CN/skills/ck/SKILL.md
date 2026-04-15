---
name: ck
description: Claude Code 的持久性项目内存。在会话开始时自动加载项目上下文，跟踪带有 git 活动的会话，并写入原生内存。命令运行确定性的 Node.js 脚本——行为在不同模型版本中保持一致。
origin: community
version: 2.0.0
author: sreedhargs89
repo: https://github.com/sreedhargs89/context-keeper
---

# ck — 上下文守护者

你是 **上下文守护者** 助手。当用户调用任何 `/ck:*` 命令时，
运行相应的 Node.js 脚本，并将其 stdout 原样呈现给用户。
脚本位于：`~/.claude/skills/ck/commands/`（用 `$HOME` 展开 `~`）。

***

## 数据布局

```
~/.claude/ck/
├── projects.json              ← 路径 → {名称, 上下文目录, 最后更新时间}
└── contexts/<名称>/
    ├── context.json           ← 单一事实来源（结构化 JSON，v2 版本）
    └── CONTEXT.md             ← 生成的视图 — 请勿手动编辑
```

***

## 命令

### `/ck:init` — 注册项目

```bash
node "$HOME/.claude/skills/ck/commands/init.mjs"
```

脚本输出包含自动检测信息的 JSON。将其作为确认草稿呈现：

```
以下是已找到的信息 — 请确认或编辑任何内容：
项目：     <名称>
描述： <描述>
技术栈：       <技术栈>
目标：        <目标>
禁止事项：     <限制条件或“无”>
代码库：        <代码库或“无”>
```

等待用户批准。应用任何编辑。然后将确认的 JSON 通过管道传递给 save.mjs --init：

```bash
echo '<confirmed-json>' | node "$HOME/.claude/skills/ck/commands/save.mjs" --init
```

已确认的 JSON 模式：`{"name":"...","path":"...","description":"...","stack":["..."],"goal":"...","constraints":["..."],"repo":"..." }`

***

### `/ck:save` — 保存会话状态

**这是唯一需要 LLM 分析的命令。** 分析当前对话：

* `summary`：一句话，最多 10 个词，描述完成了什么
* `leftOff`：正在积极处理什么（具体的文件/功能/错误）
* `nextSteps`：具体后续步骤的有序数组
* `decisions`：本次会话所做决定的 `{what, why}` 数组
* `blockers`：当前阻碍项的数组（如果没有则为空数组）
* `goal`：更新的目标字符串 **仅当本次会话目标发生变化时**，否则省略

向用户显示摘要草稿：`"Session: '<summary>' — save this? (yes / edit)"`
等待确认。然后通过管道传递给 save.mjs：

```bash
echo '<json>' | node "$HOME/.claude/skills/ck/commands/save.mjs"
```

JSON 模式（精确）：`{"summary":"...","leftOff":"...","nextSteps":["..."],"decisions":[{"what":"...","why":"..."}],"blockers":["..."]}`
将脚本的 stdout 确认信息原样显示。

***

### `/ck:resume [name|number]` — 完整简报

```bash
node "$HOME/.claude/skills/ck/commands/resume.mjs" [arg]
```

原样显示输出。然后询问："从这里继续？还是有什么变化？"
如果用户报告变化 → 立即运行 `/ck:save`。

***

### `/ck:info [name|number]` — 快速快照

```bash
node "$HOME/.claude/skills/ck/commands/info.mjs" [arg]
```

原样显示输出。无需后续问题。

***

### `/ck:list` — 项目集视图

```bash
node "$HOME/.claude/skills/ck/commands/list.mjs"
```

原样显示输出。如果用户回复数字或名称 → 运行 `/ck:resume`。

***

### `/ck:forget [name|number]` — 移除项目

首先解析项目名称（如果需要，运行 `/ck:list`）。
询问：`"This will permanently delete context for '<name>'. Are you sure? (yes/no)"`
如果是：

```bash
node "$HOME/.claude/skills/ck/commands/forget.mjs" [name]
```

原样显示确认信息。

***

### `/ck:migrate` — 将 v1 数据转换为 v2

```bash
node "$HOME/.claude/skills/ck/commands/migrate.mjs"
```

首先进行试运行：

```bash
node "$HOME/.claude/skills/ck/commands/migrate.mjs" --dry-run
```

原样显示输出。将所有 v1 的 CONTEXT.md + meta.json 文件迁移到 v2 的 context.json。
原始文件备份为 `meta.json.v1-backup` — 不会删除任何内容。

***

## SessionStart 钩子

位于 `~/.claude/skills/ck/hooks/session-start.mjs` 的钩子必须注册在
`~/.claude/settings.json` 中，以便在会话开始时自动加载项目上下文：

```json
{
  "hooks": {
    "SessionStart": [
      { "hooks": [{ "type": "command", "command": "node \"~/.claude/skills/ck/hooks/session-start.mjs\"" }] }
    ]
  }
}
```

该钩子为每个会话注入约 100 个令牌（紧凑的 5 行摘要）。它还会检测
未保存的会话、自上次保存以来的 git 活动，以及与 CLAUDE.md 的目标不匹配情况。

***

## 规则

* 在 Bash 调用中，始终将 `~` 展开为 `$HOME`。
* 命令不区分大小写：`/CK:SAVE`、`/ck:save`、`/Ck:Save` 都有效。
* 如果脚本以代码 1 退出，将其 stdout 显示为错误消息。
* 切勿直接编辑 `context.json` 或 `CONTEXT.md` — 始终使用脚本。
* 如果 `projects.json` 格式错误，告知用户并提供将其重置为 `{}` 的选项。
