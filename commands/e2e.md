---
description: Generate and run Playwright E2E tests for critical user flows.
---

# /e2e

Invokes the **e2e-runner** agent.

## When to Use

- Testing critical user journeys (login, trading, payments)
- Verifying multi-step flows end-to-end
- Preparing for production deployment

## What It Does

1. Analyze user flow and identify test scenarios
2. Generate Playwright test with Page Object Model
3. Run tests across browsers
4. Capture failures with screenshots/videos/traces
5. Identify flaky tests

## Example

```
/e2e Test the market search and view flow
```

## Quick Commands

```bash
npx playwright test                    # Run all
npx playwright test --headed           # See browser
npx playwright test --debug            # Debug
npx playwright codegen localhost:3000  # Generate
npx playwright show-report             # View report
```

See `agents/e2e-runner.md` for details.
