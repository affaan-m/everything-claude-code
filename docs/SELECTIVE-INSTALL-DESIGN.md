# ECC Selective Install Design

## Purpose

This document defines the user-facing selective-install design for ECC.

It complements
`docs/SELECTIVE-INSTALL-ARCHITECTURE.md`, which focuses on internal runtime
architecture and code boundaries.

This document answers the product and operator questions first:

- how users choose ECC components
- what the CLI should feel like
- what config file should exist
- how installation should behave across harness targets
- how the design maps onto the current ECC codebase without requiring a rewrite

## Problem

Today ECC still feels like a large payload installer even though the repo now
has first-pass manifest and lifecycle support.

Users need a simpler mental model:

- install the baseline
- add the language packs they actually use
- add the framework configs they actually want
- add optional capability packs like security, research, or orchestration

The selective-install system should make ECC feel composable instead of
all-or-nothing.

In the current substrate, user-facing components are still an alias layer over
coarser internal install modules. That means include/exclude is already useful
at the module-selection level, but some file-level boundaries remain imperfect
until the underlying module graph is split more finely.

## Goals

1. Let users install a small default ECC footprint quickly.
2. Let users compose installs from reusable component families:
   - core rules
   - language packs
   - framework packs
   - capability packs
   - target/platform configs
3. Keep one consistent UX across Claude, Cursor, Antigravity, Codex, and
   OpenCode.
4. Keep installs inspectable, repairable, and uninstallable.
5. Preserve backward compatibility with the current `ecc-install typescript`
   style during rollout.

## Non-Goals

- packaging ECC into multiple npm packages in the first phase
- building a remote marketplace
- full control-plane UI in the same phase
- solving every skill-classification problem before selective install ships

## User Experience Principles

### 1. Start Small

A user should be able to get a useful ECC install with one command:

```bash
ecc install --target claude --profile core
```

The default experience should not assume the user wants every skill family and
every framework.

### 2. Build Up By Intent

The user should think in terms of:

- "I want the developer baseline"
- "I need TypeScript and Python"
- "I want Next.js and Django"
- "I want the security pack"

The user should not have to know raw internal repo paths.

### 3. Preview Before Mutation

Every install path should support dry-run planning:

```bash
ecc install --target cursor --profile developer --with lang:typescript --with framework:nextjs --dry-run
```

The plan should clearly show:

- selected components
- skipped components
- target root
- managed paths
- expected install-state location

### 4. Local Configuration Should Be First-Class

Teams should be able to commit a project-level install config and use:

```bash
ecc install --config ecc-install.json
```

That allows deterministic installs across contributors and CI.

## Component Model

The current manifest already uses install modules and profiles. The user-facing
design should keep that internal structure, but present it as four main
component families.

Near-term implementation note: some user-facing component IDs still resolve to
shared internal modules, especially in the language/framework layer. The
catalog improves UX immediately while preserving a clean path toward finer
module granularity in later phases.

### 1. Baseline

These are the default ECC building blocks:

- core rules
- baseline agents
- core commands
- runtime hooks
- platform configs
- workflow quality primitives

Examples of current internal modules:

- `rules-core`
- `agents-core`
- `commands-core`
- `hooks-runtime`
- `platform-configs`
- `workflow-quality`

### 2. Language Packs

Language packs group rules, guidance, and workflows for a language ecosystem.

Examples:

- `lang:typescript`
- `lang:python`
- `lang:go`
- `lang:java`
- `lang:rust`

Each language pack should resolve to one or more internal modules plus
target-specific assets.

### 3. Framework Packs

Framework packs sit above language packs and pull in framework-specific rules,
skills, and optional setup.

Examples:

- `framework:react`
- `framework:nextjs`
- `framework:django`
- `framework:springboot`
- `framework:laravel`

Framework packs should depend on the correct language pack or baseline
primitives where appropriate.

### 4. Capability Packs

Capability packs are cross-cutting ECC feature bundles.

Examples:

- `capability:security`
- `capability:research`
- `capability:orchestration`
- `capability:media`
- `capability:content`

These should map onto the current module families already being introduced in
the manifests.

## Profiles

Profiles remain the fastest on-ramp.

Recommended user-facing profiles:

- `core`
  minimal baseline, safe default for most users trying ECC
- `developer`
  best default for active software engineering work
- `security`
  baseline plus security-heavy guidance
- `research`
  baseline plus research/content/investigation tools
- `full`
  everything classified and currently supported

Profiles should be composable with additional `--with` and `--without` flags.

Example:

```bash
ecc install --target claude --profile developer --with lang:typescript --with framework:nextjs --without capability:orchestration
```

## Proposed CLI Design

### Primary Commands

```bash
ecc install
ecc plan
ecc list-installed
ecc doctor
ecc repair
ecc uninstall
ecc catalog
```

### Install CLI

Recommended shape:

```bash
ecc install [--target <target>] [--profile <name>] [--with <component>]... [--without <component>]... [--config <path>] [--dry-run] [--json]
```

Examples:

```bash
ecc install --target claude --profile core
ecc install --target cursor --profile developer --with lang:typescript --with framework:nextjs
ecc install --target antigravity --with capability:security --with lang:python
ecc install --config ecc-install.json
```

