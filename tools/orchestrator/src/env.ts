import { existsSync, readFileSync } from "node:fs";
import path from "node:path";

type EnvMap = Record<string, string>;

function parseEnvFile(contents: string): EnvMap {
  const values: EnvMap = {};

  for (const rawLine of contents.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith("#")) {
      continue;
    }

    const exportLine = line.startsWith("export ") ? line.slice(7).trim() : line;
    const separator = exportLine.indexOf("=");
    if (separator <= 0) {
      continue;
    }

    const key = exportLine.slice(0, separator).trim();
    let value = exportLine.slice(separator + 1).trim();

    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }

    values[key] = value;
  }

  return values;
}

export function loadOrchestratorEnv(repoRoot: string): void {
  const candidates = [
    process.env.ORCHESTRATOR_ENV_FILE,
    "/etc/orchestrator.env",
    process.env.HOME ? path.join(process.env.HOME, ".orchestrator.env") : undefined,
    path.join(repoRoot, "tools", "orchestrator", ".env.local")
  ].filter(Boolean) as string[];

  for (const filePath of candidates) {
    if (!existsSync(filePath)) {
      continue;
    }

    let parsed: EnvMap;
    try {
      parsed = parseEnvFile(readFileSync(filePath, "utf8"));
    } catch {
      continue;
    }

    for (const [key, value] of Object.entries(parsed)) {
      if (!process.env[key]) {
        process.env[key] = value;
      }
    }
  }
}

export function getEnvValue(...names: string[]): string | undefined {
  for (const name of names) {
    const value = process.env[name];
    if (value && value.trim()) {
      return value.trim();
    }
  }

  return undefined;
}
