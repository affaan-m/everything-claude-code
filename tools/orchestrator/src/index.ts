import path from "node:path";
import { fileURLToPath } from "node:url";
import { ArtifactManager } from "./artifacts.js";
import { AgentRunner } from "./agents.js";
import { buildContextPack } from "./contextPack.js";
import { loadOrchestratorEnv } from "./env.js";
import { formatGateReport, runQualityGates } from "./gates.js";
import { GitHubClient } from "./github.js";
import { JiraClient } from "./jira.js";
import { moveRun } from "./machine.js";
import { decideExecutionPath, chooseNextState } from "./rules.js";
import { StateStore } from "./state.js";
import type { GateReport, PullRequestResult, RunRecord } from "./types.js";
import { WorktreeManager } from "./worktree.js";

const REUSABLE_RUN_STATES = new Set([
  "NEW",
  "TRIAGED",
  "CONTEXT_READY",
  "PLAN_READY",
  "APPROVAL_REQUIRED",
  "EXECUTING",
  "FIX_REQUIRED"
]);

function usage(): never {
  console.error("Usage: node dist/index.js <plan|run|resume|status> <jira-key|run-id>");
  process.exit(1);
}

function orchestratorRootFromRuntime(): string {
  const currentDir = path.dirname(fileURLToPath(import.meta.url));
  return path.resolve(currentDir, "..");
}

function repoRootFromRuntime(): string {
  const currentDir = path.dirname(fileURLToPath(import.meta.url));
  return path.resolve(currentDir, "..", "..", "..");
}

function requireArgument(value: string | undefined): string {
  if (!value) {
    usage();
  }
  return value;
}

function allowHighRiskExecution(): boolean {
  const value = process.env.ORCHESTRATOR_ALLOW_HIGH_RISK?.trim().toLowerCase();
  return value === "1" || value === "true" || value === "yes";
}

async function createOrLoadRun(store: StateStore, jiraKey: string): Promise<RunRecord> {
  const existing = store.findLatestRunByJiraKey(jiraKey);
  if (!existing) {
    return store.createRun(jiraKey);
  }

  return REUSABLE_RUN_STATES.has(existing.state) ? existing : store.createRun(jiraKey);
}

async function runPlanCommand(
  jiraKey: string,
  repoRoot: string,
  store: StateStore,
  artifacts: ArtifactManager,
  jira: JiraClient,
  agents: AgentRunner
): Promise<void> {
  const ticket = await jira.getIssue(jiraKey);
  let run = await createOrLoadRun(store, jiraKey);
  if (run.state === "NEW") {
    run = moveRun(store, run, "TRIAGED", "Ticket loaded for planning");
  }

  const plan = await agents.generatePlan(ticket);
  run = store.updateRunMetadata(run.id, { riskLevel: plan.riskLevel });
  await artifacts.writeJson(run.id, jiraKey, "plan.json", plan);
  await artifacts.writeJson(run.id, jiraKey, "relevant_files.json", plan.relevantFiles);
  await artifacts.writeMarkdown(
    run.id,
    jiraKey,
    "risk_assessment.md",
    `# Risk Assessment\n\n- Ticket: ${ticket.key}\n- Risk level: ${plan.riskLevel}\n- Source: ${ticket.source}\n`
  );

  if (run.state !== "PLAN_READY") {
    run = moveRun(store, run, "PLAN_READY", "Plan artifacts generated");
  }

  console.log(
    JSON.stringify(
      {
        runId: run.id,
        jiraKey: run.jiraKey,
        state: run.state,
        riskLevel: run.riskLevel,
        artifacts: store.listArtifacts(run.id).map((entry) => path.relative(repoRoot, entry.path))
      },
      null,
      2
    )
  );
}

