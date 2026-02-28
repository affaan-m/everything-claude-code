/**
 * ECC Custom Tool: Format Code
 *
 * Language-aware code formatter that auto-detects the project's formatter.
 * Supports: Biome/Prettier (JS/TS), Black (Python), gofmt (Go), rustfmt (Rust)
 */

import { tool } from "@opencode-ai/plugin"
import { z } from "zod"

export default tool({
  name: "format-code",
  description: "Format a file using the project's configured formatter. Auto-detects Biome, Prettier, Black, gofmt, or rustfmt.",
  parameters: z.object({
    filePath: z.string().describe("Path to the file to format"),
    formatter: z.string().optional().describe("Override formatter: biome, prettier, black, gofmt, rustfmt (default: auto-detect)"),
  }),
  execute: async ({ filePath, formatter }, { $ }) => {
    const ext = filePath.split(".").pop()?.toLowerCase() || ""

    // Auto-detect formatter based on file extension and config files
    let detected = formatter
    if (!detected) {
      if (["ts", "tsx", "js", "jsx", "json", "css", "scss"].includes(ext)) {
        // Check for Biome first, then Prettier
        try {
          await $`test -f biome.json || test -f biome.jsonc`
          detected = "biome"
        } catch {
          detected = "prettier"
        }
      } else if (["py", "pyi"].includes(ext)) {
        detected = "black"
      } else if (ext === "go") {
        detected = "gofmt"
      } else if (ext === "rs") {
        detected = "rustfmt"
      }
    }

    if (!detected) {
      return { formatted: false, message: `No formatter detected for .${ext} files` }
    }

    const commands: Record<string, string> = {
      biome: `npx @biomejs/biome format --write ${filePath}`,
      prettier: `npx prettier --write ${filePath}`,
      black: `black ${filePath}`,
      gofmt: `gofmt -w ${filePath}`,
      rustfmt: `rustfmt ${filePath}`,
    }

    const cmd = commands[detected]
    if (!cmd) {
      return { formatted: false, message: `Unknown formatter: ${detected}` }
    }

    try {
      const result = await $`${cmd}`.text()
      return { formatted: true, formatter: detected, output: result }
    } catch (error: unknown) {
      const err = error as { stderr?: string }
      return { formatted: false, formatter: detected, error: err.stderr || "Format failed" }
    }
  },
})
