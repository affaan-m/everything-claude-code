---
description: Generate and run Playwright E2E tests for critical user flows.
---

Generate Playwright E2E tests for: $ARGUMENTS

Steps:
1. Analyze user flow and identify test scenarios
2. Generate Playwright test with Page Object Model
3. Run tests across browsers
4. Capture failures with screenshots/videos/traces
5. Identify and handle flaky tests

Useful commands:
```bash
npx playwright test                    # Run all
npx playwright test --headed           # See browser
npx playwright test --debug            # Debug
npx playwright codegen localhost:3000  # Generate
npx playwright show-report             # View report
```
