---
name: e2e-patterns
description: End-to-end testing patterns with Playwright including page objects, test fixtures, visual regression, API mocking, and CI integration.
origin: ECC
---

# E2E Testing Patterns with Playwright

Comprehensive patterns for reliable end-to-end testing.

## When to Activate

- Writing E2E tests with Playwright
- Setting up test infrastructure
- Testing common user flows
- Configuring CI test pipelines

## Core Principles

- Test user flows, not implementation details
- Use stable selectors (`data-testid`, roles, labels)
- Isolate tests — no shared state between tests
- Never use `sleep` — use Playwright's auto-waiting

## Configuration

```typescript
// playwright.config.ts
import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [
    ['html', { open: 'never' }],
    ['json', { outputFile: 'test-results/results.json' }],
  ],
  use: {
    baseURL: process.env.BASE_URL ?? 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'on-first-retry',
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'mobile', use: { ...devices['iPhone 14'] } },
  ],
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
  },
})
```

## Page Object Model

```typescript
// e2e/pages/base.page.ts
import { Page, Locator } from '@playwright/test'

export class BasePage {
  constructor(protected page: Page) {}

  async navigateTo(path: string) {
    await this.page.goto(path)
  }

  getByTestId(id: string): Locator {
    return this.page.getByTestId(id)
  }

  async waitForPageLoad() {
    await this.page.waitForLoadState('networkidle')
  }
}

// e2e/pages/login.page.ts
export class LoginPage extends BasePage {
  get emailInput() { return this.page.getByLabel('Email') }
  get passwordInput() { return this.page.getByLabel('Password') }
  get submitButton() { return this.page.getByRole('button', { name: 'Sign In' }) }
  get errorMessage() { return this.getByTestId('login-error') }

  async login(email: string, password: string) {
    await this.emailInput.fill(email)
    await this.passwordInput.fill(password)
    await this.submitButton.click()
  }
}

// e2e/pages/dashboard.page.ts
export class DashboardPage extends BasePage {
  get searchInput() { return this.page.getByPlaceholder('Search...') }
  get userMenu() { return this.getByTestId('user-menu') }

  async search(query: string) {
    await this.searchInput.fill(query)
    await this.page.keyboard.press('Enter')
    await this.page.waitForResponse('**/api/search**')
  }

  async logout() {
    await this.userMenu.click()
    await this.page.getByRole('menuitem', { name: 'Logout' }).click()
  }
}
```

## Test Fixtures

```typescript
// e2e/fixtures.ts
import { test as base } from '@playwright/test'
import { LoginPage } from './pages/login.page'
import { DashboardPage } from './pages/dashboard.page'

type Fixtures = {
  loginPage: LoginPage
  dashboardPage: DashboardPage
  authenticatedPage: DashboardPage
}

export const test = base.extend<Fixtures>({
  loginPage: async ({ page }, use) => {
    await use(new LoginPage(page))
  },
  dashboardPage: async ({ page }, use) => {
    await use(new DashboardPage(page))
  },
  authenticatedPage: async ({ page }, use) => {
    // Login before test
    const loginPage = new LoginPage(page)
    await loginPage.navigateTo('/login')
    await loginPage.login('test@example.com', 'password123')
    await page.waitForURL('/dashboard')
    await use(new DashboardPage(page))
  },
})

export { expect } from '@playwright/test'
```

## Common Test Scenarios

### Authentication Flow

```typescript
import { test, expect } from './fixtures'

test.describe('Authentication', () => {
  test('logs in with valid credentials', async ({ loginPage, page }) => {
    await loginPage.navigateTo('/login')
    await loginPage.login('user@example.com', 'password123')
    await expect(page).toHaveURL('/dashboard')
  })

  test('shows error for invalid credentials', async ({ loginPage }) => {
    await loginPage.navigateTo('/login')
    await loginPage.login('user@example.com', 'wrong')
    await expect(loginPage.errorMessage).toBeVisible()
    await expect(loginPage.errorMessage).toContainText('Invalid credentials')
  })

  test('validates required fields', async ({ loginPage }) => {
    await loginPage.navigateTo('/login')
    await loginPage.submitButton.click()
    await expect(loginPage.page.getByText('Email is required')).toBeVisible()
  })

  test('logs out successfully', async ({ authenticatedPage }) => {
    await authenticatedPage.logout()
    await expect(authenticatedPage.page).toHaveURL('/login')
  })
})
```

### Form Submission

