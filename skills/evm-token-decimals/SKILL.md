---
name: evm-token-decimals
description: Prevent silent decimal mismatch bugs when reading ERC-20 balances across EVM chains — BSC USDT/USDC have 18 decimals (not 6), some tokens have 0 decimals, and bridged tokens can silently change precision.
origin: community
---

# EVM Token Decimal Mismatch

Silent decimal mismatches are one of the most common bugs in cross-chain DeFi bots and portfolio tools. They produce values that are 10^12 times wrong with no error thrown.

## When to Activate

- Reading ERC-20 token balances in Python, TypeScript, or Solidity
- Calculating USD values from on-chain balances
- Comparing token amounts across different chains
- Handling bridged tokens (amounts may change precision at the bridge)
- Building a portfolio tracker, trading bot, or DeFi aggregator

## The Core Problem

Most developers assume USDC = 6 decimals. **This is wrong on BSC.**

| Token | Ethereum | BSC  | Polygon | Arbitrum |
|-------|----------|------|---------|----------|
| USDC  | 6        | **18** | 6     | 6        |
| USDT  | 6        | **18** | 6     | 6        |
| DAI   | 18       | 18   | 18      | 18       |
| WBTC  | 8        | 8    | 8       | 8        |

If you hardcode 6 decimals for BSC USDT, you'll read a $1,000 balance as `$0.000000001` — with no error.

## Always Query Decimals at Runtime

```python
from web3 import Web3

ERC20_ABI = [
    {"name": "decimals", "type": "function", "inputs": [],
     "outputs": [{"type": "uint8"}], "stateMutability": "view"},
    {"name": "balanceOf", "type": "function",
     "inputs": [{"name": "account", "type": "address"}],
     "outputs": [{"type": "uint256"}], "stateMutability": "view"},
]

def get_token_balance(w3: Web3, token_address: str, wallet: str) -> float:
    contract = w3.eth.contract(
        address=Web3.to_checksum_address(token_address),
        abi=ERC20_ABI
    )
    decimals = contract.functions.decimals().call()  # ALWAYS query
    raw = contract.functions.balanceOf(
        Web3.to_checksum_address(wallet)
    ).call()
    return raw / (10 ** decimals)

# NEVER do this:
# usdt_balance = raw / 1_000_000  # Hardcoded — breaks on BSC
```

## Cache Decimals by (chain_id, token_address)

Decimals don't change — cache after first fetch to avoid repeated RPC calls:

```python
from functools import lru_cache

@lru_cache(maxsize=512)
def get_decimals(chain_id: int, token_address: str) -> int:
    w3 = get_web3_for_chain(chain_id)
    contract = w3.eth.contract(
        address=Web3.to_checksum_address(token_address),
        abi=ERC20_ABI
    )
    return contract.functions.decimals().call()
```

## Edge Cases

### Tokens with 0 Decimals
Some NFT wrapper tokens or governance tokens are whole-number units. `decimals()` returning `0` is valid — don't treat it as a missing function or error.

```python
decimals = contract.functions.decimals().call()
divisor = 10 ** decimals if decimals > 0 else 1
human_amount = raw / divisor
```

### Tokens Without `decimals()` (Old Tokens)
Some early ERC-20 tokens don't implement `decimals()`. Wrap defensively:

```python
try:
    decimals = contract.functions.decimals().call()
except Exception:
    import logging
    logging.warning(f"No decimals() on {token_address}, defaulting to 18")
    decimals = 18
```

### Bridged Tokens Change Precision
A 6-decimal USDC bridged through an old bridge may emerge as 18-decimal on the destination. Always re-query decimals after a bridge — never assume they match the source chain.

## Solidity: Normalize to 18 Decimals (WAD)

When accepting arbitrary ERC-20 tokens in a Solidity contract, normalize to 18-decimal WAD internally:

```solidity
interface IERC20Metadata {
    function decimals() external view returns (uint8);
}

function normalizeToWad(address token, uint256 amount) internal view returns (uint256) {
    uint8 d = IERC20Metadata(token).decimals();
    if (d == 18) return amount;
    if (d < 18)  return amount * 10 ** (18 - d);
    return amount / 10 ** (d - 18);  // Rare: >18 decimals
}
```

## TypeScript (ethers.js)

```typescript
import { Contract, formatUnits } from 'ethers';

const ERC20_ABI = ['function decimals() view returns (uint8)',
                   'function balanceOf(address) view returns (uint256)'];

async function getBalance(provider: any, tokenAddress: string, wallet: string): Promise<string> {
    const token = new Contract(tokenAddress, ERC20_ABI, provider);
    const [decimals, raw] = await Promise.all([
        token.decimals(),
        token.balanceOf(wallet),
    ]);
    return formatUnits(raw, decimals);  // ethers handles the math
}
```

## Quick Check via Cast

```bash
# Check token decimals on any chain
cast call <token_address> "decimals()(uint8)" --rpc-url <rpc>

# BSC USDT — expect 18, NOT 6
cast call 0x55d398326f99059fF775485246999027B3197955 \
  "decimals()(uint8)" \
  --rpc-url https://bsc-dataseed.binance.org/
# Returns: 18
```
