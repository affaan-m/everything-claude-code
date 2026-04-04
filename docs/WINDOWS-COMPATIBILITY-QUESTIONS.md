# Windows Compatibility — Pre-Implementation Questions

Critical questions to resolve before starting work on `docs/WINDOWS-COMPATIBILITY.md`.

---

## Scope

**Q1: What is your actual Windows environment?**

The plan assumes "native Windows with Git Bash available." But there are differences that change the fix approach:

- Are you running Claude Code in **CMD**, **PowerShell**, or **Git Bash**?
- Are shell scripts invoked by Claude Code through `bash` explicitly (via hooks.json), or could they hit CMD/PowerShell?
- Do you use **WSL2** at all, or is everything native Windows?

This matters because some "blocking" issues (e.g., `[[ ]]`, process substitution) may already work if Claude Code always invokes scripts through Git Bash, making those fixes unnecessary.

**Q2: Which items do you actually use?**

The plan covers the entire ECC codebase, but you likely only use a subset of features. For each item below, do you need it working on Windows?

- `.codebuddy/` and `.trae/` install/uninstall scripts — do you use CodeBuddy or Trae?
- `scripts/gan-harness.sh` — do you use the GAN harness?
- `scripts/sync-ecc-to-codex.sh` — do you use Codex integration?
- `mcp-configs/mcp-servers.json` (insaits, evalview) — do you use these MCP servers?
- `skills/continuous-learning-v2/` (observer, instincts) — do you use the instinct system?
- `skills/skill-stocktake/`, `skills/rules-distill/` — do you use these?
- tmux orchestration — do you need multi-pane agent orchestration?

Fixing only what you use will drastically reduce scope.

---

## PR Strategy

**Q3: Are these changes intended to be PR'd upstream, or are they fork-only?**

- If **upstream PR**: Every fix needs to be backwards-compatible. You can't just change `python3` to `python` — you need a resolver that tries both. You also need to justify each change to the author.
- If **fork-only**: You can make Windows-only changes (e.g., hardcode `python`) since you control the environment.
- If **both**: Some fixes are generic enough to PR (e.g., `grep -E` rewrite), while others might be fork-specific.

This changes the implementation approach for nearly every item.

**Q4: Will you maintain these changes through rebases?**

You set up `git sync-upstream` to rebase onto upstream/main. The more files you modify, the more likely you'll hit conflicts during rebases. Are you prepared to resolve conflicts across 10+ files regularly, or should you minimize the change surface?

---

## Phase 1 Questions

**Q5: Item 1 — MCP `python3` command. Can you just change it to `python` locally?**

If you don't use the insaits or evalview MCP servers, this fix is unnecessary. If you do, the simplest fix is editing your local `mcp-servers.json` (not the one in the repo). Claude Code reads MCP config from `~/.claude.json` or project `.mcp.json` — you may not need to change the repo file at all.

**Q6: Items 4 & 5 — SIGUSR1 and nohup. Do you need the background observer?**

These both relate to `continuous-learning-v2`'s background observer process. If you're not running the observer on Windows, neither fix is needed. If you do want it, replacing `SIGUSR1` + `nohup` is a significant rewrite of the observer's lifecycle management — likely the hardest fix in the plan.

**Q7: Item 6 — Process substitution. Are these scripts reachable on your Windows setup?**

The 10 files with `<(...)` span `.codebuddy/`, `.trae/`, `scripts/`, and `skills/`. If Claude Code invokes these through Git Bash, process substitution may already work (Git Bash 2.x+ supports it). Have you actually hit errors from these, or is this theoretical?

**Q8: Item 7 — flock. Is the directory-based fallback sufficient?**

The plan suggests using directory creation (`mkdir`) as a cross-platform lock. This is the same approach already used for the macOS fallback. But `mkdir` on Windows NTFS is not atomic across all scenarios (network drives, SMB shares). Is this acceptable, or do you need true file locking?

---

## Phase 2 Questions

**Q9: Item 8 — Tmux orchestration. What would a Windows replacement actually look like?**

The plan says "Windows Terminal tabs or separate CMD windows." But:
- Windows Terminal has no CLI API for creating tabs (the `wt` command exists but is limited).
- Separate CMD windows can't share stdin/stdout the way tmux panes do.
- The orchestrator sends commands to panes via `tmux send-keys` — there's no Windows equivalent.

Is this item actually feasible, or should it be marked as "not supported on Windows" with documentation only?

**Q10: Item 9 — Desktop notifications. Is this worth the effort?**

The hook silently does nothing on native Windows. Adding PowerShell toast notifications requires `BurntToast` module installation. Is this a feature you need, or can it stay as a known limitation?

**Q11: Item 10 — fcntl. Is the race condition realistic?**

The `projects.json` file is only written when you run `/instinct-import`, `/promote`, or `/prune` — typically one at a time. A race condition would require two Claude Code sessions running instinct commands simultaneously. How likely is this in your workflow?

---

## Testing

**Q12: How will you verify fixes?**

The plan has no testing strategy. Specifically:
- Do you have a test environment separate from your working Claude Code instance?
- The existing test suite (`node tests/run-all.js`) — does it pass on your Windows setup currently?
- For shell script fixes, will you test in Git Bash, CMD, and PowerShell, or just Git Bash?
- Who tests the observer rewrite (item 6) — automated tests or manual verification?

**Q13: Are you fixing line numbers as you go?**

The plan references specific line numbers (e.g., "line 108, 167"). These will drift as upstream makes changes. Should the plan reference function names or code patterns instead of line numbers?
