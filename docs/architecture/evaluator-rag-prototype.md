# Evaluator RAG Prototype

ECC 2.0 needs a self-improving harness loop that can learn from real work
without blindly mutating a user's Claude, Codex, OpenCode, dmux, Zed, or
terminal setup. This prototype defines the smallest read-only artifact set for
that loop.

The fixture set lives in
[`examples/evaluator-rag-prototype/`](../../examples/evaluator-rag-prototype/).
It uses the May 2026 stale-PR cleanup and salvage lane as the first concrete
scenario because that lane has real inputs, real accepted work, and real
rejected work.

## Reference Pressure

- Meta-Harness: treat the harness itself as an experiment with scenario specs,
  verifier results, and promoted playbooks.
- Autocontext: store traces, reports, artifacts, and reusable improvements
  before changing installed agent assets.
- Claude HUD: expose context, tools, todos, agent activity, checks, and risk so
  an evaluator can judge a run after the fact.
- Hermes Agent: keep skills, memories, scheduler-like follow-ups, and terminal
  gateway behavior explicit instead of hiding local commands.
- dmux, Orca, Superset, and Ghast: preserve worktree/session state so parallel
  agent work can be compared, resumed, or closed cleanly.
- ECC Tools: route evaluator findings into PR comments, check runs, and Linear
  backlog items without flooding GitHub.

## Artifact Contract

Every evaluator/RAG run is read-only until a verifier promotes a playbook.

| Artifact | Purpose | Fixture |
| --- | --- | --- |
| Scenario spec | Declares the objective, allowed evidence, forbidden actions, and pass/fail gates. | `scenario.json` |
| Trace | Captures observation, retrieval, proposal, verification, and promotion events. | `trace.json` |
| Report | Summarizes scores, evidence coverage, risks, and recommended next action. | `report.json` |
| Candidate playbook | Describes the maintainer-owned workflow that could be reused later. | `candidate-playbook.md` |
| Verifier result | Accepts or rejects candidates with concrete reasons and rollback notes. | `verifier-result.json` |

The prototype deliberately separates retrieval from action. A run can retrieve
closed PR diffs, Linear status, CI history, and local docs, but it cannot close,
merge, publish, tag, or rewrite configs as part of the evaluator pass.

## Phase Model

1. Observe the current queue, dirty worktrees, branch state, open PRs/issues,
   discussions, CI state, and release gates.
2. Retrieve relevant reference evidence: stale-salvage ledger rows, prior
   maintainer PRs, current docs, analyzer findings, CI failures, and harness
   adapter rules.
3. Propose one or more playbooks with source attribution and expected
   validation gates.
4. Verify each playbook against explicit acceptance and rejection rules.
5. Promote only the candidate that improves the scenario without widening blast
   radius.
6. Record rollback guidance and unresolved manual-review tails.

## First Scenario

The first scenario is `stale-pr-salvage-maintainer-branch`.

It models the rule Affaan set during the May 2026 cleanup: stale closure is
queue hygiene, not loss of useful work. Useful closed PR work should be ported
into maintainer-owned PRs with attribution/backlinks, while generated churn,
bulk localization, and ambiguous translator work stay out of blind
cherry-picks.

The verifier accepts a maintainer salvage branch that:

- credits source PRs;
- avoids raw private context and personal paths;
- does not import stale bulk localization without translator review;
- records a durable ledger update;
- runs the same validation gates as a normal code, docs, or catalog change;
- leaves release publication actions approval-gated.

The verifier rejects a blind cherry-pick proposal that:

- imports stale translation/doc churn wholesale;
- skips the current catalog/install architecture;
- lacks attribution;
- lacks tests or ledger updates;
- mutates release or plugin publication state.

## ECC Tools Mapping

ECC Tools already flags missing RAG/evaluator evidence for retrieval,
embedding, ranking, and evaluator changes. This prototype gives those checks a
target shape:

- `scenario.json` maps to analyzer corpus inputs.
- `trace.json` maps to golden traces and run telemetry.
- `report.json` maps to PR comment summaries and Linear backlog summaries.
- `candidate-playbook.md` maps to the suggested follow-up PR body.
- `verifier-result.json` maps to pass/fail check-run evidence.

Future ECC Tools work should consume these artifacts as fixture shape before it
adds hosted retrieval or model-backed judging. The local prototype is enough to
prove the contract before any paid API or vector store is introduced.

## Promotion Rules

A candidate can be promoted only when:

- the verifier result is `accepted`;
- at least one rejected candidate proves the verifier can say no;
- every source PR or reference artifact has attribution;
- the proposed action is maintainer-owned and reversible;
- validation commands are named;
- unresolved translator, release, billing, or publication items remain blocked
  until separately approved.

## Next Expansion

The next evaluator/RAG corpus should add:

- a CI-failure diagnosis scenario with captured logs and a known fix;
- a harness-config quality scenario covering MCP/plugin/hook drift;
- a billing-readiness scenario that separates verified Marketplace claims from
  launch-copy assumptions;
- an AgentShield policy exception scenario with SARIF and report evidence.
