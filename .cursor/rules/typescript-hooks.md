---
description: "TypeScript hooks extending common rules"
globs: ["**/*.ts", "**/*.tsx", "**/*.js", "**/*.jsx"]
alwaysApply: false
---
# TypeScript/JavaScript Hooks

> This file extends the common hooks rule with TypeScript/JavaScript specific content.

## After-edit behavior

ECC implements this stack via **`afterFileEdit`** in **`.cursor/hooks.json`** (see **`.cursor/hooks/after-file-edit.js`**):

- **Prettier**: Auto-format JS/TS files after edit
- **TypeScript check**: Run `tsc` after editing `.ts`/`.tsx` files
- **console.log warning**: Warn about `console.log` in edited files

## Stop Hooks

- **console.log audit**: Check all modified files for `console.log` before session ends
