export const RUN_STATES = [
  "NEW",
  "TRIAGED",
  "CONTEXT_READY",
  "PLAN_READY",
  "APPROVAL_REQUIRED",
  "EXECUTING",
  "SELF_VERIFIED",
  "FIX_REQUIRED",
  "REVIEWING",
  "HUMAN_REVIEW_REQUIRED",
  "PR_READY",
  "DONE",
  "FAILED"
] as const;

export type RunState = (typeof RUN_STATES)[number];

export type RiskLevel = "low" | "medium" | "high";

export interface JiraTicket {
  key: string;
  summary: string;
  description: string;
  status: string;
  priority: string;
  issueType: string;
  source: "live" | "mock";
}

export interface PlanArtifact {
  summary: string;
  riskLevel: RiskLevel;
  goals: string[];
  constraints: string[];
  steps: string[];
  testStrategy: string[];
  relevantFiles: string[];
}

export interface RunRecord {
  id: string;
  jiraKey: string;
  state: RunState;
  riskLevel: RiskLevel;
  branch: string | null;
  worktreePath: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ArtifactRecord {
  id: number;
  runId: string;
  type: string;
  path: string;
  validJson: number;
  createdAt: string;
}

export interface EventRecord {
  id: number;
  runId: string;
  fromState: RunState | null;
  toState: RunState;
  reason: string;
  createdAt: string;
}

export interface ContextPack {
  jira: JiraTicket;
  run: RunRecord;
  allowedPaths: string[];
  forbiddenAreas: string[];
  relevantFiles: string[];
  docs: Record<string, string>;
  testCommands: string[];
  definitionOfDone: string[];
}

export interface GateStepResult {
  name: string;
  command: string;
  status: "passed" | "failed" | "skipped";
  exitCode: number | null;
  output: string;
}

export interface GateReport {
  status: "passed" | "failed";
  steps: GateStepResult[];
  generatedAt: string;
}

export interface ReviewDecision {
  approve: boolean;
  requiredChanges: string[];
  summary: string;
}

export interface BuilderExecutionResult {
  mode: "mock" | "codex-script";
  implementationSummary: string;
  selfCheck: string;
  taskPath?: string;
  handoffPath?: string;
  statusPath?: string;
}

export interface PullRequestResult {
  ready: boolean;
  created: boolean;
  skipped: boolean;
  branch: string;
  url: string | null;
  number: number | null;
  command: string | null;
  reason?: string;
}

export interface AgentOutputs {
  plan: PlanArtifact;
  review: ReviewDecision;
}
