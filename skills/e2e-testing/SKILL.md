---
name: e2e-testing
description: E2E testing patterns with Playwright — Page Object Model, test structure, flaky test management, configuration, CI/CD integration, and artifact handling.
---

# E2E Testing Patterns

Practical patterns for building reliable end-to-end tests with Playwright. Covers test structure, Page Object Model, flaky test handling, configuration, CI/CD integration, and artifact management.

## Test File Organization

```
tests/
├── e2e/                       # End-to-end user journeys
│   ├── auth/                  # Authentication flows
│   │   ├── login.spec.ts
│   │   ├── logout.spec.ts
│   │   └── register.spec.ts
│   ├── features/              # Core feature flows
│   │   ├── browse.spec.ts
│   │   ├── search.spec.ts
│   │   └── create.spec.ts
│   └── api/                   # API endpoint tests
│       └── api.spec.ts
├── fixtures/                  # Test data and helpers
│   ├── auth.ts
│   └── data.ts
└── playwright.config.ts
```

## Page Object Model Pattern

```typescript
// pages/MarketsPage.ts
import { Page, Locator } from '@playwright/test'

export class MarketsPage {
  readonly page: Page
  readonly searchInput: Locator
  readonly marketCards: Locator
  readonly createMarketButton: Locator
  readonly filterDropdown: Locator

  constructor(page: Page) {
    this.page = page
    this.searchInput = page.locator('[data-testid="search-input"]')
    this.marketCards = page.locator('[data-testid="market-card"]')
    this.createMarketButton = page.locator('[data-testid="create-market-btn"]')
    this.filterDropdown = page.locator('[data-testid="filter-dropdown"]')
  }

  async goto() {
    await this.page.goto('/markets')
    await this.page.waitForLoadState('networkidle')
  }

  async searchMarkets(query: string) {
    await this.searchInput.fill(query)
    await this.page.waitForResponse(resp => resp.url().includes('/api/search'))
    await this.page.waitForLoadState('networkidle')
  }

  async getMarketCount() {
    return await this.marketCards.count()
  }

  async clickMarket(index: number) {
    await this.marketCards.nth(index).click()
  }

  async filterByStatus(status: string) {
    await this.filterDropdown.selectOption(status)
    await this.page.waitForLoadState('networkidle')
  }
}
```

## Example Test with Best Practices

```typescript
import { test, expect } from '@playwright/test'
import { MarketsPage } from '../../pages/MarketsPage'

test.describe('Market Search', () => {
  let marketsPage: MarketsPage

  test.beforeEach(async ({ page }) => {
    marketsPage = new MarketsPage(page)
    await marketsPage.goto()
  })

  test('should search by keyword', async ({ page }) => {
    // Arrange
    await expect(page).toHaveTitle(/Markets/)

    // Act
    await marketsPage.searchMarkets('election')

    // Assert
    const count = await marketsPage.getMarketCount()
    expect(count).toBeGreaterThan(0)
    await expect(marketsPage.marketCards.first()).toContainText(/election/i)
    await page.screenshot({ path: 'artifacts/search-results.png' })
  })

  test('should handle no results gracefully', async ({ page }) => {
    await marketsPage.searchMarkets('xyznonexistent123')
    await expect(page.locator('[data-testid="no-results"]')).toBeVisible()
    expect(await marketsPage.getMarketCount()).toBe(0)
  })
})
```

## Common Test Scenarios

### Browse & Navigate

```typescript
test('user can browse and view details', async ({ page }) => {
  await page.goto('/markets')
  const cards = page.locator('[data-testid="market-card"]')
  await expect(cards.first()).toBeVisible()

  await cards.first().click()
  await expect(page).toHaveURL(/\/markets\/[a-z0-9-]+/)
  await expect(page.locator('[data-testid="detail-name"]')).toBeVisible()
})
```

### Wallet Connection (with mock)

```typescript
test('user can connect wallet', async ({ page, context }) => {
  await context.addInitScript(() => {
    window.ethereum = {
      isMetaMask: true,
      request: async ({ method }) => {
        if (method === 'eth_requestAccounts') return ['0x1234...']
        if (method === 'eth_chainId') return '0x1'
      }
    }
  })

  await page.goto('/')
  await page.locator('[data-testid="connect-wallet"]').click()
  await expect(page.locator('[data-testid="wallet-modal"]')).toBeVisible()
  await page.locator('[data-testid="wallet-provider-metamask"]').click()
  await expect(page.locator('[data-testid="wallet-address"]')).toContainText('0x1234')
})
```

### Authenticated Actions

```typescript
test('authenticated user can create resource', async ({ page }) => {
  await page.goto('/dashboard')
  const isAuthenticated = await page.locator('[data-testid="user-menu"]').isVisible()
  test.skip(!isAuthenticated, 'User not authenticated')

  await page.locator('[data-testid="create-btn"]').click()
  await page.locator('[data-testid="name-input"]').fill('Test Item')
  await page.locator('[data-testid="submit"]').click()
  await expect(page.locator('[data-testid="success-message"]')).toBeVisible()
})
```

