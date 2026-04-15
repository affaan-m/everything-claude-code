---
description: 用于端到端测试技能的旧版斜杠入口垫片。建议直接使用该技能。
---

# E2E 命令（旧版适配层）

仅当您仍调用 `/e2e` 时使用此命令。维护中的工作流位于 `skills/e2e-testing/SKILL.md`。

## 规范用法

* 首选直接使用 `e2e-testing` 技能。
* 仅将此文件保留为兼容性入口点。

## 参数

`$ARGUMENTS`

## 委托

应用 `e2e-testing` 技能。

* 为请求的用户流程生成或更新 Playwright 覆盖率。
* 仅运行相关测试，除非用户明确要求整个套件。
* 捕获常规工件并报告失败、不稳定风险以及后续修复，无需在此处重复完整的技能主体。
  await marketsPage.searchMarkets('xyznonexistentmarket123456')

  // 验证空状态
  await expect(page.locator('\[data-testid="no-results"]')).toBeVisible()
  await expect(page.locator('\[data-testid="no-results"]')).toContainText(
  /no.\*results|no.\*markets/i
  )

  const marketCount = await marketsPage.marketCards.count()
  expect(marketCount).toBe(0)
  })

  test('can clear search and see all markets again', async ({ page }) => {
  const marketsPage = new MarketsPage(page)
  await marketsPage.goto()

  // 初始市场数量
  const initialCount = await marketsPage.marketCards.count()

  // 执行搜索
  await marketsPage.searchMarkets('trump')
  await page.waitForLoadState('networkidle')

  // 验证筛选结果
  const filteredCount = await marketsPage.marketCards.count()
  expect(filteredCount).toBeLessThan(initialCount)

  // 清除搜索
  await marketsPage.searchInput.clear()
  await page.waitForLoadState('networkidle')

  // 验证再次显示所有市场
  const finalCount = await marketsPage.marketCards.count()
  expect(finalCount).toBe(initialCount)
  })
  })

````

## 运行测试

```bash
# 运行生成的测试
npx playwright test tests/e2e/markets/search-and-view.spec.ts

Running 3 tests using 3 workers

  ✓  [chromium] › search-and-view.spec.ts:5:3 › user can search markets and view details (4.2s)
  ✓  [chromium] › search-and-view.spec.ts:52:3 › search with no results shows empty state (1.8s)
  ✓  [chromium] › search-and-view.spec.ts:67:3 › can clear search and see all markets again (2.9s)

  3 passed (9.1s)

Artifacts generated:
- artifacts/search-results.png
- artifacts/market-details.png
- playwright-report/index.html
````

## 测试报告

```
╔══════════════════════════════════════════════════════════════╗
║                    端到端测试结果                          ║
╠══════════════════════════════════════════════════════════════╣
║ 状态:     通过: 所有测试通过                              ║
║ 总计:      3 项测试                                          ║
║ 通过:      3 (100%)                                         ║
║ 失败:      0                                                ║
║ 不稳定:    0                                                ║
║ 耗时:      9.1秒                                             ║
╚══════════════════════════════════════════════════════════════╝

产物:
 截图: 2 个文件
 视频: 0 个文件 (仅在失败时生成)
 追踪: 0 个文件 (仅在失败时生成)
 HTML 报告: playwright-report/index.html

查看报告: npx playwright show-report
```

通过：E2E 测试套件已准备好进行 CI/CD 集成！

````
## 测试产物

当测试运行时，会捕获以下产物：

**所有测试：**
- 包含时间线和结果的 HTML 报告
- 用于 CI 集成的 JUnit XML 文件

**仅在失败时：**
- 失败状态的截图
- 测试的视频录制
- 用于调试的追踪文件（逐步重放）
- 网络日志
- 控制台日志

## 查看产物

```bash
# 在浏览器中查看 HTML 报告
npx playwright show-report

# 查看特定的追踪文件
npx playwright show-trace artifacts/trace-abc123.zip

# 截图保存在 artifacts/ 目录中
open artifacts/search-results.png

````

## 不稳定测试检测

如果测试间歇性失败：

```
警告：检测到不稳定测试：tests/e2e/markets/trade.spec.ts

测试通过 7/10 次运行（通过率 70%）

常见失败原因：
"等待元素 '[data-testid="confirm-btn"]' 超时"

推荐修复方法：
1. 添加显式等待：await page.waitForSelector('[data-testid="confirm-btn"]')
2. 增加超时时间：{ timeout: 10000 }
3. 检查组件中的竞态条件
4. 确认元素未被动画隐藏

隔离建议：在修复前标记为 test.fixme()
```

## 浏览器配置

默认情况下，测试在多个浏览器上运行：

* 通过：Chromium（桌面版 Chrome）
* 通过：Firefox（桌面版）
* 通过：WebKit（桌面版 Safari）
* 通过：移动版 Chrome（可选）

在 `playwright.config.ts` 中配置以调整浏览器。

## CI/CD 集成

添加到您的 CI 流水线：

```yaml
# .github/workflows/e2e.yml
- name: Install Playwright
  run: npx playwright install --with-deps

- name: Run E2E tests
  run: npx playwright test

- name: Upload artifacts
  if: always()
  uses: actions/upload-artifact@v3
  with:
    name: playwright-report
    path: playwright-report/
```

## PMX 特定的关键流程

对于 PMX，请优先考虑以下 E2E 测试：

**关键（必须始终通过）：**

1. 用户可以连接钱包
2. 用户可以浏览市场
3. 用户可以搜索市场（语义搜索）
4. 用户可以查看市场详情
5. 用户可以下交易单（使用测试资金）
6. 市场正确结算
7. 用户可以提取资金

**重要：**

1. 市场创建流程
2. 用户资料更新
3. 实时价格更新
4. 图表渲染
5. 过滤和排序市场
6. 移动端响应式布局

## 最佳实践

**应该：**

* 通过：使用页面对象模型以提高可维护性
* 通过：使用 data-testid 属性作为选择器
* 通过：等待 API 响应，而非任意超时
* 通过：测试端到端的关键用户旅程
* 通过：在合并到主分支前运行测试
* 通过：测试失败时审查工件

**不应该：**

* 失败：使用脆弱的选择器（CSS 类可能更改）
* 失败：测试实现细节
* 失败：针对生产环境运行测试
* 失败：忽略不稳定的测试
* 失败：失败时跳过工件审查
* 失败：使用 E2E 测试每个边缘情况（应使用单元测试）

## 重要注意事项

**对 PMX 至关重要：**

* 涉及真实资金的 E2E 测试**必须**仅在测试网/暂存环境中运行
* 切勿针对生产环境运行交易测试
* 为金融测试设置 `test.skip(process.env.NODE_ENV === 'production')`
* 仅使用带有少量测试资金的测试钱包

## 与其他命令的集成

* 使用 `/plan` 来识别要测试的关键旅程
* 使用 `/tdd` 进行单元测试（更快、更细粒度）
* 使用 `/e2e` 进行集成和用户旅程测试
* 使用 `/code-review` 来验证测试质量

## 相关代理

此命令调用由 ECC 提供的 `e2e-runner` 代理。

对于手动安装，源文件位于：
`agents/e2e-runner.md`

## 快速命令

```bash
# Run all E2E tests
npx playwright test

# Run specific test file
npx playwright test tests/e2e/markets/search.spec.ts

# Run in headed mode (see browser)
npx playwright test --headed

# Debug test
npx playwright test --debug

# Generate test code
npx playwright codegen http://localhost:3000

# View report
npx playwright show-report
```
