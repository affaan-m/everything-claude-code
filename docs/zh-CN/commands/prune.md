---
name: prune
description: 删除超过30天且从未被提升的待处理本能
command: true
---

# 清理待处理本能

移除已过期、自动生成但从未被审核或提升的待处理本能。

## 实施步骤

使用插件根路径运行本能 CLI：

```bash
python3 "${CLAUDE_PLUGIN_ROOT}/skills/continuous-learning-v2/scripts/instinct-cli.py" prune
```

或者如果未设置 `CLAUDE_PLUGIN_ROOT`（手动安装）：

```bash
python3 ~/.claude/skills/continuous-learning-v2/scripts/instinct-cli.py prune
```

## 使用方法

```
/prune                    # 删除超过 30 天的本能记录
/prune --max-age 60      # 自定义时间阈值（天）
/prune --dry-run         # 预览而不删除
```
