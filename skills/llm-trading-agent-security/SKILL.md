---
name: llm-trading-agent-security
description: Security checklist and patterns for autonomous AI trading agents — prompt injection defense, hard spend limits, transaction simulation, circuit breakers, MEV protection, and wallet key management.
origin: community
---

# LLM Trading Agent Security

Security patterns for autonomous AI agents that execute on-chain transactions, manage wallets, or interact with DeFi protocols.

## When to Use

- Building an AI agent that signs and sends transactions
- Auditing an autonomous trading bot for security vulnerabilities
- Designing wallet key management for a non-custodial agent
- Adding safety rails to an LLM that has access to blockchain actions

## How It Works

LLM trading agents face a unique threat model: prompt injection can cause direct financial loss (not just data leakage). This skill provides a layered defense pattern covering input sanitization, hard spend limits, transaction simulation, circuit breakers, MEV protection, and key management. Each layer is independent — a failure in one doesn't compromise the others.

## Examples

### 1. Prompt Injection as Financial Attack

LLM trading agents are uniquely vulnerable: injected instructions can directly drain wallets.

**Attack surfaces:** token names/symbols from `ERC20.name()`, DEX pair labels, order book notes, webhook payloads, social feed integrations.

**Defense — sanitize ALL external data before LLM context:**
```python
import re

INJECTION_PATTERNS = [
    r'ignore (previous|all) instructions',
    r'new (task|directive|instruction)',
    r'system prompt',
    r'send .{0,50} to 0x[0-9a-fA-F]{40}',
    r'transfer .{0,50} to',
    r'approve .{0,50} for',
]

def sanitize_onchain_data(text: str) -> str:
    for pattern in INJECTION_PATTERNS:
        if re.search(pattern, text, re.IGNORECASE):
            raise ValueError(f"Potential prompt injection: {text[:100]}")
    return text
```

### 2. Hard Spend Limits — Never Bypass

```python
from decimal import Decimal

MAX_SINGLE_TX_USD = Decimal("500")
MAX_DAILY_SPEND_USD = Decimal("2000")
REQUIRE_HUMAN_APPROVAL_ABOVE_USD = Decimal("1000")

class SpendLimitError(Exception):
    pass

class SpendLimitGuard:
    def check_and_record(self, usd_amount: Decimal) -> None:
        if usd_amount > MAX_SINGLE_TX_USD:
            raise SpendLimitError(f"Single tx ${usd_amount} exceeds max ${MAX_SINGLE_TX_USD}")

        daily = self._get_24h_spend()
        if daily + usd_amount > MAX_DAILY_SPEND_USD:
            raise SpendLimitError(f"Daily limit: ${daily} + ${usd_amount} > ${MAX_DAILY_SPEND_USD}")

        self._record_spend(usd_amount)
```

### 3. Simulate Before Sending

Never submit a transaction the agent hasn't seen simulated successfully:

```python
class SlippageError(Exception):
    pass

async def safe_execute(self, tx: dict) -> str:
    # 1. Simulate
    sim_result = await self.w3.eth.call(tx)

    # 2. Validate simulated output — require min_amount_out (no silent bypass)
    min_out = tx.get('min_amount_out')
    if min_out is None:
        raise ValueError("min_amount_out is required — refusing to send without slippage bound")
    actual_out = decode_uint256(sim_result)
    if actual_out < min_out:
        raise SlippageError(f"Simulation: {actual_out} < {min_out}")

    # 3. Only then send
    signed = self.account.sign_transaction(tx)
    return await self.w3.eth.send_raw_transaction(signed.raw_transaction)
```

### 4. Circuit Breaker

```python
class TradingCircuitBreaker:
    MAX_CONSECUTIVE_LOSSES = 3
    MAX_HOURLY_LOSS_PCT = 0.05   # 5% → halt

    def check(self, portfolio_value: float) -> None:
        if self.consecutive_losses >= self.MAX_CONSECUTIVE_LOSSES:
            self.halt("Too many consecutive losses")

        if self.hour_start_value <= 0:
            self.halt("Invalid hour_start_value — cannot compute PnL")
            return

        hourly_pnl = (portfolio_value - self.hour_start_value) / self.hour_start_value
        if hourly_pnl < -self.MAX_HOURLY_LOSS_PCT:
            self.halt(f"Hourly PnL {hourly_pnl:.1%} below threshold")
```

### 5. Wallet Key Management

```python
import os
from eth_account import Account

# NEVER hardcode or log private keys
private_key = os.environ.get("TRADING_WALLET_PRIVATE_KEY")
if not private_key:
    raise EnvironmentError("TRADING_WALLET_PRIVATE_KEY not set")

account = Account.from_key(private_key)
# Use a dedicated hot wallet with only the session's required funds
# Never use your main wallet as the agent's signing key
```

### 6. MEV / Sandwich Attack Defense

```python
import time

# Route through private mempool to avoid sandwich attacks
PRIVATE_RPC = "https://rpc.flashbots.net"  # Flashbots Protect

# Set tight slippage — bots exploit loose tolerances
MAX_SLIPPAGE_BPS = {'stable': 10, 'volatile': 50}  # 0.1% / 0.5%

# Always include deadline — reject if not mined in time
deadline = int(time.time()) + 60  # 60s max window
```

## Pre-Deploy Checklist

- [ ] All on-chain data sanitized before inclusion in LLM context
- [ ] Hard spend limits with rolling 24h window enforcement (using `Decimal`, not `float`)
- [ ] Every transaction simulated before sending
- [ ] `min_amount_out` is mandatory (never defaults to 0)
- [ ] Circuit breaker configured with automatic halt on drawdown
- [ ] Circuit breaker validates `hour_start_value > 0` before division
- [ ] Private key loaded from env/secrets manager only (never hardcoded)
- [ ] Private RPC endpoint configured (not public mempool)
- [ ] Slippage bounds set per asset class
- [ ] Transaction deadlines set (≤60s)
- [ ] Audit log for every agent decision (not just executed txs)
- [ ] Dedicated hot wallet funded only to session limit

## Common Pitfalls

- **Logging tx params with `print()`** — use structured logging with field masking in prod
- **Trusting LLM-generated tx params directly** — always validate against a schema before signing
- **No audit trail** — you need decision logs for post-incident analysis
- **Reusing nonces** — track locally; don't always fetch from RPC (race condition)
- **Missing reentrancy guard** — if your agent calls external contracts that call back, you can be drained mid-execution
