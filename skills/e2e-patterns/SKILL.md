---
name: e2e-patterns
description: End-to-end testing patterns with Playwright including page objects, test fixtures, visual regression, API mocking, and CI integration.
origin: ECC
---

# End-to-End Testing Patterns with Playwright

Comprehensive guide to writing robust, maintainable end-to-end tests using Playwright. Covers page object models, test fixtures, common test scenarios, API mocking, visual regression, mobile testing, CI integration, and debugging techniques.

---

## When to Use

Use this skill when:

- **Writing E2E tests**: New features require end-to-end validation of user flows
- **Setting up Playwright**: Initializing Playwright in a new project or configuring for CI
- **Testing user flows**: Authentication, forms, navigation, data tables, file uploads, drag and drop
- **API mocking**: Intercepting network requests to test edge cases and error states
- **Visual regression**: Ensuring UI changes do not introduce unintended visual differences
- **Mobile testing**: Validating responsive layouts and touch interactions
- **CI integration**: Setting up Playwright in GitHub Actions with artifacts, traces, and retries
- **Debugging flaky tests**: Identifying and fixing intermittent test failures

---

## How It Works

1. **Test user flows, not implementation**: Write tests from the user's perspective. Assert on what the user sees, not internal state.
2. **Use stable selectors**: Prefer `data-testid`, `role`, and `text` locators over CSS classes or XPath.
3. **Test isolation**: Each test must be independent. No shared state between tests. Each test sets up its own data.
4. **Avoid sleep**: Use Playwright's built-in auto-waiting and explicit `waitFor` methods instead of arbitrary timeouts.
5. **Fail fast with clear messages**: Use descriptive assertion messages. Attach screenshots on failure.

```typescript
// playwright.config.ts
import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: process.env.CI
    ? [['html', { open: 'never' }], ['github']]
    : [['html', { open: 'on-failure' }]],
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'on-first-retry',
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'firefox', use: { ...devices['Desktop Firefox'] } },
    { name: 'webkit', use: { ...devices['Desktop Safari'] } },
    { name: 'mobile-chrome', use: { ...devices['Pixel 5'] } },
    { name: 'mobile-safari', use: { ...devices['iPhone 13'] } },
  ],
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
})
```

---

## Examples

### Page Object Model

#### Base Page Object

```typescript
// e2e/pages/base.page.ts
import { type Page, type Locator, expect } from '@playwright/test'

export abstract class BasePage {
  public readonly page: Page

  constructor(page: Page) {
    this.page = page
  }

  // Common navigation elements
  get navbar(): Locator {
    return this.page.getByRole('navigation')
  }

  get userMenu(): Locator {
    return this.page.getByTestId('user-menu')
  }

  get notificationBadge(): Locator {
    return this.page.getByTestId('notification-badge')
  }

  // Common actions
  async navigateTo(path: string): Promise<void> {
    await this.page.goto(path)
    await this.page.waitForLoadState('networkidle')
  }

  async waitForPageReady(): Promise<void> {
    await this.page.waitForLoadState('domcontentloaded')
    await this.page.waitForSelector('[data-testid="page-loaded"]', {
      state: 'attached',
      timeout: 10_000,
    })
  }

  async getToastMessage(): Promise<string> {
    const toast = this.page.getByRole('alert').first()
    await toast.waitFor({ state: 'visible' })
    const text = await toast.textContent()
    return text ?? ''
  }

  async expectToastMessage(message: string): Promise<void> {
    const toast = this.page.getByRole('alert').first()
    await expect(toast).toContainText(message)
  }

  async screenshot(name: string): Promise<void> {
    await this.page.screenshot({ path: `e2e/screenshots/${name}.png`, fullPage: true })
  }
}
```

#### Login Page Object

```typescript
// e2e/pages/login.page.ts
import { type Page, type Locator, expect } from '@playwright/test'
import { BasePage } from './base.page'

export class LoginPage extends BasePage {
  readonly emailInput: Locator
  readonly passwordInput: Locator
  readonly submitButton: Locator
  readonly errorMessage: Locator
  readonly forgotPasswordLink: Locator
  readonly registerLink: Locator
  readonly rememberMeCheckbox: Locator

  constructor(page: Page) {
    super(page)
    this.emailInput = page.getByLabel('Email')
    this.passwordInput = page.getByLabel('Password')
    this.submitButton = page.getByRole('button', { name: 'Sign in' })
    this.errorMessage = page.getByTestId('login-error')
    this.forgotPasswordLink = page.getByRole('link', { name: 'Forgot password?' })
    this.registerLink = page.getByRole('link', { name: 'Create account' })
    this.rememberMeCheckbox = page.getByLabel('Remember me')
  }

  async goto(): Promise<void> {
    await this.navigateTo('/login')
  }

  async login(email: string, password: string): Promise<void> {
    await this.emailInput.fill(email)
    await this.passwordInput.fill(password)
    await this.submitButton.click()
  }

  async loginAndExpectDashboard(email: string, password: string): Promise<void> {
    await this.login(email, password)
    await this.page.waitForURL('/dashboard')
    await expect(this.page).toHaveURL('/dashboard')
  }

  async loginAndExpectError(email: string, password: string, expectedError: string): Promise<void> {
    await this.login(email, password)
    await expect(this.errorMessage).toBeVisible()
    await expect(this.errorMessage).toContainText(expectedError)
  }

  async expectEmailValidationError(): Promise<void> {
    const emailError = this.page.getByText('Please enter a valid email')
    await expect(emailError).toBeVisible()
  }

  async expectPasswordValidationError(): Promise<void> {
    const passwordError = this.page.getByText('Password is required')
    await expect(passwordError).toBeVisible()
  }
}
```

#### Dashboard Page Object

