---
description: Interactive guide to learn and navigate the everything-claude-code project
---

# /ecc-guide - Everything Claude Code Project Guide

## Purpose

Interactive assistant to help users learn and navigate the everything-claude-code project. Acts as a conversational documentation layer that helps users discover features, understand workflows, and find the right tools for their tasks.

## Usage

```
/ecc-guide [topic]
```

**Topics:**
- `setup` - Installation and configuration guide
- `skills` - Browse and understand available skills
- `commands` - Learn about available commands
- `rules` - Understand coding rules and hooks
- `workflows` - Discover recommended development workflows
- `examples` - See real-world usage examples
- (no topic) - Start interactive conversation

## Why This Command?

### Problem It Solves
- **High learning curve**: New users don't know where to start with 80+ skills and commands
- **Poor discoverability**: Features exist but users don't know about them
- **Static documentation gap**: README is comprehensive but not conversational
- **Context switching**: Users have to leave their IDE to read docs

### Value Proposition
- 🎓 **Lower barrier to entry**: Get started without reading entire documentation
- 🔍 **Feature discovery**: Find tools you didn't know existed
- 💬 **Conversational learning**: Ask questions in natural language
- 🚀 **Faster onboarding**: Learn by doing, not just reading

## Implementation Strategy

### Step 1: Understand User Intent
Parse the user's question to identify what they're trying to accomplish:
- Learning about the project (onboarding)
- Finding a specific feature (discovery)
- Understanding how to use something (usage)
- Troubleshooting an issue (support)

### Step 2: Dynamic Content Loading
Read relevant project files based on intent:
```javascript
// Example: User asks about TDD workflow
const skillPath = './skills/tdd-workflow/SKILL.md';
const content = fs.readFileSync(skillPath, 'utf8');
// Parse and explain in conversational tone
```

### Step 3: Progressive Disclosure
Don't overwhelm users with all information at once:
1. Give a high-level overview first
2. Offer to dive deeper on specific aspects
3. Provide examples when requested
4. Link to full documentation for comprehensive learning

