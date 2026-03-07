# Polish Checklist

Final quality pass before shipping. Polish is the last step, not the first — don't polish work that's not functionally complete.

## Visual Alignment & Spacing

- [ ] Everything aligns to grid at all breakpoints
- [ ] All spacing uses the spacing scale (no random 13px gaps)
- [ ] Optical alignment adjusted for visual weight (icons may need offset)
- [ ] Responsive consistency — spacing works at mobile, tablet, desktop

## Typography

- [ ] Hierarchy consistent — same elements use same sizes/weights throughout
- [ ] Line length 45-75 characters for body text
- [ ] No widows or orphans (single words on last line)
- [ ] No FOUT/FOIT font loading flashes
- [ ] Letter spacing adjusted on headlines where needed

## Color & Contrast

- [ ] All text meets WCAG AA contrast ratios
- [ ] No hard-coded colors — all use design tokens/CSS variables
- [ ] Tinted neutrals — no pure gray; add subtle color tint
- [ ] No gray text on colored backgrounds — use a shade of the background color
- [ ] Focus indicators visible with sufficient contrast

## Interaction States

Every interactive element needs ALL states:

| State | What |
|-------|------|
| **Default** | Resting appearance |
| **Hover** | Subtle feedback (color, scale, shadow) |
| **Focus** | Keyboard focus indicator (NEVER remove without replacement) |
| **Active** | Click/tap feedback |
| **Disabled** | Clearly non-interactive |
| **Loading** | Async action feedback |
| **Error** | Validation state |
| **Success** | Completion confirmation |

Missing states create confusion and broken experiences.

## Transitions

- [ ] All state changes animated (150-300ms)
- [ ] Consistent easing — ease-out-quart/quint/expo, never bounce/elastic
- [ ] 60fps — only animate `transform` and `opacity`
- [ ] Respects `prefers-reduced-motion`

## Content & Copy

- [ ] Consistent terminology throughout
- [ ] Consistent capitalization (Title Case vs Sentence case)
- [ ] No typos or grammar errors
- [ ] Button labels use verb + noun ("Save changes" not "OK")
- [ ] Error messages explain what happened + how to fix
- [ ] Empty states guide toward action

## Icons & Images

- [ ] All icons from same family/style
- [ ] Icons sized consistently and aligned optically with text
- [ ] All images have descriptive alt text
- [ ] Images don't cause layout shift (proper aspect ratios)
- [ ] 2x assets for retina/high-DPI screens

## Forms

- [ ] All inputs properly labeled (not just placeholder text)
- [ ] Required field indicators clear and consistent
- [ ] Error messages helpful and specific
- [ ] Logical tab order for keyboard navigation
- [ ] Consistent validation timing (on blur vs on submit)

## Edge Cases

- [ ] Loading states for all async actions
- [ ] Empty states that guide, not just blank space
- [ ] Error states with recovery paths
- [ ] Long content handled (very long names, descriptions)
- [ ] Missing data handled gracefully

## Responsive

- [ ] Works at mobile, tablet, desktop
- [ ] Touch targets 44x44px minimum
- [ ] No text smaller than 14px on mobile
- [ ] No horizontal scroll
- [ ] Content adapts logically, not just shrinks

## Performance

- [ ] No layout shift after load (CLS)
- [ ] Smooth interactions, no lag or jank
- [ ] Images optimized (format, size, lazy loading)
- [ ] Critical path optimized for fast initial load

## Code

- [ ] No console.log statements
- [ ] No commented-out or dead code
- [ ] No unused imports
- [ ] No TypeScript `any` without justification
- [ ] Semantic HTML with proper ARIA labels

---

**The test**: Use it yourself. Actually interact with the feature. Test all states, not just the happy path. The little things add up — they're the difference between shipped and polished.