```typescript
// e2e/pages/dashboard.page.ts
import { type Page, type Locator, expect } from '@playwright/test'
import { BasePage } from './base.page'

export class DashboardPage extends BasePage {
  readonly heading: Locator
  readonly statsCards: Locator
  readonly recentOrdersTable: Locator
  readonly searchInput: Locator
  readonly dateRangePicker: Locator
  readonly exportButton: Locator

  constructor(page: Page) {
    super(page)
    this.heading = page.getByRole('heading', { name: 'Dashboard' })
    this.statsCards = page.getByTestId('stats-card')
    this.recentOrdersTable = page.getByTestId('recent-orders-table')
    this.searchInput = page.getByPlaceholder('Search orders...')
    this.dateRangePicker = page.getByTestId('date-range-picker')
    this.exportButton = page.getByRole('button', { name: 'Export' })
  }

  async goto(): Promise<void> {
    await this.navigateTo('/dashboard')
  }

  async expectLoaded(): Promise<void> {
    await expect(this.heading).toBeVisible()
    await expect(this.statsCards.first()).toBeVisible()
  }

  async getStatValue(statName: string): Promise<string> {
    const card = this.page.getByTestId('stats-card').filter({ hasText: statName })
    const value = card.getByTestId('stat-value')
    const text = await value.textContent()
    return text ?? ''
  }

  async searchOrders(query: string): Promise<void> {
    await this.searchInput.fill(query)
    // Wait for debounced search to trigger
    await this.page.waitForResponse(response =>
      response.url().includes('/api/orders') && response.status() === 200
    )
  }

  async getTableRowCount(): Promise<number> {
    const rows = this.recentOrdersTable.getByRole('row')
    // Subtract 1 for header row
    return (await rows.count()) - 1
  }

  async clickTableRow(index: number): Promise<void> {
    const rows = this.recentOrdersTable.getByRole('row')
    // index + 1 to skip header row
    await rows.nth(index + 1).click()
  }
}
```

---

### Test Fixtures

#### Authentication Fixture

```typescript
// e2e/fixtures/auth.fixture.ts
import { test as base, type Page } from '@playwright/test'

interface TestUser {
  readonly email: string
  readonly password: string
  readonly name: string
}

const TEST_USER: TestUser = {
  email: 'test@example.com',
  password: 'TestPassword123!',
  name: 'Test User',
}

const ADMIN_USER: TestUser = {
  email: 'admin@example.com',
  password: 'AdminPassword123!',
  name: 'Admin User',
}

// Authenticate once, reuse storage state across tests
async function authenticate(page: Page, user: TestUser): Promise<void> {
  await page.goto('/login')
  await page.getByLabel('Email').fill(user.email)
  await page.getByLabel('Password').fill(user.password)
  await page.getByRole('button', { name: 'Sign in' }).click()
  await page.waitForURL('/dashboard')
}

type AuthFixtures = {
  authenticatedPage: Page
  adminPage: Page
  testUser: TestUser
  adminUser: TestUser
}

export const test = base.extend<AuthFixtures>({
  testUser: TEST_USER,
  adminUser: ADMIN_USER,

  authenticatedPage: async ({ page }, use) => {
    await authenticate(page, TEST_USER)
    await use(page)
  },

  adminPage: async ({ page }, use) => {
    await authenticate(page, ADMIN_USER)
    await use(page)
  },
})

export { expect } from '@playwright/test'
```

#### Storage State for Session Reuse

```typescript
// e2e/global-setup.ts
import { chromium, type FullConfig } from '@playwright/test'

const AUTH_FILE = 'e2e/.auth/user.json'

async function globalSetup(config: FullConfig): Promise<void> {
  const { baseURL } = config.projects[0].use

  const browser = await chromium.launch()
  const page = await browser.newPage()

  await page.goto(`${baseURL}/login`)
  await page.getByLabel('Email').fill('test@example.com')
  await page.getByLabel('Password').fill('TestPassword123!')
  await page.getByRole('button', { name: 'Sign in' }).click()
  await page.waitForURL('**/dashboard')

  // Save authentication state
  await page.context().storageState({ path: AUTH_FILE })

  await browser.close()
}

export default globalSetup

// playwright.config.ts - reference the storage state
// projects: [
//   { name: 'setup', testMatch: /global-setup\.ts/ },
//   {
//     name: 'chromium',
//     use: {
//       ...devices['Desktop Chrome'],
//       storageState: 'e2e/.auth/user.json',
//     },
//     dependencies: ['setup'],
//   },
// ]
```

#### Database Seeding Fixture

```typescript
// e2e/fixtures/database.fixture.ts
import { test as base } from './auth.fixture'

interface SeedData {
  readonly products: readonly { id: string; name: string; price: number }[]
  readonly orders: readonly { id: string; total: number; status: string }[]
}

type DatabaseFixtures = {
  seedData: SeedData
}

export const test = base.extend<DatabaseFixtures>({
  seedData: async ({ page }, use) => {
    // Seed test data via API
    const response = await page.request.post('/api/test/seed', {
      data: {
        products: [
          { name: 'Test Product A', price: 29.99, category: 'electronics' },
          { name: 'Test Product B', price: 49.99, category: 'clothing' },
          { name: 'Test Product C', price: 9.99, category: 'electronics' },
        ],
        orders: [
          { total: 79.98, status: 'completed' },
          { total: 29.99, status: 'pending' },
        ],
      },
    })

    const data = await response.json() as SeedData

    await use(data)

    // Cleanup after test
    await page.request.post('/api/test/cleanup', {
      data: {
        productIds: data.products.map(p => p.id),
        orderIds: data.orders.map(o => o.id),
      },
    })
  },
})

export { expect } from '@playwright/test'
```

---

### Common Test Scenarios

#### Authentication Flow

