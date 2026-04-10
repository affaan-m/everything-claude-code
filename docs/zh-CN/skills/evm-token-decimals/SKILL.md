---
name: evm-token-decimals
description: 防止跨EVM链的无声小数不匹配错误。涵盖运行时小数查找、链感知缓存、桥接代币精度漂移，以及为机器人、仪表板和DeFi工具提供安全标准化。
origin: ECC direct-port adaptation
version: "1.0.0"
---

# EVM 代币小数位数

静默的小数位数不匹配是导致余额或美元价值出现数量级偏差而不会抛出错误的最简单方式之一。

## 何时使用

* 在 Python、TypeScript 或 Solidity 中读取 ERC-20 余额
* 根据链上余额计算法币价值
* 跨多个 EVM 链比较代币数量
* 处理桥接资产
* 构建投资组合跟踪器、机器人或聚合器

## 工作原理

切勿假设稳定币在所有地方都使用相同的小数位数。在运行时查询 `decimals()`，按 `(chain_id, token_address)` 缓存，并在进行价值计算时使用小数安全的数学运算。

## 示例

### 在运行时查询小数位数

```python
from decimal import Decimal
from web3 import Web3

ERC20_ABI = [
    {"name": "decimals", "type": "function", "inputs": [],
     "outputs": [{"type": "uint8"}], "stateMutability": "view"},
    {"name": "balanceOf", "type": "function",
     "inputs": [{"name": "account", "type": "address"}],
     "outputs": [{"type": "uint256"}], "stateMutability": "view"},
]

def get_token_balance(w3: Web3, token_address: str, wallet: str) -> Decimal:
    contract = w3.eth.contract(
        address=Web3.to_checksum_address(token_address),
        abi=ERC20_ABI,
    )
    decimals = contract.functions.decimals().call()
    raw = contract.functions.balanceOf(Web3.to_checksum_address(wallet)).call()
    return Decimal(raw) / Decimal(10 ** decimals)
```

不要硬编码 `1_000_000`，因为某个符号在其他地方通常有 6 位小数。

### 按链和代币缓存

```python
from functools import lru_cache

@lru_cache(maxsize=512)
def get_decimals(chain_id: int, token_address: str) -> int:
    w3 = get_web3_for_chain(chain_id)
    contract = w3.eth.contract(
        address=Web3.to_checksum_address(token_address),
        abi=ERC20_ABI,
    )
    return contract.functions.decimals().call()
```

### 防御性地处理特殊代币

```python
try:
    decimals = contract.functions.decimals().call()
except Exception:
    logging.warning(
        "decimals() reverted on %s (chain %s), defaulting to 18",
        token_address,
        chain_id,
    )
    decimals = 18
```

记录回退情况并保持其可见性。旧的或非标准的代币仍然存在。

### 在 Solidity 中归一化为 18 位小数的 WAD

```solidity
interface IERC20Metadata {
    function decimals() external view returns (uint8);
}

function normalizeToWad(address token, uint256 amount) internal view returns (uint256) {
    uint8 d = IERC20Metadata(token).decimals();
    if (d == 18) return amount;
    if (d < 18) return amount * 10 ** (18 - d);
    return amount / 10 ** (d - 18);
}
```

### 使用 ethers 的 TypeScript

```typescript
import { Contract, formatUnits } from 'ethers';

const ERC20_ABI = [
  'function decimals() view returns (uint8)',
  'function balanceOf(address) view returns (uint256)',
];

async function getBalance(provider: any, tokenAddress: string, wallet: string): Promise<string> {
  const token = new Contract(tokenAddress, ERC20_ABI, provider);
  const [decimals, raw] = await Promise.all([
    token.decimals(),
    token.balanceOf(wallet),
  ]);
  return formatUnits(raw, decimals);
}
```

### 快速链上检查

```bash
cast call <token_address> "decimals()(uint8)" --rpc-url <rpc>
```

## 规则

* 始终在运行时查询 `decimals()`
* 按链加代币地址缓存，而不是按符号
* 使用 `Decimal`、`BigInt` 或等效的精确数学运算，而不是浮点数
* 在桥接或包装器变更后重新查询小数位数
* 在比较或定价之前，始终如一地归一化内部记账
