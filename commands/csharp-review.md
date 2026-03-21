---
description: Comprehensive C# code review for async safety, EF Core patterns, dependency injection, and security. Invokes the csharp-reviewer agent.
---

# C# Code Review

This command invokes the **csharp-reviewer** agent for comprehensive C#-specific code review.

## What This Command Does

1. **Identify C# Changes**: Find modified `.cs` and `.csproj` files via `git diff`
2. **Run Build & Analysis**: Execute `dotnet build` and `dotnet format --verify-no-changes`
3. **Security Scan**: Check for SQL injection, hardcoded secrets, unsafe deserialization
4. **Async Safety Review**: Analyze `.Result`/`.Wait()` usage, `async void`, missing cancellation
5. **EF Core Review**: Check for N+1 queries, unbounded queries, tracking misuse
6. **Generate Report**: Categorize issues by severity

## When to Use

Use `/csharp-review` when:
- After writing or modifying C# code
- Before committing C# changes
- Reviewing pull requests with C# code
- Onboarding to a new .NET codebase

## Review Categories

### CRITICAL (Must Fix)
- SQL/command injection vulnerabilities
- Hardcoded credentials or connection strings
- `.Result` / `.Wait()` deadlock risks
- `async void` methods (except event handlers)
- Unsafe deserialization (`BinaryFormatter`, `TypeNameHandling.All`)

### HIGH (Should Fix)
- N+1 queries in EF Core
- Captive dependencies (singleton holding scoped)
- Missing `CancellationToken` on public async APIs
- Missing input validation on API endpoints
- Exposed stack traces in API responses

### MEDIUM (Consider)
- Missing `sealed` on non-inherited classes
- `DateTime.Now` instead of `DateTime.UtcNow`
- Missing `AsNoTracking()` on read-only queries
- Non-idiomatic patterns (Java-style C#)

## Automated Checks Run

```bash
# Build check
dotnet build

# Format check
dotnet format --verify-no-changes

# Tests
dotnet test
```

## Example Usage

````text
User: /csharp-review

Agent:
# C# Code Review Report

## Files Reviewed
- src/Services/OrderService.cs (modified)
- src/Controllers/OrderController.cs (modified)

## Static Analysis Results
✓ Build: Successful
⚠ Format: 1 formatting issue

## Issues Found

[CRITICAL] Blocking async call
File: src/Services/OrderService.cs:35
Issue: Using `.Result` on async method — deadlock risk
```csharp
var order = GetOrderAsync(id).Result;  // deadlock
```
Fix: Use `await` with cancellation
```csharp
var order = await GetOrderAsync(id, cancellationToken);
```

[HIGH] N+1 query pattern
File: src/Services/ReportService.cs:52
Issue: Lazy loading `order.Items` in a foreach loop
Fix: Add `.Include(o => o.Items)` to the initial query

## Summary
- CRITICAL: 1
- HIGH: 1
- MEDIUM: 0

Recommendation: ❌ Block merge until CRITICAL issue is fixed
````

## Approval Criteria

| Status | Condition |
|--------|-----------|
| ✅ Approve | No CRITICAL or HIGH issues |
| ⚠️ Warning | Only MEDIUM issues (merge with caution) |
| ❌ Block | CRITICAL or HIGH issues found |

## Integration with Other Commands

- Use `/csharp-test` first to ensure tests pass
- Use `/csharp-build` if build errors occur
- Use `/csharp-review` before committing
- Use `/code-review` for non-C#-specific concerns

## Related

- Agent: `agents/csharp-reviewer.md`
- Skills: `skills/csharp-patterns/`
