# Qwen CLI + ECC Quick Start Guide

## What Was Installed

✅ **16 rule directories** - Coding standards for common, TypeScript, Python, Go, Java, Kotlin, Swift, PHP, Rust, C++, C#, Dart, Perl, and more

✅ **238 skills** - Workflow definitions for TDD, security, research, content creation, agent orchestration, and more

✅ **47 agents** - Specialized subagents for planning, reviewing, testing, and debugging

✅ **Hooks** - Event-based automations for session lifecycle, file edits, and security checks

✅ **MCP configurations** - Pre-configured MCP servers for GitHub, Context7, Exa, and more

## Using ECC with Qwen CLI

### Basic Commands

Once in a Qwen CLI session, you can use these ECC commands:

```bash
# Planning & Architecture
/ecc:plan "Add user authentication"

# Test-Driven Development
/tdd

# Code Review
/code-review

# Security Scanning
/security-scan

# Build Error Resolution
/build-fix

# End-to-End Testing
/e2e

# Documentation Updates
/update-docs
```

### Model Selection

```bash
# Use Sonnet for most tasks (60% cost reduction)
/model sonnet

# Switch to Opus for complex architecture
/model opus

# Monitor token spending
/cost
```

### Session Management

```bash
# Clear context between unrelated tasks
/clear

# Compact at logical breakpoints
/compact

# View session history
/sessions
```

## Token Optimization

Add these to your `~/.qwen/settings.json` for optimal performance:

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

### Starting a New Feature

```bash
/ecc:plan "Add user authentication with OAuth"
/tdd                                          # Write tests first
/code-review                                  # Review your work
/security-scan                                # Security audit
```

### Fixing a Bug

```bash
/tdd                                          # Write failing test first
                                              # Implement the fix
/code-review                                  # Catch regressions
```

### Preparing for Production

```bash
/security-scan                                # OWASP Top 10 audit
/e2e                                          # Critical user flow tests
/test-coverage                                # Verify 80%+ coverage
```

## Language-Specific Rules

ECC installed rules for these languages. They auto-apply based on file types:

| Language | Rules Location | Auto-Applies To |
|----------|---------------|-----------------|
| Common | `~/.qwen/rules/common/` | All files |
| TypeScript | `~/.qwen/rules/typescript/` | `.ts`, `.tsx`, `.js`, `.jsx` |
| Python | `~/.qwen/rules/python/` | `.py` |
| Go | `~/.qwen/rules/golang/` | `.go` |
| Java | `~/.qwen/rules/java/` | `.java` |
| Kotlin | `~/.qwen/rules/kotlin/` | `.kt`, `.kts` |
| Swift | `~/.qwen/rules/swift/` | `.swift` |
| PHP | `~/.qwen/rules/php/` | `.php` |
| Rust | `~/.qwen/rules/rust/` | `.rs` |
| C++ | `~/.qwen/rules/cpp/` | `.cpp`, `.h`, `.hpp` |
| Perl | `~/.qwen/rules/perl/` | `.pl`, `.pm` |

## Key Skills Available

### Development Workflows
- **tdd-workflow** - Test-driven development with 80%+ coverage
- **verification-loop** - Build, test, lint, typecheck, security
- **eval-harness** - Eval-driven development
- **e2e-testing** - Playwright E2E patterns

### Security
- **security-review** - Comprehensive security checklist
- **security-scan** - AgentShield security auditor
- **security-bounty-hunter** - Hunt for exploitable security issues

### Research & Documentation
- **deep-research** - Multi-source research with synthesis
- **search-first** - Research-before-coding workflow
- **documentation-lookup** - Up-to-date library docs
- **article-writing** - Long-form writing

### Content & Communication
- **content-engine** - Multi-platform social content
- **brand-voice** - Source-derived writing style profiles
- **market-research** - Source-attributed market research
- **investor-materials** - Pitch decks, memos, models

### Agent & Orchestration
- **agentic-engineering** - Agentic engineering patterns
- **autonomous-loops** - Autonomous loop patterns
- **team-builder** - Compose parallel agent teams
- **continuous-learning-v2** - Instinct-based learning

## Troubleshooting

### Rules Not Applied

If rules aren't being followed:
1. Verify rules exist: `ls ~/.qwen/rules/`
2. Check that Qwen CLI is configured to read rules
3. Restart Qwen CLI

### Skills Not Available

If skills aren't showing up:
1. Verify skills exist: `ls ~/.qwen/skills/ | wc -l`
2. Should show 238 skills
3. Check Qwen CLI skill loading configuration

### Hooks Not Firing

If hooks aren't automating tasks:
1. Check hooks directory: `ls ~/.qwen/hooks/`
2. Verify hook configurations in settings
3. Check Qwen CLI hook event support

## Reinstallation

To reinstall or update ECC for Qwen CLI:

```bash
cd ~/everything-claude-code
git pull

# Reinstall full profile
./install.sh --target qwen --profile full

# Or install specific languages only
./install.sh --target qwen typescript python
```

## Additional Resources

- **[Qwen Setup Guide](docs/QWEN-SETUP.md)** - Detailed setup instructions
- **[Shorthand Guide](https://x.com/affaanmustafa/status/2012378465664745795)** - Quick start (read first)
- **[Longform Guide](https://x.com/affaanmustafa/status/2014040193557471352)** - Advanced usage
- **[Security Guide](the-security-guide.md)** - Security best practices
- **[Token Optimization](docs/token-optimization.md)** - Cost reduction tips

## Support

- **GitHub Issues**: https://github.com/affaan-m/everything-claude-code/issues
- **Contributing**: See [CONTRIBUTING.md](CONTRIBUTING.md)
- **Sponsor**: https://github.com/sponsors/affaan-m
