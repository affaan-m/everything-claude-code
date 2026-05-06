import type { RunRecord, RunState } from "./types.js";
import { RUN_STATES } from "./types.js";
import { StateStore } from "./state.js";

const transitions: Record<RunState, RunState[]> = {
  NEW: ["TRIAGED", "FAILED"],
  TRIAGED: ["CONTEXT_READY", "PLAN_READY", "FAILED"],
  CONTEXT_READY: ["PLAN_READY", "FAILED"],
  PLAN_READY: ["APPROVAL_REQUIRED", "EXECUTING", "FAILED"],
  APPROVAL_REQUIRED: ["EXECUTING", "FAILED"],
  EXECUTING: ["SELF_VERIFIED", "FIX_REQUIRED", "FAILED"],
  SELF_VERIFIED: ["REVIEWING", "FIX_REQUIRED", "HUMAN_REVIEW_REQUIRED", "FAILED"],
  FIX_REQUIRED: ["EXECUTING", "FAILED"],
  REVIEWING: ["PR_READY", "HUMAN_REVIEW_REQUIRED", "FAILED"],
  HUMAN_REVIEW_REQUIRED: ["PR_READY", "DONE", "FAILED"],
  PR_READY: ["DONE", "FAILED"],
  DONE: [],
  FAILED: []
};

export function assertValidState(candidate: string): asserts candidate is RunState {
  if (!RUN_STATES.includes(candidate as RunState)) {
    throw new Error(`Unknown state ${candidate}`);
  }
}

export function canTransition(from: RunState, to: RunState): boolean {
  return transitions[from].includes(to);
}

export function moveRun(
  store: StateStore,
  run: RunRecord,
  toState: RunState,
  reason: string
): RunRecord {
  if (!canTransition(run.state, toState)) {
    throw new Error(`Invalid transition ${run.state} -> ${toState}`);
  }

  return store.transitionRun(run.id, run.state, toState, reason);
}
