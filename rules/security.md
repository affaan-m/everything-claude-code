# PostgreSQL Security Rules

## SQL Security

- All dynamic SQL must be parameterized.
- Exposed interfaces require explicit privilege checks and RLS assessment.
- Use `SECURITY DEFINER` only with strict input validation.

## Extension Security

- Do not expose dangerous functions outside superuser context.
- Avoid unsafe C APIs (e.g., direct system calls).
- Document any extension-level file or network access.
- Use restricted `search_path` in security-definer functions.

## Kernel Security

- New GUCs must define explicit privilege scope.
- WAL/log format changes require compatibility and rollback analysis.
- Ensure new log lines do not leak sensitive values.
