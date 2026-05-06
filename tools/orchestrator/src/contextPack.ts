import { readFile } from "node:fs/promises";
import path from "node:path";
import type { ContextPack, JiraTicket, PlanArtifact, RunRecord } from "./types.js";

async function safeRead(filePath: string): Promise<string> {
  try {
    return await readFile(filePath, "utf8");
  } catch {
    return "";
  }
}

export async function buildContextPack(
  repoRoot: string,
  jira: JiraTicket,
  run: RunRecord,
  plan: PlanArtifact
): Promise<ContextPack> {
  const agentsDoc = await safeRead(path.join(repoRoot, "AGENTS.md"));
  const claudeDoc = await safeRead(path.join(repoRoot, "CLAUDE.md"));

  return {
    jira,
    run,
    allowedPaths: ["tools/orchestrator/**"],
    forbiddenAreas: ["auth/**", "sync/**", "health/**", ".env*", "secrets/**"],
    relevantFiles: plan.relevantFiles,
    docs: {
      "AGENTS.md": agentsDoc,
      "CLAUDE.md": claudeDoc
    },
    testCommands: [
      "npm run orchestrator -- run <jira-key>",
      "npm run orchestrator -- status <run-id>"
    ],
    definitionOfDone: [
      "Run exists in the state store",
      "Worktree exists for the Jira key",
      "Context pack artifact is written",
      "Plan and verification artifacts are persisted",
      "Status output shows the current state"
    ]
  };
}
