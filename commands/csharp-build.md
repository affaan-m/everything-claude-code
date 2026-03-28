---
description: Fix C#/.NET build errors, compiler warnings, and NuGet dependency issues incrementally. Invokes the csharp-build-resolver agent for minimal, surgical fixes.
---

# C# Build and Fix

This command invokes the **csharp-build-resolver** agent to incrementally fix C# build errors with minimal changes.

## What This Command Does

1. **Run Diagnostics**: Execute `dotnet restore`, `dotnet build`, `dotnet format`
2. **Parse Errors**: Group by file and sort by severity
3. **Fix Incrementally**: One error at a time
4. **Verify Each Fix**: Re-run build after each change
5. **Report Summary**: Show what was fixed and what remains

## When to Use

Use `/csharp-build` when:
- `dotnet build` fails with errors
- C# compiler reports errors (CS#### codes)
- NuGet dependency resolution fails
- Analyzer warnings need resolution (CA####, IDE#### codes)
- After pulling changes that break the build

## Diagnostic Commands Run

```bash
# Restore packages
dotnet restore 2>&1

# Build check
dotnet build --no-restore 2>&1

# Format check
dotnet format --verify-no-changes 2>&1

# List outdated packages
dotnet list package --outdated
```

## Example Session

````text
User: /csharp-build

Agent:
# C# Build Resolution

## Initial Diagnostics

```bash
$ dotnet build
error CS0234: The type or namespace name 'User' does not exist in the namespace 'MyApp.Models'
error CS0029: Cannot implicitly convert type 'string' to 'int'
error CS8600: Converting null literal or possible null value to non-nullable type
```

Errors found: 3

## Fix 1: Missing Namespace

File: src/Services/UserService.cs:5
Error: CS0234 — The type or namespace name 'User' does not exist
Cause: Missing using directive

```csharp
// Added import
using MyApp.Domain.Models;
```

```bash
$ dotnet build
# 2 errors remaining
```

## Fix 2: Type Mismatch

File: src/Controllers/OrderController.cs:28
Error: CS0029 — Cannot implicitly convert type 'string' to 'int'

```csharp
// Changed
var count = request.Query["count"];
// To
var count = int.TryParse(request.Query["count"], out var c) ? c : 0;
```

```bash
$ dotnet build
# 1 error remaining
```

## Fix 3: Nullable Warning

File: src/Services/OrderService.cs:45
Error: CS8600 — Converting null literal to non-nullable type

```csharp
// Changed
Order order = await repository.FindByIdAsync(id, cancellationToken);
// To
Order? order = await repository.FindByIdAsync(id, cancellationToken);
```

```bash
$ dotnet build
# Build successful!
```

## Final Verification

```bash
$ dotnet format --verify-no-changes
# No issues

$ dotnet test --no-build
# All tests passed
```

## Summary

| Metric | Count |
|--------|-------|
| Build errors fixed | 3 |
| Analyzer issues fixed | 0 |
| Files modified | 3 |
| Remaining issues | 0 |

Build Status: ✅ SUCCESS
````

## Common Errors Fixed

| Error | Typical Fix |
|-------|-------------|
| `CS0234` — Type not found | Add `using` directive or package reference |
| `CS0029` — Cannot convert type | Fix type conversion or assignment |
| `CS0103` — Name does not exist | Fix typo or add import |
| `CS1061` — No definition for member | Fix type or add extension `using` |
| `CS8600/8602/8604` — Nullable | Add null checks or nullable annotations |
| `NU1605` — Package downgrade | Pin version in `.csproj` |
| `NU1100` — Cannot resolve package | Check NuGet source and package name |
| `NETSDK1045` — SDK version | Update `global.json` |

## Fix Strategy

1. **Restore first** — Ensure packages are resolved
2. **Build errors second** — Code must compile
3. **Analyzer warnings third** — Fix quality issues
4. **Format violations fourth** — Fix formatting
5. **One fix at a time** — Verify each change
6. **Minimal changes** — Don't refactor, just fix

## Stop Conditions

The agent will stop and report if:
- Same error persists after 3 attempts
- Fix introduces more errors
- Requires architectural changes
- Missing external dependencies

## Related Commands

- `/csharp-test` — Run tests after build succeeds
- `/csharp-review` — Review code quality
- `/verify` — Run full verification loop

## Related

- Agent: `agents/csharp-build-resolver.md`
- Skill: `skills/csharp-patterns/`
