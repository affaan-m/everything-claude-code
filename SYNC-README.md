# Everything Claude Code - 本地同步管理

## 工作流

```
GitHub 上游 → D:\ai\mcc (选择性更新) → Marketplaces (主存储) → Cache (Claude 加载)
```

## 目录职责

| 目录 | 作用 |
|------|------|
| `D:\ai\mcc` | 上游跟踪 + 选择性更新 |
| `~/.claude/plugins/marketplaces/everything-claude-code` | 主存储 (所有自定义) |
| `~/.claude/plugins/cache/.../1.2.0` | Claude 实际加载 |

## 快速使用

```bash
cd D:\ai\mcc

# 1. 查看上游更新
./sync-tools.sh status

# 2. 查看差异
./sync-tools.sh diff
./sync-tools.sh diff-file agents/planner.md

# 3. 选择性更新
./sync-tools.sh update-file skills/new-skill/SKILL.md
./sync-tools.sh update-dir skills/django-patterns/
./sync-tools.sh cherry-pick abc123

# 4. 部署到 Claude
./sync-tools.sh deploy

# 5. 重启 Claude Code
```

## 分支结构

```
* local          ← 当前工作分支 (包含所有自定义)
  main           ← 原始上游版本
  upstream/main  ← 远程上游
```

## 手动 Git 操作

```bash
# 查看某个提交改了什么
git show <hash> --stat
git show <hash> -- path/to/file

# 从上游获取多个文件
git checkout upstream/main -- file1 file2 dir/

# 合并整个上游 (谨慎，会有冲突)
git merge upstream/main
```
