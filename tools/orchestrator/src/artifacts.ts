import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { ArtifactStore } from "./state.js";

export class ArtifactManager {
  constructor(
    private readonly repoRoot: string,
    private readonly store: ArtifactStore
  ) {}

  async ensureTaskDirectory(jiraKey: string): Promise<string> {
    const taskDir = path.join(this.repoRoot, ".task", jiraKey);
    await mkdir(taskDir, { recursive: true });
    return taskDir;
  }

  async writeJson(
    runId: string,
    jiraKey: string,
    fileName: string,
    payload: unknown
  ): Promise<string> {
    const taskDir = await this.ensureTaskDirectory(jiraKey);
    const target = path.join(taskDir, fileName);
    await writeFile(target, `${JSON.stringify(payload, null, 2)}\n`, "utf8");
    this.store.recordArtifact(runId, fileName, target, true);
    return target;
  }

  async writeMarkdown(
    runId: string,
    jiraKey: string,
    fileName: string,
    content: string
  ): Promise<string> {
    const taskDir = await this.ensureTaskDirectory(jiraKey);
    const target = path.join(taskDir, fileName);
    await writeFile(target, `${content.trimEnd()}\n`, "utf8");
    this.store.recordArtifact(runId, fileName, target, false);
    return target;
  }
}
