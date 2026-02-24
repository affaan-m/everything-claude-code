---
paths:
  - "**/*.rb"
  - "**/Gemfile"
  - "**/Rakefile"
  - "**/*.gemspec"
---
# Ruby Testing

> This file extends [common/testing.md](../common/testing.md) with Ruby specific content.

## Framework

Use **RSpec** with descriptive `describe`/`it` blocks:

```ruby
RSpec.describe User do
  describe "#full_name" do
    it "concatenates first and last name" do
      user = build(:user, first_name: "Jane", last_name: "Doe")
      expect(user.full_name).to eq("Jane Doe")
    end
  end
end
```

## Test Data

Use **FactoryBot** for test data and **shoulda-matchers** for model validations.

## Coverage

Target 80%+ with **SimpleCov**:

```ruby
# spec/spec_helper.rb
require "simplecov"
SimpleCov.start
```

## Reference

See skill: `rails-patterns` for Rails-specific testing patterns.
