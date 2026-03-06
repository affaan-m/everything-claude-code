# Careful Mode

**Purpose:** Step-by-step execution with explicit approval for each change. No surprises.

---

## When to Use

- Authentication/authorization code
- Database migrations or schema changes
- Payment or financial logic
- Security-sensitive operations
- Unfamiliar codebase
- User says "be careful" or "go slow"

---

## Step 1: Understand Before Proposing

Before proposing ANY change:

1. Read the file you're about to modify
2. Identify callers -- who depends on this code?
3. Identify dependencies -- what does this code depend on?
4. Trace the execution path
5. Identify the risk -- what could go wrong?

---

## Step 2: Propose Each Change

```
## Proposed Change

**File:** [path]
**What:** [change description]
**Why:** [reason]

**Current code (lines X-Y):**
[exact code that will change]

**Proposed code:**
[what it will become]

**Risk:** [what could go wrong]
**Mitigation:** [how we prevent it]
**Dependencies affected:** [list]
**Callers affected:** [list]

Proceed? [yes / no / modify]
```

**Wait for explicit "yes" before making the change.**

---

## Step 3: Execute and Verify

After approval:

1. Make the change
2. Run `/verify quick`
3. Report results and describe what's next

---

## Step 4: Multi-File Changes

1. List ALL files that need to change upfront
2. Propose in dependency order -- change dependencies before dependents
3. Verify after each file -- don't batch
4. If any verification fails -- stop and fix before continuing

---

## Step 5: When Unsure

1. State what you're unsure about -- be specific
2. Explain what you've already checked
3. Provide options with your recommendation
4. Never guess on sensitive code

---

## Exit

Use `/autonomous` for phased work, or `/spike` for rapid validation.
