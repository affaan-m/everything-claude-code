---
description: Adapt existing content for a different platform. Rewrite articles/posts/threads across WeChat, Zhihu, Xiaohongshu, and Twitter/X with proper format and cultural adaptation.
---

# Adapt Command

This command invokes the **content-writer** agent to adapt existing content for a different platform.

## What This Command Does

1. **Read Source Content** - Analyze the original piece
2. **Plan Adaptation** - Determine what changes are needed for the target platform
3. **Rewrite Content** - Produce a platform-native version (not a direct translation)
4. **Output Result** - Present the adapted content inline

## Supported Parameters

- `--from` - Source platform: `wechat`, `zhihu`, `xiaohongshu`, `twitter` (auto-detected if content is provided)
- `--to` - Target platform (required): `wechat`, `zhihu`, `xiaohongshu`, `twitter`

## When to Use

Use `/adapt` when:
- You have existing content and want to publish on another platform
- Converting a Chinese article to an English Twitter thread
- Condensing a long-form piece into a short Xiaohongshu note
- Expanding a Twitter thread into a full Zhihu analysis

## Adaptation Matrix

| From | To | What Changes |
|------|----|--------------|
| Zhihu | WeChat | Restructure for narrative flow, add visual breaks, soften academic tone |
| Zhihu | Xiaohongshu | Extract 3-5 tips, rewrite casually, shorten to 300-1000 chars |
| Zhihu/WeChat | Twitter | Rewrite in English, extract key insights, format as thread |
| Twitter | Zhihu | Expand into full Chinese analysis, add sources and depth |
| WeChat | Xiaohongshu | Extract core takeaways, casual rewrite, add formatting |
| Xiaohongshu | WeChat | Expand with depth, add analysis, professional tone |

## How It Works

The content-writer agent will:

1. **Read the source content** you provide (paste inline or reference a file)
2. **Identify key ideas** and structure from the original
3. **Rewrite for the target platform** following its format specs
4. **Adjust language** if crossing Chinese/English boundary
5. **Output the adapted version** inline

## Example Usage

```
User: /adapt --to xiaohongshu
[pastes a 3000-char Zhihu article about productivity tools]

Agent (content-writer):
# Adapted for Xiaohongshu (小红书)

5个让我效率翻倍的工具

1/5 Notion - 知识管理神器
把所有笔记、项目、文档放在一个地方
再也不用在10个app之间切换了

2/5 Arc Browser - 浏览器革命
...

[300-800 chars, casual tone, structured as numbered tips]

#效率工具 #生产力 #工具推荐 #自我提升 #职场干货
```

## Important Notes

- Adaptation is rewriting, NOT translation
- Each platform has its own culture and reader expectations
- The core idea stays the same; the presentation changes completely
- Provide the source content by pasting it or referencing a file path

## Integration with Other Commands

- Use `/write` first to create original content
- Use `/adapt` to distribute across platforms
- Recommended flow: Write deep (Zhihu) -> Adapt to WeChat -> Adapt to Xiaohongshu -> Adapt to Twitter

## Related Agents

This command invokes the `content-writer` agent located at:
`~/.claude/agents/content-writer.md`

And references the `content-creation` skill at:
`~/.claude/skills/content-creation/`
