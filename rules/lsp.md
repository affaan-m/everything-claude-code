# LSP Integration

## Code Navigation (CRITICAL)

ALWAYS prefer LSP tools over text search:

```
// WRONG: Text-based search
grep -r "functionName" .
Glob for files, then Read

// CORRECT: LSP tools
find_definition - jump to definition
find_references - find all usages
get_diagnostics - check for errors
```

## When to Use LSP

| Task | LSP Tool | Fallback |
|------|----------|----------|
| Find definition | find_definition | Grep + Read |
| Find references | find_references | Grep |
| Check errors | get_diagnostics | Run linter manually |
| Rename symbol | rename_symbol | Find/replace (risky) |

## Post-Edit Workflow (CRITICAL)

After EVERY code edit:
1. Run `get_diagnostics` on modified file
2. Fix any errors immediately
3. Repeat until no errors

```
Edit file.py
  ↓
get_diagnostics("file.py")
  ↓
Errors? → Fix → get_diagnostics again
  ↓
No errors → Continue
```

## LSP Setup

```bash
claude plugin install pyright-lsp      # Python
claude plugin install typescript-lsp   # TypeScript
```

## Performance

LSP vs Text Search:
- find_references: ~50ms
- grep search: ~45 seconds
- **900x faster**

## Checklist

Before completing any code task:
- [ ] Used LSP for navigation (not grep)
- [ ] Ran get_diagnostics after edits
- [ ] Fixed all reported errors
- [ ] No type errors remaining
