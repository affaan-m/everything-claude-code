---
name: agent-payment-x402
description: Add x402 payment execution to AI agents — per-task budgets, spending controls, and non-custodial wallets via MCP tools. Supports Base (agentwallet-sdk) and X Layer (OKX Payments x402 SDK). Use when agents need to pay for APIs, services, or other agents.
origin: community
---

# Agent Payment Execution (x402)

Enable AI agents to make autonomous payments with built-in spending controls. Uses the x402 HTTP payment protocol and MCP tools so agents can pay for external services, APIs, or other agents without custodial risk.

## When to Use

Use when: your agent needs to pay for an API call, purchase a service, settle with another agent, enforce per-task spending limits, or manage a non-custodial wallet. Pairs naturally with cost-aware-llm-pipeline and security-review skills.

## Decision Tree

```
Are you paying for a resource, or charging for one?
│
├─ BUYER (paying for 402-gated APIs)
│  │
│  ├─ Want TEE wallet (no local keys)?
│  │  └─ Option B → OnchainOS CLI + okx-x402-payment skill
│  │
│  └─ Want local wallet with spending controls?
│     └─ Option A → agentwallet-sdk (Base, multi-chain)
│
└─ SELLER (charging for your API)
   │
   ├─ TypeScript? → WebFetch https://raw.githubusercontent.com/okx/payments/main/typescript/SELLER.md  (Express, Hono, Fastify, Next.js)
   ├─ Go?         → WebFetch https://raw.githubusercontent.com/okx/payments/main/go/x402/SELLER.md     (Gin, Echo, net/http)
   ├─ Rust?       → WebFetch https://raw.githubusercontent.com/okx/payments/main/rust/x402/SELLER.md   (Axum)
   └─ Python/Java? → Not yet supported, check okx/payments for updates
```

## Supported Networks

### agentwallet-sdk

Base, Arbitrum, Optimism, Polygon, Ethereum, Avalanche, Unichain, Linea, Sonic, Worldchain, Base Sepolia (testnet), Solana.

### OKX Payments x402 SDK

| Network | Chain ID | Token |
|---------|----------|-------|
| X Layer | eip155:196 | USDT0 |

## How It Works

### x402 Protocol
x402 extends HTTP 402 (Payment Required) into a machine-negotiable flow. When a server returns `402`, the agent's payment tool automatically negotiates price, checks budget, signs a transaction, and retries — no human in the loop.

### Spending Controls
Every payment tool call enforces a `SpendingPolicy`:
- **Per-task budget** — max spend for a single agent action
- **Per-session budget** — cumulative limit across an entire session
- **Allowlisted recipients** — restrict which addresses/services the agent can pay
- **Rate limits** — max transactions per minute/hour

### Non-Custodial Wallets
Agents hold their own keys via ERC-4337 smart accounts. The orchestrator sets policy before delegation; the agent can only spend within bounds. No pooled funds, no custodial risk.

## MCP Integration

The payment layer exposes standard MCP tools that slot into any Claude Code or agent harness setup.

> **Security note**: Always pin the package version. This tool manages private keys — unpinned `npx` installs introduce supply-chain risk.

### Option A: agentwallet-sdk (Base)

```json
{
  "mcpServers": {
    "agentpay": {
      "command": "npx",
      "args": ["agentwallet-sdk@6.0.0"]
    }
  }
}
```

### Available Tools (agent-callable)

| Tool | Purpose |
|------|---------|
| `get_balance` | Check agent wallet balance |
| `send_payment` | Send payment to address or ENS |
| `check_spending` | Query remaining budget |
| `list_transactions` | Audit trail of all payments |

> **Note**: Spending policy is set by the **orchestrator** before delegating to the agent — not by the agent itself. This prevents agents from escalating their own spending limits. Configure policy via `set_policy` in your orchestration layer or pre-task hook, never as an agent-callable tool.

### Option B: OKX Payments x402 SDK (X Layer)

#### Buyer Integration