```typescript
// e2e/tests/auth.spec.ts
import { test, expect } from '../fixtures/auth.fixture'
import { LoginPage } from '../pages/login.page'

test.describe('Authentication', () => {
  test('successful login redirects to dashboard', async ({ page }) => {
    const loginPage = new LoginPage(page)
    await loginPage.goto()

    await loginPage.loginAndExpectDashboard('test@example.com', 'TestPassword123!')
  })

  test('invalid credentials show error message', async ({ page }) => {
    const loginPage = new LoginPage(page)
    await loginPage.goto()

    await loginPage.loginAndExpectError(
      'test@example.com',
      'WrongPassword',
      'Invalid email or password'
    )

    // Should remain on login page
    await expect(page).toHaveURL('/login')
  })

  test('empty form shows validation errors', async ({ page }) => {
    const loginPage = new LoginPage(page)
    await loginPage.goto()

    await loginPage.submitButton.click()

    await loginPage.expectEmailValidationError()
    await loginPage.expectPasswordValidationError()
  })

  test('forgot password sends reset email', async ({ page }) => {
    const loginPage = new LoginPage(page)
    await loginPage.goto()

    await loginPage.forgotPasswordLink.click()
    await expect(page).toHaveURL('/forgot-password')

    await page.getByLabel('Email').fill('test@example.com')
    await page.getByRole('button', { name: 'Send reset link' }).click()

    await expect(page.getByText('Check your email')).toBeVisible()
  })

  test('logout clears session and redirects to login', async ({ authenticatedPage }) => {
    const page = authenticatedPage

    await page.getByTestId('user-menu').click()
    await page.getByRole('menuitem', { name: 'Sign out' }).click()

    await expect(page).toHaveURL('/login')

    // Attempting to access protected route redirects to login
    await page.goto('/dashboard')
    await expect(page).toHaveURL('/login')
  })

  test('registration creates account and logs in', async ({ page }) => {
    const loginPage = new LoginPage(page)
    await loginPage.goto()
    await loginPage.registerLink.click()

    await expect(page).toHaveURL('/register')

    const uniqueEmail = `test-${Date.now()}@example.com`
    await page.getByLabel('Name').fill('New User')
    await page.getByLabel('Email').fill(uniqueEmail)
    await page.getByLabel('Password', { exact: true }).fill('SecurePassword123!')
    await page.getByLabel('Confirm password').fill('SecurePassword123!')
    await page.getByRole('button', { name: 'Create account' }).click()

    await expect(page).toHaveURL('/dashboard')
    await expect(page.getByText('Welcome, New User')).toBeVisible()
  })
})
```

#### Form Submission and Validation

```typescript
// e2e/tests/product-form.spec.ts
import { test, expect } from '../fixtures/database.fixture'

test.describe('Product Form', () => {
  test('creates a new product with valid data', async ({ authenticatedPage }) => {
    const page = authenticatedPage

    await page.goto('/products/new')

    await page.getByLabel('Product name').fill('Premium Widget')
    await page.getByLabel('Description').fill('A high-quality widget for all purposes.')
    await page.getByLabel('Price').fill('49.99')
    await page.getByLabel('SKU').fill('WDG-001')
    await page.getByLabel('Category').selectOption('electronics')
    await page.getByLabel('Stock quantity').fill('100')

    await page.getByRole('button', { name: 'Create product' }).click()

    // Should redirect to product detail page
    await expect(page).toHaveURL(/\/products\/[\w-]+/)
    await expect(page.getByRole('heading', { name: 'Premium Widget' })).toBeVisible()
    await expect(page.getByText('$49.99')).toBeVisible()
  })

  test('shows validation errors for invalid data', async ({ authenticatedPage }) => {
    const page = authenticatedPage

    await page.goto('/products/new')

    // Submit empty form
    await page.getByRole('button', { name: 'Create product' }).click()

    // Check for validation messages
    await expect(page.getByText('Product name is required')).toBeVisible()
    await expect(page.getByText('Price must be greater than 0')).toBeVisible()

    // Fill with invalid price
    await page.getByLabel('Product name').fill('Test Product')
    await page.getByLabel('Price').fill('-10')
    await page.getByRole('button', { name: 'Create product' }).click()

    await expect(page.getByText('Price must be greater than 0')).toBeVisible()
  })

  test('edits an existing product', async ({ authenticatedPage, seedData }) => {
    const page = authenticatedPage
    const product = seedData.products[0]

    await page.goto(`/products/${product.id}/edit`)

    // Verify existing values are populated
    await expect(page.getByLabel('Product name')).toHaveValue(product.name)

    // Update the product name
    await page.getByLabel('Product name').clear()
    await page.getByLabel('Product name').fill('Updated Product Name')
    await page.getByRole('button', { name: 'Save changes' }).click()

    await expect(page.getByRole('heading', { name: 'Updated Product Name' })).toBeVisible()

    // Verify toast notification
    await expect(page.getByRole('alert')).toContainText('Product updated successfully')
  })

  test('handles server errors gracefully', async ({ authenticatedPage }) => {
    const page = authenticatedPage

    // Mock the API to return a 500 error
    await page.route('**/api/products', route => {
      if (route.request().method() === 'POST') {
        return route.fulfill({
          status: 500,
          contentType: 'application/json',
          body: JSON.stringify({ error: 'Internal server error' }),
        })
      }
      return route.continue()
    })

    await page.goto('/products/new')
    await page.getByLabel('Product name').fill('Test Product')
    await page.getByLabel('Price').fill('29.99')
    await page.getByLabel('Category').selectOption('electronics')
    await page.getByRole('button', { name: 'Create product' }).click()

    await expect(page.getByRole('alert')).toContainText('Something went wrong')
    // Form data should be preserved
    await expect(page.getByLabel('Product name')).toHaveValue('Test Product')
  })
})
```

#### Navigation and Routing

