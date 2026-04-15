---
name: agent-payment-x402
description: 为AI代理添加x402支付执行功能——通过MCP工具实现每任务预算、支出控制和非托管钱包。适用于代理需要支付API、服务或其他代理的场景。
origin: community
---

# 代理支付执行 (x402)

使 AI 代理能够通过内置的支出控制进行自主支付。使用 x402 HTTP 支付协议和 MCP 工具，使代理能够为外部服务、API 或其他代理支付费用，而无需托管风险。

## 何时使用

在以下情况使用：您的代理需要为 API 调用付费、购买服务、与其他代理结算、强制执行每任务支出限制或管理非托管钱包。与成本感知 LLM 管道和安全审查技能自然搭配使用。

## 工作原理

### x402 协议

x402 将 HTTP 402（需要付款）扩展为机器可协商的流程。当服务器返回 `402` 时，代理的支付工具会自动协商价格、检查预算、签署交易并重试——无需人工干预。

### 支出控制

每次支付工具调用都会强制执行一个 `SpendingPolicy`：

* **每任务预算** — 单个代理操作的最大支出
* **每会话预算** — 整个会话期间的累计限制
* **允许列表收件人** — 限制代理可以支付的地址/服务
* **速率限制** — 每分钟/小时的最大交易次数

### 非托管钱包

代理通过 ERC-4337 智能账户持有自己的密钥。编排器在委托前设置策略；代理只能在限定范围内支出。没有资金池，没有托管风险。

## MCP 集成

支付层暴露标准的 MCP 工具，可插入任何 Claude Code 或代理框架设置中。

> **安全提示**：始终固定包版本。此工具管理私钥——未固定的 `npx` 安装会引入供应链风险。

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

### 可用工具（代理可调用）

| 工具 | 用途 |
|------|---------|
| `get_balance` | 检查代理钱包余额 |
| `send_payment` | 向地址或 ENS 发送付款 |
| `check_spending` | 查询剩余预算 |
| `list_transactions` | 所有支付的审计跟踪 |

> **注意**：支出策略由**编排器**在委托给代理**之前**设置——而不是由代理自身设置。这可以防止代理自行提升其支出限制。通过编排层或任务前钩子中的 `set_policy` 配置策略，切勿将其作为代理可调用的工具。

## 示例

### MCP 客户端中的预算强制执行

在构建调用 agentpay MCP 服务器的编排器时，在分派付费工具调用之前强制执行预算。

> **先决条件**：在添加 MCP 配置之前安装包——在非交互式环境中，没有 `-y` 的 `npx` 将提示确认，导致服务器挂起：`npm install -g agentwallet-sdk@6.0.0`

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

## 最佳实践

* **委托前设置预算**：当生成子代理时，通过编排层附加 SpendingPolicy。切勿给予代理无限支出权限。
* **固定依赖项**：始终在 MCP 配置中指定确切版本（例如，`agentwallet-sdk@6.0.0`）。在生产部署前验证包的完整性。
* **审计跟踪**：在任务后钩子中使用 `list_transactions` 来记录花费了什么以及原因。
* **故障关闭**：如果支付工具无法访问，则阻止付费操作——不要回退到未计量的访问。
* **与安全审查配对使用**：支付工具是高权限的。应用与 shell 访问相同的审查级别。
* **首先使用测试网测试**：开发时使用 Base Sepolia；生产时切换到 Base 主网。

## 生产参考

* **npm**: [`agentwallet-sdk`](https://www.npmjs.com/package/agentwallet-sdk)
* **已合并到 NVIDIA NeMo Agent Toolkit**: [PR #17](https://github.com/NVIDIA/NeMo-Agent-Toolkit-Examples/pull/17) — 用于 NVIDIA 代理示例的 x402 支付工具
* **协议规范**: [x402.org](https://x402.org)
