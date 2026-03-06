# Spike (Fast MVP Mode)

**Purpose:** Rapidly validate if an idea works. Speed over quality. Technical debt accepted.

**Time Limit:** 90 minutes max. If you hit 90 minutes, stop and report.

---

## When to Use

- Testing if an idea is feasible
- Validating UX before committing to full build
- "Can I click through this and see if it works?"
- Exploring before planning

---

## Mindset

- **Speed over completeness** — Get core flow working
- **Technical debt accepted** — Refactor expected later
- **Learn by doing** — Goal is validation, not production code
- **Minimal patterns** — Just enough to be realistic

---

## What's Required (Minimal)

- Core functionality works
- Can be demonstrated
- Basic error handling (try/catch, not comprehensive)

## What's Skipped

- Tests
- Documentation
- Edge cases
- Polish and animations
- Full error handling
- Proper abstractions
- Code organization

---

## Time Boxing

| Phase | Time |
|-------|------|
| Setup | 15 min |
| Core functionality | 50 min |
| Make it demonstrable | 15 min |
| Report | 10 min |
| **Total** | **90 min max** |

---

## Stop Criteria

Stop spiking if:
- 90 minutes elapsed
- Core idea validated (works or doesn't)
- Hit a fundamental blocker
- Idea clearly won't work

---

## Report Template

When done, provide:

```
## Spike Complete: [Name]

### Time Spent
[X minutes]

### What It Does
[2-3 sentences - what can you DO with this?]

### How to Test
1. [Step 1]
2. [Step 2]
3. [Step 3]

### Files Created
- [file1] - [purpose]
- [file2] - [purpose]

### What Works
- [Working feature 1]
- [Working feature 2]

### What Doesn't Work
- [Known limitation 1]
- [Known limitation 2]

### To Move to Production
- [ ] [Thing that needs doing]
- [ ] [Thing that needs doing]
- [ ] [Thing that needs doing]

### Verdict
- PROCEED — Idea works, worth building properly
- ITERATE — Needs changes before full build
- ABANDON — Idea doesn't work, don't pursue
```

---

## After Spike

Based on verdict:

**PROCEED:**
- Create a proper brief with `/brief`
- Then build properly with `/autonomous`

**ITERATE:**
- Document what needs to change
- Spike again with new approach, OR
- Create brief with lessons learned

**ABANDON:**
- Document why it didn't work
- Move on

---

## Rules

- **DO NOT exceed 90 minutes**
- **DO NOT polish** — ugly that works > pretty that doesn't
- **DO NOT write tests** — validate manually
- **DO commit your spike** — even failed spikes are learning
- **DO be honest in report** — if it doesn't work, say so
