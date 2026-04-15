---
description: "Kotlin hooks extending common rules"
globs: ["**/*.kt", "**/*.kts", "**/build.gradle.kts"]
alwaysApply: false
---
# Kotlin Hooks

> This file extends the common hooks rule with Kotlin-specific content.

## After-edit behavior

Align tooling with the **`afterFileEdit`** hook in **`.cursor/hooks.json`** (extend **`.cursor/hooks/after-file-edit.js`** or add Kotlin-specific hooks if needed):

- **ktfmt/ktlint**: Auto-format `.kt` and `.kts` files after edit
- **detekt**: Run static analysis after editing Kotlin files
- **./gradlew build**: Verify compilation after changes
