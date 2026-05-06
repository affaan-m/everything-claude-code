> 此文件扩展了 [common/hooks.md](../common/hooks.md)，提供了针对 Web 的钩子推荐。

# Web 钩子

## 推荐的 PostToolUse 钩子

优先使用项目本地工具。不要将钩子连接到远程的一次性包执行。

### 保存时格式化

编辑后使用项目现有的格式化入口点：

```json
{
  "hooks": {
    "PostToolUse": [
      {
        "matcher": "Write|Edit",
        "command": "pnpm prettier --write \"$FILE_PATH\"",
        "description": "Format edited frontend files"
      }
    ]
  }
}
```

通过 `yarn prettier` 或 `npm exec prettier --` 执行的等效本地命令，只要使用仓库拥有的依赖项即可。

### Lint 检查

```json
{
  "hooks": {
    "PostToolUse": [
      {
        "matcher": "Write|Edit",
        "command": "pnpm eslint --fix \"$FILE_PATH\"",
        "description": "Run ESLint on edited frontend files"
      }
    ]
  }
}
```

### 类型检查

```json
{
  "hooks": {
    "PostToolUse": [
      {
        "matcher": "Write|Edit",
        "command": "pnpm tsc --noEmit --pretty false",
        "description": "Type-check after frontend edits"
      }
    ]
  }
}
```

### CSS Lint

```json
{
  "hooks": {
    "PostToolUse": [
      {
        "matcher": "Write|Edit",
        "command": "pnpm stylelint --fix \"$FILE_PATH\"",
        "description": "Lint edited stylesheets"
      }
    ]
  }
}
```

## PreToolUse 钩子

### 文件大小保护

阻止工具输入内容中的过大写入，而不是针对可能尚不存在的文件：

```json
{
  "hooks": {
    "PreToolUse": [
      {
        "matcher": "Write",
        "command": "node -e \"let d='';process.stdin.on('data',c=>d+=c);process.stdin.on('end',()=>{const i=JSON.parse(d);const c=i.tool_input?.content||'';const lines=c.split('\\n').length;if(lines>800){console.error('[Hook] BLOCKED: File exceeds 800 lines ('+lines+' lines)');console.error('[Hook] Split into smaller modules');process.exit(2)}console.log(d)})\"",
        "description": "Block writes that exceed 800 lines"
      }
    ]
  }
}
```

## Stop 钩子

### 最终构建验证

```json
{
  "hooks": {
    "Stop": [
      {
        "command": "pnpm build",
        "description": "Verify the production build at session end"
      }
    ]
  }
}
```

## 执行顺序

推荐顺序：

1. 格式化
2. lint
3. 类型检查
4. 构建验证
