# ecc-guide

Interactive guide to help users learn and navigate the everything-claude-code project. Acts as a conversational documentation layer that helps users discover features, understand workflows, and find the right tools for their tasks.

## When to Activate

Activate this skill when the user:
- Asks for help navigating the project
- Wants to learn about available skills, commands, or agents
- Needs guidance on workflows or best practices
- Says "guide me", "show me around", "how do I...", or "what can you do?"
- Is new to the project and needs onboarding
- Asks questions like:
  - "What skills are available?"
  - "How do I do TDD here?"
  - "Show me the recommended workflow"
  - "I'm lost, help me get started"

## Purpose

**Problem It Solves:**
- **High learning curve**: New users don't know where to start with 80+ skills and commands
- **Poor discoverability**: Features exist but users don't know about them
- **Static documentation gap**: README is comprehensive but not conversational
- **Context switching**: Users have to leave their IDE to read docs

**Value Proposition:**
- **Lower barrier to entry**: Get started without reading entire documentation
- **Feature discovery**: Find tools you didn't know existed
- **Conversational learning**: Ask questions in natural language
- **Faster onboarding**: Learn by doing, not just reading

## How It Works

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

## Usage Examples

### Example 1: Initial Onboarding
```
User: I'm new here, can you guide me?

AI: Welcome to everything-claude-code!

This project provides 80+ skills, commands, and agents to supercharge your development workflow.

**Quick Start:**
- **New to the project?** Ask me about "setup"
- **Looking for specific features?** Ask about "skills"
- **Want workflow recommendations?** Ask about "workflows"
- **Just ask me anything!**

What would you like to explore?
```

### Example 2: Skill Discovery
```
User: What skills are available?

AI: The project has 80+ skills organized by category:

**Development Workflows:**
- `tdd-workflow` - Test-driven development
- `code-review` - Structured code reviews
- `e2e-testing` - End-to-end testing

**Language-Specific:**
- `python-patterns` - Python best practices
- `frontend-patterns` - Frontend development patterns
- `backend-patterns` - Backend architecture patterns

**Tooling:**
- `git-workflow` - Advanced git workflows
- `agent-introspection-debugging` - Debug methodology
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
1. Write a failing test first
2. Write minimal code to make it pass
3. Refactor while keeping tests green
4. Repeat

**Example usage:**
  You: "Let's add a user authentication feature using TDD"
  AI: [Activates tdd-workflow]
      1. First, let's write a failing test for user login...
      2. Now let's implement just enough to pass...
      3. Tests pass! Let's refactor for clarity...

Want to see a real example? Or learn about related skills?
```

### Example 4: Workflow Recommendations
```
User: What's the recommended workflow for building a feature?

AI: Here are the recommended workflows for common tasks:

**Feature Development:**
  /prp-prd      -> Write product requirements
  /prp-plan     -> Create implementation plan
  /prp-implement -> Build the feature
  /prp-pr       -> Create pull request

**Bug Fixing:**
  /tdd          -> Write failing test that reproduces bug
  Fix code      -> Make the test pass
  /verify       -> Run verification checks

**Code Review:**
  /code-review  -> Get structured review
  Address feedback
  /prp-commit   -> Commit with proper message

Which workflow would you like to explore in detail?
```

### Example 5: Troubleshooting Help
```
User: I'm having issues with a skill not activating

AI: Let me help troubleshoot skill activation issues.

**Common reasons why skills don't activate:**
1. **Skill not installed**: Check if the skill exists in your skills/ directory
2. **Trigger keywords not matched**: Skills activate based on specific keywords - check the "When to Activate" section in SKILL.md
3. **Context mismatch**: Some skills only activate in certain project contexts (e.g., language-specific skills)

**To diagnose:**
- What skill are you trying to use?
- What command or request did you make?
- What happened instead of the expected behavior?

Share these details and I'll help you figure out what's wrong!
```

## Anti-patterns to Avoid

### Don't Duplicate Documentation
```
Bad: Copy/paste entire SKILL.md content
Good: Summarize key points, link to full docs
```

### Don't Overwhelm with Information
```
Bad: List all 80 skills in one response
Good: Categorize and let user drill down
```

### Don't Assume User's Level
```
Bad: Use technical jargon without explanation
Good: Explain concepts simply, offer deeper dive
```

### Don't Be Static
```
Bad: Return pre-written responses
Good: Read current project state, give contextual advice
```

## Integration with Existing Features

### Complements, Not Replaces
- **README**: Comprehensive reference -> **ecc-guide**: Interactive learning
- **SKILL.md files**: Detailed specifications -> **ecc-guide**: Practical usage
- **Individual commands**: Execute tasks -> **ecc-guide**: Discover and learn

### Cross-Referencing
When explaining features, reference related tools:
```
"The tdd-workflow skill works great with /verify command 
and pairs well with agent-introspection-debugging skill."
```

### Contextual Suggestions
Based on user's project, suggest relevant features:
```
Detected: TypeScript + React project
Suggested: frontend-patterns, backend-patterns, e2e-testing skills
```

## Success Metrics

### User Can Accomplish These Goals:
- **Find relevant skill/command** for their task in under 2 interactions
- **Understand how to use a feature** without reading raw markdown
- **Discover new features** they weren't aware of
- **Get unblocked** when encountering issues
- **Learn recommended workflows** for their tech stack

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
  'git-workflow'
];
// Guide users through learning journey
```

## Technical Implementation

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
- **Auto-sync**: Content is read dynamically from latest files
- **Focus on structure**: Teach how to navigate, not memorize content
- **Link to source**: Always reference canonical documentation

### When to Update This Skill
- New major feature categories added
- Project structure changes significantly
- User feedback reveals confusing areas
- New integration points emerge

## Related Skills & Commands

- `/learn` - Learn from past coding sessions
- `/docs` - Access project documentation
- `/skill-create` - Create new skills
- `tdd-workflow` - Test-driven development
- `code-review` - Structured code reviews
- `verification-loop` - Continuous verification

## Notes for Contributors

### When Adding New Features
Update examples in this guide to include new categories of skills/commands.

### Testing the Guide
- Ask "guide me" or "help me get started"
- Ask about specific skills/commands
- Ask for workflow recommendations
- Test search functionality

### Balancing Depth vs Brevity
- First response: Brief overview + options to drill down
- Follow-up: More detailed information
- Always: Option to see full documentation

---

**Remember**: This skill is about making the project accessible and discoverable, not about replacing comprehensive documentation. It's a friendly guide, not an encyclopedia.
