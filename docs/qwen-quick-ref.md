# Qwen CLI + ECC Quick Reference Card

## Installation

```bash
cd ~/everything-claude-code
./install.sh --target qwen --profile full
```

## Essential Commands

### Planning & Development
```bash
/ecc:plan "feature description"    # Plan implementation
/tdd                               # Test-driven development
/code-review                       # Review code
/build-fix                         # Fix build errors
```

### Security & Testing
```bash
/security-scan                     # Security audit
/e2e                               # E2E tests
/test-coverage                     # Check coverage
```

### Model & Context
```bash
/model sonnet                      # Default (60% cheaper)
/model opus                        # Complex architecture
/clear                             # Reset context
/compact                           # Compact context
/cost                              # Monitor spending
```

## Installed Components

| Component | Count | Location |
|-----------|-------|----------|
| Rules | 16 dirs | `~/.qwen/rules/` |
| Skills | 238 | `~/.qwen/skills/` |
| Agents | 47 | `~/.qwen/agents/` |
| Commands | 79 | `~/.qwen/commands/` |

## Token Optimization

Add to `~/.qwen/settings.json`:
```json
{
  "model": "sonnet",
  "env": {
    "MAX_THINKING_TOKENS": "10000",
    "CLAUDE_AUTOCOMPACT_PCT_OVERRIDE": "50"
  }
}
```

## Common Workflows

### New Feature
```bash
/ecc:plan "description" → /tdd → /code-review → /security-scan
```

### Fix Bug
```bash
/tdd → implement fix → /code-review
```

### Production Ready
```bash
/security-scan → /e2e → /test-coverage
```

## Rules Languages

Auto-applied based on file type:
- **common/** - All files
- **typescript/** - `.ts`, `.tsx`, `.js`, `.jsx`
- **python/** - `.py`
- **golang/** - `.go`
- **java/** - `.java`
- **kotlin/** - `.kt`, `.kts`
- **swift/** - `.swift`
- **php/** - `.php`
- **rust/** - `.rs`
- **cpp/** - `.cpp`, `.h`, `.hpp`
- **perl/** - `.pl`, `.pm`
- **csharp/** - `.cs`
- **dart/** - `.dart`

## Verification

```bash
ls ~/.qwen/rules/ | wc -l      # Should show 16+
ls ~/.qwen/skills/ | wc -l     # Should show 238
ls ~/.qwen/agents/ | wc -l     # Should show 47
```

## Documentation

- **Setup Guide**: `docs/QWEN-SETUP.md`
- **Quick Start**: `docs/QWEN-QUICK-START.md`
- **Summary**: `QWEN-SETUP-SUMMARY.md`
- **Shorthand Guide**: https://x.com/affaanmustafa/status/2012378465664745795
- **Longform Guide**: https://x.com/affaanmustafa/status/2014040193557471352

## Support

- **Repo**: https://github.com/affaan-m/everything-claude-code
- **Issues**: https://github.com/affaan-m/everything-claude-code/issues
- **Tests**: 1783/1783 passing ✅
