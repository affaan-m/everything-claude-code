import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { randomUUID } from "node:crypto";
import type { ArtifactRecord, EventRecord, RiskLevel, RunRecord, RunState } from "./types.js";

type SqlJsStatic = (config?: { locateFile?: (file: string) => string }) => Promise<any>;

export interface ArtifactStore {
  recordArtifact(runId: string, type: string, targetPath: string, validJson: boolean): void;
}

function timestamp(): string {
  return new Date().toISOString();
}

function getRepoRootFromRuntime(): string {
  const currentDir = path.dirname(fileURLToPath(import.meta.url));
  return path.resolve(currentDir, "..", "..", "..");
}

export class StateStore implements ArtifactStore {
  private db: any;
  private dbPath: string;

  private constructor(db: any, dbPath: string) {
    this.db = db;
    this.dbPath = dbPath;
  }

  static async create(orchestratorRoot: string): Promise<StateStore> {
    const repoRoot = getRepoRootFromRuntime();
    const sqlModulePath = path.join(repoRoot, "node_modules", "sql.js", "dist");
    const initSqlJs = (await import("sql.js")).default as SqlJsStatic;
    const SQL = await initSqlJs({
      locateFile: (file) => path.join(sqlModulePath, file)
    });

    const configuredPath =
      process.env.ORCHESTRATOR_DB_PATH ||
      path.join(orchestratorRoot, ".orchestrator", "state.sqlite");

    await mkdir(path.dirname(configuredPath), { recursive: true });

    let db: any;
    try {
      const existing = await readFile(configuredPath);
      db = new SQL.Database(existing);
    } catch {
      db = new SQL.Database();
    }

    const store = new StateStore(db, configuredPath);
    store.initializeSchema();
    store.persist();
    return store;
  }

  private initializeSchema(): void {
    this.db.run(`
      CREATE TABLE IF NOT EXISTS runs (
        id TEXT PRIMARY KEY,
        jira_key TEXT NOT NULL,
        state TEXT NOT NULL,
        risk_level TEXT NOT NULL,
        branch TEXT,
        worktree_path TEXT,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS artifacts (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        run_id TEXT NOT NULL,
        type TEXT NOT NULL,
        path TEXT NOT NULL,
        valid_json INTEGER NOT NULL,
        created_at TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS events (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        run_id TEXT NOT NULL,
        from_state TEXT,
        to_state TEXT NOT NULL,
        reason TEXT NOT NULL,
        created_at TEXT NOT NULL
      );
    `);
  }

  private persist(): void {
    const data = this.db.export();
    void writeFile(this.dbPath, Buffer.from(data));
  }

  createRun(jiraKey: string, riskLevel: RiskLevel = "medium"): RunRecord {
    const id = randomUUID();
    const now = timestamp();
    this.db.run(
      `INSERT INTO runs (id, jira_key, state, risk_level, branch, worktree_path, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [id, jiraKey, "NEW", riskLevel, null, null, now, now]
    );
    this.db.run(
      `INSERT INTO events (run_id, from_state, to_state, reason, created_at)
       VALUES (?, ?, ?, ?, ?)`,
      [id, null, "NEW", "Run created", now]
    );
    this.persist();
    return this.getRun(id)!;
  }

  getRun(runId: string): RunRecord | null {
    const statement = this.db.prepare(
      `SELECT id, jira_key, state, risk_level, branch, worktree_path, created_at, updated_at
       FROM runs WHERE id = ?`
    );
    statement.bind([runId]);
    if (!statement.step()) {
      statement.free();
      return null;
    }
    const row = statement.getAsObject();
    statement.free();
    return this.mapRun(row);
  }

  findLatestRunByJiraKey(jiraKey: string): RunRecord | null {
    const statement = this.db.prepare(
      `SELECT id, jira_key, state, risk_level, branch, worktree_path, created_at, updated_at
       FROM runs WHERE jira_key = ?
       ORDER BY created_at DESC LIMIT 1`
    );
    statement.bind([jiraKey]);
    if (!statement.step()) {
      statement.free();
      return null;
    }
    const row = statement.getAsObject();
    statement.free();
    return this.mapRun(row);
  }

  updateRunMetadata(runId: string, metadata: Partial<Pick<RunRecord, "riskLevel" | "branch" | "worktreePath">>): RunRecord {
    const current = this.getRun(runId);
    if (!current) {
      throw new Error(`Unknown run ${runId}`);
    }

    const next = {
      ...current,
      ...metadata,
      updatedAt: timestamp()
    };

    this.db.run(
      `UPDATE runs
       SET risk_level = ?, branch = ?, worktree_path = ?, updated_at = ?
       WHERE id = ?`,
      [next.riskLevel, next.branch, next.worktreePath, next.updatedAt, runId]
    );
    this.persist();
    return this.getRun(runId)!;
  }

  transitionRun(runId: string, fromState: RunState | null, toState: RunState, reason: string): RunRecord {
    const current = this.getRun(runId);
    if (!current) {
      throw new Error(`Unknown run ${runId}`);
    }

    const now = timestamp();
    this.db.run(
      `UPDATE runs SET state = ?, updated_at = ? WHERE id = ?`,
      [toState, now, runId]
    );
    this.db.run(
      `INSERT INTO events (run_id, from_state, to_state, reason, created_at)
       VALUES (?, ?, ?, ?, ?)`,
      [runId, fromState, toState, reason, now]
    );
    this.persist();
    return this.getRun(runId)!;
  }

  listArtifacts(runId: string): ArtifactRecord[] {
    const statement = this.db.prepare(
      `SELECT id, run_id, type, path, valid_json, created_at
       FROM artifacts WHERE run_id = ? ORDER BY id ASC`
    );
    statement.bind([runId]);
    const rows: ArtifactRecord[] = [];
    while (statement.step()) {
      const row = statement.getAsObject();
      rows.push({
        id: Number(row.id),
        runId: String(row.run_id),
        type: String(row.type),
        path: String(row.path),
        validJson: Number(row.valid_json),
        createdAt: String(row.created_at)
      });
    }
    statement.free();
    return rows;
  }

  listEvents(runId: string): EventRecord[] {
    const statement = this.db.prepare(
      `SELECT id, run_id, from_state, to_state, reason, created_at
       FROM events WHERE run_id = ? ORDER BY id ASC`
    );
    statement.bind([runId]);
    const rows: EventRecord[] = [];
    while (statement.step()) {
      const row = statement.getAsObject();
      rows.push({
        id: Number(row.id),
        runId: String(row.run_id),
        fromState: row.from_state ? (String(row.from_state) as RunState) : null,
        toState: String(row.to_state) as RunState,
        reason: String(row.reason),
        createdAt: String(row.created_at)
      });
    }
    statement.free();
    return rows;
  }

  recordArtifact(runId: string, type: string, targetPath: string, validJson: boolean): void {
    this.db.run(
      `INSERT INTO artifacts (run_id, type, path, valid_json, created_at)
       VALUES (?, ?, ?, ?, ?)`,
      [runId, type, targetPath, validJson ? 1 : 0, timestamp()]
    );
    this.persist();
  }

  private mapRun(row: Record<string, unknown>): RunRecord {
    return {
      id: String(row.id),
      jiraKey: String(row.jira_key),
      state: String(row.state) as RunState,
      riskLevel: String(row.risk_level) as RiskLevel,
      branch: row.branch ? String(row.branch) : null,
      worktreePath: row.worktree_path ? String(row.worktree_path) : null,
      createdAt: String(row.created_at),
      updatedAt: String(row.updated_at)
    };
  }
}
