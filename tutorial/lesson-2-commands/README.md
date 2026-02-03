# Lesson 2: Commands — Your Toolbelt

## What Are Commands?

Commands are **slash commands** you type inside Claude Code to trigger specific
actions. They start with `/` and work like shortcuts.

Think of them as **tools on a tool belt** — you don't carry everything at once, but
you reach for the right tool when you need it.

## Real-World Analogy

As a system engineer, you probably have a set of scripts:

```bash
./scripts/scan.sh          # Run a compliance scan
./scripts/generate-ssp.sh  # Generate a System Security Plan
./scripts/deploy.sh        # Deploy to staging
```

Commands in Claude Code work the same way — they're shortcuts that trigger
specific workflows, but with the power of AI behind them.

## Built-In Commands

These come with Claude Code out of the box:

| Command | What It Does |
|---------|-------------|
| `/help` | Show help information |
| `/init` | Create a CLAUDE.md for your project |
| `/compact` | Summarize conversation to free up context |
| `/memory` | Edit your memory files (CLAUDE.md) |
| `/cost` | Show token usage and costs this session |
| `/agents` | Manage subagents (Lesson 5) |
| `/hooks` | Configure hooks (Lesson 4) |
| `/mcp` | Manage MCP servers (Lesson 6) |

### Try These Right Now

Open Claude Code and try:

```
/help
/cost
/compact
```

## Custom Commands (via Skills)

You can create your own slash commands! Custom commands are just **skill files**
with a name — Claude turns the name into a `/command`.

### Where to Put Them

```
~/.claude/commands/         # Available in ALL your projects
.claude/commands/           # Available in THIS project only
```

OR (the newer, recommended way):

```
~/.claude/skills/my-skill/SKILL.md    # User-level skill → /my-skill
.claude/skills/my-skill/SKILL.md      # Project-level skill → /my-skill
```

### Creating Your First Custom Command

Let's create a `/scan-review` command that reviews compliance scan results.

**Step 1**: Create the file

```bash
mkdir -p .claude/commands
```

**Step 2**: Write the command file

Save this as `.claude/commands/scan-review.md`:

```markdown
Review the compliance scan results and provide:

1. **Summary**: How many controls passed vs failed
2. **Critical Findings**: List any High/Critical severity items
3. **Quick Wins**: Which failures are easiest to fix
4. **Action Items**: Prioritized list of remediation steps

Format the output as a structured report.

If a scan file path is provided as $ARGUMENTS, analyze that file.
Otherwise, look for the most recent scan results in the project.
```

**Step 3**: Use it

```
/scan-review results/scan-2024-01-15.json
```

The `$ARGUMENTS` variable captures everything after the command name.

---

## Command Patterns That Are Useful for System Engineers

### Pattern 1: Checklist Command

`.claude/commands/security-checklist.md`:

```markdown
Run through this security checklist for the current project:

## Access Control
- [ ] Are default credentials changed?
- [ ] Is MFA enforced for admin access?
- [ ] Are service accounts using least privilege?

## Network
- [ ] Are unnecessary ports closed?
- [ ] Is TLS 1.2+ enforced?
- [ ] Are security groups/firewall rules minimal?

## Data Protection
- [ ] Is encryption at rest enabled?
- [ ] Is encryption in transit enabled?
- [ ] Are backups encrypted?

## Logging
- [ ] Are audit logs enabled?
- [ ] Are logs sent to a central location?
- [ ] Is log tampering prevented?

Check the codebase and configs against each item. Report what passes,
what fails, and what can't be determined from the code alone.
```

### Pattern 2: Generator Command

`.claude/commands/generate-poam.md`:

```markdown
Generate a Plan of Action & Milestones (POA&M) entry.

Using the information provided in $ARGUMENTS, create a POA&M entry with:

- **Weakness ID**: Auto-increment from existing entries
- **Control**: The NIST 800-53 control that's deficient
- **Weakness Description**: Clear description of the finding
- **Risk Level**: High/Moderate/Low
- **Remediation Plan**: Specific steps to fix
- **Milestone Dates**: Suggested timeline
- **Resources Required**: People, tools, budget needed
- **Status**: Open

Output in both markdown table format and JSON.
```

### Pattern 3: Explain Command

`.claude/commands/explain-control.md`:

```markdown
Explain the NIST SP 800-53 Rev 5 control specified in $ARGUMENTS.

Include:
1. **Control Name and Family**: The full title and family
2. **What It Requires**: Plain English explanation
3. **Why It Matters**: Real-world risk it mitigates
4. **Common Implementations**: How teams typically satisfy this
5. **Evidence Needed**: What an assessor looks for
6. **Related Controls**: Other controls that work together
7. **Common Mistakes**: Pitfalls to avoid

Keep the language accessible for someone new to RMF.
```

Usage: `/explain-control AC-2` or `/explain-control SC-28`

---

## Exercises

### Exercise 1: Use Built-In Commands

1. Start Claude Code
2. Run `/init` in a project that doesn't have CLAUDE.md yet
3. Run `/cost` to see your usage
4. Have a conversation, then run `/compact` to see it summarize

### Exercise 2: Create a Custom Command

1. Look at the example in `exercises/exercise-1-custom-command.md`
2. Create the command file in your project
3. Test it with `/your-command-name`

### Exercise 3: Create an RMF-Relevant Command

1. Look at the templates in `exercises/exercise-2-rmf-commands/`
2. Pick one and customize it for your project
3. Use it in a real work scenario

---

## Tips

- **Keep commands focused**: One command = one job. Don't make a command that
  does 10 different things.
- **Use `$ARGUMENTS`**: This makes commands flexible. The user provides context
  when invoking the command.
- **Test with edge cases**: What happens if no arguments are provided?
- **Iterate**: Start simple, add detail as you learn what works.

## What's Next?

In **Lesson 3**, you'll learn about **Skills** — the evolution of commands.
Skills can be auto-detected, include supporting files, and run in isolated
contexts. They're commands with superpowers.
