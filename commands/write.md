---
description: Start a content writing workflow. Generate outlines, write articles/posts/threads for WeChat, Zhihu, Xiaohongshu, or Twitter/X. WAIT for outline approval before writing full content.
---

# Write Command

This command invokes the **content-writer** agent to create original content for social media platforms.

## What This Command Does

1. **Confirm Topic** - Clarify the subject, angle, and target platform
2. **Generate Outline** - Create a structured outline for approval
3. **Wait for Confirmation** - MUST receive user approval before writing
4. **Write Full Content** - Produce the complete piece following platform specs

## Supported Parameters

- `--platform` - Target platform: `wechat`, `zhihu`, `xiaohongshu`, `twitter` (default: `wechat`)
- `--type` - Content type: `article`, `answer`, `note`, `thread` (auto-detected from platform)
- `--lang` - Language override: `zh`, `en` (default: platform native language)

## When to Use

Use `/write` when:
- Creating a new article or post from scratch
- Writing about a specific topic for a target platform
- Starting the content creation workflow

## How It Works

The content-writer agent will:

1. **Analyze the topic** and confirm the angle with you
2. **Create an outline** with section headers and key points
3. **Present the outline** and WAIT for your explicit confirmation
4. **Write the full piece** following the target platform's format specs
5. **Output as inline text** in the conversation (not to a file)

## Example Usage

```
User: /write --platform zhihu How AI is changing software development

Agent (content-writer):
# Outline: AI is Changing Software Development

Platform: Zhihu (知乎)
Estimated length: 3000-4000 chars

## Proposed Outline

1. Opening: The current state of AI-assisted coding
2. Three key shifts:
   - From writing code to reviewing AI-generated code
   - From debugging to prompt engineering
   - From solo coding to human-AI pair programming
3. Real examples from my experience
4. What this means for junior developers
5. Conclusion: Adapt or stagnate

WAITING FOR CONFIRMATION: Proceed with this outline? (yes/modify)
```

## Important Notes

**CRITICAL**: The agent will NOT write the full piece until you explicitly approve the outline.

If you want changes, respond with:
- "modify: [your changes]"
- "add a section about [topic]"
- "shorter, focus on [aspect]"

## Integration with Other Commands

After writing:
- Use `/adapt` to repurpose content for other platforms
- Content is output inline; ask to save if you need a file

## Related Agents

This command invokes the `content-writer` agent located at:
`~/.claude/agents/content-writer.md`

And references the `content-creation` skill at:
`~/.claude/skills/content-creation/`
