---
name: design-system-patterns
description: Component library architecture, design tokens, Storybook setup, accessibility patterns, and theming strategies.
---

# Design System Patterns

## When to Activate
- Building or maintaining a component library
- Defining design tokens (colors, spacing, typography)
- Setting up Storybook for component documentation
- Implementing theming or accessibility foundations

## Core Principles
- **Consistency**: Tokens and components enforce visual consistency across products
- **Composition**: Build complex UIs from small, composable primitives
- **Accessibility first**: Every component meets WCAG 2.1 AA by default
- **Documentation**: Undocumented components are undiscoverable components

---

## 1. Component Architecture

### Atomic Design Hierarchy

```
Atoms       → Button, Input, Icon, Badge
Molecules   → SearchBar (Input + Button), FormField (Label + Input + Error)
Organisms   → Header (Logo + Nav + SearchBar), DataTable
Templates   → PageLayout, DashboardLayout
Pages       → Actual page instances
```

### Composition over Configuration

```tsx
// Bad — monolithic component with many props
<Card variant="horizontal" showImage showFooter footerAlign="right" />

// Good — composable primitives
<Card>
  <Card.Image src="/photo.jpg" alt="Photo" />
  <Card.Body>
    <Card.Title>Title</Card.Title>
    <Card.Description>Description</Card.Description>
  </Card.Body>
  <Card.Footer align="right">
    <Button>Action</Button>
  </Card.Footer>
</Card>
```

### Polymorphic Components

```tsx
type ButtonProps<T extends React.ElementType = "button"> = {
  as?: T;
  variant?: "primary" | "secondary" | "ghost";
  size?: "sm" | "md" | "lg";
} & React.ComponentPropsWithoutRef<T>;

function Button<T extends React.ElementType = "button">({
  as, variant = "primary", size = "md", ...props
}: ButtonProps<T>) {
  const Component = as ?? "button";
  return <Component className={cn(styles.base, styles[variant], styles[size])} {...props} />;
}

// Usage
<Button>Click me</Button>
<Button as="a" href="/about">Link button</Button>
<Button as={Link} to="/dashboard">Router link</Button>
```

---

## 2. Design Tokens

### CSS Custom Properties

```css
:root {
  /* Colors */
  --color-primary-50: #eff6ff;
  --color-primary-500: #3b82f6;
  --color-primary-900: #1e3a5f;
  --color-neutral-0: #ffffff;
  --color-neutral-950: #0a0a0a;

  /* Spacing (4px base) */
  --space-1: 0.25rem;  /* 4px */
  --space-2: 0.5rem;   /* 8px */
  --space-3: 0.75rem;  /* 12px */
  --space-4: 1rem;     /* 16px */
  --space-6: 1.5rem;   /* 24px */
  --space-8: 2rem;     /* 32px */

  /* Typography */
  --font-sans: "Inter", system-ui, sans-serif;
  --font-mono: "JetBrains Mono", monospace;
  --text-sm: 0.875rem;
  --text-base: 1rem;
  --text-lg: 1.125rem;
  --text-xl: 1.25rem;

  /* Radii */
  --radius-sm: 0.25rem;
  --radius-md: 0.375rem;
  --radius-lg: 0.5rem;
  --radius-full: 9999px;

  /* Shadows */
  --shadow-sm: 0 1px 2px rgb(0 0 0 / 0.05);
  --shadow-md: 0 4px 6px rgb(0 0 0 / 0.1);
}
```

### Tailwind Config Mapping

```typescript
// tailwind.config.ts
export default {
  theme: {
    extend: {
      colors: {
        primary: {
          50: "var(--color-primary-50)",
          500: "var(--color-primary-500)",
          900: "var(--color-primary-900)",
        },
      },
      fontFamily: {
        sans: ["var(--font-sans)"],
        mono: ["var(--font-mono)"],
      },
    },
  },
};
```

---

## 3. Component API Design

### Props Guidelines

```tsx
// 1. Use unions over booleans
type ButtonProps = {
  variant: "primary" | "secondary" | "ghost";  // not isPrimary, isGhost
  size: "sm" | "md" | "lg";                    // not isSmall, isLarge
};

// 2. Forward refs for DOM access
const Input = forwardRef<HTMLInputElement, InputProps>((props, ref) => (
  <input ref={ref} {...props} />
));

// 3. Spread remaining props to root element
function Card({ className, children, ...props }: CardProps) {
  return <div className={cn("card", className)} {...props}>{children}</div>;
}
```

### Controlled vs Uncontrolled

```tsx
function Select({ value, defaultValue, onChange, ...props }: SelectProps) {
  const [internal, setInternal] = useState(defaultValue ?? "");
  const isControlled = value !== undefined;
  const current = isControlled ? value : internal;

  const handleChange = (next: string) => {
    if (!isControlled) setInternal(next);
    onChange?.(next);
  };

  return <select value={current} onChange={(e) => handleChange(e.target.value)} {...props} />;
}
```

---

## 4. Storybook

### Component Story Format (CSF3)

