---
description: Generate and run end-to-end tests with Playwright for Odoo. Creates test journeys for Odoo workflows, captures screenshots/videos/traces, and uploads artifacts.
---

# E2E Command

This command invokes the **e2e-runner** agent to generate, maintain, and execute end-to-end tests using Playwright for Odoo web interface.

## What This Command Does

1. **Generate Test Journeys** - Create Playwright tests for Odoo workflows
2. **Run E2E Tests** - Execute tests across browsers
3. **Capture Artifacts** - Screenshots, videos, traces on failures
4. **Upload Results** - HTML reports and JUnit XML
5. **Identify Flaky Tests** - Quarantine unstable tests

## When to Use

Use `/e2e` when:
- Testing critical Odoo workflows (sales, purchases, HR)
- Verifying multi-step wizard flows
- Testing UI interactions and navigation
- Validating form submissions and validations
- Preparing for production deployment

## How It Works

The e2e-runner agent will:

1. **Analyze Odoo workflow** and identify test scenarios
2. **Generate Playwright test** using Odoo-specific selectors
3. **Run tests** across browsers (Chrome, Firefox)
4. **Capture failures** with screenshots, videos, and traces
5. **Generate report** with results and artifacts

## Odoo-Specific Selectors

Odoo uses specific selectors for elements:

```typescript
// Field selectors
page.locator('[data-name="partner_id"]')
page.locator('.o_field_widget[name="name"]')
page.locator('.o_field_many2one[name="company_id"]')

// Button selectors
page.locator('button.o_form_button_save')
page.locator('button[name="action_confirm"]')
page.locator('.o_statusbar_status button[data-value="confirmed"]')

// Menu selectors
page.locator('.o_menu_entry_lvl_1:has-text("Sales")')
page.locator('.o_menu_entry_lvl_2:has-text("Orders")')

// Form elements
page.locator('.o_form_view')
page.locator('.o_list_view')
page.locator('.o_kanban_view')

// Chatter
page.locator('.o_chatter')
page.locator('.o_Message')
```

## Example Usage

```
User: /e2e Test the sale order creation and confirmation flow

Agent (e2e-runner):
# E2E Test Generation: Sale Order Workflow

## Test Scenario Identified

**User Journey:** Create Sale Order → Add Lines → Confirm → Create Invoice

**Test Coverage:**
1. Navigate to Sales > Orders
2. Create new sale order
3. Select customer
4. Add order line with product
5. Save and confirm order
6. Verify order state changes

## Generated Test Code

```typescript
// tests/e2e/sales/order-workflow.spec.ts
import { test, expect } from '@playwright/test'

test.describe('Sale Order Workflow', () => {
  test.beforeEach(async ({ page }) => {
    // Login to Odoo
    await page.goto('http://localhost:8069/web/login')
    await page.fill('input[name="login"]', 'admin')
    await page.fill('input[name="password"]', 'admin')
    await page.click('button[type="submit"]')
    await page.waitForURL('**/web#*')
  })

  test('user can create and confirm sale order', async ({ page }) => {
    // 1. Navigate to Sales > Orders
    await page.click('.o_menu_entry_lvl_1:has-text("Sales")')
    await page.click('.o_menu_entry_lvl_2:has-text("Orders")')
    await page.waitForSelector('.o_list_view')

    // 2. Click Create button
    await page.click('.o_list_button_add')
    await page.waitForSelector('.o_form_view')

    // 3. Select customer (Many2one field)
    await page.click('.o_field_many2one[name="partner_id"] input')
    await page.fill('.o_field_many2one[name="partner_id"] input', 'Azure')
    await page.waitForSelector('.o_m2o_dropdown_option')
    await page.click('.o_m2o_dropdown_option:first-child')

    // 4. Add order line
    await page.click('.o_field_x2many[name="order_line"] .o_field_x2many_list_row_add a')

    // Select product
    await page.click('.o_field_many2one[name="product_id"] input')
    await page.fill('.o_field_many2one[name="product_id"] input', 'Office')
    await page.waitForSelector('.o_m2o_dropdown_option')
    await page.click('.o_m2o_dropdown_option:first-child')

    // Set quantity
    await page.fill('.o_field_widget[name="product_uom_qty"] input', '5')

    // 5. Save the order
    await page.click('button.o_form_button_save')
    await page.waitForSelector('.o_form_status_indicator_buttons:not(.o_form_status_saved)')

    // Take screenshot of created order
    await page.screenshot({ path: 'artifacts/sale-order-created.png' })

    // 6. Confirm the order
    await page.click('button[name="action_confirm"]')

    // Wait for state change
    await page.waitForSelector('.o_statusbar_status button.btn-primary:has-text("Sales Order")')

    // Verify order is confirmed
    const stateButton = page.locator('.o_statusbar_status button.btn-primary')
    await expect(stateButton).toContainText('Sales Order')

    // Take screenshot of confirmed order
    await page.screenshot({ path: 'artifacts/sale-order-confirmed.png' })
  })

  test('order validation fails without customer', async ({ page }) => {
    // Navigate to Sales > Orders
    await page.click('.o_menu_entry_lvl_1:has-text("Sales")')
    await page.click('.o_menu_entry_lvl_2:has-text("Orders")')

    // Create new order without customer
    await page.click('.o_list_button_add')
    await page.waitForSelector('.o_form_view')

    // Try to save without customer
    await page.click('button.o_form_button_save')

    // Verify validation error appears
    await expect(page.locator('.o_notification_manager')).toContainText('required')
  })
})
```

## Running Tests

```bash
# Run the generated test
npx playwright test tests/e2e/sales/order-workflow.spec.ts

