---
paths:
  - "**/*.java"
  - "**/*.kt"
  - "**/pom.xml"
  - "**/build.gradle*"
---
# Java/Kotlin Hooks

> This file extends [common/hooks.md](../common/hooks.md) with Java/Kotlin specific content.

## PostToolUse Hooks

Format and lint Java/Kotlin files after editing:

```json
{
  "hooks": {
    "PostToolUse": [
      {
        "matcher": "Edit|Write",
        "hooks": [
          {
            "type": "command",
            "command": "if echo '$TOOL_INPUT' | grep -qE '\\.java$'; then google-java-format --dry-run --set-exit-if-changed $(echo '$TOOL_INPUT' | grep -oE '[^ ]+\\.java') 2>/dev/null; fi"
          },
          {
            "type": "command",
            "command": "if echo '$TOOL_INPUT' | grep -qE '\\.kt$'; then ktlint $(echo '$TOOL_INPUT' | grep -oE '[^ ]+\\.kt') 2>/dev/null; fi"
          }
        ]
      }
    ]
  }
}
```

## PreToolUse Hooks

- Use tmux reminder for `mvn`, `gradle`, `./gradlew` (long-running)
- Detect build tool automatically (Maven vs Gradle)

## CI Recommendations

Run before each commit:
1. `spotless:check` or `google-java-format` (formatting)
2. `ktlint` or `detekt` (Kotlin lint)
3. `spotbugs` or `checkstyle` (static analysis)
4. `mvn compile` / `./gradlew compileJava` (compilation)
5. `mvn test` / `./gradlew test` (tests)
