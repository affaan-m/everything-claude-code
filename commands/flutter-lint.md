---
description: Run Dart analysis, fix common issues, and enforce project lint rules
---

# Lint & Analyze

Run static analysis on the Flutter project and fix issues.

## Process

1. Run `dart analyze` (or `flutter analyze`) on the project or specified files
2. Categorize findings: **errors** > **warnings** > **info**
3. Auto-fix what can be fixed safely:
   - Add missing `const` constructors
   - Remove unused imports
   - Add missing return types
   - Fix `prefer_final_locals` violations
   - Add missing `@override` annotations
   - Sort imports (dart: first, package: second, relative: third)
4. Flag issues that need human judgment:
   - Deprecated API usage — suggest the replacement
   - `dynamic` types that should be explicit
   - Missing null checks on nullable access
   - Large functions that should be split (>50 lines)

## Rules

- Never suppress a lint with `// ignore:` unless the user explicitly asks
- If `analysis_options.yaml` exists, respect its rules — do not override
- When fixing, explain what changed and why in a brief comment
- Group fixes by file, show a summary at the end

## Output

For each file with issues:
```
file: lib/features/auth/screens/login_screen.dart
  Fixed: Added const to LoginScreen constructor
  Fixed: Removed unused import of 'dart:math'
  Review: Line 47 — `dynamic` return type on `_handleSubmit`, should be `Future<void>`
```

Then a summary:
```
Summary: 12 issues found, 8 auto-fixed, 4 need review
```
