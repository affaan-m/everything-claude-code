# Integration and Merge Strategies

Patterns for integrating parallel work streams and resolving conflicts.

## Integration Patterns

### Pattern 1: Direct Integration

All implementers commit to the same branch; integration happens naturally.

```
feature/auth ← implementer-1 commits
             ← implementer-2 commits
             ← implementer-3 commits
```

**When to use**: Small teams (2-3), strict file ownership (no conflicts expected).

### Pattern 2: Sub-Branch Integration

Each implementer works on a sub-branch; lead merges them sequentially.

```
feature/auth
  ├── feature/auth-login     ← implementer-1
  ├── feature/auth-register  ← implementer-2
  └── feature/auth-tests     ← implementer-3
```

Merge order: follow dependency graph (foundation → dependent → integration).

**When to use**: Larger teams (4+), overlapping concerns, need for review gates.

### Pattern 3: Trunk-Based with Feature Flags

All implementers commit to the main branch behind a feature flag.

```
main ← all implementers commit
     ← feature flag gates new code
```

**When to use**: CI/CD environments, short-lived features, continuous deployment.

## Integration Verification Checklist

After all implementers complete:

1. **Build check**: Does the code compile/bundle without errors?
2. **Type check**: Do TypeScript/type annotations pass?
3. **Lint check**: Does the code pass linting rules?
4. **Unit tests**: Do all unit tests pass?
5. **Integration tests**: Do cross-component tests pass?
6. **Interface verification**: Do all interface contracts match their implementations?

## Conflict Resolution

### Prevention (Best)

- Strict file ownership eliminates most conflicts
- Interface contracts define boundaries before implementation
- Shared type files are owned by the lead and modified sequentially

### Detection

- Git merge will report conflicts if they occur
- TypeScript/lint errors indicate interface mismatches
- Test failures indicate behavioral conflicts

### Resolution Strategies

1. **Contract wins**: If code doesn't match the interface contract, the code is wrong
2. **Lead arbitrates**: The team lead decides which implementation to keep
3. **Tests decide**: The implementation that passes tests is correct
4. **Merge manually**: For complex conflicts, the lead merges by hand
