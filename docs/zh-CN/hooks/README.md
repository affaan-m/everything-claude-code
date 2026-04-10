# 钩子

钩子是事件驱动的自动化程序，在 Claude Code 工具执行前后触发。它们用于强制执行代码质量、及早发现错误以及自动化重复性检查。

## 钩子如何工作

```
用户请求 → Claude 选择工具 → PreToolUse 钩子运行 → 工具执行 → PostToolUse 钩子运行
```

* **PreToolUse** 钩子在工具执行前运行。它们可以**阻止**（退出码 2）或**警告**（stderr 输出但不阻止）。
* **PostToolUse** 钩子在工具完成后运行。它们可以分析输出但不能阻止执行。
* **Stop** 钩子在每次 Claude 响应后运行。
* **SessionStart/SessionEnd** 钩子在会话生命周期的边界处运行。
* **PreCompact** 钩子在上下文压缩前运行，适用于保存状态。

## 本插件中的钩子

### PreToolUse 钩子

| 钩子 | 匹配器 | 行为 | 退出码 |
|------|---------|----------|-----------|
| **开发服务器拦截器** | `Bash` | 在 tmux 外阻止 `npm run dev` 等命令 — 确保日志可访问 | 2 (阻止) |
| **Tmux 提醒器** | `Bash` | 建议对长时间运行的命令（npm test、cargo build、docker）使用 tmux | 0 (警告) |
| **Git 推送提醒器** | `Bash` | 提醒在 `git push` 前检查更改 | 0 (警告) |
| **提交前质量检查** | `Bash` | 在 `git commit` 前运行质量检查：对暂存文件进行代码检查，当通过 `-m/--message` 提供时验证提交消息格式，检测 console.log/debugger/敏感信息 | 2 (阻止关键问题) / 0 (警告) |
| **文档文件警告器** | `Write` | 警告非标准的 `.md`/`.txt` 文件（允许 README、CLAUDE、CONTRIBUTING、CHANGELOG、LICENSE、SKILL、docs/、skills/）；跨平台路径处理 | 0 (警告) |
| **策略性压缩提醒器** | `Edit\|Write` | 建议在逻辑间隔（约每 50 次工具调用）手动执行 `/compact` | 0 (警告) |

### PostToolUse 钩子

| 钩子 | 匹配器 | 功能 |
|------|---------|-------------|
| **PR 记录器** | `Bash` | 在 `gh pr create` 后记录 PR URL 和审查命令 |
| **构建分析器** | `Bash` | 构建命令后的后台分析（异步，非阻塞） |
| **质量门** | `Edit\|Write\|MultiEdit` | 编辑后运行快速质量检查 |
| **设计质量检查器** | `Edit\|Write\|MultiEdit` | 当前端编辑趋向于通用模板式 UI 时发出警告 |
| **Prettier 格式化器** | `Edit` | 编辑后使用 Prettier 自动格式化 JS/TS 文件 |
| **TypeScript 检查器** | `Edit` | 编辑 `.ts`/`.tsx` 文件后运行 `tsc --noEmit` |
| **console.log 警告器** | `Edit` | 对编辑文件中的 `console.log` 语句发出警告 |

### 生命周期钩子

| 钩子 | 事件 | 功能 |
|------|-------|-------------|
| **会话开始** | `SessionStart` | 加载先前上下文并检测包管理器 |
| **预压缩** | `PreCompact` | 在上下文压缩前保存状态 |
| **Console.log 审计器** | `Stop` | 每次响应后检查所有修改文件中的 `console.log` |
| **会话摘要器** | `Stop` | 当转录路径可用时持久化会话状态 |
| **模式提取器** | `Stop` | 评估会话以提取可复用模式（持续学习） |
| **成本跟踪器** | `Stop` | 发出轻量级的运行成本遥测标记 |
| **桌面通知器** | `Stop` | 发送包含任务摘要的 macOS 桌面通知（标准+） |
| **会话结束标记器** | `SessionEnd` | 生命周期标记和清理日志 |

## 自定义钩子

### 禁用钩子

在 `hooks.json` 中移除或注释掉钩子条目。如果作为插件安装，请在您的 `~/.claude/settings.json` 中覆盖：

```json
{
  "hooks": {
    "PreToolUse": [
      {
        "matcher": "Write",
        "hooks": [],
        "description": "Override: allow all .md file creation"
      }
    ]
  }
}
```

### 运行时钩子控制（推荐）

使用环境变量控制钩子行为，无需编辑 `hooks.json`：

```bash
# minimal | standard | strict (default: standard)
export ECC_HOOK_PROFILE=standard

# Disable specific hook IDs (comma-separated)
export ECC_DISABLED_HOOKS="pre:bash:tmux-reminder,post:edit:typecheck"
```

配置文件：

* `minimal` —— 仅保留必要的生命周期和安全钩子。
* `standard` —— 默认；平衡的质量 + 安全检查。
* `strict` —— 启用额外的提醒和更严格的防护措施。