```typescript
// e2e/tests/navigation.spec.ts
import { test, expect } from '../fixtures/auth.fixture'

test.describe('Navigation', () => {
  test('sidebar navigation works correctly', async ({ authenticatedPage }) => {
    const page = authenticatedPage

    // Navigate via sidebar
    await page.getByRole('link', { name: 'Products' }).click()
    await expect(page).toHaveURL('/products')
    await expect(page.getByRole('heading', { name: 'Products' })).toBeVisible()

    await page.getByRole('link', { name: 'Orders' }).click()
    await expect(page).toHaveURL('/orders')
    await expect(page.getByRole('heading', { name: 'Orders' })).toBeVisible()

    await page.getByRole('link', { name: 'Settings' }).click()
    await expect(page).toHaveURL('/settings')
    await expect(page.getByRole('heading', { name: 'Settings' })).toBeVisible()
  })

  test('breadcrumb navigation works', async ({ authenticatedPage }) => {
    const page = authenticatedPage

    await page.goto('/products/PRD-001')

    const breadcrumbs = page.getByTestId('breadcrumbs')
    await expect(breadcrumbs.getByText('Products')).toBeVisible()
    await expect(breadcrumbs.getByText('PRD-001')).toBeVisible()

    // Click breadcrumb to navigate back
    await breadcrumbs.getByRole('link', { name: 'Products' }).click()
    await expect(page).toHaveURL('/products')
  })

  test('browser back/forward navigation works', async ({ authenticatedPage }) => {
    const page = authenticatedPage

    await page.goto('/products')
    await page.goto('/orders')
    await page.goto('/settings')

    await page.goBack()
    await expect(page).toHaveURL('/orders')

    await page.goBack()
    await expect(page).toHaveURL('/products')

    await page.goForward()
    await expect(page).toHaveURL('/orders')
  })

  test('404 page shown for unknown routes', async ({ authenticatedPage }) => {
    const page = authenticatedPage

    await page.goto('/this-does-not-exist')
    await expect(page.getByRole('heading', { name: '404' })).toBeVisible()
    await expect(page.getByText('Page not found')).toBeVisible()

    // Can navigate home from 404
    await page.getByRole('link', { name: 'Go home' }).click()
    await expect(page).toHaveURL('/dashboard')
  })
})
```

#### Data Table Interaction

```typescript
// e2e/tests/data-table.spec.ts
import { test, expect } from '../fixtures/database.fixture'

test.describe('Data Table', () => {
  test('sorts table by column', async ({ authenticatedPage }) => {
    const page = authenticatedPage
    await page.goto('/products')

    const table = page.getByTestId('products-table')

    // Click column header to sort by name ascending
    await table.getByRole('columnheader', { name: 'Name' }).click()

    const firstRowName = await table.getByRole('row').nth(1).getByRole('cell').first().textContent()

    // Click again to sort descending
    await table.getByRole('columnheader', { name: 'Name' }).click()

    const firstRowNameDesc = await table.getByRole('row').nth(1).getByRole('cell').first().textContent()

    // Verify sort order changed
    expect(firstRowName).not.toBe(firstRowNameDesc)

    // Verify sort indicator is visible
    await expect(
      table.getByRole('columnheader', { name: 'Name' }).getByTestId('sort-desc-icon')
    ).toBeVisible()
  })

  test('filters table with search', async ({ authenticatedPage, seedData }) => {
    const page = authenticatedPage
    await page.goto('/products')

    const searchInput = page.getByPlaceholder('Search products...')
    await searchInput.fill('Product A')

    // Wait for filtered results
    await page.waitForResponse(resp => resp.url().includes('/api/products'))

    const table = page.getByTestId('products-table')
    const rows = table.getByRole('row')
    // Header + 1 matching row
    await expect(rows).toHaveCount(2)
    await expect(rows.nth(1)).toContainText('Test Product A')
  })

  test('paginates through results', async ({ authenticatedPage }) => {
    const page = authenticatedPage
    await page.goto('/products')

    const pagination = page.getByTestId('pagination')

    // Verify first page is active
    await expect(pagination.getByRole('button', { name: '1' })).toHaveAttribute('aria-current', 'page')

    // Navigate to second page
    await pagination.getByRole('button', { name: 'Next' }).click()
    await page.waitForResponse(resp => resp.url().includes('/api/products'))

    await expect(pagination.getByRole('button', { name: '2' })).toHaveAttribute('aria-current', 'page')

    // Verify URL is updated
    await expect(page).toHaveURL(/page=2/)

    // Navigate back to first page
    await pagination.getByRole('button', { name: 'Previous' }).click()
    await expect(pagination.getByRole('button', { name: '1' })).toHaveAttribute('aria-current', 'page')
  })

  test('selects and bulk deletes rows', async ({ authenticatedPage, seedData }) => {
    const page = authenticatedPage
    await page.goto('/products')

    const table = page.getByTestId('products-table')

    // Select first two rows
    await table.getByRole('row').nth(1).getByRole('checkbox').check()
    await table.getByRole('row').nth(2).getByRole('checkbox').check()

    // Bulk action bar should appear
    const bulkBar = page.getByTestId('bulk-actions')
    await expect(bulkBar).toBeVisible()
    await expect(bulkBar).toContainText('2 selected')

    // Delete selected items
    await bulkBar.getByRole('button', { name: 'Delete' }).click()

    // Confirm deletion dialog
    const dialog = page.getByRole('dialog')
    await expect(dialog).toBeVisible()
    await expect(dialog).toContainText('Delete 2 products?')
    await dialog.getByRole('button', { name: 'Confirm' }).click()

    // Verify items are removed
    await expect(page.getByRole('alert')).toContainText('2 products deleted')
  })
})
```

#### Modal and Dialog Interactions