Running 2 tests using 2 workers

  ✓  [chromium] › order-workflow.spec.ts:10:3 › user can create and confirm sale order (8.2s)
  ✓  [chromium] › order-workflow.spec.ts:62:3 › order validation fails without customer (3.1s)

  2 passed (11.5s)

Artifacts generated:
- artifacts/sale-order-created.png
- artifacts/sale-order-confirmed.png
- playwright-report/index.html
```

## Test Report

```
╔══════════════════════════════════════════════════════════════╗
║                    E2E Test Results                          ║
╠══════════════════════════════════════════════════════════════╣
║ Status:     ✅ ALL TESTS PASSED                              ║
║ Total:      2 tests                                          ║
║ Passed:     2 (100%)                                         ║
║ Duration:   11.5s                                            ║
╚══════════════════════════════════════════════════════════════╝

Artifacts:
📸 Screenshots: 2 files
📊 HTML Report: playwright-report/index.html

View report: npx playwright show-report
```

✅ E2E test suite ready!
```

## Odoo Critical Flows

Prioritize these E2E tests:

**🔴 CRITICAL (Must Always Pass):**
1. User can login
2. User can navigate to module
3. User can create/edit records
4. Workflow buttons work (confirm, cancel, etc.)
5. Computed fields update correctly
6. One2many/Many2many fields work

**🟡 IMPORTANT:**
1. Search filters work
2. Reports generate correctly
3. Wizards complete successfully
4. Attachments upload
5. Chatter messages post

## Playwright Configuration for Odoo

```typescript
// playwright.config.ts
import { defineConfig } from '@playwright/test'

export default defineConfig({
  testDir: './tests/e2e',
  timeout: 60000,  // Odoo can be slow
  use: {
    baseURL: process.env.ODOO_URL || 'http://localhost:8069',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    trace: 'retain-on-failure',
  },
  projects: [
    { name: 'chromium', use: { browserName: 'chromium' } },
    { name: 'firefox', use: { browserName: 'firefox' } },
  ],
})
```

## Environment Setup

```bash
# Set Odoo URL for tests
export ODOO_URL=http://localhost:$ODOO_PORT

# Install Playwright
npm init -y
npm install -D @playwright/test
npx playwright install

# Run tests
npx playwright test
```

## Best Practices

**DO:**
- ✅ Use Odoo-specific selectors (data-name, o_field_widget)
- ✅ Wait for network idle after actions
- ✅ Handle Odoo's async field updates
- ✅ Test critical workflows end-to-end
- ✅ Capture screenshots at key steps
- ✅ Use test database (not production)

**DON'T:**
- ❌ Use CSS classes that may change
- ❌ Test against production database
- ❌ Ignore Odoo's loading states
- ❌ Test every edge case with E2E (use unit tests)
- ❌ Hardcode record IDs

## Quick Commands

```bash
# Run all E2E tests
npx playwright test

# Run specific test file
npx playwright test tests/e2e/sales/order.spec.ts

# Run in headed mode (see browser)
npx playwright test --headed

# Debug test
npx playwright test --debug

# Generate test code interactively
npx playwright codegen http://localhost:$ODOO_PORT

# View report
npx playwright show-report
```

## Related Agents

This command invokes the `e2e-runner` agent located at:
`~/.claude/agents/e2e-runner.md`
