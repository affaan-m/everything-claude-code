---
name: defi-amm-security
description: Solidity AMM合约、流动性池和交换流程的安全检查清单。涵盖重入攻击、CEI顺序、捐赠或通胀攻击、预言机操纵、滑点、管理员控制和整数运算。
origin: ECC direct-port adaptation
version: "1.0.0"
---

# DeFi AMM 安全

Solidity AMM 合约、LP 金库和交换函数的关键漏洞模式及加固实现。

## 何时使用

* 编写或审计 Solidity AMM 或流动性池合约时
* 实现持有代币余额的交换、存入、提取、铸造或销毁流程时
* 审查任何在份额或储备金计算中使用 `token.balanceOf(address(this))` 的合约时
* 为 DeFi 协议添加费用设置器、暂停器、预言机更新或其他管理功能时

## 工作原理

将其用作检查清单加模式库。对照以下类别审查每个用户入口点，并优先使用加固示例而非自行编写的变体。

## 示例

### 重入攻击：强制执行 CEI 顺序

易受攻击：

```solidity
function withdraw(uint256 amount) external {
    require(balances[msg.sender] >= amount);
    token.transfer(msg.sender, amount);
    balances[msg.sender] -= amount;
}
```

安全：

```solidity
import {ReentrancyGuard} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import {SafeERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

using SafeERC20 for IERC20;

function withdraw(uint256 amount) external nonReentrant {
    require(balances[msg.sender] >= amount, "Insufficient");
    balances[msg.sender] -= amount;
    token.safeTransfer(msg.sender, amount);
}
```

当存在加固库时，不要编写自己的防护代码。

### 捐赠或通胀攻击

直接使用 `token.balanceOf(address(this))` 进行份额计算，会让攻击者能够通过向合约发送代币（在预期路径之外）来操纵分母。

```solidity
// Vulnerable
function deposit(uint256 assets) external returns (uint256 shares) {
    shares = (assets * totalShares) / token.balanceOf(address(this));
}
```

```solidity
// Safe
uint256 private _totalAssets;

function deposit(uint256 assets) external nonReentrant returns (uint256 shares) {
    uint256 balBefore = token.balanceOf(address(this));
    token.safeTransferFrom(msg.sender, address(this), assets);
    uint256 received = token.balanceOf(address(this)) - balBefore;

    shares = totalShares == 0 ? received : (received * totalShares) / _totalAssets;
    _totalAssets += received;
    totalShares += shares;
}
```

跟踪内部记账并测量实际收到的代币。

### 预言机操纵

现货价格易受闪电贷操纵。优先使用 TWAP。

```solidity
uint32[] memory secondsAgos = new uint32[](2);
secondsAgos[0] = 1800;
secondsAgos[1] = 0;
(int56[] memory tickCumulatives,) = IUniswapV3Pool(pool).observe(secondsAgos);
int24 twapTick = int24(
    (tickCumulatives[1] - tickCumulatives[0]) / int56(uint56(30 minutes))
);
uint160 sqrtPriceX96 = TickMath.getSqrtRatioAtTick(twapTick);
```

### 滑点保护

每个交换路径都需要调用者提供滑点限制和截止时间。

```solidity
function swap(
    uint256 amountIn,
    uint256 amountOutMin,
    uint256 deadline
) external returns (uint256 amountOut) {
    require(block.timestamp <= deadline, "Expired");
    amountOut = _calculateOut(amountIn);
    require(amountOut >= amountOutMin, "Slippage exceeded");
    _executeSwap(amountIn, amountOut);
}
```

### 安全的储备金计算

```solidity
import {FullMath} from "@uniswap/v3-core/contracts/libraries/FullMath.sol";

uint256 result = FullMath.mulDiv(a, b, c);
```

对于大型储备金计算，当存在溢出风险时，避免使用简单的 `a * b / c`。

### 管理控制

```solidity
import {Ownable2Step} from "@openzeppelin/contracts/access/Ownable2Step.sol";

contract MyAMM is Ownable2Step {
    function setFee(uint256 fee) external onlyOwner { ... }
    function pause() external onlyOwner { ... }
}
```

优先采用明确的所有权转移确认机制，并对每个特权路径进行门控。

## 安全检查清单

* 暴露于重入攻击的入口点使用 `nonReentrant`
* 遵守 CEI 顺序
* 份额计算不依赖于原始的 `balanceOf(address(this))`
* ERC-20 转账使用 `SafeERC20`
* 存款操作测量实际收到的代币
* 预言机读取使用 TWAP 或其他抗操纵的数据源
* 交换操作要求 `amountOutMin` 和 `deadline`
* 对溢出敏感的储备金计算使用安全原语，例如 `mulDiv`
* 管理功能受访问控制
* 存在紧急暂停功能并经过测试
* 在生产前运行静态分析和模糊测试

## 审计工具

```bash
pip install slither-analyzer
slither . --exclude-dependencies

echidna-test . --contract YourAMM --config echidna.yaml

forge test --fuzz-runs 10000
```
