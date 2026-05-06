import type { GateReport, JiraTicket, PlanArtifact, RiskLevel, ReviewDecision } from "./types.js";

export function classifyRisk(ticket: JiraTicket, relevantFiles: string[]): RiskLevel {
  const haystack = `${ticket.summary}\n${ticket.description}\n${relevantFiles.join("\n")}`.toLowerCase();
  if (/(auth|token|secret|privacy|health|sync)/.test(haystack)) {
    return "high";
  }
  if (/(workflow|orchestrator|state|worktree|queue|runner)/.test(haystack)) {
    return "medium";
  }
  return "low";
}

export function decideExecutionPath(riskLevel: RiskLevel): "execute" | "approval_required" {
  return riskLevel === "high" ? "approval_required" : "execute";
}

export function chooseNextState(
  plan: PlanArtifact,
  gateReport: GateReport,
  review: ReviewDecision
): "PR_READY" | "HUMAN_REVIEW_REQUIRED" | "FIX_REQUIRED" {
  if (gateReport.status === "failed") {
    return "FIX_REQUIRED";
  }

  if (!review.approve || plan.riskLevel === "high") {
    return "HUMAN_REVIEW_REQUIRED";
  }

  return "PR_READY";
}
