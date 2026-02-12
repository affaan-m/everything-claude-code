# Accessibility Guidelines (WCAG 2.1 AA)

## Mandatory Checks

Before ANY frontend commit:
- [ ] Semantic HTML elements used (not div soup)
- [ ] All `<img>` tags have meaningful `alt` attributes
- [ ] All form inputs have associated `<label>` elements
- [ ] Interactive elements are keyboard accessible
- [ ] Color contrast meets AA standards
- [ ] ARIA attributes used correctly (and only when needed)
- [ ] Focus management handles route changes and modals

## Semantic HTML

```tsx
// ❌ WRONG: div soup
<div className="header">
  <div className="nav">
    <div onClick={handleClick}>Home</div>
  </div>
</div>

// ✅ CORRECT: semantic elements
<header>
  <nav>
    <button onClick={handleClick}>Home</button>
  </nav>
</header>
```

Use `<main>`, `<section>`, `<article>`, `<aside>`, `<header>`, `<footer>`, `<nav>` over generic `<div>`.

## ARIA Attributes

Use ARIA only when native HTML semantics are insufficient:

```tsx
// ❌ WRONG: redundant ARIA
<button role="button" aria-label="Submit">Submit</button>

// ✅ CORRECT: ARIA where needed
<button aria-expanded={isOpen} aria-controls="menu-panel">Menu</button>
<div id="menu-panel" role="menu" aria-hidden={!isOpen}>
  {menuItems}
</div>
```

## Keyboard Navigation

- All interactive elements reachable via **Tab**
- **Enter** / **Space** activate buttons and links
- **Escape** closes modals, dropdowns, and overlays
- Visible focus indicators on all focusable elements
- Logical tab order (avoid positive `tabIndex`)

```tsx
// ✅ Set initial focus when modal opens
useEffect(() => {
  if (isOpen) {
    const firstFocusable = modalRef.current?.querySelector('button, [href], input')
    firstFocusable?.focus()
  }
}, [isOpen])
// Note: A full focus trap (Tab/Shift+Tab cycling within modal) also required.
// Use a library like focus-trap-react or implement a keydown handler.
```

## Color Contrast

| Element | Minimum Ratio |
|---------|---------------|
| Normal text (< 18px) | 4.5:1 |
| Large text (≥ 18px bold, ≥ 24px) | 3:1 |
| UI components & icons | 3:1 |

Never rely on color alone to convey information — use icons, patterns, or text labels.

## Images & Media

```tsx
// ❌ WRONG: missing alt
<img src="/chart.png" />

// ❌ WRONG: empty alt on meaningful image (charts need description)
<img src="/chart.png" alt="" />

// ✅ CORRECT: descriptive alt
<img src="/chart.png" alt="Monthly revenue chart showing 20% growth" />

// ✅ CORRECT: decorative image (alt="" marks it as decorative)
<img src="/divider.svg" alt="" />
```

## Form Labels

```tsx
// ❌ WRONG: placeholder as label
<input placeholder="Email" />

// ✅ CORRECT: explicit label
<label htmlFor="email">Email</label>
<input id="email" type="email" aria-required="true" />

// ✅ CORRECT: error messages linked
<input id="email" aria-describedby="email-error" aria-invalid={!!error} />
<span id="email-error" role="alert">{error}</span>
```

## Focus Management

Handle focus on route changes and dynamic content:

```tsx
// ✅ Announce route changes to screen readers
<div aria-live="polite" className="sr-only">
  {`Navigated to ${pageTitle}`}
</div>

// ✅ Return focus after modal close
const triggerRef = useRef<HTMLButtonElement>(null)

function closeModal() {
  setIsOpen(false)
  triggerRef.current?.focus()
}
```

## Escalation Protocol

If accessibility issues affect user safety or legal compliance:
1. STOP immediately
2. Use **security-reviewer** agent for impact assessment
3. Fix CRITICAL issues (no keyboard access, missing form labels) before continuing
4. Test with screen reader before shipping
