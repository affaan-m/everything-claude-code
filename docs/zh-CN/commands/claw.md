---
description: 启动 NanoClaw 代理 REPL —— 一个由 claude CLI 驱动的持久、会话感知的 AI 助手。
---

# Claw 命令

启动一个交互式 AI 代理会话，该会话将会话历史持久化到磁盘，并可选择加载 ECC 技能上下文。

## 使用方法

```bash
node scripts/claw.js
```

或通过 npm：

```bash
npm run claw
```

## 环境变量

| 变量 | 默认值 | 描述 |
|----------|---------|-------------|
| `CLAW_SESSION` | `default` | 会话名称（字母数字 + 连字符） |
| `CLAW_SKILLS` | *(空)* | 要加载为系统上下文的技能名称，以逗号分隔 |

## REPL 命令

在 REPL 内部，直接在提示符下输入这些命令：

```
/clear      Clear current session history
/history    Print full conversation history
/sessions   List all saved sessions
/help       Show available commands
exit        Quit the REPL
```

## 工作原理

1. 读取 `CLAW_SESSION` 环境变量以选择命名会话（默认：`default`）
2. 从 `~/.claude/claw/{session}.md` 加载会话历史
3. 可选地从 `CLAW_SKILLS` 环境变量加载 ECC 技能上下文
4. 进入一个阻塞式提示循环 —— 每条用户消息都会连同完整历史记录发送到 `claude -p`
5. 响应会被追加到会话文件中，以便在重启后保持持久性

## 会话存储

会话以 Markdown 文件形式存储在 `~/.claude/claw/` 中：

```
~/.claude/claw/default.md
~/.claude/claw/my-project.md
```

每一轮对话的格式如下：

```markdown
### [2025-01-15T10:30:00.000Z] 用户
这个函数是做什么的？
---
### [2025-01-15T10:30:05.000Z] 助手
这个函数用于计算...
---
```

## 示例

```bash
# Start default session
node scripts/claw.js

# Named session
CLAW_SESSION=my-project node scripts/claw.js

# With skill context
CLAW_SKILLS=tdd-workflow,security-review node scripts/claw.js
```
