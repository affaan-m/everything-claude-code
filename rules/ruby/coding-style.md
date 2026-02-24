---
paths:
  - "**/*.rb"
  - "**/Gemfile"
  - "**/Rakefile"
  - "**/*.gemspec"
---
# Ruby Coding Style

> This file extends [common/coding-style.md](../common/coding-style.md) with Ruby specific content.

## Frozen String Literal

Always add the magic comment at the top of every `.rb` file:

```ruby
# frozen_string_literal: true
```

## Naming

- Classes/Modules: `PascalCase`
- Methods/Variables: `snake_case`
- Constants: `UPPER_SNAKE_CASE`
- Predicates: end with `?` (e.g., `valid?`, `empty?`)
- Dangerous methods: end with `!` (e.g., `save!`, `strip!`)

## Style

- 2-space indentation, no tabs
- Prefer guard clauses over nested conditionals
- Use `&.` (safe navigation) instead of `nil` checks
- Prefer string interpolation over concatenation
- Use `%w[]` for word arrays, `%i[]` for symbol arrays

```ruby
# Good
return unless user&.active?

names = %w[alice bob carol]
```

## Reference

See skill: `rails-patterns` for Rails-specific conventions and patterns.
