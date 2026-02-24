---
paths:
  - "**/*.rb"
  - "**/Gemfile"
  - "**/Rakefile"
  - "**/*.gemspec"
---
# Ruby Security

> This file extends [common/security.md](../common/security.md) with Ruby specific content.

## Static Analysis

Run **Brakeman** on every Rails project:

```bash
bundle exec brakeman --quiet
```

## Strong Parameters

Never trust user input — always use `params.permit`:

```ruby
def user_params
  params.require(:user).permit(:name, :email)
end
```

## Dangerous Methods

Avoid `send` and `public_send` with user input — they allow arbitrary method execution.

## Output Escaping

In ERB templates, always use `<%= %>` (auto-escaped). Never use `raw` or `html_safe` on user-controlled strings.

## Dependency Audit

Run `bundle audit check --update` regularly to detect vulnerable gems.

## Reference

See skill: `rails-patterns` for Rails-specific security patterns.
