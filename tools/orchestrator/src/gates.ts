import { readFile } from "node:fs/promises";
import path from "node:path";
import type { GateReport, GateStepResult } from "./types.js";
import { runCommand } from "./shell.js";

interface PackageJsonShape {
  packageManager?: string;
  scripts?: Record<string, string>;
}

async function readPackageJson(repoRoot: string): Promise<PackageJsonShape> {
  const packageJsonPath = path.join(repoRoot, "package.json");
  const content = await readFile(packageJsonPath, "utf8");
  return JSON.parse(content) as PackageJsonShape;
}

function packageManagerCommand(packageJson: PackageJsonShape): string {
  if (packageJson.packageManager?.startsWith("yarn")) {
    return "yarn";
  }
  if (packageJson.packageManager?.startsWith("pnpm")) {
    return "pnpm";
  }
  if (packageJson.packageManager?.startsWith("bun")) {
    return "bun";
  }
  return "npm";
}

async function resolvePackageManagerBinary(repoRoot: string, preferred: string): Promise<string> {
  const check = await runCommand("bash", ["-lc", `command -v ${preferred}`], repoRoot);
  if (check.exitCode === 0) {
    return preferred;
  }

  return "npm";
}

function toAscii(text: string): string {
  return text.replace(/[^\x09\x0A\x0D\x20-\x7E]/g, (char) => {
    if (char === String.fromCodePoint(0x2716)) {
      return "X";
    }
    if (char === String.fromCodePoint(0x2713)) {
      return "v";
    }
    return "?";
  });
}

async function executeStep(command: string, args: string[], cwd: string, name: string): Promise<GateStepResult> {
  const result = await runCommand(command, args, cwd);
  return {
    name,
    command: [command, ...args].join(" "),
    status: result.exitCode === 0 ? "passed" : "failed",
    exitCode: result.exitCode,
    output: toAscii([result.stdout.trim(), result.stderr.trim()].filter(Boolean).join("\n"))
  };
}

export async function runQualityGates(repoRoot: string, orchestratorRoot: string): Promise<GateReport> {
  const packageJson = await readPackageJson(repoRoot);
  const manager = await resolvePackageManagerBinary(repoRoot, packageManagerCommand(packageJson));
  const steps: GateStepResult[] = [];

  steps.push(
    await executeStep("npm", ["run", "build", "--silent"], orchestratorRoot, "orchestrator-build")
  );

  const rootScripts = packageJson.scripts || {};
  for (const scriptName of ["lint", "test"]) {
    if (!rootScripts[scriptName]) {
      steps.push({
        name: `root-${scriptName}`,
        command: `${manager} ${scriptName}`,
        status: "skipped",
        exitCode: null,
        output: `Root script "${scriptName}" is not defined.`
      });
      continue;
    }

    const args =
      manager === "yarn"
        ? [scriptName]
        : manager === "pnpm"
          ? [scriptName]
          : manager === "bun"
            ? ["run", scriptName]
            : ["run", scriptName];

    steps.push(await executeStep(manager, args, repoRoot, `root-${scriptName}`));
  }

  return {
    status: steps.some((step) => step.status === "failed") ? "failed" : "passed",
    steps,
    generatedAt: new Date().toISOString()
  };
}

export function formatGateReport(report: GateReport): string {
  const lines = ["# Test Report", "", `Overall status: ${report.status}`, ""];
  for (const step of report.steps) {
    lines.push(`## ${step.name}`);
    lines.push(`- Status: ${step.status}`);
    lines.push(`- Command: \`${step.command}\``);
    if (step.exitCode !== null) {
      lines.push(`- Exit code: ${step.exitCode}`);
    }
    if (step.output) {
      lines.push("");
      lines.push("```text");
      lines.push(step.output);
      lines.push("```");
    }
    lines.push("");
  }
  return lines.join("\n").trimEnd();
}
