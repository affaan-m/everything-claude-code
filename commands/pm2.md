# PM2 初始化

PM2 初始化 - 自动分析项目生成服务命令

**命令**: `$ARGUMENTS`

---

## 执行流程

1. 检查 PM2（未安装则 `npm install -g pm2`）
2. 扫描项目识别服务（前端/后端/数据库）
3. 生成配置文件和命令

---

## 服务检测

| 类型 | 识别方式 | 默认端口 |
|------|----------|----------|
| Vite | vite.config.* | 5173 |
| Next.js | next.config.* | 3000 |
| Nuxt | nuxt.config.* | 3000 |
| CRA | react-scripts in package.json | 3000 |
| Express/Node | server/backend/api 目录 + package.json | 3000 |
| FastAPI/Flask | requirements.txt / pyproject.toml | 8000 |
| Go | go.mod / main.go | 8080 |

**端口检测优先级**：用户指定 > .env > 配置文件 > scripts 参数 > 默认端口

---

## 生成文件

```
project/
├── ecosystem.config.cjs              # PM2 配置
├── {backend}/start.cjs               # Python 包装脚本（如有）
└── .claude/
    ├── commands/pm2-*.md             # 服务命令
    └── scripts/pm2-*.ps1             # PowerShell 脚本
```

### 生成的命令

| 命令 | 作用 |
|------|------|
| `/pm2-all` | 启动所有 + 打开 monit |
| `/pm2-all-stop` | 停止所有 |
| `/pm2-all-restart` | 重启所有 |
| `/pm2-{port}` | 启动单个 + 打开日志 |
| `/pm2-{port}-stop` | 停止单个 |
| `/pm2-{port}-restart` | 重启单个 |
| `/pm2-logs` | 查看所有日志 |
| `/pm2-status` | 查看状态 |

---

## Windows 配置规范（IMPORTANT）

### ecosystem.config.cjs

**必须用 `.cjs` 扩展名**

```javascript
module.exports = {
  apps: [
    // Node.js (Vite/Next/Nuxt)
    {
      name: 'project-3000',
      cwd: './packages/web',
      script: 'node_modules/vite/bin/vite.js',  // 见下表
      args: '--port 3000',
      interpreter: 'C:/Program Files/nodejs/node.exe',
      env: { NODE_ENV: 'development' }
    },
    // Python
    {
      name: 'project-8000',
      cwd: './backend',
      script: 'start.cjs',
      interpreter: 'C:/Program Files/nodejs/node.exe',
      env: { PYTHONUNBUFFERED: '1' }
    }
  ]
}
```

**框架 script 路径：**

| 框架 | script | args |
|------|--------|------|
| Vite | `node_modules/vite/bin/vite.js` | `--port {port}` |
| Next.js | `node_modules/next/dist/bin/next` | `dev -p {port}` |
| Nuxt | `node_modules/nuxt/bin/nuxt.mjs` | `dev --port {port}` |
| Express | `src/index.js` 或 `server.js` | - |

### Python 包装脚本 (start.cjs)

```javascript
const { spawn } = require('child_process');
const proc = spawn('python', ['-m', 'uvicorn', 'app.main:app', '--host', '0.0.0.0', '--port', '8000', '--reload'], {
  cwd: __dirname, stdio: 'inherit', windowsHide: true
});
proc.on('close', (code) => process.exit(code));
```

**其他 Python 框架替换参数：**
- Flask: `['-m', 'flask', 'run', '--host', '0.0.0.0', '--port', '5000']`
- Django: `['manage.py', 'runserver', '0.0.0.0:8000']`

### 命令文件模板

启动命令（打开日志窗口）：
```bash
cd {PROJECT_ROOT} && pm2 start ecosystem.config.cjs --only {name} && wt.exe pwsh.exe -NoExit -File "{PROJECT_ROOT}/.claude/scripts/pm2-logs-{port}.ps1" &
```

停止/重启命令：
```bash
pm2 stop {name}
pm2 restart {name}
```

### PowerShell 脚本模板

```powershell
Set-Location {PROJECT_ROOT}
pm2 logs {name}  # 或 pm2 monit
```

---

## 关键规则

1. **配置文件**：`ecosystem.config.cjs`（不是 .js）
2. **Node.js**：直接指定 bin 路径 + interpreter
3. **Python**：Node.js 包装脚本 + `windowsHide: true`
4. **打开窗口**：`.ps1` + `wt.exe pwsh.exe -NoExit -File`
5. **后台执行**：命令末尾加 `&`

---

## 立即执行

根据 `$ARGUMENTS` 执行 init，生成所有配置和命令文件。
