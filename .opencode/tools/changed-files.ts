import { tool } from "@opencode-ai/plugin/tool"
import {
  buildTree,
  getChangedPaths,
  hasChanges,
  type ChangeType,
  type TreeNode,
} from "../plugins/lib/changed-files-store.js"

const INDICATORS: Record<ChangeType, string> = {
  added: "+",
  modified: "~",
  deleted: "-",
}

function renderTree(nodes: TreeNode[], indent: string): string {
  const lines: string[] = []
  for (const node of nodes) {
    const indicator = node.changeType ? ` (${INDICATORS[node.changeType]})` : ""
    const name = node.changeType ? `${node.name}${indicator}` : `${node.name}/`
    lines.push(`${indent}${name}`)
    if (node.children.length > 0) {
      lines.push(renderTree(node.children, `${indent}  `))
    }
  }
  return lines.join("\n")
}

export default tool({
  description:
    "List files changed by agents in this session as a navigable tree. Shows added (+), modified (~), and deleted (-) indicators. Use filter to show only specific change types. Returns paths for git diff.",
  args: {
    filter: tool.schema
      .enum(["all", "added", "modified", "deleted"])
      .optional()
      .describe("Filter by change type (default: all)"),
    format: tool.schema
      .enum(["tree", "json"])
      .optional()
      .describe("Output format: tree for terminal display, json for structured data (default: tree)"),
  },
  async execute(args, context) {
    const filter = args.filter === "all" || !args.filter ? undefined : (args.filter as ChangeType)
    const format = args.format ?? "tree"

    if (!hasChanges()) {
      return JSON.stringify({ changed: false, message: "No files changed in this session" })
    }

    const paths = getChangedPaths(filter)

    if (format === "json") {
      return JSON.stringify(
        {
          changed: true,
          filter: filter ?? "all",
          files: paths.map((p) => ({ path: p.path, changeType: p.changeType })),
          diffCommands: paths
            .filter((p) => p.changeType !== "added")
            .map((p) => `git diff ${p.path}`),
        },
        null,
        2
      )
    }

    const tree = buildTree(filter)
    const treeStr = renderTree(tree, "")
    const diffHint = paths
      .filter((p) => p.changeType !== "added")
      .slice(0, 5)
      .map((p) => `  git diff ${p.path}`)
      .join("\n")

    let output = `Changed files (${paths.length}):\n\n${treeStr}`
    if (diffHint) {
      output += `\n\nTo view diff for a file:\n${diffHint}`
    }
    return output
  },
})
