# WCAG 2.2 Guidelines Reference

## Overview

The Web Content Accessibility Guidelines (WCAG) 2.2 provide recommendations for making web content more accessible. They are organized into four principles (POUR): Perceivable, Operable, Understandable, and Robust.

## Conformance Levels

- **Level A**: Minimum accessibility (must satisfy)
- **Level AA**: Standard accessibility (should satisfy)
- **Level AAA**: Enhanced accessibility (may satisfy)

Most organizations target Level AA compliance.

## Principle 1: Perceivable

Content must be presentable in ways users can perceive.

### 1.1 Text Alternatives

#### 1.1.1 Non-text Content (Level A)

All non-text content needs text alternatives.

```tsx
// Images
<img src="chart.png" alt="Q3 sales increased 25% compared to Q2" />

// Decorative images
<img src="decorative-line.svg" alt="" role="presentation" />

// Complex images with long descriptions
<figure>
  <img src="org-chart.png" alt="Organization chart" aria-describedby="org-desc" />
  <figcaption id="org-desc">
    The CEO reports to the board. Three VPs report to the CEO:
    VP Engineering, VP Sales, and VP Marketing...
  </figcaption>
</figure>

// Icons with meaning
<button aria-label="Delete item">
  <TrashIcon aria-hidden="true" />
</button>

// Icon buttons with visible text
<button>
  <DownloadIcon aria-hidden="true" />
  <span>Download</span>
</button>
```

### 1.2 Time-based Media

#### 1.2.1 Audio-only and Video-only (Level A)

```tsx
// Audio with transcript
<audio src="podcast.mp3" controls />
<details>
  <summary>View transcript</summary>
  <p>Full transcript text here...</p>
</details>

// Video with captions
<video controls>
  <source src="tutorial.mp4" type="video/mp4" />
  <track kind="captions" src="captions-en.vtt" srclang="en" label="English" />
  <track kind="subtitles" src="subtitles-es.vtt" srclang="es" label="Spanish" />
</video>
```

### 1.3 Adaptable

#### 1.3.1 Info and Relationships (Level A)

Structure and relationships must be programmatically determinable.

```tsx
// Proper heading hierarchy
<main>
  <h1>Page Title</h1>
  <section>
    <h2>Section Title</h2>
    <h3>Subsection</h3>
  </section>
</main>

// Data tables with headers
<table>
  <caption>Quarterly Sales Report</caption>
  <thead>
    <tr>
      <th scope="col">Product</th>
      <th scope="col">Q1</th>
      <th scope="col">Q2</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <th scope="row">Widget A</th>
      <td>$10,000</td>
      <td>$12,000</td>
    </tr>
  </tbody>
</table>

// Lists for grouped content
<nav aria-label="Main navigation">
  <ul>
    <li><a href="/">Home</a></li>
    <li><a href="/about">About</a></li>
    <li><a href="/contact">Contact</a></li>
  </ul>
</nav>
```

#### 1.3.5 Identify Input Purpose (Level AA)

```tsx
// Input with autocomplete for autofill
<form>
  <label htmlFor="name">Full Name</label>
  <input id="name" name="name" autoComplete="name" />

  <label htmlFor="email">Email</label>
  <input id="email" name="email" type="email" autoComplete="email" />

  <label htmlFor="phone">Phone</label>
  <input id="phone" name="phone" type="tel" autoComplete="tel" />

  <label htmlFor="address">Street Address</label>
  <input id="address" name="address" autoComplete="street-address" />

  <label htmlFor="cc">Credit Card Number</label>
  <input id="cc" name="cc" autoComplete="cc-number" />
</form>
```

### 1.4 Distinguishable

#### 1.4.1 Use of Color (Level A)

```tsx
// Bad: Color only indicates error
<input className={hasError ? 'border-red-500' : ''} />

// Good: Color plus icon and text
<div>
  <input
    className={hasError ? 'border-red-500' : ''}
    aria-invalid={hasError}
    aria-describedby={hasError ? 'error-message' : undefined}
  />
  {hasError && (
    <p id="error-message" className="text-red-500 flex items-center gap-1">
      <AlertIcon aria-hidden="true" />
      This field is required
    </p>
  )}
</div>
```

#### 1.4.3 Contrast (Minimum) (Level AA)

```css
/* Minimum contrast ratios */
/* Normal text: 4.5:1 */
/* Large text (18pt+ or 14pt bold+): 3:1 */

/* Good contrast examples */
.text-on-white {
  color: #595959; /* 7:1 ratio on white */
}

.text-on-dark {
  color: #ffffff;
  background: #333333; /* 12.6:1 ratio */
}

/* Link must be distinguishable from surrounding text */
.link {
  color: #0066cc; /* 4.5:1 on white */
  text-decoration: underline; /* Additional visual cue */
}
```

#### 1.4.11 Non-text Contrast (Level AA)