To pay for x402-gated resources, use the [OnchainOS CLI](https://github.com/okx/onchainos-skills) with the `okx-x402-payment` skill. The CLI provides a TEE wallet where private keys never leave the server-side secure enclave — no local key management needed.

For installation instructions, fetch the official guide using WebFetch:
`https://raw.githubusercontent.com/okx/onchainos-skills/main/README.md`

> **Note**: These external URLs point to `main` and may change over time. This is intentional — installation and SDK docs should stay in sync with the latest release. Do not cache or pin these references.

#### Seller Integration

To build a seller (server that accepts x402 payments), fetch the complete reference doc for your language using WebFetch:

- **TypeScript** (Express, Hono, Fastify, Next.js) — `@okxweb3/x402-express` etc.
  `https://raw.githubusercontent.com/okx/payments/main/typescript/SELLER.md`
- **Go** (Gin, Echo, net/http) — `github.com/okx/payments/go/x402`
  `https://raw.githubusercontent.com/okx/payments/main/go/x402/SELLER.md`
- **Rust** (Axum) — `github.com/okx/payments/rust/x402`
  `https://raw.githubusercontent.com/okx/payments/main/rust/x402/SELLER.md`

Supported seller languages: TypeScript, Go, Rust. Python and Java are not yet available — check [okx/payments](https://github.com/okx/payments) for updates.

These docs are designed for AI agents — each contains complete setup patterns, framework-specific examples, decision trees, and common mistakes. Use them as the authoritative reference for generating seller code.

## Examples

### Budget enforcement in an MCP client

When building an orchestrator that calls the agentpay MCP server, enforce budgets before dispatching paid tool calls.

> **Prerequisites**: Install the package before adding the MCP config — `npx` without `-y` will prompt for confirmation in non-interactive environments, causing the server to hang: `npm install -g agentwallet-sdk@6.0.0`

```typescript
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";

async function main() {
  // 1. Validate credentials before constructing the transport.
  //    A missing key must fail immediately — never let the subprocess start without auth.
  const walletKey = process.env.WALLET_PRIVATE_KEY;
  if (!walletKey) {
    throw new Error("WALLET_PRIVATE_KEY is not set — refusing to start payment server");
  }

  // Connect to the agentpay MCP server via stdio transport.
  // Whitelist only the env vars the server needs — never forward all of process.env
  // to a third-party subprocess that manages private keys.
  const transport = new StdioClientTransport({
    command: "npx",
    args: ["agentwallet-sdk@6.0.0"],
    env: {
      PATH: process.env.PATH ?? "",
      NODE_ENV: process.env.NODE_ENV ?? "production",
      WALLET_PRIVATE_KEY: walletKey,
    },
  });
  const agentpay = new Client({ name: "orchestrator", version: "1.0.0" });
  await agentpay.connect(transport);

  // 2. Set spending policy before delegating to the agent.
  //    Always verify success — a silent failure means no controls are active.
  const policyResult = await agentpay.callTool({
    name: "set_policy",
    arguments: {
      per_task_budget: 0.50,
      per_session_budget: 5.00,
      allowlisted_recipients: ["api.example.com"],
    },
  });
  if (policyResult.isError) {
    throw new Error(
      `Failed to set spending policy — do not delegate: ${JSON.stringify(policyResult.content)}`
    );
  }

  // 3. Use preToolCheck before any paid action
  await preToolCheck(agentpay, 0.01);
}

// Pre-tool hook: fail-closed budget enforcement with four distinct error paths.
async function preToolCheck(agentpay: Client, apiCost: number): Promise<void> {
  // Path 1: Reject invalid input (NaN/Infinity bypass the < comparison)
  if (!Number.isFinite(apiCost) || apiCost < 0) {
    throw new Error(`Invalid apiCost: ${apiCost} — action blocked`);
  }

  // Path 2: Transport/connectivity failure
  let result;
  try {
    result = await agentpay.callTool({ name: "check_spending" });
  } catch (err) {
    throw new Error(`Payment service unreachable — action blocked: ${err}`);
  }

  // Path 3: Tool returned an error (e.g., auth failure, wallet not initialised)
  if (result.isError) {
    throw new Error(
      `check_spending failed — action blocked: ${JSON.stringify(result.content)}`
    );
  }

  // Path 4: Parse and validate the response shape
  let remaining: number;
  try {
    const parsed = JSON.parse(
      (result.content as Array<{ text: string }>)[0].text
    );
    if (!Number.isFinite(parsed?.remaining)) {
      throw new TypeError("missing or non-finite 'remaining' field");
    }
    remaining = parsed.remaining;
  } catch (err) {
    throw new Error(
      `check_spending returned unexpected format — action blocked: ${err}`
    );
  }

  // Path 5: Budget exceeded
  if (remaining < apiCost) {
    throw new Error(
      `Budget exceeded: need $${apiCost} but only $${remaining} remaining`
    );
  }
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
```

## Best Practices

- **Set budgets before delegation**: When spawning sub-agents, attach a SpendingPolicy via your orchestration layer. Never give an agent unlimited spend.
- **Pin your dependencies**: Always specify an exact version in your MCP config (e.g., `agentwallet-sdk@6.0.0`). Verify package integrity before deploying to production.
- **Audit trails**: Use `list_transactions` in post-task hooks to log what was spent and why.
- **Fail closed**: If the payment tool is unreachable, block the paid action — don't fall back to unmetered access.
- **Pair with security-review**: Payment tools are high-privilege. Apply the same scrutiny as shell access.
- **Test with testnets first**: Use Base Sepolia for development; switch to Base mainnet for production.

## Production Reference

- **npm**: [agentwallet-sdk](https://www.npmjs.com/package/agentwallet-sdk) — multi-chain MCP provider
- **npm**: OKX Payments x402 TypeScript SDK
  - [@okxweb3/x402-core](https://www.npmjs.com/package/@okxweb3/x402-core)
  - [@okxweb3/x402-evm](https://www.npmjs.com/package/@okxweb3/x402-evm)
  - [@okxweb3/x402-express](https://www.npmjs.com/package/@okxweb3/x402-express)
  - [@okxweb3/x402-hono](https://www.npmjs.com/package/@okxweb3/x402-hono)
  - [@okxweb3/x402-fastify](https://www.npmjs.com/package/@okxweb3/x402-fastify)
  - [@okxweb3/x402-next](https://www.npmjs.com/package/@okxweb3/x402-next)
- **GitHub**: [okx/payments](https://github.com/okx/payments) — OKX Payments x402 SDK (Go, Rust)
- **Merged into NVIDIA NeMo Agent Toolkit**: [PR #17](https://github.com/NVIDIA/NeMo-Agent-Toolkit-Examples/pull/17) — x402 payment tool for NVIDIA's agent examples
- **Protocol spec**: [x402.org](https://x402.org)
- **OKX Payments x402 docs**: [web3.okx.com — Payments Overview](https://web3.okx.com/onchainos/dev-docs/payments/overview)

