# PostgreSQL Testing Rules

## Required Tests

- Kernel: `src/test/regress` or `src/test/isolation`
- Extensions: SQL upgrade and rollback tests
- Performance: `pgbench` or micro-benchmarks on critical paths

## Strategy

1. Write the minimal regression test first
2. Compile and run core test suites
3. Validate high-risk changes across supported versions
4. Add isolation tests for lock or visibility semantics

## Documentation Sync

If tests fail, document root cause and mitigation in the PR.
