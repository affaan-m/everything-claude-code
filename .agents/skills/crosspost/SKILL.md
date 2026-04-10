---
name: crosspost
description: Multi-platform content distribution across X, LinkedIn, Threads, and Bluesky. Adapts content per platform using content-engine patterns. Never posts identical content cross-platform. Use when the user wants to distribute content across social platforms.
origin: ECC
---

# Crosspost

Distribute content across multiple social platforms with platform-native adaptation.

## When to Activate

- User wants to post content to multiple platforms
- Publishing announcements, launches, or updates across social media
- Repurposing a post from one platform to others
- User says "crosspost", "post everywhere", "share on all platforms", or "distribute this"

## Core Rules

1. **Never post identical content cross-platform.** Each platform gets a native adaptation.
2. **Primary platform first.** Post to the main platform, then adapt for others.
3. **Respect platform conventions.** Length limits, formatting, link handling all differ.
4. **One idea per post.** If the source content has multiple ideas, split across posts.
5. **Attribution matters.** If crossposting someone else's content, credit the source.

## Platform Specifications

| Platform | Max Length | Link Handling | Hashtags | Media |
|----------|-----------|---------------|----------|-------|
| X | 280 chars (4000 for Premium) | Counted in length | Minimal (1-2 max) | Images, video, GIFs |
| LinkedIn | 3000 chars | Not counted in length | 3-5 relevant | Images, video, docs, carousels |
| Threads | 500 chars | Separate link attachment | None typical | Images, video |
| Bluesky | 300 chars | Via facets (rich text) | None (use feeds) | Images |

## Workflow

### Step 1: Create Source Content

Start with the core idea. Use `content-engine` skill for high-quality drafts:
- Identify the single core message
- Determine the primary platform (where the audience is biggest)
- Draft the primary platform version first

### Step 2: Identify Target Platforms

Ask the user or determine from context:
- Which platforms to target
- Priority order (primary gets the best version)
- Any platform-specific requirements (e.g., LinkedIn needs professional tone)

### Step 3: Adapt Per Platform

For each target platform, transform the content:

**X adaptation:**
- Open with a hook, not a summary
- Cut to the core insight fast
- Keep links out of main body when possible
- Use thread format for longer content

**LinkedIn adaptation:**
- Strong first line (visible before "see more")
- Short paragraphs with line breaks
- Frame around lessons, results, or professional takeaways
- More explicit context than X (LinkedIn audience needs framing)

**Threads adaptation:**
- Conversational, casual tone
- Shorter than LinkedIn, less compressed than X
- Visual-first if possible

**Bluesky adaptation:**
- Direct and concise (300 char limit)
- Community-oriented tone
- Use feeds/lists for topic targeting instead of hashtags

### Step 4: Post Primary Platform

Post to the primary platform first:
- Use `x-api` skill for X
- Use platform-specific APIs or tools for others
- Capture the post URL for cross-referencing

### Step 5: Post to Secondary Platforms

Post adapted versions to remaining platforms:
- Stagger timing (not all at once — 30-60 min gaps)
- Include cross-platform references where appropriate ("longer thread on X" etc.)

## Content Adaptation Examples

### Source: Product Launch

**X version:**
```
We just shipped [feature].

[One specific thing it does that's impressive]

[Link]
```

**LinkedIn version:**
```
Excited to share: we just launched [feature] at [Company].

Here's why it matters:

[2-3 short paragraphs with context]

[Takeaway for the audience]

[Link]
```

**Threads version:**
```
just shipped something cool — [feature]

[casual explanation of what it does]

link in bio
```

### Source: Technical Insight

**X version:**
```
TIL: [specific technical insight]

[Why it matters in one sentence]
```

**LinkedIn version:**
```
A pattern I've been using that's made a real difference:

[Technical insight with professional framing]

[How it applies to teams/orgs]

#relevantHashtag
```

## API Integration

### Batch Crossposting Service (Example Pattern)
If using a crossposting service (e.g., Postbridge, Buffer, or a custom API), the pattern looks like:

```python
import os
import requests

resp = requests.post(
    "https://api.postbridge.io/v1/posts",
    headers={"Authorization": f"Bearer {os.environ['POSTBRIDGE_API_KEY']}"},
    json={
        "platforms": ["twitter", "linkedin", "threads"],
        "content": {
            "twitter": {"text": x_version},
            "linkedin": {"text": linkedin_version},
            "threads": {"text": threads_version}
        }
    }
)
```

### Manual Posting
Without Postbridge, post to each platform using its native API:
- X: Use `x-api` skill patterns
- LinkedIn: LinkedIn API v2 with OAuth 2.0
- Threads: Threads API (Meta)
- Bluesky: AT Protocol API

## Quality Gate

Before posting:
- [ ] Each platform version reads naturally for that platform
- [ ] No identical content across platforms
- [ ] Length limits respected
- [ ] Links work and are placed appropriately
- [ ] Tone matches platform conventions
- [ ] Media is sized correctly for each platform

## Related Skills

- `content-engine` — Generate platform-native content
- `x-api` — X/Twitter API integration
