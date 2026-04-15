---
name: llm-trading-agent-security
description: 具有钱包或交易权限的自主交易代理的安全模式。涵盖提示注入、支出限制、预发送模拟、断路器、MEV保护和密钥处理。
origin: ECC direct-port adaptation
version: "1.0.0"
---

# LLM 交易代理安全

自主交易代理比普通 LLM 应用面临更严峻的威胁模型：一次注入或错误的工具路径可能直接导致资产损失。

## 使用时机

* 构建能够签名并发送交易的 AI 代理
* 审计交易机器人或链上执行助手
* 为代理设计钱包密钥管理方案
* 授予 LLM 下单、交换或资金库操作的权限

## 工作原理

分层部署防御措施。单一检查是不够的。将提示词卫生、支出策略、模拟、执行限制和钱包隔离视为独立的控制措施。

## 示例

### 将提示词注入视为金融攻击

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

不要盲目地将代币名称、交易对标签、网络钩子或社交信息流注入到具备执行能力的提示词中。

### 严格的支出限制

```python
from decimal import Decimal

MAX_SINGLE_TX_USD = Decimal("500")
MAX_DAILY_SPEND_USD = Decimal("2000")

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

### 发送前先模拟

```python
class SlippageError(Exception):
    pass

async def safe_execute(self, tx: dict, expected_min_out: int | None = None) -> str:
    sim_result = await self.w3.eth.call(tx)

    if expected_min_out is None:
        raise ValueError("min_amount_out is required before send")

    actual_out = decode_uint256(sim_result)
    if actual_out < expected_min_out:
        raise SlippageError(f"Simulation: {actual_out} < {expected_min_out}")

    signed = self.account.sign_transaction(tx)
    return await self.w3.eth.send_raw_transaction(signed.raw_transaction)
```

### 熔断机制

```python
class TradingCircuitBreaker:
    MAX_CONSECUTIVE_LOSSES = 3
    MAX_HOURLY_LOSS_PCT = 0.05

    def check(self, portfolio_value: float) -> None:
        if self.consecutive_losses >= self.MAX_CONSECUTIVE_LOSSES:
            self.halt("Too many consecutive losses")

        if self.hour_start_value <= 0:
            self.halt("Invalid hour_start_value")
            return

        hourly_pnl = (portfolio_value - self.hour_start_value) / self.hour_start_value
        if hourly_pnl < -self.MAX_HOURLY_LOSS_PCT:
            self.halt(f"Hourly PnL {hourly_pnl:.1%} below threshold")
```

### 钱包隔离

```python
import os
from eth_account import Account

private_key = os.environ.get("TRADING_WALLET_PRIVATE_KEY")
if not private_key:
    raise EnvironmentError("TRADING_WALLET_PRIVATE_KEY not set")

account = Account.from_key(private_key)
```

使用一个专用的热钱包，仅存放所需的会话资金。切勿让代理指向主资金库钱包。

### MEV 和截止时间保护

```python
import time

PRIVATE_RPC = "https://rpc.flashbots.net"
MAX_SLIPPAGE_BPS = {"stable": 10, "volatile": 50}
deadline = int(time.time()) + 60
```

## 部署前检查清单

* 外部数据在进入 LLM 上下文前已进行清理
* 支出限制独立于模型输出强制执行
* 交易在发送前经过模拟
* `min_amount_out` 是强制性的
* 熔断机制在亏损或无效状态时停止运行
* 密钥来自环境变量或密钥管理器，绝不来自代码或日志
* 在适当时使用私有内存池或受保护的路由
* 根据策略设置滑点和截止时间
* 所有代理决策都记录在审计日志中，而不仅仅是成功的发送