### Financial/Critical Flows

```typescript
test('user can place trade', async ({ page }) => {
  test.skip(process.env.NODE_ENV === 'production', 'Skip on production')

  await page.goto('/markets/test-market')
  await page.locator('[data-testid="position-yes"]').click()
  await page.locator('[data-testid="trade-amount"]').fill('1.0')

  const preview = page.locator('[data-testid="trade-preview"]')
  await expect(preview).toContainText('1.0')

  await page.locator('[data-testid="confirm-trade"]').click()
  await page.waitForResponse(
    resp => resp.url().includes('/api/trade') && resp.status() === 200,
    { timeout: 30000 }
  )
  await expect(page.locator('[data-testid="trade-success"]')).toBeVisible()
})
```

## Flaky Test Patterns

### Common Causes & Fixes

**Race conditions:**
```typescript
// BAD: Don't assume element is ready
await page.click('[data-testid="button"]')

// GOOD: Use locator with built-in auto-wait
await page.locator('[data-testid="button"]').click()
```

**Network timing:**
```typescript
// BAD: Arbitrary timeout
await page.waitForTimeout(5000)

// GOOD: Wait for specific condition
await page.waitForResponse(resp => resp.url().includes('/api/data'))
```

**Animation timing:**
```typescript
// BAD: Click during animation
await page.click('[data-testid="menu-item"]')

// GOOD: Wait for stability
await page.locator('[data-testid="menu-item"]').waitFor({ state: 'visible' })
await page.waitForLoadState('networkidle')
await page.locator('[data-testid="menu-item"]').click()
```

### Quarantine Pattern

```typescript
test('flaky: complex query search', async ({ page }) => {
  test.fixme(true, 'Flaky - Issue #123')
  // ...
})

test('conditional skip in CI', async ({ page }) => {
  test.skip(process.env.CI, 'Flaky in CI - Issue #456')
  // ...
})
```

## Playwright Configuration

```typescript
import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [
    ['html', { outputFolder: 'playwright-report' }],
    ['junit', { outputFile: 'playwright-results.xml' }],
  ],
  use: {
    baseURL: process.env.BASE_URL || 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    actionTimeout: 10000,
    navigationTimeout: 30000,
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'firefox', use: { ...devices['Desktop Firefox'] } },
    { name: 'webkit', use: { ...devices['Desktop Safari'] } },
    { name: 'mobile-chrome', use: { ...devices['Pixel 5'] } },
  ],
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
    timeout: 120000,
  },
})
```

## Artifact Management

```typescript
// Screenshots
await page.screenshot({ path: 'artifacts/after-login.png' })
await page.screenshot({ path: 'artifacts/full-page.png', fullPage: true })
await page.locator('[data-testid="chart"]').screenshot({ path: 'artifacts/chart.png' })

// Trace collection
await browser.startTracing(page, { path: 'artifacts/trace.json', screenshots: true, snapshots: true })
// ... test actions ...
await browser.stopTracing()
```

## CI/CD Integration

```yaml
# .github/workflows/e2e.yml
name: E2E Tests
on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20

      - run: npm ci
      - run: npx playwright install --with-deps
      - run: npx playwright test
        env:
          BASE_URL: ${{ vars.STAGING_URL }}

      - uses: actions/upload-artifact@v4
        if: always()
        with:
          name: playwright-report
          path: playwright-report/
          retention-days: 30
```

## Test Report Format

```markdown
# E2E Test Report

**Date:** YYYY-MM-DD | **Duration:** Xm Ys | **Status:** PASSING / FAILING

## Summary
- Total: X | Passed: Y | Failed: A | Flaky: B | Skipped: C

## Failed Tests
### test-name
- **File:** `tests/e2e/feature.spec.ts:45`
- **Error:** Expected element to be visible
- **Screenshot:** artifacts/failed.png

## Artifacts
- HTML Report: playwright-report/index.html
- Screenshots: artifacts/*.png
- Traces: artifacts/*.zip
```

## Best Practices

- **Prefer `data-testid` selectors** — resilient to styling and text changes
- **Use Page Object Model** — centralizes selectors, reduces duplication
- **Wait for conditions, not time** — `waitForResponse` over `waitForTimeout`
- **Arrange-Act-Assert** — clear test structure
- **One assertion per concern** — easier to diagnose failures
- **Skip production-unsafe tests** — guard financial flows with env checks
- **Capture artifacts on failure** — screenshots, video, traces for debugging
- **Run flaky detection** — `--repeat-each=10` before merging new tests

## When to Use

- Writing or maintaining Playwright E2E test suites
- Setting up E2E infrastructure (config, CI/CD, reporting)
- Debugging flaky tests or improving test reliability
- Implementing Page Object Model for a new feature area