```typescript
// e2e/tests/modal.spec.ts
import { test, expect } from '../fixtures/auth.fixture'

test.describe('Modal Interactions', () => {
  test('opens and closes modal', async ({ authenticatedPage }) => {
    const page = authenticatedPage
    await page.goto('/products')

    // Open create modal
    await page.getByRole('button', { name: 'Add product' }).click()

    const dialog = page.getByRole('dialog')
    await expect(dialog).toBeVisible()
    await expect(dialog.getByRole('heading')).toContainText('New Product')

    // Close with X button
    await dialog.getByRole('button', { name: 'Close' }).click()
    await expect(dialog).not.toBeVisible()
  })

  test('closes modal with Escape key', async ({ authenticatedPage }) => {
    const page = authenticatedPage
    await page.goto('/products')

    await page.getByRole('button', { name: 'Add product' }).click()
    await expect(page.getByRole('dialog')).toBeVisible()

    await page.keyboard.press('Escape')
    await expect(page.getByRole('dialog')).not.toBeVisible()
  })

  test('confirmation dialog blocks destructive action', async ({ authenticatedPage, seedData }) => {
    const page = authenticatedPage
    const product = seedData.products[0]

    await page.goto(`/products/${product.id}`)

    // Click delete button
    await page.getByRole('button', { name: 'Delete product' }).click()

    // Confirmation dialog appears
    const dialog = page.getByRole('alertdialog')
    await expect(dialog).toBeVisible()
    await expect(dialog).toContainText('This action cannot be undone')

    // Cancel should close dialog and keep product
    await dialog.getByRole('button', { name: 'Cancel' }).click()
    await expect(dialog).not.toBeVisible()
    await expect(page).toHaveURL(`/products/${product.id}`)
  })

  test('traps focus within modal', async ({ authenticatedPage }) => {
    const page = authenticatedPage
    await page.goto('/products')

    await page.getByRole('button', { name: 'Add product' }).click()

    const dialog = page.getByRole('dialog')
    await expect(dialog).toBeVisible()

    // Tab through all focusable elements
    const firstInput = dialog.getByLabel('Product name')
    await expect(firstInput).toBeFocused()

    // Tab to last element and verify focus stays within dialog
    await page.keyboard.press('Tab')
    await page.keyboard.press('Tab')
    await page.keyboard.press('Tab')

    // Focus should still be within the dialog
    const activeElement = page.locator(':focus')
    await expect(activeElement).toBeVisible()

    // Verify the active element is within the dialog
    const dialogBox = await dialog.boundingBox()
    const focusedBox = await activeElement.boundingBox()

    if (dialogBox && focusedBox) {
      expect(focusedBox.x).toBeGreaterThanOrEqual(dialogBox.x)
      expect(focusedBox.y).toBeGreaterThanOrEqual(dialogBox.y)
    }
  })
})
```

#### File Upload

```typescript
// e2e/tests/file-upload.spec.ts
import { test, expect } from '../fixtures/auth.fixture'
import path from 'node:path'

test.describe('File Upload', () => {
  test('uploads a single image file', async ({ authenticatedPage }) => {
    const page = authenticatedPage
    await page.goto('/products/new')

    // Upload a file using the file chooser
    const fileInput = page.getByTestId('image-upload')
    await fileInput.setInputFiles(path.join(__dirname, '../fixtures/files/test-image.jpg'))

    // Verify preview appears
    const preview = page.getByTestId('image-preview')
    await expect(preview).toBeVisible()
    await expect(preview.getByRole('img')).toHaveAttribute('src', /blob:/)
  })

  test('uploads multiple files', async ({ authenticatedPage }) => {
    const page = authenticatedPage
    await page.goto('/products/new')

    const fileInput = page.getByTestId('image-upload')
    await fileInput.setInputFiles([
      path.join(__dirname, '../fixtures/files/test-image-1.jpg'),
      path.join(__dirname, '../fixtures/files/test-image-2.jpg'),
      path.join(__dirname, '../fixtures/files/test-image-3.jpg'),
    ])

    const previews = page.getByTestId('image-preview')
    await expect(previews).toHaveCount(3)
  })

  test('rejects files exceeding size limit', async ({ authenticatedPage }) => {
    const page = authenticatedPage
    await page.goto('/products/new')

    // Create a large file buffer (6MB, assuming 5MB limit)
    const fileInput = page.getByTestId('image-upload')
    await fileInput.setInputFiles(path.join(__dirname, '../fixtures/files/large-file.jpg'))

    await expect(page.getByText('File size must be under 5MB')).toBeVisible()
  })

  test('rejects unsupported file types', async ({ authenticatedPage }) => {
    const page = authenticatedPage
    await page.goto('/products/new')

    const fileInput = page.getByTestId('image-upload')
    await fileInput.setInputFiles(path.join(__dirname, '../fixtures/files/document.pdf'))

    await expect(page.getByText('Only image files are allowed')).toBeVisible()
  })

  test('removes uploaded file', async ({ authenticatedPage }) => {
    const page = authenticatedPage
    await page.goto('/products/new')

    const fileInput = page.getByTestId('image-upload')
    await fileInput.setInputFiles(path.join(__dirname, '../fixtures/files/test-image.jpg'))

    await expect(page.getByTestId('image-preview')).toBeVisible()

    // Click remove button on the preview
    await page.getByTestId('remove-image').click()
    await expect(page.getByTestId('image-preview')).not.toBeVisible()
  })
})
```

#### Drag and Drop

