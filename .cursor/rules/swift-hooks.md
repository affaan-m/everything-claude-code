---
description: "Swift hooks extending common rules"
globs: ["**/*.swift", "**/Package.swift"]
alwaysApply: false
---
# Swift Hooks

> This file extends the common hooks rule with Swift specific content.

## After-edit behavior

Align tooling with the **`afterFileEdit`** hook in **`.cursor/hooks.json`** (extend **`.cursor/hooks/after-file-edit.js`** or add Swift-specific hooks if needed):

- **SwiftFormat**: Auto-format `.swift` files after edit
- **SwiftLint**: Run lint checks after editing `.swift` files
- **swift build**: Type-check modified packages after edit

## Warning

Flag `print()` statements -- use `os.Logger` or structured logging instead for production code.
