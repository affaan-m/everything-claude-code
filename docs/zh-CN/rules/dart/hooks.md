---
paths:
  - "**/*.dart"
  - "**/pubspec.yaml"
  - "**/analysis_options.yaml"
---

# Dart/Flutter Hooks

> 本文件在 [common/hooks.md](../common/hooks.md) 基础上扩展了 Dart 和 Flutter 专属内容。

## PostToolUse Hooks

在 `~/.claude/settings.json` 中配置：

* **dart format**：编辑后自动格式化 `.dart` 文件
* **dart analyze**：编辑 Dart 文件后运行静态分析并显示警告
* **flutter test**：在重大变更后可选运行受影响的测试

## 推荐的 Hook 配置

```json
{
  "hooks": {
    "PostToolUse": [
      {
        "matcher": { "tool_name": "Edit", "file_paths": ["**/*.dart"] },
        "hooks": [
          { "type": "command", "command": "dart format $CLAUDE_FILE_PATHS" }
        ]
      }
    ]
  }
}
```

## 预提交检查

提交 Dart/Flutter 变更前运行：

```bash
dart format --set-exit-if-changed .
dart analyze --fatal-infos
flutter test
```

## 实用单行命令

```bash
# Format all Dart files
dart format .

# Analyze and report issues
dart analyze

# Run all tests with coverage
flutter test --coverage

# Regenerate code-gen files
dart run build_runner build --delete-conflicting-outputs

# Check for outdated packages
flutter pub outdated

# Upgrade packages within constraints
flutter pub upgrade
```
