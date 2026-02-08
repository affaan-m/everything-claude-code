# MCP Packages Directory

This directory should contain the following pinned .tgz tarballs and the
pre-seeded npm cache archive for offline MCP server installation.

## Required Packages

1. **@modelcontextprotocol/server-filesystem**
   - Tarball pattern: `modelcontextprotocol-server-filesystem-*.tgz`
   - Example: `modelcontextprotocol-server-filesystem-0.5.1.tgz`

2. **@modelcontextprotocol/server-memory**
   - Tarball pattern: `modelcontextprotocol-server-memory-*.tgz`
   - Example: `modelcontextprotocol-server-memory-0.5.1.tgz`

## Required npm Cache Archive

3. **npm-cache.zip** — Pre-seeded npm cache containing all transitive
   dependencies so that `npm install --offline` succeeds without network access.

## How to Obtain .tgz Files

You can create these tarballs from npm packages using:

```bash
npm pack @modelcontextprotocol/server-filesystem
npm pack @modelcontextprotocol/server-memory
```

Then move the generated `.tgz` files to this directory.

## How to Create npm-cache.zip

On an **online** machine, seed a local npm cache with all transitive
dependencies, then zip it:

```powershell
npm cache clean --force
npm install @modelcontextprotocol/server-filesystem @modelcontextprotocol/server-memory --cache ./npm-cache
Compress-Archive -Path ./npm-cache/* -DestinationPath npm-cache.zip
```

Place `npm-cache.zip` into this directory (`scripts/mcp_packages/`).

## Directory Structure

```
scripts/
└── mcp_packages/
    ├── README.md (this file)
    ├── npm-cache.zip
    ├── modelcontextprotocol-server-filesystem-0.5.1.tgz
    └── modelcontextprotocol-server-memory-0.5.1.tgz
```

## Notes

- The `Rebuild-ClaudeStack.ps1` script requires EXACTLY ONE matching tarball
  for each package. If zero or more than one match is found, the script fails
  fast with a clear error.
- The script requires `npm-cache.zip` to be present; it is extracted into
  `<StackRoot>/mcp/.npm-cache` before running `npm install --offline`.
- Package tarball names follow npm's naming convention: scoped `@org/pkg`
  becomes `org-pkg-<version>.tgz`.
