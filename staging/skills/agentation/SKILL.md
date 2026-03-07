---
name: agentation
description: Set up the Agentation annotation toolbar for click-to-annotate design feedback in a Next.js project. Use when the user wants to add visual annotations, design feedback tools, or the Agentation component to their app.
---

# Agentation Setup

Set up the Agentation annotation toolbar in this project.

## Steps

1. **Check if already installed**
   - Look for `agentation` in package.json dependencies
   - If not found, ask the user before installing: `npm install agentation` (or pnpm/yarn based on lockfile)

2. **Check if already configured**
   - Search for `<Agentation` or `import { Agentation }` in src/ or app/
   - If found, report that Agentation is already set up and exit

3. **Detect framework**
   - Next.js App Router: has `app/layout.tsx` or `app/layout.js`
   - Next.js Pages Router: has `pages/_app.tsx` or `pages/_app.js`

4. **Add the component**

   For Next.js App Router, add to the root layout:
   ```tsx
   import { Agentation } from "agentation";

   // Add inside the body, after children:
   {process.env.NODE_ENV === "development" && <Agentation />}
   ```

   For Next.js Pages Router, add to _app:
   ```tsx
   import { Agentation } from "agentation";

   // Add after Component:
   {process.env.NODE_ENV === "development" && <Agentation />}
   ```

5. **Confirm component setup**
   - Tell the user the Agentation toolbar component is configured

6. **Check if MCP server already configured**
   - Run `claude mcp list` to check if `agentation` MCP server is already registered
   - If yes, skip to final confirmation step

7. **Configure Claude Code MCP server**
   - Ask the user before registering the MCP server. This modifies Claude Code's configuration.
   - Run: `claude mcp add agentation -- npx agentation-mcp server`
   - This registers the MCP server with Claude Code

8. **Confirm full setup**
   - Tell the user both components are set up:
     - React component for the toolbar (`<Agentation />`)
     - MCP server configured to auto-start with Claude Code
   - Tell user to restart Claude Code to load the MCP server
   - Explain that annotations will now sync to Claude automatically

## Notes

- The `NODE_ENV` check ensures Agentation only loads in development
- Agentation requires React 18+. Check the package's peer dependencies for the latest compatibility.
- The MCP server auto-starts when Claude Code launches (uses npx, no global install needed)
- Port 4747 is used by default for the HTTP server
- Run `npx agentation-mcp doctor` to verify setup
