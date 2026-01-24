# Claude Code Project Instructions

This file contains project-specific instructions for Claude Code when working in this repository.

## Project Documentation Requirement

### FOR Andrew Danckert.md

**For every project, write a detailed `FOR Andrew Danckert.md` file** that explains the whole project in plain language.

This document should include:

1. **Technical Architecture** — Explain how the system is designed at a high level. What are the main components? How do they communicate? Think of it like describing the blueprint of a house to someone who's never seen architectural drawings.

2. **Codebase Structure** — Walk through how the code is organized and how the various parts connect to each other. Explain the "why" behind the folder structure and file organization. Help the reader build a mental map of where everything lives.

3. **Technologies Used** — List the key technologies, frameworks, libraries, and tools. But don't just list them — explain *why* we chose each one. What problem does it solve? What were the alternatives we considered?

4. **Technical Decisions** — Document the important choices we made and the reasoning behind them. Include trade-offs we weighed and why we went one direction over another.

5. **Lessons Learned** — This is the gold. Include:
   - **Bugs we encountered** and how we fixed them (the gnarlier the better — these are the stories that stick)
   - **Potential pitfalls** and how to avoid them in the future
   - **New technologies** we learned and key insights about them
   - **How good engineers think and work** — capture the problem-solving approaches, debugging strategies, and mental models that made things click
   - **Best practices** we discovered or reinforced

### Writing Style Guidelines

- **Be engaging** — This is not a boring technical manual or a dry textbook. Write like you're explaining the project to a smart friend over coffee.
- **Use analogies** — Complex technical concepts become memorable when compared to familiar things. "The message queue is like a restaurant's order tickets hanging in the kitchen..."
- **Include anecdotes** — The story of that 3am debugging session that led to discovering a subtle race condition is more valuable than a sterile bullet point.
- **Plain language first** — Assume the reader is intelligent but might not know the specific domain. Explain jargon when you first use it.
- **Make it memorable** — The goal is for someone to read this months later and actually remember the key lessons.

### Example Section Tone

Instead of:
> "The application uses Redis for caching to improve performance."

Write:
> "We added Redis as a caching layer after noticing the database was getting hammered with the same queries over and over. It's like having a really good assistant who remembers the answers to questions you ask frequently — instead of looking it up every time, they just tell you from memory. This dropped our average response time from 800ms to under 50ms for cached routes."

---

## Repository Overview

This repository (`everything-claude-code`) is a collection of Claude Code configurations, hooks, skills, and best practices. When working here, maintain the organizational structure and follow the patterns established in existing files.