### Step 4: Context-Aware Responses
Tailor responses based on:
- User's experience level (detect from conversation)
- Current project context (language, framework)
- Recent activity (what they've been working on)

## Examples

### Example 1: Initial Onboarding
```
User: /ecc-guide

AI: 👋 Welcome to everything-claude-code!

This project provides 80+ skills, commands, and agents to supercharge your development workflow.

**Quick Start:**
- 🚀 New to the project? → `/ecc-guide setup`
- 🎯 Looking for specific features? → `/ecc-guide skills`
- 📝 Want workflow recommendations? → `/ecc-guide workflows`
- 💡 Just ask me anything!

What would you like to explore?
```

### Example 2: Skill Discovery
```
User: /ecc-guide skills

AI: The project has 80+ skills organized by category:

**Development Workflows:**
- `tdd-workflow` - Test-driven development
- `code-review` - Structured code reviews
- `e2e-testing` - End-to-end testing

**Language-Specific:**
- `python-patterns` - Python best practices
- `typescript-patterns` - TypeScript patterns
- `golang-patterns` - Go patterns

**Tooling:**
- `git-worktrees` - Advanced git workflows
- `systematic-debugging` - Debug methodology
- `verification-loop` - Continuous verification

Which category interests you? Or ask about a specific skill!
```

### Example 3: Deep Dive into Specific Feature
```
User: Tell me about tdd-workflow

AI: The **tdd-workflow** skill guides you through test-driven development.

**When it triggers:**
- You mention "TDD", "test first", or "write tests"
- You're starting a new feature
- You say "let's do TDD"

**How it works:**
1. 🔴 Write a failing test first
2. 🟢 Write minimal code to make it pass
3. 🔵 Refactor while keeping tests green
4. ↻ Repeat

**Example usage:**
```
You: "Let's add a user authentication feature using TDD"
AI: [Activates tdd-workflow]
    1. First, let's write a failing test for user login...
    2. Now let's implement just enough to pass...
    3. Tests pass! Let's refactor for clarity...
```

Want to see a real example? Or learn about related skills?
```

### Example 4: Workflow Recommendations
```
User: /ecc-guide workflows

AI: Here are the recommended workflows for common tasks:

**🚀 Feature Development:**
```
/prp-prd      → Write product requirements
/prp-plan     → Create implementation plan
/prp-implement → Build the feature
/prp-pr       → Create pull request
```

**🐛 Bug Fixing:**
```
/tdd          → Write failing test that reproduces bug
Fix code      → Make the test pass
/verify       → Run verification checks
```

**🔍 Code Review:**
```
/code-review  → Get structured review
Address feedback
/prp-commit   → Commit with proper message
```

Which workflow would you like to explore in detail?
```

### Example 5: Troubleshooting Help
```
User: I'm getting errors when trying to use the brainstorming skill

AI: Let me help troubleshoot the brainstorming skill issues.

**Common issues:**
1. **Missing dependencies**: Run `npm install` in the skill directory
2. **Port conflicts**: Check if port 3000 is already in use
3. **Browser not opening**: Try manually opening http://localhost:3000

**To diagnose:**
- What error message are you seeing?
- Which platform are you on (Cursor/Codex/OpenCode)?
- Have you run the setup command?

Can you share the specific error? I'll help you fix it!
```

## Command Behavior

### Interactive Mode (No Arguments)
```bash
/ecc-guide
```
Starts a conversational session where the AI asks clarifying questions to understand what you want to learn.

### Direct Topic Access
```bash
/ecc-guide skills
```
Directly shows information about the requested topic without introductory conversation.

### Specific Feature Lookup
```bash
/ecc-guide tdd-workflow
```
Provides detailed information about a specific skill, command, or agent.

### Search Mode
```bash
/ecc-guide find: "code review"
```
Searches across all skills, commands, and documentation for relevant content.

## Anti-patterns to Avoid

### ❌ Don't Duplicate Documentation
```
Bad: Copy/paste entire SKILL.md content
Good: Summarize key points, link to full docs
```

### ❌ Don't Overwhelm with Information
```
Bad: List all 80 skills in one response
Good: Categorize and let user drill down
```

### ❌ Don't Assume User's Level
```
Bad: Use technical jargon without explanation
Good: Explain concepts simply, offer deeper dive
```

### ❌ Don't Be Static
```
Bad: Return pre-written responses
Good: Read current project state, give contextual advice
```

## Integration with Existing Features

### Complements, Not Replaces
- 📚 **README**: Comprehensive reference → **ecc-guide**: Interactive learning
- 📖 **SKILL.md files**: Detailed specifications → **ecc-guide**: Practical usage
- 🛠️ **Individual commands**: Execute tasks → **ecc-guide**: Discover and learn

### Cross-Referencing
When explaining features, reference related tools:
```
"The tdd-workflow skill works great with /verify command 
and pairs well with systematic-debugging skill."
```

### Contextual Suggestions
Based on user's project, suggest relevant features:
```
Detected: TypeScript + React project
Suggested: typescript-patterns, react-patterns, e2e-testing skills
```

## Success Metrics

### User Can Accomplish These Goals:
- ✅ **Find relevant skill/command** for their task in under 2 interactions
- ✅ **Understand how to use a feature** without reading raw markdown
- ✅ **Discover new features** they weren't aware of
- ✅ **Get unblocked** when encountering issues
- ✅ **Learn recommended workflows** for their tech stack

### Indicators of Success:
- Reduced time from installation to first productive use
- Increased usage of lesser-known but valuable features
- Fewer "how do I..." questions in issues/discussions
- Higher user satisfaction in onboarding experience

## Future Enhancements

### Phase 2: Smart Recommendations
```javascript
// Analyze user's codebase
const detectedStack = analyzeProject();
// Recommend relevant skills
if (detectedStack.includes('python')) {
  suggest('python-patterns', 'python-testing');
}
```

### Phase 3: Usage Analytics
```javascript
// Track which features users discover via /ecc-guide
// Identify gaps in discoverability
// Improve recommendations based on data
```

### Phase 4: Personalized Learning Paths
```javascript
// Create skill progression paths
const beginnerPath = [
  'setup',
  'tdd-workflow',
  'code-review',
  'git-worktrees'
];
// Guide users through learning journey
```

## Technical Implementation Notes

### File Structure
```
commands/
  ecc-guide.md          # This file
  
scripts/ecc-guide/      # Optional: Helper scripts
  indexer.js            # Index all skills/commands
  search.js             # Full-text search
  recommender.js        # Smart recommendations
```

### Dynamic Content Loading
```javascript
// Read project structure
const projectIndex = {
  skills: fs.readdirSync('./skills').map(dir => ({
    name: dir,
    readme: fs.readFileSync(`./skills/${dir}/SKILL.md`, 'utf8')
  })),
  commands: fs.readdirSync('./commands').filter(f => f.endsWith('.md'))
};
```

### Caching Strategy
```javascript
// Cache project index on first load
// Invalidate cache when files change
// Balance freshness vs performance
```

## Maintenance

### Keeping Content Fresh
- 🔄 **Auto-sync**: Content is read dynamically from latest files
- 🎯 **Focus on structure**: Teach how to navigate, not memorize content
- 🔗 **Link to source**: Always reference canonical documentation

### When to Update This Command
- New major feature categories added
- Project structure changes significantly
- User feedback reveals confusing areas
- New integration points emerge

## Related Commands

- `/learn` - Learn from past coding sessions
- `/docs` - Access project documentation
- `/skill-create` - Create new skills
- `/help` - General help for current platform

## Notes for Contributors

### When Adding New Features
Update examples in this guide to include new categories of skills/commands.

### Testing the Guide
```bash
# Try common user journeys:
/ecc-guide                    # Initial experience
/ecc-guide skills             # Discovery
/ecc-guide tdd-workflow       # Deep dive
/ecc-guide find: "testing"    # Search
```

### Balancing Depth vs Brevity
- First response: Brief overview + options to drill down
- Follow-up: More detailed information
- Always: Option to see full documentation

---

**Remember**: This command is about making the project accessible and discoverable, not about replacing comprehensive documentation. It's a friendly guide, not an encyclopedia.