```typescript
test.describe('Create Order', () => {
  test('submits form with valid data', async ({ authenticatedPage: dashboard }) => {
    await dashboard.navigateTo('/orders/new')

    await dashboard.page.getByLabel('Customer').fill('Acme Corp')
    await dashboard.page.getByLabel('Amount').fill('1500.00')
    await dashboard.page.getByLabel('Priority').selectOption('high')
    await dashboard.page.getByRole('button', { name: 'Create Order' }).click()

    await expect(dashboard.page.getByText('Order created successfully')).toBeVisible()
  })

  test('shows validation errors', async ({ authenticatedPage: dashboard }) => {
    await dashboard.navigateTo('/orders/new')
    await dashboard.page.getByRole('button', { name: 'Create Order' }).click()

    await expect(dashboard.page.getByText('Customer is required')).toBeVisible()
    await expect(dashboard.page.getByText('Amount must be greater than 0')).toBeVisible()
  })
})
```

### Data Table Interactions

```typescript
test.describe('Users Table', () => {
  test('sorts by column', async ({ authenticatedPage: dashboard }) => {
    await dashboard.navigateTo('/users')
    await dashboard.page.getByRole('columnheader', { name: 'Name' }).click()

    const firstCell = dashboard.page.getByRole('row').nth(1).getByRole('cell').first()
    await expect(firstCell).toContainText('A')  // Alphabetical order
  })

  test('filters by search', async ({ authenticatedPage: dashboard }) => {
    await dashboard.navigateTo('/users')
    await dashboard.search('admin')

    const rows = dashboard.page.getByRole('row')
    await expect(rows).toHaveCount(2) // header + 1 result
  })

  test('paginates results', async ({ authenticatedPage: dashboard }) => {
    await dashboard.navigateTo('/users')
    await dashboard.page.getByRole('button', { name: 'Next' }).click()
    await expect(dashboard.page.getByText('Page 2')).toBeVisible()
  })
})
```

### File Upload

```typescript
test('uploads a file', async ({ authenticatedPage: dashboard }) => {
  await dashboard.navigateTo('/upload')

  const fileChooserPromise = dashboard.page.waitForEvent('filechooser')
  await dashboard.page.getByRole('button', { name: 'Choose File' }).click()
  const fileChooser = await fileChooserPromise
  await fileChooser.setFiles('e2e/fixtures/test-document.pdf')

  await expect(dashboard.page.getByText('test-document.pdf')).toBeVisible()
  await dashboard.page.getByRole('button', { name: 'Upload' }).click()
  await expect(dashboard.page.getByText('Upload successful')).toBeVisible()
})
```

## API Mocking

```typescript
test('handles empty state', async ({ page }) => {
  await page.route('**/api/orders', (route) =>
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ data: [], total: 0 }),
    }),
  )

  await page.goto('/orders')
  await expect(page.getByText('No orders found')).toBeVisible()
})

test('handles server error gracefully', async ({ page }) => {
  await page.route('**/api/orders', (route) =>
    route.fulfill({ status: 500 }),
  )

  await page.goto('/orders')
  await expect(page.getByText('Something went wrong')).toBeVisible()
  await expect(page.getByRole('button', { name: 'Retry' })).toBeVisible()
})

test('captures request body', async ({ page }) => {
  let capturedBody: unknown
  await page.route('**/api/orders', (route) => {
    capturedBody = JSON.parse(route.request().postData() ?? '{}')
    return route.fulfill({ status: 201, body: JSON.stringify({ id: '1' }) })
  })

  // Submit form...
  expect(capturedBody).toMatchObject({ customer: 'Acme Corp' })
})
```

## Visual Regression

```typescript
test('matches visual snapshot', async ({ page }) => {
  // Mock data for deterministic screenshots
  await page.route('**/api/dashboard', (route) =>
    route.fulfill({
      body: JSON.stringify(fixtures.dashboardData),
    }),
  )

  await page.goto('/dashboard')
  await expect(page).toHaveScreenshot('dashboard.png', {
    maxDiffPixels: 100,
  })
})
```

## Mobile Testing

```typescript
test.describe('Mobile Navigation', () => {
  test.use({ ...devices['iPhone 14'] })

  test('opens hamburger menu', async ({ page }) => {
    await page.goto('/')
    await page.getByRole('button', { name: 'Menu' }).click()
    await expect(page.getByRole('navigation')).toBeVisible()
  })
})
```

## CI Integration

```yaml
name: E2E Tests
on: [push, pull_request]

jobs:
  e2e:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      - run: npm ci
      - run: npx playwright install --with-deps
      - run: npx playwright test
      - uses: actions/upload-artifact@v4
        if: always()
        with:
          name: playwright-report
          path: |
            playwright-report/
            test-results/
```

## Debugging

```bash
# Run with trace viewer
npx playwright test --trace on

# Run in headed mode
npx playwright test --headed

# Run specific test
npx playwright test auth.spec.ts

# Show report
npx playwright show-report

# Debug with inspector
npx playwright test --debug

# Generate code
npx playwright codegen http://localhost:3000
```

**Remember**: E2E tests are the most expensive to run and maintain. Test critical user flows, not every edge case. Keep tests independent, use page objects, and run in CI with retries.