```typescript
// e2e/tests/drag-and-drop.spec.ts
import { test, expect } from '../fixtures/auth.fixture'

test.describe('Drag and Drop', () => {
  test('reorders items in a list via drag and drop', async ({ authenticatedPage }) => {
    const page = authenticatedPage
    await page.goto('/settings/priorities')

    const list = page.getByTestId('sortable-list')
    const items = list.getByTestId('sortable-item')

    // Get initial order
    const initialFirst = await items.nth(0).textContent()
    const initialSecond = await items.nth(1).textContent()

    // Drag first item to second position
    const source = items.nth(0)
    const target = items.nth(1)

    const sourceBox = await source.boundingBox()
    const targetBox = await target.boundingBox()

    if (sourceBox && targetBox) {
      await page.mouse.move(
        sourceBox.x + sourceBox.width / 2,
        sourceBox.y + sourceBox.height / 2
      )
      await page.mouse.down()

      // Move in steps for smoother drag
      await page.mouse.move(
        targetBox.x + targetBox.width / 2,
        targetBox.y + targetBox.height / 2,
        { steps: 10 }
      )
      await page.mouse.up()
    }

    // Verify order changed
    await expect(items.nth(0)).toContainText(initialSecond ?? '')
    await expect(items.nth(1)).toContainText(initialFirst ?? '')
  })

  test('drags item between kanban columns', async ({ authenticatedPage }) => {
    const page = authenticatedPage
    await page.goto('/board')

    const todoColumn = page.getByTestId('column-todo')
    const doneColumn = page.getByTestId('column-done')

    const card = todoColumn.getByTestId('card').first()
    const cardTitle = await card.textContent()

    const cardBox = await card.boundingBox()
    const targetBox = await doneColumn.boundingBox()

    if (cardBox && targetBox) {
      await page.mouse.move(
        cardBox.x + cardBox.width / 2,
        cardBox.y + cardBox.height / 2
      )
      await page.mouse.down()
      await page.mouse.move(
        targetBox.x + targetBox.width / 2,
        targetBox.y + targetBox.height / 2,
        { steps: 15 }
      )
      await page.mouse.up()
    }

    // Card should now be in the "Done" column
    await expect(doneColumn.getByText(cardTitle ?? '')).toBeVisible()
    // And not in "Todo" column
    await expect(todoColumn.getByText(cardTitle ?? '')).not.toBeVisible()
  })
})
```

---

### API Mocking

#### Route Interception

```typescript
// e2e/tests/api-mocking.spec.ts
import { test, expect } from '../fixtures/auth.fixture'

test.describe('API Mocking', () => {
  test('handles empty state', async ({ authenticatedPage }) => {
    const page = authenticatedPage

    // Mock API to return empty results
    await page.route('**/api/products*', route =>
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ success: true, data: [], pagination: { total: 0 } }),
      })
    )

    await page.goto('/products')
    await expect(page.getByText('No products found')).toBeVisible()
    await expect(page.getByRole('link', { name: 'Add your first product' })).toBeVisible()
  })

  test('handles network errors', async ({ authenticatedPage }) => {
    const page = authenticatedPage

    await page.route('**/api/products*', route =>
      route.abort('connectionrefused')
    )

    await page.goto('/products')
    await expect(page.getByText('Unable to load products')).toBeVisible()
    await expect(page.getByRole('button', { name: 'Retry' })).toBeVisible()
  })

  test('handles slow responses', async ({ authenticatedPage }) => {
    const page = authenticatedPage

    await page.route('**/api/products*', async route => {
      // Delay response by 3 seconds
      await new Promise(resolve => setTimeout(resolve, 3000))
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ success: true, data: [{ id: '1', name: 'Product' }] }),
      })
    })

    await page.goto('/products')

    // Loading skeleton should be visible
    await expect(page.getByTestId('loading-skeleton')).toBeVisible()

    // After response, content should appear
    await expect(page.getByText('Product')).toBeVisible({ timeout: 5000 })
  })

  test('intercepts and modifies API response', async ({ authenticatedPage }) => {
    const page = authenticatedPage

    await page.route('**/api/user/profile', async route => {
      // Fetch original response then modify it
      const response = await route.fetch()
      const body = await response.json()

      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          ...body,
          data: {
            ...body.data,
            name: 'Modified Name',
            subscription: 'enterprise',
          },
        }),
      })
    })

    await page.goto('/settings/profile')
    await expect(page.getByText('Modified Name')).toBeVisible()
    await expect(page.getByText('Enterprise')).toBeVisible()
  })

  test('captures request body for verification', async ({ authenticatedPage }) => {
    const page = authenticatedPage

    let capturedBody: Record<string, unknown> | null = null

    await page.route('**/api/products', async route => {
      if (route.request().method() === 'POST') {
        capturedBody = route.request().postDataJSON()
        await route.fulfill({
          status: 201,
          contentType: 'application/json',
          body: JSON.stringify({ success: true, data: { id: 'new-1', ...capturedBody } }),
        })
      } else {
        await route.continue()
      }
    })

    await page.goto('/products/new')
    await page.getByLabel('Product name').fill('API Test Product')
    await page.getByLabel('Price').fill('39.99')
    await page.getByLabel('Category').selectOption('electronics')
    await page.getByRole('button', { name: 'Create product' }).click()

    // Verify the request body was correct
    expect(capturedBody).toMatchObject({
      name: 'API Test Product',
      price: 39.99,
      category: 'electronics',
    })
  })
})
```

---

### Visual Regression

#### Screenshot Comparison

```typescript
// e2e/tests/visual.spec.ts
import { test, expect } from '../fixtures/auth.fixture'

test.describe('Visual Regression', () => {
  test('dashboard matches snapshot', async ({ authenticatedPage }) => {
    const page = authenticatedPage

    // Mock data for deterministic screenshots
    await page.route('**/api/dashboard/stats', route =>
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          revenue: 12500,
          orders: 156,
          customers: 89,
          conversionRate: 3.2,
        }),
      })
    )

    await page.goto('/dashboard')
    await page.waitForLoadState('networkidle')

    // Wait for all animations to complete
    await page.evaluate(() => {
      document.querySelectorAll('*').forEach(el => {
        const style = window.getComputedStyle(el)
        if (style.animation !== 'none' || style.transition !== 'all 0s ease 0s') {
          (el as HTMLElement).style.animation = 'none';
          (el as HTMLElement).style.transition = 'none'
        }
      })
    })

    await expect(page).toHaveScreenshot('dashboard.png', {
      maxDiffPixelRatio: 0.01,  // Allow 1% pixel difference
      animations: 'disabled',
    })
  })

  test('product card component matches snapshot', async ({ authenticatedPage }) => {
    const page = authenticatedPage
    await page.goto('/products')

    const card = page.getByTestId('product-card').first()
    await expect(card).toHaveScreenshot('product-card.png', {
      maxDiffPixelRatio: 0.01,
    })
  })

  test('responsive layouts match snapshots', async ({ authenticatedPage }) => {
    const page = authenticatedPage

    // Desktop
    await page.setViewportSize({ width: 1280, height: 720 })
    await page.goto('/products')
    await page.waitForLoadState('networkidle')
    await expect(page).toHaveScreenshot('products-desktop.png')

    // Tablet
    await page.setViewportSize({ width: 768, height: 1024 })
    await page.waitForLoadState('networkidle')
    await expect(page).toHaveScreenshot('products-tablet.png')

    // Mobile
    await page.setViewportSize({ width: 375, height: 667 })
    await page.waitForLoadState('networkidle')
    await expect(page).toHaveScreenshot('products-mobile.png')
  })
})
```

