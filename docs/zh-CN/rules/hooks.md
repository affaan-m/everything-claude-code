# Hooks 系统

## Hook 类型

* **PreToolUse**：工具执行前（验证、参数修改）
* **PostToolUse**：工具执行后（自动格式化、检查）
* **Stop**：会话结束时（最终验证）

## 当前 Hooks（位于 ~/.claude/settings.json）

### PreToolUse

* **tmux 提醒**：建议对长时间运行的命令（npm、pnpm、yarn、cargo 等）使用 tmux
* **git push 审查**：推送前在 Zed 中打开进行审查
* **文档拦截器**：阻止创建不必要的 .md/.txt 文件

### PostToolUse

* **PR 创建**：记录 PR URL 和 GitHub Actions 状态
* **Prettier**：编辑后自动格式化 JS/TS 文件
* **TypeScript 检查**：编辑 .ts/.tsx 文件后运行 tsc
* **console.log 警告**：警告编辑的文件中存在 console.log

### Stop

* **console.log 审计**：会话结束前检查所有修改的文件中是否存在 console.log

## 自动接受权限

谨慎使用：

* 为受信任、定义明确的计划启用
* 为探索性工作禁用
* 切勿使用 dangerously-skip-permissions 标志
* 改为在 `~/.claude.json` 中配置 `allowedTools`

## TodoWrite 最佳实践

使用 TodoWrite 工具来：

* 跟踪多步骤任务的进度
* 验证对指令的理解
* 实现实时指导
* 展示详细的实现步骤

待办事项列表可揭示：

* 步骤顺序错误
* 缺失的项目
* 额外不必要的项目
* 粒度错误
* 对需求的理解有误
