# Dev Server Management

## Windows (PM2)

### 初始化

```bash
/everything-claude-code:pm2 init
```

生成 `ecosystem.config.cjs` + 项目级命令。

### 命令

| 命令 | 作用 |
|------|------|
| `/pm2-all` | 启动所有 + monit |
| `/pm2-all-stop` | 停止所有 |
| `/pm2-all-restart` | 重启所有 |
| `/pm2-{port}` | 启动单个 + 日志 |
| `/pm2-{port}-stop` | 停止单个 |
| `/pm2-{port}-restart` | 重启单个 |
| `/pm2-logs` | 查看日志 |
| `/pm2-status` | 查看状态 |

### 手动命令

```bash
pm2 start ecosystem.config.cjs
pm2 logs / pm2 monit
pm2 stop all && pm2 delete all
```

## Linux/macOS (tmux)

```bash
tmux new-session -d -s dev "pnpm dev"
tmux attach -t dev
tmux kill-session -t dev
```

## CC 自动调用

当 CC 需要启动/管理服务时，直接使用 PM2 命令（不开窗口）：

| 场景 | 命令 |
|------|------|
| 启动所有 | `pm2 start ecosystem.config.cjs` |
| 启动单个 | `pm2 start ecosystem.config.cjs --only {name}` |
| 重启 | `pm2 restart all` 或 `pm2 restart {name}` |
| 停止 | `pm2 stop all` 或 `pm2 stop {name}` |
| 检查状态 | `pm2 list` |
| 查看日志 | `pm2 logs --lines 50 --nostream` |

**IMPORTANT**：
- CC 运行 `pnpm dev` 会被 hook 阻止，必须用 PM2
- 无 `ecosystem.config.cjs` 时，先运行 `/everything-claude-code:pm2 init`
- CC 不需要打开窗口，直接后台运行即可

## IMPORTANT

| 项目 | 正确做法 |
|------|----------|
| 配置文件 | `.cjs` 扩展名 |
| Node.js | 直接指定 bin 路径 + interpreter |
| Python | start.cjs 包装 + windowsHide |
| 打开窗口 | .ps1 + wt.exe |
| 后台执行 | 命令末尾 `&` |
