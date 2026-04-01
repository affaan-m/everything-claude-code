> This file extends [common/testing.md](../common/testing.md) with web-specific testing content.

# Web Testing Rules

## Visual Testing Priority

For visual/animation-heavy sites, testing priorities differ from typical apps:

### 1. Visual Regression (HIGH PRIORITY)
- Screenshot comparison at key breakpoints: 320px, 768px, 1024px, 1440px
- Test hero section, scrollytelling sections, key interactive states
- Use Playwright's `toHaveScreenshot()` for automated visual regression
- Test both light and dark modes

### 2. Accessibility Testing (MANDATORY)
```bash
# Run axe-core on every page
npx @axe-core/cli http://localhost:3000

# Or in Playwright
import AxeBuilder from "@axe-core/playwright";
const results = await new AxeBuilder({ page }).analyze();
expect(results.violations).toEqual([]);
```

- Test keyboard navigation through all interactive elements
- Test with screen reader (VoiceOver on Mac)
- Verify `prefers-reduced-motion` disables animations
- Verify color contrast ratios

### 3. Performance Testing
```bash
# Lighthouse CI
npx lhci autorun --collect.url=http://localhost:3000
```

- LCP < 2.5s
- CLS < 0.1
- Performance score > 90

### 4. Cross-Browser Testing
- Chrome, Firefox, Safari (minimum)
- Test smooth scrolling behavior (Lenis)
- Test GSAP animations in all browsers
- Test backdrop-filter support (glassmorphism fallbacks)

### 5. Responsive Testing
- Test at: 320px, 375px, 768px, 1024px, 1440px, 1920px
- Verify no horizontal overflow at any width
- Verify touch interactions on mobile viewports
- Test scroll behavior on touch devices

## E2E Test Structure

```typescript
// tests/e2e/landing-page.spec.ts
import { test, expect } from "@playwright/test";

test.describe("Landing Page", () => {
  test("hero section loads and animates", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator("h1")).toBeVisible();
    await expect(page.locator(".hero-cta")).toBeVisible();
  });

  test("scrollytelling section triggers on scroll", async ({ page }) => {
    await page.goto("/");
    await page.evaluate(() => window.scrollTo(0, window.innerHeight * 2));
    await page.waitForTimeout(1000);
    await expect(page.locator(".sticky-visual")).toBeVisible();
  });

  test("respects reduced motion preference", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/");
    // Verify animations are disabled
    const opacity = await page.locator("[data-reveal]").evaluate(
      (el) => getComputedStyle(el).opacity
    );
    expect(opacity).toBe("1"); // No fade-in animation
  });

  test("responsive layout at mobile", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto("/");
    await expect(page).toHaveScreenshot("mobile-hero.png");
  });
});
```

## Unit Tests (Where Applicable)

- Test utility functions (throttle, debounce, scroll calculations)
- Test data transformations for dynamic content
- Test custom hooks (useScrollProgress, useReducedMotion)
- Skip testing pure visual/animation components — use visual regression instead
