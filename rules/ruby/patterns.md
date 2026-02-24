---
paths:
  - "**/*.rb"
  - "**/Gemfile"
  - "**/Rakefile"
  - "**/*.gemspec"
---
# Ruby Patterns

> This file extends [common/patterns.md](../common/patterns.md) with Ruby specific content.

## Service Objects

Encapsulate business logic in callable objects:

```ruby
class CreateOrder
  def initialize(user:, items:)
    @user = user
    @items = items
  end

  def call
    ActiveRecord::Base.transaction do
      order = @user.orders.create!(status: :pending)
      @items.each { |item| order.line_items.create!(item) }
      order
    end
  end
end
```

## Value Objects & Enumerable

Use `Data.define` (Ruby 3.2+) for immutable values. Prefer `Enumerable` over manual loops:

```ruby
Point = Data.define(:x, :y)
active_names = users.select(&:active?).map(&:name)
```

## Reference

See skill: `rails-patterns` for Rails-specific patterns including ActiveRecord, concerns, and MVC.
