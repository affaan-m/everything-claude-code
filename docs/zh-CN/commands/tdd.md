---
description: 用于tdd-workflow技能的旧版斜杠入口垫片。建议直接使用该技能。
---

# TDD 命令（旧版兼容层）

仅当您仍调用 `/tdd` 时使用此命令。当前维护的工作流位于 `skills/tdd-workflow/SKILL.md`。

## 规范使用方式

* 优先直接使用 `tdd-workflow` 技能。
* 仅将此文件保留为兼容性入口点。

## 参数

`$ARGUMENTS`

## 委托执行

应用 `tdd-workflow` 技能。

* 严格遵守 RED -> GREEN -> REFACTOR 流程。
* 保持测试优先、覆盖率明确、检查点证据清晰。
* 使用该技能作为当前维护的 TDD 主体，而非在此处重复编写操作手册。
  })

````

## Step 3: 运行测试 - 验证失败

```bash
npm test lib/liquidity.test.ts

FAIL lib/liquidity.test.ts
  ✕ should return high score for liquid market (2 ms)
    Error: Not implemented

1 test failed, 0 passed
````

通过：测试按预期失败。准备实现。

## 步骤 4：实现最小化代码（绿）

```typescript
// lib/liquidity.ts
export function calculateLiquidityScore(market: MarketData): number {
  // Handle zero volume edge case
  if (market.totalVolume === 0) {
    return 0
  }

  // Calculate component scores (0-100 scale)
  const volumeScore = Math.min(market.totalVolume / 1000, 100)
  const spreadScore = Math.max(100 - (market.bidAskSpread * 1000), 0)
  const traderScore = Math.min(market.activeTraders / 10, 100)

  // Recent activity bonus
  const hoursSinceLastTrade = (Date.now() - market.lastTradeTime.getTime()) / (1000 * 60 * 60)
  const recencyScore = Math.max(100 - (hoursSinceLastTrade * 10), 0)

  // Weighted average
  const score = (
    volumeScore * 0.4 +
    spreadScore * 0.3 +
    traderScore * 0.2 +
    recencyScore * 0.1
  )

  return Math.min(Math.max(score, 0), 100) // Clamp to 0-100
}
```

## 步骤 5：运行测试 - 验证通过

```bash
npm test lib/liquidity.test.ts

PASS lib/liquidity.test.ts
  ✓ should return high score for liquid market (3 ms)
  ✓ should return low score for illiquid market (2 ms)
  ✓ should handle edge case: zero volume (1 ms)

3 tests passed
```

通过：所有测试通过！

## 步骤 6：重构（改进）

```typescript
// lib/liquidity.ts - Refactored with constants and better readability
const WEIGHTS = {
  VOLUME: 0.4,
  SPREAD: 0.3,
  TRADERS: 0.2,
  RECENCY: 0.1,
} as const

const SCALE_FACTORS = {
  VOLUME: 1000,
  SPREAD: 1000,
  TRADERS: 10,
  RECENCY_PENALTY: 10,
} as const

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max)
}

export function calculateLiquidityScore(market: MarketData): number {
  if (market.totalVolume === 0) return 0

  const volumeScore = Math.min(market.totalVolume / SCALE_FACTORS.VOLUME, 100)
  const spreadScore = clamp(100 - (market.bidAskSpread * SCALE_FACTORS.SPREAD), 0, 100)
  const traderScore = Math.min(market.activeTraders / SCALE_FACTORS.TRADERS, 100)

  const hoursSinceLastTrade = (Date.now() - market.lastTradeTime.getTime()) / (1000 * 60 * 60)
  const recencyScore = clamp(100 - (hoursSinceLastTrade * SCALE_FACTORS.RECENCY_PENALTY), 0, 100)

  const weightedScore =
    volumeScore * WEIGHTS.VOLUME +
    spreadScore * WEIGHTS.SPREAD +
    traderScore * WEIGHTS.TRADERS +
    recencyScore * WEIGHTS.RECENCY

  return clamp(weightedScore, 0, 100)
}
```

## 步骤 7：验证测试仍然通过

```bash
npm test lib/liquidity.test.ts

PASS lib/liquidity.test.ts
  ✓ should return high score for liquid market (3 ms)
  ✓ should return low score for illiquid market (2 ms)
  ✓ should handle edge case: zero volume (1 ms)

3 tests passed
```

通过：重构完成，测试依然通过！

## 步骤 8：检查覆盖率

```bash
npm test -- --coverage lib/liquidity.test.ts

File           | % Stmts | % Branch | % Funcs | % Lines
---------------|---------|----------|---------|--------
liquidity.ts   |   100   |   100    |   100   |   100

Coverage: 100% PASS: (Target: 80%)
```

通过：TDD 会话完成！

```

## TDD 最佳实践

**应做事项：**
- 通过：先编写测试，再实现功能
- 通过：运行测试并确认失败后再实现
- 通过：编写最少量代码使测试通过
- 通过：仅在测试通过后进行重构
- 通过：添加边界情况和错误场景
- 通过：目标覆盖率 80% 以上（关键代码 100%）

**禁止事项：**
- 失败：先实现功能再写测试
- 失败：每次更改后跳过运行测试
- 失败：一次性编写过多代码
- 失败：忽略失败的测试
- 失败：测试实现细节（应测试行为）
- 失败：过度模拟（优先集成测试）

## 应包含的测试类型

**单元测试**（函数级别）：
- 正常路径场景
- 边界情况（空值、null、最大值）
- 错误条件
- 边界值

**集成测试**（组件级别）：
- API 端点
- 数据库操作
- 外部服务调用
- 带钩子的 React 组件

**端到端测试**（使用 `/e2e` 命令）：
- 关键用户流程
- 多步骤流程
- 全栈集成

## 覆盖率要求

- 所有代码**最低 80%**
- **必须达到 100%** 的代码：
  - 财务计算
  - 身份验证逻辑
  - 安全关键代码
  - 核心业务逻辑

## 重要说明

**强制要求**：必须在实现前编写测试。TDD 循环如下：

1. **红** - 编写失败的测试
2. **绿** - 实现功能使测试通过
3. **重构** - 改进代码

切勿跳过红阶段。切勿在测试前编写代码。

## 与其他命令的集成

- 先使用 `/plan` 了解要构建的内容
- 使用 `/tdd` 进行带测试的实现
- 如果出现构建错误，使用 `/build-fix`
- 使用 `/code-review` 审查实现
- 使用 `/test-coverage` 验证覆盖率

## 相关代理

此命令调用由 ECC 提供的 `tdd-guide` 代理。

相关的 `tdd-workflow` 技能也随 ECC 捆绑。

对于手动安装，源文件位于：
- `agents/tdd-guide.md`
- `skills/tdd-workflow/SKILL.md`
```
