# PR 399 Review — March 12, 2026

## Scope

Reviewed `#399`:

- title: `fix(observe): 5-layer automated session guard to prevent self-loop observations`
- head: `e7df0e588ceecfcd1072ef616034ccd33bb0f251`
- files changed:
  - `skills/continuous-learning-v2/hooks/observe.sh`
  - `skills/continuous-learning-v2/agents/observer-loop.sh`

## Findings

### Medium

1. `skills/continuous-learning-v2/hooks/observe.sh`

The new `CLAUDE_CODE_ENTRYPOINT` guard uses a finite allowlist of known
non-`cli` values (`sdk-ts`, `sdk-py`, `sdk-cli`, `mcp`, `remote`).

That leaves a forward-compatibility hole: any future non-`cli` entrypoint value
will fall through and be treated as interactive. That reintroduces the exact
class of automated-session observation the PR is trying to prevent.

The safer rule is:

- allow only `cli`
- treat every other explicit entrypoint as automated
- keep the default fallback as `cli` when the variable is unset

Suggested shape:

```bash
case "${CLAUDE_CODE_ENTRYPOINT:-cli}" in
  cli) ;;
  *) exit 0 ;;
esac
```

## Merge Recommendation

`Needs one follow-up change before merge.`

The PR direction is correct:

- it closes the ECC self-observation loop in `observer-loop.sh`
- it adds multiple guard layers in the right area of `observe.sh`
- it already addressed the cheaper-first ordering and skip-path trimming issues

But the entrypoint guard should be generalized before merge so the automation
filter does not silently age out when Claude Code introduces additional
non-interactive entrypoints.

## Residual Risk

- There is still no dedicated regression test coverage around the new shell
  guard behavior, so the final merge should include at least one executable
  verification pass for the entrypoint and skip-path cases.