### Plan CLI

Recommended shape:

```bash
ecc plan [same selection flags as install]
```

Purpose:

- produce a preview without mutation
- act as the canonical debugging surface for selective install

### Catalog CLI

Recommended shape:

```bash
ecc catalog profiles
ecc catalog components
ecc catalog components --family language
ecc catalog show framework:nextjs
```

Purpose:

- let users discover valid component names without reading docs
- keep config authoring approachable

### Compatibility CLI

These legacy flows should still work during migration:

```bash
ecc-install typescript
ecc-install --target cursor typescript
ecc typescript
```

Internally these should normalize into the new request model and write
install-state the same way as modern installs.

## Proposed Config File

### Filename

Recommended default:

- `ecc-install.json`

Optional future support:

- `.ecc/install.json`

### Config Shape

```json
{
  "$schema": "./schemas/ecc-install-config.schema.json",
  "version": 1,
  "target": "cursor",
  "profile": "developer",
  "include": [
    "lang:typescript",
    "lang:python",
    "framework:nextjs",
    "capability:security"
  ],
  "exclude": [
    "capability:media"
  ],
  "options": {
    "hooksProfile": "standard",
    "mcpCatalog": "baseline",
    "includeExamples": false
  }
}
```

### Field Semantics

- `target`
  selected harness target such as `claude`, `cursor`, or `antigravity`
- `profile`
  baseline profile to start from
- `include`
  additional components to add
- `exclude`
  components to subtract from the profile result
- `options`
  target/runtime tuning flags that do not change component identity

### Precedence Rules

1. CLI arguments override config file values.
2. config file overrides profile defaults.
3. profile defaults override internal module defaults.

This keeps the behavior predictable and easy to explain.

## Modular Installation Flow

The user-facing flow should be:

1. load config file if provided or auto-detected
2. merge CLI intent on top of config intent
3. normalize the request into a canonical selection
4. expand profile into baseline components
5. add `include` components
6. subtract `exclude` components
7. resolve dependencies and target compatibility
8. render a plan
9. apply operations if not in dry-run mode
10. write install-state

The important UX property is that the exact same flow powers:

- `install`
- `plan`
- `repair`
- `uninstall`

The commands differ in action, not in how ECC understands the selected install.

## Target Behavior

Selective install should preserve the same conceptual component graph across all
targets, while letting target adapters decide how content lands.

### Claude

Best fit for:

- home-scoped ECC baseline
- commands, agents, rules, hooks, platform config, orchestration

### Cursor

Best fit for:

- project-scoped installs
- rules plus project-local automation and config

### Antigravity

Best fit for:

- project-scoped agent/rule/workflow installs

### Codex / OpenCode

Should remain additive targets rather than special forks of the installer.

The selective-install design should make these just new adapters plus new
target-specific mapping rules, not new installer architectures.

## Technical Feasibility

This design is feasible because the repo already has:

- install module and profile manifests
- target adapters with install-state paths
- plan inspection
- install-state recording
- lifecycle commands
- a unified `ecc` CLI surface

The missing work is not conceptual invention. The missing work is productizing
the current substrate into a cleaner user-facing component model.

### Feasible In Phase 1

- profile + include/exclude selection
- `ecc-install.json` config file parsing
- catalog/discovery command
- alias mapping from user-facing component IDs to internal module sets
- dry-run and JSON planning

### Feasible In Phase 2

- richer target adapter semantics
- merge-aware operations for config-like assets
- stronger repair/uninstall behavior for non-copy operations

### Later

- reduced publish surface
- generated slim bundles
- remote component fetch

## Mapping To Current ECC Manifests

The current manifests do not yet expose a true user-facing `lang:*` /
`framework:*` / `capability:*` taxonomy. That should be introduced as a
presentation layer on top of the existing modules, not as a second installer
engine.

Recommended approach:

- keep `install-modules.json` as the internal resolution catalog
- add a user-facing component catalog that maps friendly component IDs to one or
  more internal modules
- let profiles reference either internal modules or user-facing component IDs
  during the migration window

That avoids breaking the current selective-install substrate while improving UX.

## Suggested Rollout

### Phase 1: Design And Discovery

- finalize the user-facing component taxonomy
- add the config schema
- add CLI design and precedence rules

### Phase 2: User-Facing Resolution Layer

- implement component aliases
- implement config-file parsing
- implement `include` / `exclude`
- implement `catalog`

### Phase 3: Stronger Target Semantics

- move more logic into target-owned planning
- support merge/generate operations cleanly
- improve repair/uninstall fidelity

### Phase 4: Packaging Optimization

- narrow published surface
- evaluate generated bundles

## Recommendation

The next implementation move should not be "rewrite the installer."

It should be:

1. keep the current manifest/runtime substrate
2. add a user-facing component catalog and config file
3. add `include` / `exclude` selection and catalog discovery
4. let the existing planner and lifecycle stack consume that model

That is the shortest path from the current ECC codebase to a real selective
install experience that feels like ECC 2.0 instead of a large legacy installer.
