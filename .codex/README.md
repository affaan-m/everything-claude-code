# Everything Claude Code - Codex Support

Direct support for Codex CLI and the Codex macOS app.

## Quick Start

```bash
npm install ecc-universal
npx ecc-install --target codex typescript
```

For multiple stacks:

```bash
npx ecc-install --target codex typescript python golang
```

## What `--target codex` Installs

- `AGENTS.md` in project root (when not already present)
- `.codex/AGENTS.ecc.md` fallback if your project already has a custom `AGENTS.md`
- `.codex/rules/common/*` plus requested language rules
- `.codex/mcp-servers.json` copied from `mcp-configs/mcp-servers.json`

## Notes

- Existing `AGENTS.md` is preserved unless it was previously installed by ECC.
- The same `AGENTS.md` works in both Codex CLI and Codex app workspaces.
