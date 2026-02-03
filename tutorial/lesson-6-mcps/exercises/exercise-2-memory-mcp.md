# Exercise 2: Persistent Memory with MCP

## Goal

Set up the Memory MCP to give Claude persistent memory across sessions.

## Why This Matters

Normally, Claude forgets everything when you end a session. The Memory MCP
lets Claude store and recall information across sessions — like project
decisions, learned patterns, and notes.

For an RMF project, this means Claude can remember:
- Which controls you've already assessed
- Decisions made in previous sessions
- Patterns specific to your system
- Status of POA&M items you've discussed

## Step 1: Set Up Memory MCP

```bash
claude mcp add --transport stdio memory -- \
  npx -y @anthropic/mcp-memory
```

## Step 2: Use It

Start Claude Code and try:

```
"Remember that our system is authorized at FISMA Moderate impact level
and our authorization boundary includes 3 web servers, 2 app servers,
and 1 database server."
```

```
"Remember that AC-2 was assessed as 'Other Than Satisfied' because we
don't have automated account disabling after 90 days of inactivity."
```

## Step 3: Start a New Session

End the session and start a new one:

```
"What do you remember about our system's authorization level?"
```

```
"What was the status of AC-2?"
```

If the Memory MCP is working, Claude should recall this information.

## Step 4: View Stored Memories

```
"Show me all stored memories"
```

## Verification

- [ ] Memories persist across sessions
- [ ] Claude can recall specific details
- [ ] You can list all stored memories
- [ ] Memories are relevant and accurately recalled

## Tips for Effective Memory Use

- Store **decisions**, not conversations
- Store **status updates** for ongoing work
- Store **patterns** you want Claude to follow
- Periodically ask Claude to clean up outdated memories