#### Visual Regression Configuration

```typescript
// playwright.config.ts - visual regression settings
export default defineConfig({
  expect: {
    toHaveScreenshot: {
      maxDiffPixelRatio: 0.01,
      threshold: 0.2,           // Per-pixel color difference threshold
      animations: 'disabled',
    },
  },
  snapshotPathTemplate: '{testDir}/__screenshots__/{testFilePath}/{arg}{ext}',
  // Update snapshots: npx playwright test --update-snapshots
})
```

---

### Mobile Testing

#### Viewport Emulation and Touch Events

```typescript
// e2e/tests/mobile.spec.ts
import { test, expect, devices } from '@playwright/test'

const iPhone = devices['iPhone 13']

test.describe('Mobile Experience', () => {
  test.use({ ...iPhone })

  test('hamburger menu opens navigation', async ({ page }) => {
    await page.goto('/dashboard')

    // Desktop nav should not be visible on mobile
    await expect(page.getByTestId('desktop-nav')).not.toBeVisible()

    // Hamburger menu should be visible
    const menuButton = page.getByRole('button', { name: 'Menu' })
    await expect(menuButton).toBeVisible()

    await menuButton.click()

    // Mobile navigation drawer should open
    const drawer = page.getByTestId('mobile-nav')
    await expect(drawer).toBeVisible()

    await page.getByRole('link', { name: 'Products' }).click()
    await expect(page).toHaveURL('/products')

    // Drawer should close after navigation
    await expect(drawer).not.toBeVisible()
  })

  test('swipe gestures work on carousel', async ({ page }) => {
    await page.goto('/products/PRD-001')

    const carousel = page.getByTestId('image-carousel')
    const carouselBox = await carousel.boundingBox()

    if (carouselBox) {
      // Swipe left
      await page.mouse.move(
        carouselBox.x + carouselBox.width * 0.8,
        carouselBox.y + carouselBox.height / 2
      )
      await page.mouse.down()
      await page.mouse.move(
        carouselBox.x + carouselBox.width * 0.2,
        carouselBox.y + carouselBox.height / 2,
        { steps: 10 }
      )
      await page.mouse.up()

      // Second slide indicator should be active
      await expect(
        page.getByTestId('carousel-indicator').nth(1)
      ).toHaveClass(/active/)
    }
  })

  test('bottom sheet opens on mobile', async ({ page }) => {
    await page.goto('/products')

    // Filters open as bottom sheet on mobile
    await page.getByRole('button', { name: 'Filters' }).click()

    const bottomSheet = page.getByTestId('bottom-sheet')
    await expect(bottomSheet).toBeVisible()

    // Can interact with filter options
    await bottomSheet.getByLabel('Category').selectOption('electronics')
    await bottomSheet.getByRole('button', { name: 'Apply' }).click()

    await expect(bottomSheet).not.toBeVisible()
    await expect(page).toHaveURL(/category=electronics/)
  })

  test('long press shows context menu', async ({ page }) => {
    await page.goto('/products')

    const firstCard = page.getByTestId('product-card').first()
    const cardBox = await firstCard.boundingBox()

    if (cardBox) {
      // Simulate long press (touch hold for 500ms+)
      await page.mouse.move(
        cardBox.x + cardBox.width / 2,
        cardBox.y + cardBox.height / 2
      )
      await page.mouse.down()
      await page.waitForTimeout(600)
      await page.mouse.up()

      // Context menu should appear
      const contextMenu = page.getByTestId('context-menu')
      await expect(contextMenu).toBeVisible()
      await expect(contextMenu.getByText('Edit')).toBeVisible()
      await expect(contextMenu.getByText('Delete')).toBeVisible()
    }
  })
})
```

---

### CI Integration

#### GitHub Actions Workflow

```yaml
# .github/workflows/e2e.yml
name: E2E Tests

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  e2e:
    runs-on: ubuntu-latest
    timeout-minutes: 30

    services:
      postgres:
        image: postgres:16
        env:
          POSTGRES_USER: test
          POSTGRES_PASSWORD: test
          POSTGRES_DB: testdb
        ports:
          - 5432:5432
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5

      redis:
        image: redis:7
        ports:
          - 6379:6379
        options: >-
          --health-cmd "redis-cli ping"
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5

    steps:
      - uses: actions/checkout@v4

      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Install Playwright browsers
        run: npx playwright install --with-deps chromium

      - name: Run database migrations
        run: npm run db:migrate
        env:
          DATABASE_URL: postgresql://test:test@localhost:5432/testdb

      - name: Seed test data
        run: npm run db:seed:test
        env:
          DATABASE_URL: postgresql://test:test@localhost:5432/testdb

      - name: Build application
        run: npm run build
        env:
          DATABASE_URL: postgresql://test:test@localhost:5432/testdb
          REDIS_URL: redis://localhost:6379

      - name: Run E2E tests
        run: npx playwright test --project=chromium
        env:
          DATABASE_URL: postgresql://test:test@localhost:5432/testdb
          REDIS_URL: redis://localhost:6379
          CI: true

      - name: Upload test results
        if: always()
        uses: actions/upload-artifact@v4
        with:
          name: playwright-report
          path: playwright-report/
          retention-days: 14

      - name: Upload test traces
        if: failure()
        uses: actions/upload-artifact@v4
        with:
          name: playwright-traces
          path: test-results/
          retention-days: 7
```