```css
/* UI components need 3:1 contrast */
.button {
  border: 2px solid #767676; /* 3:1 against white */
  background: white;
}

.input {
  border: 1px solid #767676;
}

.input:focus {
  outline: 2px solid #0066cc; /* Focus indicator needs 3:1 */
  outline-offset: 2px;
}

/* Custom checkbox */
.checkbox {
  border: 2px solid #767676;
}

.checkbox:checked {
  background: #0066cc;
  border-color: #0066cc;
}
```

#### 1.4.12 Text Spacing (Level AA)

Content must not be lost when user adjusts text spacing.

```css
/* Allow text spacing adjustments without breaking layout */
.content {
  /* Use relative units */
  line-height: 1.5; /* At least 1.5x font size */
  letter-spacing: 0.12em; /* Support for 0.12em */
  word-spacing: 0.16em; /* Support for 0.16em */

  /* Don't use fixed heights on text containers */
  min-height: auto;

  /* Allow wrapping */
  overflow-wrap: break-word;
}

/* Test with these values: */
/* Line height: 1.5x font size */
/* Letter spacing: 0.12em */
/* Word spacing: 0.16em */
/* Paragraph spacing: 2x font size */
```

#### 1.4.13 Content on Hover or Focus (Level AA)

```tsx
// Tooltip pattern
function Tooltip({ content, children }) {
  const [isVisible, setIsVisible] = useState(false);

  return (
    <div
      onMouseEnter={() => setIsVisible(true)}
      onMouseLeave={() => setIsVisible(false)}
      onFocus={() => setIsVisible(true)}
      onBlur={() => setIsVisible(false)}
    >
      {children}
      {isVisible && (
        <div
          role="tooltip"
          // Dismissible: user can close without moving pointer
          onKeyDown={(e) => e.key === "Escape" && setIsVisible(false)}
          // Hoverable: content stays visible when pointer moves to it
          onMouseEnter={() => setIsVisible(true)}
          onMouseLeave={() => setIsVisible(false)}
          // Persistent: stays until trigger loses focus/hover
        >
          {content}
        </div>
      )}
    </div>
  );
}
```

## Principle 2: Operable

Interface components must be operable by all users.

### 2.1 Keyboard Accessible

#### 2.1.1 Keyboard (Level A)

All functionality must be operable via keyboard.

```tsx
// Custom interactive element
function CustomButton({ onClick, children }) {
  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onClick();
        }
      }}
    >
      {children}
    </div>
  );
}

// Better: just use a button
function BetterButton({ onClick, children }) {
  return <button onClick={onClick}>{children}</button>;
}
```

#### 2.1.2 No Keyboard Trap (Level A)

```tsx
// Modal with proper focus management
function Modal({ isOpen, onClose, children }) {
  const closeButtonRef = useRef(null);

  // Return focus on close
  useEffect(() => {
    if (!isOpen) return;

    const previousFocus = document.activeElement;
    closeButtonRef.current?.focus();

    return () => {
      (previousFocus as HTMLElement)?.focus();
    };
  }, [isOpen]);

  // Allow Escape to close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  return (
    <FocusTrap>
      <div role="dialog" aria-modal="true">
        <button ref={closeButtonRef} onClick={onClose}>
          Close
        </button>
        {children}
      </div>
    </FocusTrap>
  );
}
```

### 2.4 Navigable

#### 2.4.1 Bypass Blocks (Level A)

```tsx
// Skip links
<body>
  <a href="#main" className="skip-link">
    Skip to main content
  </a>
  <a href="#nav" className="skip-link">
    Skip to navigation
  </a>

  <header>...</header>

  <nav id="nav" aria-label="Main">
    ...
  </nav>

  <main id="main" tabIndex={-1}>
    {/* Main content */}
  </main>
</body>
```

#### 2.4.4 Link Purpose (In Context) (Level A)

```tsx
// Bad: Ambiguous link text
<a href="/report">Click here</a>
<a href="/report">Read more</a>

// Good: Descriptive link text
<a href="/report">View quarterly sales report</a>

// Good: Context provides meaning
<article>
  <h2>Quarterly Sales Report</h2>
  <p>Sales increased by 25% this quarter...</p>
  <a href="/report">Read full report</a>
</article>

// Good: Visually hidden text for context
<a href="/report">
  Read more
  <span className="sr-only"> about quarterly sales report</span>
</a>
```

#### 2.4.7 Focus Visible (Level AA)

```css
/* Always show focus indicator */
:focus-visible {
  outline: 2px solid var(--color-focus);
  outline-offset: 2px;
}

/* Custom focus styles */
.button:focus-visible {
  outline: none;
  box-shadow: 0 0 0 3px var(--color-focus);
}

/* High visibility focus for links */
.link:focus-visible {
  outline: 3px solid var(--color-focus);
  outline-offset: 2px;
  background: var(--color-focus-bg);
}
```

### 2.5 Input Modalities (New in 2.2)

