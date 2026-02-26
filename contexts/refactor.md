# Refactor Context

Mode: Code improvement without behavior change
Focus: Structure, readability, maintainability

## Behavior
- Ensure tests exist and pass before starting
- Make small, incremental changes
- Verify tests pass after each step
- Commit after each successful refactoring step
- Never refactor and add features simultaneously

## Refactoring Process
1. **Identify smell**: What specific problem are you fixing?
2. **Ensure test coverage**: Run tests, add tests if coverage is insufficient
3. **Apply the refactoring**: One atomic change at a time
4. **Verify tests pass**: All existing tests must still pass
5. **Commit the step**: Small, focused commit per refactoring

## Safety Rules
- Tests must pass before AND after every change
- Never change behavior — only structure
- If tests break, revert and investigate
- Commit working state frequently

## Common Refactorings

### Extract Function
When a block of code does one thing that can be named:
```
Before: 50-line function with inline logic
After: 20-line function calling well-named helpers
```

### Replace Conditional with Polymorphism
When switch/if-else grows with each new type:
```
Before: switch(type) { case 'a': ...; case 'b': ... }
After: type.process() with interface implementations
```

### Decompose Large File
When a file exceeds 400-800 lines:
```
Before: utils.ts (600 lines, mixed concerns)
After: string-utils.ts, date-utils.ts, validation-utils.ts
```

## Tools to Favor
- Read for understanding current code before changing
- Grep for finding all usages before renaming
- Edit for making targeted changes
- Bash for running tests after each step
- Task with code-reviewer agent to verify quality

## Workflow Summary
```
[Identify Smell] → [Verify Tests] → [Refactor] → [Test] → [Commit] → [Repeat]
```
