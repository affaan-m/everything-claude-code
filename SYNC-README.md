# Everything Claude Code - 本地同步管理

本目录用于管理 everything-claude-code 插件的本地自定义和上游同步。

## 分支结构

- `main` - 跟踪上游 (upstream/main)
- `local` - 本地自定义分支 (当前工作分支)

## 快速使用

```bash
cd D:\ai\mcc

# 查看上游有哪些更新
./sync-tools.sh status

# 查看文件差异
./sync-tools.sh diff

# 更新指定文件
./sync-tools.sh update-file agents/planner.md

# 更新指定目录
./sync-tools.sh update-dir skills/security-review/

# 交互式选择更新
./sync-tools.sh update

# 同步到 Claude Code 插件目录
./sync-tools.sh deploy
```

## 手动 Git 操作

```bash
# 获取上游更新
git fetch upstream

# 查看上游新提交
git log HEAD..upstream/main --oneline

# 查看某个提交改了什么
git show <commit-hash> --stat

# Cherry-pick 特定提交
git cherry-pick <commit-hash>

# 从上游获取特定文件
git checkout upstream/main -- path/to/file

# 合并上游 (会有冲突需要手动解决)
git merge upstream/main
```

## 目录说明

```
D:\ai\mcc\
├── agents/          # AI Agent 定义
├── commands/        # 命令定义
├── skills/          # 技能包
├── rules/           # 全局规则
├── hooks/           # Hook 配置
├── scripts/         # 脚本
├── sync-tools.sh    # 同步工具
└── SYNC-README.md   # 本文件
```

## 工作流程

1. **查看更新**: `./sync-tools.sh status`
2. **选择性更新**: `./sync-tools.sh update-file <path>`
3. **本地测试**: 在此目录测试修改
4. **部署**: `./sync-tools.sh deploy`
5. **重启 Claude Code**: 加载更新
