---
name: frontend-patterns
description: Frontend rules for React and Next.js.
---

# Frontend Patterns

## Component Rules

- Use composition over inheritance
- Use compound components for complex UI (Tabs, Accordion)
- Prefer custom hooks over render props for logic reuse

## Performance Rules

- Use `useMemo` for expensive computations
- Use `useCallback` for functions passed to children
- Use `React.memo` for pure components that re-render often
- Use `lazy()` + `Suspense` for heavy components
- Use virtualization (@tanstack/react-virtual) for lists > 100 items

## State Rules

- Use `useState` for local state
- Use Context + `useReducer` for shared state across components
- ALWAYS use functional updates when state depends on previous: `setCount(prev => prev + 1)`

## Form Rules

- Use controlled components
- Validate on submit, not on every keystroke
- Use `useDebounce` for search inputs (300-500ms)

## Accessibility Rules

- Support keyboard navigation (Arrow keys, Enter, Escape)
- Manage focus when opening/closing modals
- Use semantic ARIA attributes (`role`, `aria-expanded`, `aria-modal`)
