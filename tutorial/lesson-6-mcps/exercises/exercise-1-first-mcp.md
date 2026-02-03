# Exercise 1: Set Up Your First MCP

## Goal

Set up the Filesystem MCP server to give Claude controlled access to
specific directories.

## Why Start Here?

The Filesystem MCP is a safe, local MCP that doesn't need any external
services or API keys. It runs on your machine.

## Step 1: Install the MCP

```bash
claude mcp add --transport stdio filesystem -- \
  npx -y @anthropic/mcp-filesystem /home/user/projects
```

This gives Claude access to read and write files under `/home/user/projects`.

## Step 2: Verify It's Configured

```bash
claude mcp list
```

You should see `filesystem` in the list.

## Step 3: Use It in Claude Code

Start Claude Code and try:

```
"Using the filesystem MCP, list all Python files in the projects directory"
```

```
"Read the contents of the README in my projects folder"
```

## Step 4: Check Status

Inside Claude Code:

```
/mcp
```

This shows all configured MCPs and their status.

## Verification

- [ ] MCP appears in `claude mcp list`
- [ ] `/mcp` inside Claude Code shows it as connected
- [ ] Claude can access files through the MCP
- [ ] Access is limited to the specified directory

## Cleanup

To remove the MCP:
```bash
claude mcp remove filesystem
```
