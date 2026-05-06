---
description: 检查活动循环状态、进度、故障信号以及建议的干预措施。
---

# 循环状态命令

检查活动循环状态、进度和故障信号。

此斜杠命令仅在当前会话将其出队后才能运行。如需检查卡住或兄弟会话，请从另一个终端运行打包的 CLI：

```bash
npx --package ecc-universal ecc loop-status --json
```

CLI 会扫描 `~/.claude/projects/**` 下的本地 Claude 转录 JSONL 文件，并报告没有匹配 `tool_result` 的过期 `ScheduleWakeup` 调用或 `Bash` 工具调用。

## 用法

`/loop-status [--watch]`

## 报告内容

* 活动循环模式
* 当前阶段和最后一个成功的检查点
* 失败的检查（如果有）
* 预计的时间/成本偏差
* 建议的干预措施（继续/暂停/停止）

## 跨会话 CLI

* `ecc loop-status --json` 输出近期本地 Claude 转录的机器可读状态。
* `ecc loop-status --home <dir>` 在检查其他本地配置文件或挂载的工作区时扫描不同的主目录。
* `ecc loop-status --transcript <session.jsonl>` 直接检查单个转录。
* `ecc loop-status --bash-timeout-seconds 1800` 调整过期的 Bash 阈值。
* `ecc loop-status --exit-code` 在发现过期循环或工具信号时以 `2` 退出，或在无法扫描转录时以 `1` 退出。
* `--exit-code` 与 `--watch` 配合使用时需要 `--watch-count`，以便看门狗脚本不会无限等待进程退出。
* `ecc loop-status --watch` 持续刷新状态直至中断。
* `ecc loop-status --watch --watch-count 3 --exit-code` 刷新有限次数后退出，并返回所见最高状态。
* `ecc loop-status --watch --watch-count 3` 为脚本和交接输出有限次数的监控流。
* `ecc loop-status --watch --write-dir ~/.claude/loops` 维护 `index.json` 和每个会话的 JSON 快照，供兄弟终端或看门狗脚本使用。

## 监视模式

当存在 `--watch` 时，定期刷新状态。使用 `--json` 时，每次刷新输出一行 JSON 对象，供其他终端或脚本消费。

## 快照文件

当独立进程需要检查循环状态而不等待当前 Claude 会话将 `/loop-status` 出队时，请使用 `--write-dir <dir>`。CLI 会写入：

* `index.json`，每行对应一个被检查的会话。
* `<session-id>.json`，包含该会话的完整状态负载。

这些文件是本地转录分析的快照。它们不会控制或超时 Claude Code 运行时的工具调用。

## 参数

$ARGUMENTS:

* `--watch` 可选