#### 2.5.8 Target Size (Minimum) (Level AA) - NEW

Interactive targets must be at least 24x24 CSS pixels.

```css
/* Minimum target size */
.interactive {
  min-width: 24px;
  min-height: 24px;
}

/* Recommended size for touch (44x44) */
.touch-target {
  min-width: 44px;
  min-height: 44px;
}

/* Inline links are exempt if they have adequate spacing */
.link {
  /* Inline text links don't need minimum size */
  /* but should have adequate line-height */
  line-height: 1.5;
}
```

## Principle 3: Understandable

Content and interface must be understandable.

### 3.1 Readable

#### 3.1.1 Language of Page (Level A)

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    ...
  </head>
  <body>
    ...
  </body>
</html>
```

#### 3.1.2 Language of Parts (Level AA)

```tsx
<p>
  The French phrase <span lang="fr">c'est la vie</span> means "that's life."
</p>
```

### 3.2 Predictable

#### 3.2.2 On Input (Level A)

Don't automatically change context on input.

```tsx
// Bad: Auto-submit on selection
<select onChange={(e) => form.submit()}>
  <option>Select country</option>
</select>

// Good: Explicit submit action
<select onChange={(e) => setCountry(e.target.value)}>
  <option>Select country</option>
</select>
<button type="submit">Continue</button>
```

### 3.3 Input Assistance

#### 3.3.1 Error Identification (Level A)

```tsx
function FormField({ id, label, error, ...props }) {
  return (
    <div>
      <label htmlFor={id}>{label}</label>
      <input
        id={id}
        aria-invalid={!!error}
        aria-describedby={error ? `${id}-error` : undefined}
        {...props}
      />
      {error && (
        <p id={`${id}-error`} role="alert" className="text-red-600">
          {error}
        </p>
      )}
    </div>
  );
}
```

#### 3.3.7 Redundant Entry (Level A) - NEW

Don't require users to re-enter previously provided information.

```tsx
// Auto-fill shipping address from billing
function CheckoutForm() {
  const [sameAsBilling, setSameAsBilling] = useState(false);
  const [billing, setBilling] = useState({});
  const [shipping, setShipping] = useState({});

  return (
    <form>
      <fieldset>
        <legend>Billing Address</legend>
        <AddressFields value={billing} onChange={setBilling} />
      </fieldset>

      <label>
        <input
          type="checkbox"
          checked={sameAsBilling}
          onChange={(e) => {
            setSameAsBilling(e.target.checked);
            if (e.target.checked) setShipping(billing);
          }}
        />
        Shipping same as billing
      </label>

      {!sameAsBilling && (
        <fieldset>
          <legend>Shipping Address</legend>
          <AddressFields value={shipping} onChange={setShipping} />
        </fieldset>
      )}
    </form>
  );
}
```

## Principle 4: Robust

Content must be robust enough for assistive technologies.

### 4.1 Compatible

#### 4.1.2 Name, Role, Value (Level A)

```tsx
// Custom components must expose name, role, and value
function CustomCheckbox({ checked, onChange, label }) {
  return (
    <button
      role="checkbox"
      aria-checked={checked}
      aria-label={label}
      onClick={() => onChange(!checked)}
    >
      {checked ? "✓" : "○"} {label}
    </button>
  );
}

// Custom slider
function CustomSlider({ value, min, max, label, onChange }) {
  return (
    <div
      role="slider"
      aria-valuemin={min}
      aria-valuemax={max}
      aria-valuenow={value}
      aria-label={label}
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "ArrowRight") onChange(Math.min(value + 1, max));
        if (e.key === "ArrowLeft") onChange(Math.max(value - 1, min));
      }}
    >
      <div style={{ width: `${((value - min) / (max - min)) * 100}%` }} />
    </div>
  );
}
```

## Testing Checklist

```markdown
## Keyboard Testing

- [ ] All interactive elements focusable with Tab
- [ ] Focus order matches visual order
- [ ] Focus indicator always visible
- [ ] No keyboard traps
- [ ] Escape closes modals/dropdowns
- [ ] Enter/Space activates buttons and links

## Screen Reader Testing

- [ ] All images have alt text
- [ ] Form inputs have labels
- [ ] Headings in logical order
- [ ] Landmarks present (main, nav, header, footer)
- [ ] Dynamic content announced
- [ ] Error messages announced

## Visual Testing

- [ ] Text contrast at least 4.5:1
- [ ] UI component contrast at least 3:1
- [ ] Works at 200% zoom
- [ ] Content readable with text spacing
- [ ] Focus indicators visible
- [ ] Color not sole indicator of meaning
```

## Resources

- [WCAG 2.2 Quick Reference](https://www.w3.org/WAI/WCAG22/quickref/)
- [Understanding WCAG 2.2](https://www.w3.org/WAI/WCAG22/Understanding/)
- [Techniques for WCAG 2.2](https://www.w3.org/WAI/WCAG22/Techniques/)