#### Sharded Parallel Execution

```yaml
# .github/workflows/e2e-sharded.yml
name: E2E Tests (Sharded)

on:
  pull_request:

jobs:
  e2e:
    runs-on: ubuntu-latest
    strategy:
      fail-fast: false
      matrix:
        shard: [1/4, 2/4, 3/4, 4/4]

    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'npm'

      - run: npm ci
      - run: npx playwright install --with-deps chromium

      - name: Run E2E tests (shard ${{ matrix.shard }})
        run: npx playwright test --project=chromium --shard=${{ matrix.shard }}

      - uses: actions/upload-artifact@v4
        if: always()
        with:
          name: blob-report-${{ strategy.job-index }}
          path: blob-report/
          retention-days: 1

  merge-reports:
    needs: e2e
    if: always()
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'npm'

      - run: npm ci

      - name: Download blob reports
        uses: actions/download-artifact@v4
        with:
          path: all-blob-reports
          pattern: blob-report-*
          merge-multiple: true

      - name: Merge reports
        run: npx playwright merge-reports --reporter html ./all-blob-reports

      - uses: actions/upload-artifact@v4
        with:
          name: playwright-report
          path: playwright-report/
          retention-days: 14
```

---

### Debugging

#### Trace Viewer

```typescript
// Enable traces for debugging
// playwright.config.ts
export default defineConfig({
  use: {
    // 'on' - Record trace for every test
    // 'on-first-retry' - Record trace only on first retry (recommended for CI)
    // 'retain-on-failure' - Record but only save on failure
    trace: 'on-first-retry',
  },
})

// View traces after test failure:
// npx playwright show-trace test-results/test-name/trace.zip
```

#### Step-by-Step Debugging

```typescript
// e2e/tests/debug-example.spec.ts
import { test, expect } from '@playwright/test'

test('debug complex flow', async ({ page }) => {
  // Add step annotations for trace viewer
  await test.step('Navigate to checkout', async () => {
    await page.goto('/cart')
    await page.getByRole('button', { name: 'Proceed to checkout' }).click()
    await expect(page).toHaveURL('/checkout')
  })

  await test.step('Fill shipping details', async () => {
    await page.getByLabel('Street address').fill('123 Main St')
    await page.getByLabel('City').fill('San Francisco')
    await page.getByLabel('State').selectOption('CA')
    await page.getByLabel('ZIP code').fill('94102')
  })

  await test.step('Select shipping method', async () => {
    await page.getByLabel('Express (2-3 days)').check()
    await expect(page.getByTestId('shipping-cost')).toContainText('$12.99')
  })

  await test.step('Enter payment details', async () => {
    // Use frame locator for Stripe Elements
    const cardFrame = page.frameLocator('[title="Secure card number input"]')
    await cardFrame.getByPlaceholder('Card number').fill('4242424242424242')

    const expiryFrame = page.frameLocator('[title="Secure expiration date input"]')
    await expiryFrame.getByPlaceholder('MM / YY').fill('12/28')

    const cvcFrame = page.frameLocator('[title="Secure CVC input"]')
    await cvcFrame.getByPlaceholder('CVC').fill('123')
  })

  await test.step('Complete order', async () => {
    await page.getByRole('button', { name: 'Place order' }).click()
    await expect(page).toHaveURL(/\/orders\/[\w-]+\/confirmation/)
    await expect(page.getByRole('heading', { name: 'Order confirmed' })).toBeVisible()
  })
})
```

#### Screenshot on Failure Helper

```typescript
// e2e/helpers/screenshot.ts
import { type Page, type TestInfo } from '@playwright/test'

export async function screenshotOnFailure(
  page: Page,
  testInfo: TestInfo,
  label: string
): Promise<void> {
  if (testInfo.status !== testInfo.expectedStatus) {
    const screenshot = await page.screenshot({ fullPage: true })
    await testInfo.attach(`${label}-failure`, {
      body: screenshot,
      contentType: 'image/png',
    })
  }
}

// Usage in afterEach
test.afterEach(async ({ page }, testInfo) => {
  await screenshotOnFailure(page, testInfo, testInfo.title)
})
```

#### Debugging Commands

```bash
# Run in headed mode to watch the test
npx playwright test --headed

# Run with Playwright Inspector (step-by-step debugger)
npx playwright test --debug

# Run a specific test file
npx playwright test e2e/tests/auth.spec.ts

# Run tests with a specific title pattern
npx playwright test -g "successful login"

# Generate tests interactively with codegen
npx playwright codegen http://localhost:3000

# Open the HTML report
npx playwright show-report

# View a specific trace file
npx playwright show-trace test-results/auth-spec-ts/trace.zip

# Update visual regression snapshots
npx playwright test --update-snapshots

# List all available tests without running them
npx playwright test --list
```

---

### Quick Reference Checklist

Before merging E2E tests:

- [ ] Tests use page object model for shared page interactions
- [ ] Test data is seeded per test (no shared mutable state)
- [ ] Selectors use `data-testid`, `role`, or `text` (not CSS classes)
- [ ] No arbitrary `waitForTimeout` calls (use auto-waiting or explicit `waitFor`)
- [ ] API mocks cover error states and edge cases
- [ ] Visual regression snapshots are deterministic (mock data, disable animations)
- [ ] Mobile viewport tests included for responsive layouts
- [ ] CI pipeline uploads traces and screenshots on failure
- [ ] Retries configured for CI (2 retries recommended)
- [ ] Tests run in parallel with `fullyParallel: true`
- [ ] Storage state reused for authenticated tests
- [ ] Cleanup runs after tests that create data
- [ ] Test steps annotated for trace viewer readability
- [ ] Flaky tests identified and fixed (not just retried)