async function runExecutionCommand(
  jiraKey: string,
  repoRoot: string,
  orchestratorRoot: string,
  store: StateStore,
  artifacts: ArtifactManager,
  jira: JiraClient,
  agents: AgentRunner
): Promise<void> {
  const ticket = await jira.getIssue(jiraKey);
  let run = await createOrLoadRun(store, jiraKey);
  if (run.state === "NEW") {
    run = moveRun(store, run, "TRIAGED", "Ticket loaded for execution");
  }

  const plan = await agents.generatePlan(ticket);
  run = store.updateRunMetadata(run.id, { riskLevel: plan.riskLevel });

  const worktrees = new WorktreeManager(repoRoot);
  const worktree = await worktrees.createForTicket(jiraKey);
  run = store.updateRunMetadata(run.id, {
    branch: worktree.branch,
    worktreePath: worktree.worktreePath
  });

  await artifacts.writeJson(run.id, jiraKey, "plan.json", plan);
  await artifacts.writeJson(run.id, jiraKey, "relevant_files.json", plan.relevantFiles);
  await artifacts.writeMarkdown(
    run.id,
    jiraKey,
    "risk_assessment.md",
    `# Risk Assessment\n\n- Ticket: ${ticket.key}\n- Risk level: ${plan.riskLevel}\n- Source: ${ticket.source}\n`
  );

  if (run.state === "TRIAGED") {
    run = moveRun(store, run, "CONTEXT_READY", "Worktree metadata prepared");
  }

  const contextPack = await buildContextPack(repoRoot, ticket, run, plan);
  await artifacts.writeJson(run.id, jiraKey, "context_pack.json", contextPack);

  if (run.state === "CONTEXT_READY") {
    run = moveRun(store, run, "PLAN_READY", "Context pack written");
  }

  if (decideExecutionPath(plan.riskLevel) === "approval_required" && !allowHighRiskExecution()) {
    run = moveRun(store, run, "APPROVAL_REQUIRED", "High-risk run requires human approval");
  } else if (decideExecutionPath(plan.riskLevel) === "approval_required" && allowHighRiskExecution()) {
    run = moveRun(store, run, "EXECUTING", "High-risk execution explicitly approved");
  } else if (run.state === "PLAN_READY" || run.state === "FIX_REQUIRED") {
    run = moveRun(
      store,
      run,
      "EXECUTING",
      run.state === "FIX_REQUIRED" ? "Retrying execution after required fixes" : "Execution started"
    );
  }

  if (run.state === "APPROVAL_REQUIRED") {
    console.log(
      JSON.stringify(
        {
          runId: run.id,
          jiraKey: run.jiraKey,
          state: run.state,
          branch: run.branch,
          worktreePath: run.worktreePath
        },
        null,
        2
      )
    );
    return;
  }

  const builderResult = await agents.executeBuilder(ticket, run, plan);
  await artifacts.writeMarkdown(run.id, jiraKey, "implementation_summary.md", builderResult.implementationSummary);
  await artifacts.writeMarkdown(run.id, jiraKey, "self_check.md", builderResult.selfCheck);

  run = moveRun(store, run, "SELF_VERIFIED", "Implementation artifacts generated");

  const gateReport: GateReport = await runQualityGates(repoRoot, orchestratorRoot);
  await artifacts.writeMarkdown(run.id, jiraKey, "test_report.md", formatGateReport(gateReport));
  await artifacts.writeJson(run.id, jiraKey, "metrics.json", {
    gateStatus: gateReport.status,
    stepCount: gateReport.steps.length,
    generatedAt: gateReport.generatedAt
  });

  if (gateReport.status === "failed") {
    run = moveRun(store, run, "FIX_REQUIRED", "Quality gates failed");
  } else {
    run = moveRun(store, run, "REVIEWING", "Quality gates passed");
  }

  const review = await agents.review(plan, gateReport.status === "passed");
  await artifacts.writeMarkdown(
    run.id,
    jiraKey,
    "review_report.md",
    `# Review Report\n\n- Approved: ${review.approve}\n- Summary: ${review.summary}\n${
      review.requiredChanges.length ? `- Required changes: ${review.requiredChanges.join(", ")}` : "- Required changes: none"
    }\n`
  );

  if (run.state === "FIX_REQUIRED") {
    console.log(
      JSON.stringify(
        {
          runId: run.id,
          jiraKey: run.jiraKey,
          state: run.state,
          gateStatus: gateReport.status
        },
        null,
        2
      )
    );
    return;
  }

  let nextState = chooseNextState(plan, gateReport, review);
  if (nextState === "HUMAN_REVIEW_REQUIRED" && allowHighRiskExecution() && review.requiredChanges.length === 0) {
    nextState = "PR_READY";
  }
  run = moveRun(store, run, nextState, "Review decision recorded");

  const github = new GitHubClient(repoRoot);
  const reviewReportPath = path.join(repoRoot, ".task", jiraKey, "review_report.md");
  let prInfo: PullRequestResult | { ready: boolean; command: string };
  if (run.state === "PR_READY" && run.worktreePath && run.branch) {
    prInfo = await github.publishPullRequest(
      run.worktreePath,
      run.branch,
      `${jiraKey}: ${ticket.summary}`,
      reviewReportPath,
      `feat(orchestrator): prepare ${jiraKey}`
    );

    if ("url" in prInfo && prInfo.url) {
      await jira.addComment(
        jiraKey,
        [
          `Draft PR prepared for ${jiraKey}.`,
          `PR: ${prInfo.url}`,
          `Run: ${run.id}`,
          `State: ${run.state}`
        ].join("\n\n")
      );
    }
  } else {
    prInfo = await github.preparePullRequest(
      run.branch || `agent/${jiraKey}`,
      `${jiraKey}: ${ticket.summary}`,
      reviewReportPath
    );
  }

  console.log(
    JSON.stringify(
      {
        runId: run.id,
        jiraKey: run.jiraKey,
        state: run.state,
        riskLevel: run.riskLevel,
        branch: run.branch,
        worktreePath: run.worktreePath,
        runnerMode: builderResult.mode,
        pr: prInfo,
        artifacts: store.listArtifacts(run.id).map((entry) => path.relative(repoRoot, entry.path))
      },
      null,
      2
    )
  );
}