### 编写你自己的钩子

钩子是 shell 命令，通过 stdin 接收 JSON 格式的工具输入，并且必须在 stdout 上输出 JSON。

**基本结构：**

```javascript
// my-hook.js
let data = '';
process.stdin.on('data', chunk => data += chunk);
process.stdin.on('end', () => {
  const input = JSON.parse(data);

  // Access tool info
  const toolName = input.tool_name;        // "Edit", "Bash", "Write", etc.
  const toolInput = input.tool_input;      // Tool-specific parameters
  const toolOutput = input.tool_output;    // Only available in PostToolUse

  // Warn (non-blocking): write to stderr
  console.error('[Hook] Warning message shown to Claude');

  // Block (PreToolUse only): exit with code 2
  // process.exit(2);

  // Always output the original data to stdout
  console.log(data);
});
```

**退出码：**

* `0` —— 成功（继续执行）
* `2` —— 阻止工具调用（仅限 PreToolUse）
* 其他非零值 —— 错误（记录日志但不阻止）

### 钩子输入模式

```typescript
interface HookInput {
  tool_name: string;          // "Bash", "Edit", "Write", "Read", etc.
  tool_input: {
    command?: string;         // Bash: the command being run
    file_path?: string;       // Edit/Write/Read: target file
    old_string?: string;      // Edit: text being replaced
    new_string?: string;      // Edit: replacement text
    content?: string;         // Write: file content
  };
  tool_output?: {             // PostToolUse only
    output?: string;          // Command/tool output
  };
}
```

### 异步钩子

对于不应阻塞主流程的钩子（例如，后台分析）：

```json
{
  "type": "command",
  "command": "node my-slow-hook.js",
  "async": true,
  "timeout": 30
}
```

异步钩子在后台运行。它们不能阻止工具执行。

## 常用钩子配方

### 警告 TODO 注释

```json
{
  "matcher": "Edit",
  "hooks": [{
    "type": "command",
    "command": "node -e \"let d='';process.stdin.on('data',c=>d+=c);process.stdin.on('end',()=>{const i=JSON.parse(d);const ns=i.tool_input?.new_string||'';if(/TODO|FIXME|HACK/.test(ns)){console.error('[Hook] New TODO/FIXME added - consider creating an issue')}console.log(d)})\""
  }],
  "description": "Warn when adding TODO/FIXME comments"
}
```

### 阻止创建大文件

```json
{
  "matcher": "Write",
  "hooks": [{
    "type": "command",
    "command": "node -e \"let d='';process.stdin.on('data',c=>d+=c);process.stdin.on('end',()=>{const i=JSON.parse(d);const c=i.tool_input?.content||'';const lines=c.split('\\n').length;if(lines>800){console.error('[Hook] BLOCKED: File exceeds 800 lines ('+lines+' lines)');console.error('[Hook] Split into smaller, focused modules');process.exit(2)}console.log(d)})\""
  }],
  "description": "Block creation of files larger than 800 lines"
}
```

### 使用 ruff 自动格式化 Python 文件

```json
{
  "matcher": "Edit",
  "hooks": [{
    "type": "command",
    "command": "node -e \"let d='';process.stdin.on('data',c=>d+=c);process.stdin.on('end',()=>{const i=JSON.parse(d);const p=i.tool_input?.file_path||'';if(/\\.py$/.test(p)){const{execFileSync}=require('child_process');try{execFileSync('ruff',['format',p],{stdio:'pipe'})}catch(e){}}console.log(d)})\""
  }],
  "description": "Auto-format Python files with ruff after edits"
}
```

### 要求新源文件附带测试文件

```json
{
  "matcher": "Write",
  "hooks": [{
    "type": "command",
    "command": "node -e \"const fs=require('fs');let d='';process.stdin.on('data',c=>d+=c);process.stdin.on('end',()=>{const i=JSON.parse(d);const p=i.tool_input?.file_path||'';if(/src\\/.*\\.(ts|js)$/.test(p)&&!/\\.test\\.|\\.spec\\./.test(p)){const testPath=p.replace(/\\.(ts|js)$/,'.test.$1');if(!fs.existsSync(testPath)){console.error('[Hook] No test file found for: '+p);console.error('[Hook] Expected: '+testPath);console.error('[Hook] Consider writing tests first (/tdd)')}}console.log(d)})\""
  }],
  "description": "Remind to create tests when adding new source files"
}
```

## 跨平台注意事项

钩子逻辑在 Node.js 脚本中实现，以便在 Windows、macOS 和 Linux 上具有跨平台行为。保留了少量 shell 包装器用于持续学习的观察者钩子；这些包装器受配置文件控制，并具有 Windows 安全的回退行为。

## 相关

* [rules/common/hooks.md](../rules/common/hooks.md) —— 钩子架构指南
* [skills/strategic-compact/](../../../skills/strategic-compact) —— 策略性压缩技能
* [scripts/hooks/](../../../scripts/hooks) —— 钩子脚本实现
