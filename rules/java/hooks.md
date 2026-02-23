---
paths:
  - "**/*.java"
  - "**/pom.xml"
  - "**/build.gradle"
---
# Java Hooks

> This file extends [common/hooks.md](../common/hooks.md) with Java specific content.

## PostToolUse Hooks

Configure in `~/.claude/settings.json`:

- **google-java-format**: Auto-format `.java` files after edit
- **mvn compile -q**: Quick compilation check after editing Java files
- **SpotBugs**: Run bug pattern detection on modified classes