async function runStatusCommand(
  identifier: string,
  repoRoot: string,
  store: StateStore
): Promise<void> {
  const run = store.getRun(identifier) || store.findLatestRunByJiraKey(identifier);
  if (!run) {
    throw new Error(`Run or Jira key not found: ${identifier}`);
  }

  console.log(
    JSON.stringify(
      {
        run,
        artifacts: store.listArtifacts(run.id).map((entry) => ({
          type: entry.type,
          path: path.relative(repoRoot, entry.path)
        })),
        events: store.listEvents(run.id)
      },
      null,
      2
    )
  );
}

async function runResumeCommand(identifier: string, repoRoot: string, store: StateStore): Promise<void> {
  const run = store.getRun(identifier);
  if (!run) {
    throw new Error(`Run not found: ${identifier}`);
  }

  console.log(
    JSON.stringify(
      {
        runId: run.id,
        state: run.state,
        message: "Resume is intentionally conservative in the MVP. Inspect artifacts and rerun the command that should advance the workflow.",
        artifacts: store.listArtifacts(run.id).map((entry) => path.relative(repoRoot, entry.path))
      },
      null,
      2
    )
  );
}

async function main(): Promise<void> {
  const [, , action, rawIdentifier] = process.argv;
  const identifier = requireArgument(rawIdentifier);
  const repoRoot = repoRootFromRuntime();
  const orchestratorRoot = orchestratorRootFromRuntime();
  loadOrchestratorEnv(repoRoot);
  const store = await StateStore.create(orchestratorRoot);
  const artifacts = new ArtifactManager(repoRoot, store);
  const jira = new JiraClient();
  const agents = new AgentRunner(repoRoot);

  switch (action) {
    case "plan":
      await runPlanCommand(identifier, repoRoot, store, artifacts, jira, agents);
      return;
    case "run":
      await runExecutionCommand(identifier, repoRoot, orchestratorRoot, store, artifacts, jira, agents);
      return;
    case "status":
      await runStatusCommand(identifier, repoRoot, store);
      return;
    case "resume":
      await runResumeCommand(identifier, repoRoot, store);
      return;
    default:
      usage();
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exit(1);
});
