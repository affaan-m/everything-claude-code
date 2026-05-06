import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { runCommand } from "./shell.js";
import type { BuilderExecutionResult, JiraTicket, PlanArtifact, ReviewDecision, RunRecord } from "./types.js";
import { classifyRisk } from "./rules.js";

export class AgentRunner {
  constructor(private readonly repoRoot: string) {
    void this.repoRoot;
  }

  private mode(): BuilderExecutionResult["mode"] {
    const configured = (process.env.AGENT_RUNNER || "mock").trim().toLowerCase();
    return configured === "codex" || configured === "codex-script" ? "codex-script" : "mock";
  }

  private async ensureTaskDir(jiraKey: string): Promise<string> {
    const taskDir = path.join(this.repoRoot, ".task", jiraKey);
    await mkdir(taskDir, { recursive: true });
    return taskDir;
  }

  private builderTask(ticket: JiraTicket, run: RunRecord, plan: PlanArtifact): string {
    return [
      "# Builder Task",
      "",
      `- Jira key: ${ticket.key}`,
      `- Summary: ${ticket.summary}`,
      `- Risk level: ${plan.riskLevel}`,
      `- Worktree: ${run.worktreePath || "missing"}`,
      "",
      "## Constraints",
      "",
      ...plan.constraints.map((constraint) => `- ${constraint}`),
      "",
      "## Planned Steps",
      "",
      ...plan.steps.map((step, index) => `${index + 1}. ${step}`),
      "",
      "## Relevant Files",
      "",
      ...plan.relevantFiles.map((filePath) => `- ${filePath}`),
      "",
      "## Verification",
      "",
      ...plan.testStrategy.map((step) => `- ${step}`),
      "",
      "## Jira Description",
      "",
      ticket.description || "_No description provided._"
    ].join("\n");
  }

  async executeBuilder(ticket: JiraTicket, run: RunRecord, plan: PlanArtifact): Promise<BuilderExecutionResult> {
    if (this.mode() === "mock") {
      return {
        mode: "mock",
        implementationSummary: await this.generateImplementationSummary(plan),
        selfCheck: await this.generateSelfCheck()
      };
    }

    if (!run.worktreePath) {
      throw new Error("Cannot execute builder without an assigned worktree path.");
    }

    const taskDir = await this.ensureTaskDir(ticket.key);
    const taskPath = path.join(taskDir, "builder_task.md");
    const handoffPath = path.join(taskDir, "builder_handoff.md");
    const statusPath = path.join(taskDir, "builder_status.md");
    const scriptPath = path.join(run.worktreePath, "scripts", "orchestrate-codex-worker.sh");

    await writeFile(taskPath, `${this.builderTask(ticket, run, plan).trimEnd()}\n`, "utf8");
    const workerResult = await runCommand("bash", [scriptPath, taskPath, handoffPath, statusPath], run.worktreePath, {
      AGENT_RUNNER: "codex"
    });

    if (workerResult.exitCode !== 0) {
      throw new Error(
        `Codex worker failed: ${workerResult.stderr || workerResult.stdout || "unknown error"}`
      );
    }

    const [handoffContent, statusContent] = await Promise.all([
      readFile(handoffPath, "utf8"),
      readFile(statusPath, "utf8")
    ]);

    return {
      mode: "codex-script",
      implementationSummary: handoffContent.trim(),
      selfCheck: statusContent.trim(),
      taskPath,
      handoffPath,
      statusPath
    };
  }

  async generatePlan(ticket: JiraTicket): Promise<PlanArtifact> {
    const relevantFiles = [
      "tools/orchestrator/src/index.ts",
      "tools/orchestrator/src/machine.ts",
      "tools/orchestrator/src/state.ts",
      "tools/orchestrator/src/worktree.ts",
      "tools/orchestrator/src/gates.ts",
      "tools/orchestrator/README.md"
    ];

    const riskLevel = classifyRisk(ticket, relevantFiles);
    return {
      summary: `Implement a deterministic orchestrator MVP for ${ticket.key}`,
      riskLevel,
      goals: [
        "Persist runs, artifacts, and events",
        "Create isolated worktrees per Jira key",
        "Write context pack, plan, and review artifacts",
        "Expose plan, run, resume, and status CLI commands"
      ],
      constraints: [
        "Keep the implementation lightweight and TypeScript-first",
        "Avoid hardcoded secrets",
        "Use mockable agent and Jira adapters"
      ],
      steps: [
        "Read the ticket and classify risk",
        "Create or load a run record",
        "Create a worktree and context pack",
        "Generate plan and verification artifacts",
        "Run deterministic quality gates",
        "Record reviewer output and next state"
      ],
      testStrategy: [
        "Build the orchestrator package",
        "Run plan and run commands against a Jira key",
        "Inspect the generated status and artifacts",
        "If AGENT_RUNNER=codex, verify builder handoff and status artifacts were produced"
      ],
      relevantFiles
    };
  }

  async generateImplementationSummary(plan: PlanArtifact): Promise<string> {
    return [
      "# Implementation Summary",
      "",
      `Plan summary: ${plan.summary}`,
      "",
      "Implemented:",
      "- typed state transitions for the orchestrator lifecycle",
      "- persisted run, artifact, and event storage",
      "- Jira, worktree, and GitHub adapters",
      "- context pack and report artifact generation",
      "- deterministic quality gate execution",
      "",
      "The MVP uses a mock-friendly runner so the control plane can be demonstrated without external credentials."
    ].join("\n");
  }

  async generateSelfCheck(): Promise<string> {
    return [
      "# Self Check",
      "",
      "- Scope stayed inside `tools/orchestrator/`.",
      "- No secrets were embedded in source files.",
      "- The CLI writes artifacts instead of relying on long chat histories.",
      "- Live Jira access remains optional through environment variables."
    ].join("\n");
  }

  async review(plan: PlanArtifact, gatesPassed: boolean): Promise<ReviewDecision> {
    return {
      approve: gatesPassed && plan.riskLevel !== "high",
      requiredChanges: gatesPassed ? [] : ["Resolve failed quality gates before PR preparation."],
      summary: gatesPassed
        ? "Implementation matches the MVP scope and passed deterministic verification."
        : "Implementation needs follow-up on the failed quality gates."
    };
  }
}
