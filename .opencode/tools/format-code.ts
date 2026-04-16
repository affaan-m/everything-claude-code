/**
 * ECC Custom Tool: Format Code
 *
 * Returns the formatter command that should be run for a given file.
 * This avoids shell execution assumptions while still giving precise guidance.
 */

import { tool, type ToolDefinition } from "@opencode-ai/plugin/tool"
import * as path from "path"
import * as fs from "fs"

type Formatter = "biome" | "prettier" | "black" | "gofmt" | "rustfmt"

const formatCodeTool: ToolDefinition = tool({
  description:
    "Detect formatter for a file and return the exact command to run (Biome, Prettier, Black, gofmt, rustfmt).",
  args: {
    filePath: tool.schema.string().describe("Path to the file to format"),
    formatter: tool.schema
      .enum(["biome", "prettier", "black", "gofmt", "rustfmt"])
      .optional()
      .describe("Optional formatter override"),
  },
  async execute(args, context) {
    const cwd = context.worktree || context.directory
    const ext = args.filePath.split(".").pop()?.toLowerCase() || ""
    const detected = args.formatter || detectFormatter(cwd, ext)

    if (!detected) {
      return JSON.stringify({
        success: false,
        message: `No formatter detected for .${ext} files`,
      })
    }

    const command = buildFormatterCommand(detected, args.filePath)
    return JSON.stringify({
      success: true,
      formatter: detected,
      command,
      instructions: `Run this command:\n\n${command}`,
    })
  },
})

export default formatCodeTool

function detectFormatter(cwd: string, ext: string): Formatter | null {
  if (["ts", "tsx", "js", "jsx", "json", "css", "scss", "md", "yaml", "yml"].includes(ext)) {
    if (fs.existsSync(path.join(cwd, "biome.json")) || fs.existsSync(path.join(cwd, "biome.jsonc"))) {
      return "biome"
    }
    return "prettier"
  }
  if (["py", "pyi"].includes(ext)) return "black"
  if (ext === "go") return "gofmt"
  if (ext === "rs") return "rustfmt"
  return null
}

function buildFormatterCommand(formatter: Formatter, filePath: string): string {
  const commands: Record<Formatter, string> = {
    biome: `npx @biomejs/biome format --write ${filePath}`,
    prettier: `npx prettier --write ${filePath}`,
    black: `black ${filePath}`,
    gofmt: `gofmt -w ${filePath}`,
    rustfmt: `rustfmt ${filePath}`,
  }
  return commands[formatter]
}
