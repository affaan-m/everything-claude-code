# UX Writing Reference

## Button Labels

**NEVER use "OK", "Submit", "Yes/No", or "Click here".** Use verb + noun:

| Bad | Good | Why |
|-----|------|-----|
| OK | Save changes | Says what will happen |
| Submit | Create account | Outcome-focused |
| Yes | Delete message | Confirms the action |
| Cancel | Keep editing | Clarifies what "cancel" means |
| Click here | Download PDF | Describes the destination |

For destructive actions, name the destruction: "Delete 5 items" not "Delete selected."

## Error Messages

Every error must answer: (1) What happened? (2) Why? (3) How to fix it?

| Situation | Template |
|-----------|----------|
| **Format error** | "[Field] needs to be [format]. Example: [example]" |
| **Missing required** | "Please enter [what's missing]" |
| **Permission denied** | "You don't have access to [thing]. [What to do instead]" |
| **Network error** | "We couldn't reach [thing]. Check your connection and [action]." |
| **Server error** | "Something went wrong on our end. We're looking into it. [Alternative action]" |

NEVER blame the user: "Please enter a date in MM/DD format" not "You entered an invalid date."

## Empty States

Empty states are onboarding moments. Every one needs:
1. **Acknowledge** — what will appear here
2. **Value** — why it matters
3. **Action** — clear CTA to create first item

"No projects yet. Projects help you organize your work. [Create your first project] or [Start from template]"

NOT: "No items" with a blank page.

## Voice vs Tone

**Voice** is your brand personality — consistent everywhere.
**Tone** adapts to the moment:

| Moment | Tone |
|--------|------|
| Success | Celebratory, brief: "Done! Your changes are live." |
| Error | Empathetic, helpful: "That didn't work. Here's what to try..." |
| Loading | Reassuring: "Saving your work..." |
| Destructive confirm | Serious, clear: "Delete this project? This can't be undone." |

NEVER use humor for errors. Users are already frustrated.

## Confirmation Dialogs

Most confirmation dialogs are design failures — consider undo instead. When you must confirm:
- Name the specific action ("Delete 'Project Alpha'?" not "Are you sure?")
- Explain consequences ("This can't be undone")
- Use specific button labels ("Delete project" / "Keep project", not "Yes" / "No")

## Consistency

Pick one term and stick with it:

| Inconsistent | Pick One |
|--------------|----------|
| Delete / Remove / Trash | Delete |
| Settings / Preferences / Options | Settings |
| Sign in / Log in / Enter | Sign in |
| Create / Add / New | Create |

## Loading States

Be specific: "Saving your draft..." not "Loading...". For long waits, set expectations ("This usually takes 30 seconds") or show progress.

## Writing for Accessibility

- Link text must have standalone meaning — "View pricing plans" not "Click here"
- Alt text describes information, not the image — "Revenue increased 40% in Q4" not "Chart"
- Use `alt=""` for decorative images
- Icon buttons need `aria-label`

## Writing for Translation

German text is ~30% longer than English. Keep numbers separate ("New messages: 3" not "You have 3 new messages"). Use full sentences as single strings (word order varies by language). Avoid abbreviations.

---

**Core rules**: Be specific. Be concise. Be active voice. Be human. Be helpful. Be consistent. Say it once.
