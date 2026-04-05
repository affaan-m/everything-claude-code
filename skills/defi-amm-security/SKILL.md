---
name: defi-amm-security
description: Security checklist for Solidity AMM contracts — reentrancy guards, CEI ordering, donation/inflation attack prevention, price oracle manipulation protection, slippage safety, and integer overflow patterns.
origin: community
---

# DeFi AMM Security Checklist

Critical vulnerability patterns and fixes for Solidity AMM contracts, liquidity pools, and swap functions.

## When to Use

- Writing or auditing a Solidity AMM or liquidity pool contract
- Implementing a swap function that holds token balances
- Reviewing any contract that uses `token.balanceOf(address(this))` for share math
- Adding admin functions (fee setters, pausers) to a DeFi contract

## How It Works

This skill provides a pattern library of common AMM vulnerabilities with corresponding safe implementations. Each pattern shows both the vulnerable and hardened code so you can identify and fix issues during code review or development.

## Examples

### 1. Reentrancy — Always Use CEI Order

**Vulnerable (Interactions before Effects):**
```solidity
function withdraw(uint256 amount) external {
    require(balances[msg.sender] >= amount);
    token.transfer(msg.sender, amount);   // External call FIRST — exploitable
    balances[msg.sender] -= amount;        // State update too late
}
```

**Safe (Checks → Effects → Interactions):**
```solidity
import {ReentrancyGuard} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import {SafeERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
using SafeERC20 for IERC20;

function withdraw(uint256 amount) external nonReentrant {
    require(balances[msg.sender] >= amount, "Insufficient");
    balances[msg.sender] -= amount;                 // Effect FIRST
    token.safeTransfer(msg.sender, amount);          // Interaction LAST (checked)
}
```

Never write your own reentrancy guard — use OpenZeppelin or Solmate.

### 2. Donation (Inflation) Attack — ERC4626 and LP Tokens

Relying on `token.balanceOf(address(this))` for share math lets an attacker inflate the denominator by sending tokens directly to the contract, manipulating the share price.

```solidity
// VULNERABLE: attacker pre-seeds balance via direct transfer, then first
// legitimate depositor's (assets * totalShares) / inflatedBalance rounds
// to 0 shares — attacker redeems to steal the deposit.
function deposit(uint256 assets) external returns (uint256 shares) {
    shares = (assets * totalShares) / token.balanceOf(address(this));
}

// SAFE: track internal accounting separately from actual balance;
// use SafeERC20 and measure actual tokens received for fee-on-transfer safety.
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

### 3. Price Oracle Manipulation

Spot price from a pool can be manipulated in the same block via flash loan. Always use TWAP.

```solidity
// VULNERABLE: spot price
uint256 price = reserve0 / reserve1;  // Flash-loan manipulatable

// SAFE: Uniswap V3 TWAP (30-minute window)
uint32[] memory secondsAgos = new uint32[](2);
secondsAgos[0] = 1800;  // 30 minutes ago
secondsAgos[1] = 0;     // now
(int56[] memory tickCumulatives,) = IUniswapV3Pool(pool).observe(secondsAgos);
int24 twapTick = int24(
    (tickCumulatives[1] - tickCumulatives[0]) / int56(uint56(30 minutes))
);
uint160 sqrtPriceX96 = TickMath.getSqrtRatioAtTick(twapTick);
```

### 4. Slippage Protection — Required on Every Swap

```solidity
// VULNERABLE: no minimum output — sandwich-able
function swap(uint256 amountIn) external returns (uint256 amountOut) {
    amountOut = _calculateOut(amountIn);
    _executeSwap(amountIn, amountOut);
}

// SAFE:
function swap(
    uint256 amountIn,
    uint256 amountOutMin,  // caller sets this
    uint256 deadline
) external returns (uint256 amountOut) {
    require(block.timestamp <= deadline, "Expired");
    amountOut = _calculateOut(amountIn);
    require(amountOut >= amountOutMin, "Slippage exceeded");
    _executeSwap(amountIn, amountOut);
}
```

### 5. Safe Integer Math for Reserve Calculations

```solidity
// Overflow risk: a * b overflows if product > uint256 max
uint256 result = (a * b) / c;   // DANGEROUS for large reserve values

// SAFE: use FullMath (Uniswap) for 512-bit intermediate precision
import {FullMath} from "@uniswap/v3-core/contracts/libraries/FullMath.sol";
uint256 result = FullMath.mulDiv(a, b, c);
```

### 6. Access Control on Admin Functions

```solidity
// Fee setters, pool pausers, oracle updaters — all need access control
// Prefer Ownable2Step over Ownable (requires acceptance, prevents accidental transfers)
import {Ownable2Step} from "@openzeppelin/contracts/access/Ownable2Step.sol";

contract MyAMM is Ownable2Step {
    function setFee(uint256 fee) external onlyOwner { ... }
    function pause() external onlyOwner { ... }
}
```

## Security Checklist

- [ ] Reentrancy-exposed entrypoints (deposit, withdraw, swap) have `nonReentrant`
- [ ] CEI order enforced: Checks → Effects → Interactions
- [ ] No `token.balanceOf(address(this))` for share math (use internal accounting)
- [ ] ERC-20 transfers use `SafeERC20` (handles non-standard return values)
- [ ] Deposits measure actual tokens received (fee-on-transfer safe)
- [ ] Price oracle uses TWAP — not spot price
- [ ] Every swap has `amountOutMin` and `deadline` params
- [ ] Integer overflow safe (Solidity 0.8+ built-in checks + `FullMath` for mulDiv)
- [ ] Admin functions gated with `onlyOwner` or role-based access
- [ ] Emergency pause mechanism exists
- [ ] Static analysis run: `slither . --exclude-dependencies`
- [ ] Fuzz tested: `echidna-test` or `forge fuzz` before mainnet

## Audit Tools

```bash
# Slither — static analysis
pip install slither-analyzer
slither . --exclude-dependencies

# Echidna — property-based fuzzing
echidna-test . --contract YourAMM --config echidna.yaml

# Foundry — fuzz testing built in
forge test --fuzz-runs 10000
```
