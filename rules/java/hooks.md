---
paths:
  - "**/*.java"
  - "**/*.kt"
  - "**/pom.xml"
  - "**/build.gradle*"
---
# Java/Kotlin Hooks

> This file extends [common/hooks.md](../common/hooks.md) with Java/Kotlin-specific content.

## PostToolUse Hooks

Configure in `~/.claude/settings.json`:

- **Spotless/google-java-format**: Auto-format `.java` files after edit
- **ktlint**: Auto-format `.kt` files after edit
- **Checkstyle**: Run style checks on modified `.java` files
- **Detekt**: Run static analysis on modified `.kt` files

## Example Hook Configuration

```json
{
  "hooks": {
    "PostToolUse": [
      {
        "matcher": "Edit|Write",
        "hooks": [
          {
            "type": "command",
            "command": "if echo $TOOL_INPUT | grep -q '\\.java'; then cd $(git rev-parse --show-toplevel) && mvn spotless:apply -q 2>/dev/null || gradle spotlessApply -q 2>/dev/null; fi"
          },
          {
            "type": "command",
            "command": "if echo $TOOL_INPUT | grep -q '\\.kt'; then cd $(git rev-parse --show-toplevel) && ktlint --format $(echo $TOOL_INPUT | grep -o '[^ ]*\\.kt') 2>/dev/null; fi"
          }
        ]
      }
    ],
    "PreToolUse": [
      {
        "matcher": "Bash",
        "hooks": [
          {
            "type": "command",
            "command": "if echo $TOOL_INPUT | grep -qE '(mvn|gradle|./gradlew).*?(install|build|test|verify|package)'; then echo 'Consider using tmux for long-running build commands'; fi"
          }
        ]
      }
    ]
  }
}
```

## Recommended CI Hooks

For pre-commit or CI pipelines:

```bash
# Java formatting check
mvn spotless:check
# or
gradle spotlessCheck

# Kotlin lint
ktlint --reporter=checkstyle

# Static analysis
mvn spotbugs:check
gradle spotbugsMain
detekt --input src/main/kotlin

# Compile check
mvn compile -q
gradle compileJava compileKotlin

# Test execution
mvn test
gradle test
```

## Build Tool Detection

Hooks should detect the build tool automatically:

```bash
# Detect Maven vs Gradle
if [ -f "pom.xml" ]; then
    mvn spotless:apply -q
elif [ -f "build.gradle" ] || [ -f "build.gradle.kts" ]; then
    ./gradlew spotlessApply -q
fi
```

## Reference

See [common/hooks.md](../common/hooks.md) for shared hook patterns.
See skill: `springboot-verification` for Spring Boot build and verification hooks.
