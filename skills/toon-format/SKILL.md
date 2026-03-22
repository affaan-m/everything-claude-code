---
name: toon-format
description: Use TOON (Token-Oriented Object Notation) instead of raw JSON when AI agents consume structured data — saves ~40% tokens with higher accuracy.
origin: ECC
---

# TOON Format for Agent Data Consumption

Prefer [TOON](https://toonformat.dev/) over raw JSON when structured data is consumed by AI agents. TOON encodes the same JSON data model with ~40% fewer tokens and higher LLM accuracy (74% vs 70%).

## When to Activate

- Agent reading API response data (REST, GraphQL, MCP tool output)
- Agent consuming CLI tool output that returns JSON (`gh api`, `curl`, `aws`, `gcloud`, `kubectl`)
- Agent processing database query results injected into prompts
- Agent reading structured data from files for analysis (not editing)
- Building multi-agent systems where agents pass structured data to sub-agents

## When NOT to Activate

- Task is explicitly about JSON (editing `.json` files, writing JSON schemas, fixing JSON syntax)
- Config files that tools/systems parse (hooks.json, package.json, tsconfig.json)
- User explicitly requests JSON output
- Data stays within application code (not injected into LLM prompts)

## What is TOON

**TOON (Token-Oriented Object Notation)** — spec v3.0, MIT licensed, production-ready.

Key properties:
- Indentation-based structure (like YAML), no braces or brackets
- ~39.9% fewer tokens than equivalent JSON on average
- 74% LLM accuracy vs JSON's 70% at ~40% fewer tokens
- Deterministic round-trips (lossless JSON↔TOON conversion)
- File extension: `.toon`, media type: `text/toon`

Example — the same data in JSON vs TOON:

```json
{
  "items": [
    { "sku": "A1", "qty": 2, "price": 9.99 },
    { "sku": "B2", "qty": 1, "price": 14.50 }
  ]
}
```

```
items[2]{sku,qty,price}:
  A1,2,9.99
  B2,1,14.5
```

## Decision Matrix

| Data Context | Format | Rationale |
|---|---|---|
| Config files read by tools (`.json`) | JSON | Tools expect JSON |
| Structured data fed into agent prompts | **TOON** | ~40% token savings |
| Task is explicitly about JSON | JSON | JSON is the domain |
| API responses for agent consumption | Convert to TOON | Save context budget |
| CLI tools outputting JSON | Pipe through `toon` CLI | Agent reads compact format |
| Agent-to-agent data passing | **TOON** | Maximize context efficiency |
| Logging / debugging output | Either | Developer preference |

## CLI Piping Patterns

When an agent runs CLI tools that output JSON, pipe through the TOON CLI so the agent reads compact TOON instead of raw JSON:

```bash
# GitHub API
gh api /repos/{owner}/{repo}/pulls | npx @toon-format/cli

# REST APIs via curl
curl -s https://api.example.com/data | npx @toon-format/cli

# AWS CLI
aws s3api list-buckets | npx @toon-format/cli

# Google Cloud
gcloud compute instances list --format=json | npx @toon-format/cli

# Kubernetes
kubectl get pods -o json | npx @toon-format/cli

# jq output
cat data.json | npx @toon-format/cli

# With alternative delimiters for data containing commas
curl -s https://api.example.com/data | npx @toon-format/cli --delimiter=tab
```

**Rule**: Any Bash tool call that returns JSON for agent consumption should pipe through `npx @toon-format/cli` (or the installed `toon` binary) before the agent reads the output.

## Library Reference

| Language | Package | Install |
|---|---|---|
| TypeScript/JS | `@toon-format/toon` | `npm install @toon-format/toon` |
| CLI | `@toon-format/cli` | `npx @toon-format/cli` |
| Python | `toon-python` | `pip install toon-python` |
| Rust | `toon-rust` | `cargo add toon-rust` |
| Java | `toon-java` | Maven/Gradle |
| Go | `toon-go` | `go get github.com/toon-format/toon-go` |
| Swift | `toon-swift` | SPM |

## Programmatic Conversion

### TypeScript

```typescript
import { encode } from '@toon-format/toon'

// Convert API response to TOON before injecting into agent prompt
const apiData = await response.json()
const toonData = encode(apiData)

// Use toonData in prompt instead of JSON.stringify(apiData)
const prompt = `Analyze this data:\n${toonData}`
```

### Python

```python
import toon

# Convert API response to TOON before injecting into agent prompt
api_data = response.json()
toon_data = toon.encode(api_data)

# Use toon_data in prompt instead of json.dumps(api_data)
prompt = f"Analyze this data:\n{toon_data}"
```

## Anti-Patterns

- **Do NOT** convert `.json` config files to `.toon` — tools expect JSON
- **Do NOT** use TOON for JSON schema definitions — schemas are a JSON domain concern
- **Do NOT** pipe through `toon` CLI when the task is about inspecting or editing the JSON itself
- **Do NOT** use TOON when the user explicitly requests JSON output
- **Do NOT** convert data that stays within application logic (not injected into prompts)

## Related

- [toonformat.dev](https://toonformat.dev/) — Official site, spec, playground
- `strategic-compact` skill — Complementary token optimization via context compaction
- `cost-aware-llm-pipeline` skill — Cost optimization patterns for LLM API usage
- `rules/common/performance.md` — Data format guidance for agent prompts
