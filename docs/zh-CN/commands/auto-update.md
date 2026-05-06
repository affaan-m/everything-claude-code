---
description: 拉取最新的ECC仓库更改并重新安装当前管理的目标。
disable-model-invocation: true
---

# 自动更新

从其上游仓库更新 ECC，并使用原始的安装状态请求重新生成当前上下文的受管安装。

## 用法

```bash
# Preview the update without mutating anything
ECC_ROOT="${CLAUDE_PLUGIN_ROOT:-$(node -e "var r=(()=>{var e=process.env.CLAUDE_PLUGIN_ROOT;if(e&&e.trim())return e.trim();var p=require('path'),f=require('fs'),h=require('os').homedir(),d=p.join(h,'.claude'),q=p.join('scripts','lib','utils.js');if(f.existsSync(p.join(d,q)))return d;for(var s of [['ecc'],['ecc@ecc'],['marketplace','ecc'],['everything-claude-code'],['everything-claude-code@everything-claude-code'],['marketplace','everything-claude-code']]){var l=p.join(d,'plugins',...s);if(f.existsSync(p.join(l,q)))return l}try{for(var g of ['ecc','everything-claude-code']){var b=p.join(d,'plugins','cache',g);for(var o of f.readdirSync(b,{withFileTypes:true})){if(!o.isDirectory())continue;for(var v of f.readdirSync(p.join(b,o.name),{withFileTypes:true})){if(!v.isDirectory())continue;var c=p.join(b,o.name,v.name);if(f.existsSync(p.join(c,q)))return c}}}}catch(x){}return d})();console.log(r)")}"
node "$ECC_ROOT/scripts/auto-update.js" --dry-run

# Update only Cursor-managed files in the current project
node "$ECC_ROOT/scripts/auto-update.js" --target cursor

# Override the ECC repo root explicitly
node "$ECC_ROOT/scripts/auto-update.js" --repo-root /path/to/everything-claude-code
```

## 说明

* 此命令使用记录的安装状态请求，在拉取最新仓库更改后重新运行 `install-apply.js`。
* 重新安装是必要的：它能处理上游的重命名和删除操作，而 `repair.js` 无法仅通过过时的操作安全地重建这些更改。
* 如需在修改前查看重建的重新安装计划，请先使用 `--dry-run`。
