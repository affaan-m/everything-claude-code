---
description: "Python hooks extending common rules"
globs: ["**/*.py", "**/*.pyi"]
alwaysApply: false
---
# Python Hooks

> This file extends the common hooks rule with Python specific content.

## After-edit behavior

Align tooling with the **`afterFileEdit`** hook in **`.cursor/hooks.json`** (extend **`.cursor/hooks/after-file-edit.js`** or add language-specific hooks if needed):

- **black/ruff**: Auto-format `.py` files after edit
- **mypy/pyright**: Run type checking after editing `.py` files

## Warnings

- Warn about `print()` statements in edited files (use `logging` module instead)
