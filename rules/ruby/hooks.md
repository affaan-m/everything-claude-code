---
paths:
  - "**/*.rb"
  - "**/Gemfile"
  - "**/Rakefile"
  - "**/*.gemspec"
---
# Ruby Hooks

> This file extends [common/hooks.md](../common/hooks.md) with Ruby specific content.

## PostToolUse Hooks

Configure in `~/.claude/settings.json`:

- **rubocop**: Auto-correct `.rb` files after edit (`rubocop --autocorrect`)
- **rspec**: Run tests after editing spec files (`bundle exec rspec`)
- **brakeman**: Security scan after editing models/controllers (`brakeman --quiet`)
