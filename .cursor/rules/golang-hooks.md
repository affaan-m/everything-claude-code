---
description: "Go hooks extending common rules"
globs: ["**/*.go", "**/go.mod", "**/go.sum"]
alwaysApply: false
---
# Go Hooks

> This file extends the common hooks rule with Go specific content.

## After-edit behavior

Align tooling with the **`afterFileEdit`** hook in **`.cursor/hooks.json`** (extend **`.cursor/hooks/after-file-edit.js`** or add Go-specific hooks if needed):

- **gofmt/goimports**: Auto-format `.go` files after edit
- **go vet**: Run static analysis after editing `.go` files
- **staticcheck**: Run extended static checks on modified packages
