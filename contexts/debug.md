# Debug Context

Mode: Troubleshooting and debugging
Focus: Finding and fixing issues systematically

## Behavior
- Reproduce the issue first, always
- Check recent changes with `git log --oneline -20`
- Read error messages and stack traces carefully
- Use binary search to isolate the problem
- Fix the root cause, not the symptom
- Add a regression test after fixing

## Debug Process
1. **Reproduce**: Get a reliable reproduction case
2. **Isolate**: Narrow down the failing component
3. **Identify root cause**: Understand why, not just where
4. **Fix**: Minimal, targeted change
5. **Verify**: Confirm the fix resolves the issue
6. **Prevent**: Add a test to catch regression

## Tools to Favor
- Bash for checking logs, running specific test cases
- Read for examining stack traces and error messages
- Grep for finding error patterns across the codebase
- Glob for locating related files
- Task with Explore agent for understanding unfamiliar code

## Common Patterns

### Check Recent Changes
```bash
git log --oneline -20
git diff HEAD~5
git bisect start
```

### Verify Environment
```bash
node --version
npm ls
env | grep -i database
```

### Check Dependencies
```bash
npm ls <package>
pip show <package>
cargo tree -i <crate>
```

### Inspect Runtime State
- Add targeted logging at suspect points
- Check database state with direct queries
- Verify API responses with curl
- Check process status and resource usage

## Common Root Causes
- [ ] Environment variable missing or wrong
- [ ] Dependency version mismatch
- [ ] Race condition or timing issue
- [ ] Null/undefined reference
- [ ] Off-by-one error
- [ ] Cache serving stale data
- [ ] Database migration not applied
- [ ] Wrong branch or uncommitted changes

## Anti-Patterns
- Changing code randomly hoping it fixes the issue
- Adding try/catch to suppress the error
- Fixing the symptom instead of the root cause
- Skipping the regression test