```tsx
// Button.stories.tsx
import type { Meta, StoryObj } from "@storybook/react";
import { Button } from "./Button";

const meta: Meta<typeof Button> = {
  component: Button,
  tags: ["autodocs"],
  argTypes: {
    variant: { control: "select", options: ["primary", "secondary", "ghost"] },
    size: { control: "select", options: ["sm", "md", "lg"] },
  },
};
export default meta;

type Story = StoryObj<typeof Button>;

export const Primary: Story = {
  args: { variant: "primary", children: "Button" },
};

export const AllVariants: Story = {
  render: () => (
    <div style={{ display: "flex", gap: 8 }}>
      <Button variant="primary">Primary</Button>
      <Button variant="secondary">Secondary</Button>
      <Button variant="ghost">Ghost</Button>
    </div>
  ),
};
```

### Interaction Tests

```tsx
import { expect, userEvent, within } from "@storybook/test";

export const ClickTest: Story = {
  args: { variant: "primary", children: "Click me" },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const button = canvas.getByRole("button");
    await userEvent.click(button);
    await expect(button).toHaveFocus();
  },
};
```

### Chromatic Visual Regression

```bash
npx chromatic --project-token=$CHROMATIC_TOKEN
```

---

## 5. Accessibility Foundation

### ARIA Patterns

```tsx
// Dialog
function Dialog({ open, onClose, title, children }: DialogProps) {
  return (
    <div role="dialog" aria-modal="true" aria-labelledby="dialog-title" hidden={!open}>
      <h2 id="dialog-title">{title}</h2>
      <div>{children}</div>
      <button onClick={onClose} aria-label="Close dialog">×</button>
    </div>
  );
}
```

### Keyboard Navigation

```tsx
function Tabs({ items }: TabsProps) {
  const [active, setActive] = useState(0);

  const handleKeyDown = (e: React.KeyboardEvent, index: number) => {
    if (e.key === "ArrowRight") setActive((index + 1) % items.length);
    if (e.key === "ArrowLeft") setActive((index - 1 + items.length) % items.length);
    if (e.key === "Home") setActive(0);
    if (e.key === "End") setActive(items.length - 1);
  };

  return (
    <div role="tablist">
      {items.map((item, i) => (
        <button
          key={item.id}
          role="tab"
          aria-selected={i === active}
          tabIndex={i === active ? 0 : -1}
          onKeyDown={(e) => handleKeyDown(e, i)}
          onClick={() => setActive(i)}
        >
          {item.label}
        </button>
      ))}
    </div>
  );
}
```

### Color Contrast

- **AA standard**: 4.5:1 for normal text, 3:1 for large text
- **AAA standard**: 7:1 for normal text, 4.5:1 for large text
- Test with: `npx axe-core/cli http://localhost:6006`

---

## 6. Theme System

### CSS Variables + System Preference

```css
:root {
  --bg: var(--color-neutral-0);
  --fg: var(--color-neutral-950);
}

[data-theme="dark"] {
  --bg: var(--color-neutral-950);
  --fg: var(--color-neutral-0);
}

@media (prefers-color-scheme: dark) {
  :root:not([data-theme]) {
    --bg: var(--color-neutral-950);
    --fg: var(--color-neutral-0);
  }
}
```

### Theme Provider

```tsx
function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<"light" | "dark" | "system">("system");

  useEffect(() => {
    const root = document.documentElement;
    if (theme === "system") {
      root.removeAttribute("data-theme");
    } else {
      root.setAttribute("data-theme", theme);
    }
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}
```

---

## 7. Documentation

### MDX Component Docs

```mdx
{/* Button.mdx */}
import { Meta, Canvas, Controls, Story } from "@storybook/blocks";
import * as ButtonStories from "./Button.stories";

<Meta of={ButtonStories} />

# Button

Buttons trigger actions. Use primary for the main CTA, secondary for alternatives.

## Usage

<Canvas of={ButtonStories.Primary} />
<Controls of={ButtonStories.Primary} />

## Guidelines

- One primary button per section
- Use verb labels: "Save", "Delete", not "OK"
- Minimum tap target: 44×44px on touch devices
```

### Auto-Generated Props Table

Storybook `autodocs` generates props tables from TypeScript types automatically when `tags: ["autodocs"]` is set in meta.

---

## 8. Versioning & Distribution

### Changesets

```bash
npx changeset        # create a changeset
npx changeset version  # bump versions
npx changeset publish  # publish to npm
```

### Package Structure

```
packages/
  design-tokens/     # CSS variables, Tailwind config
  core/              # Headless logic (hooks, utilities)
  react/             # React components
  docs/              # Storybook documentation site
```

### Release Strategy
- **Patch**: Bug fixes, style tweaks
- **Minor**: New components, new variants
- **Major**: Breaking API changes, token renames

---

## Checklist

- [ ] Tokens defined in CSS custom properties with semantic naming
- [ ] Components use composition (compound components) over config props
- [ ] All interactive components support keyboard navigation
- [ ] Color contrast meets WCAG 2.1 AA (4.5:1 text, 3:1 UI)
- [ ] Storybook stories cover all variants with autodocs
- [ ] Theme system supports light, dark, and system preference
- [ ] Component APIs forward refs and spread remaining props
- [ ] Versioning uses changesets with semantic versioning
