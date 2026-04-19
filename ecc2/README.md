# ECC 2.0 Alpha

`ecc2/` is the current Rust-based ECC 2.0 control-plane scaffold.

It is usable as an alpha for local experimentation, but it is **not** the finished ECC 2.0 product yet.

## What Exists Today

- terminal UI dashboard
- session store backed by SQLite
- session start / stop / resume flows
- background daemon mode
- observability and risk-scoring primitives
- worktree-aware session scaffolding
- basic multi-session state and output tracking

## What This Is For

ECC 2.0 is the layer above individual harness installs.

The goal is:

- manage many agent sessions from one surface
- keep session state, output, and risk visible
- add orchestration, worktree management, and review controls
- support Claude Code first without blocking future harness interoperability

## Current Status

This directory should be treated as:

- real code
- alpha quality
- valid to build and test locally
- not yet a public GA release

Open issue clusters for the broader roadmap live in the main repo issue tracker under the `ecc-2.0` label.

## Run It

From the repo root:

```bash
cd ecc2
cargo run
```

Useful commands:

```bash
# Launch the dashboard
cargo run -- dashboard

# Start a new session
cargo run -- start --task "audit the repo and propose fixes" --agent claude --worktree

# List sessions
cargo run -- sessions

# Inspect a session
cargo run -- status latest

# Stop a session
cargo run -- stop <session-id>

# Resume a failed/stopped session
cargo run -- resume <session-id>

# Run the daemon loop
cargo run -- daemon
```

## Validate

```bash
cd ecc2
cargo test
```

## What Is Still Missing

The alpha is missing the higher-level operator surface that defines ECC 2.0:

- richer multi-agent orchestration
- explicit agent-to-agent delegation and summaries
- visual worktree / diff review surface
- stronger external harness compatibility
- deeper memory and roadmap-aware planning layers
- release packaging and installer story

## Repo Rule

Do not market `ecc2/` as done just because the scaffold builds.

The right framing is:

- ECC 2.0 alpha exists
- it is usable for internal/operator testing
- it is not the complete release yet
