---
name: prune
description: 删除超过30天且从未被推广的待处理直觉
command: true
---

# 清理待处理本能

移除自动生成但从未审核或升级的过期待处理本能。

## 实现方法

使用插件根路径运行本能 CLI：

```bash
python3 "${CLAUDE_PLUGIN_ROOT}/skills/continuous-learning-v2/scripts/instinct-cli.py" prune
```

如果未设置 `CLAUDE_PLUGIN_ROOT`（手动安装）：

```bash
python3 ~/.claude/skills/continuous-learning-v2/scripts/instinct-cli.py prune
```

## 使用方法

```
/prune                    # 删除超过30天的本能
/prune --max-age 60      # 自定义年龄阈值（天）
/prune --dry-run         # 预览而不删除
```
