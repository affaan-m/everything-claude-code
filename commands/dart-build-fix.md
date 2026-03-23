---
description: Incrementally fix Dart analysis errors and Flutter build issues. Runs dart analyze and flutter build, then fixes errors one at a time.
---

# Dart Build and Fix

Incrementally fix Dart analysis and Flutter build errors:

1. Run analysis: dart analyze

2. Parse error output:
   - Group by file
   - Sort by severity (error > warning > info)

3. For each error:
   - Show error context (5 lines before/after)
   - Explain the issue
   - Propose fix
   - Apply fix
   - Re-run dart analyze on the file
   - Verify error resolved

4. After analysis is clean, run relevant platform builds:
   - flutter build apk --debug (Android - requires Android SDK)
   - flutter build ios --no-codesign (iOS - requires macOS with Xcode)
   - flutter build web (Web)
   Note: Only run builds for platforms you are targeting. iOS builds require macOS with Xcode installed.

5. If code generation is stale:
   - Run: dart run build_runner build --delete-conflicting-outputs
   - Re-run analysis

6. Stop if:
   - Fix introduces new errors
   - Same error persists after 3 attempts
   - User requests pause

7. Show summary:
   - Errors fixed
   - Errors remaining
   - New errors introduced

Fix one error at a time for safety!

## Common Dart/Flutter Errors

- Missing generated files: Run build_runner
- Null safety violations: Add null checks or use nullable types
- Import errors: Check package name in pubspec.yaml
- Widget build errors: Check return types and widget tree
- State management errors: Verify provider/bloc setup
- Platform channel errors: Check method channel registration
