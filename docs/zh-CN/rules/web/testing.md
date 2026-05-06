> 此文件在 [common/testing.md](../common/testing.md) 基础上扩展了 Web 专属测试内容。

# Web 测试规则

## 优先级顺序

### 1. 视觉回归测试

* 对关键断点进行截图：320、768、1024、1440
* 测试英雄区域、滚动叙事区域及有意义的状态
* 对视觉密集型工作使用 Playwright 截图
* 若存在两种主题，则均需测试

### 2. 无障碍测试

* 运行自动化无障碍检查
* 测试键盘导航
* 验证减少动效行为
* 验证色彩对比度

### 3. 性能测试

* 对有意义页面运行 Lighthouse 或等效工具
* 保持 [performance.md](performance.md) 中的 CWV 目标

### 4. 跨浏览器测试

* 最低要求：Chrome、Firefox、Safari
* 测试滚动、动效及降级行为

### 5. 响应式测试

* 测试 320、375、768、1024、1440、1920 断点
* 验证无溢出
* 验证触摸交互

## 端到端测试形态

```ts
import { test, expect } from '@playwright/test';

test('landing hero loads', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('h1')).toBeVisible();
});
```

* 避免基于超时的脆弱断言
* 优先使用确定性等待

## 单元测试

* 测试工具函数、数据转换及自定义 Hook
* 对于高度视觉化的组件，视觉回归测试通常比脆弱的标记断言更具参考价值
* 视觉回归测试补充覆盖率目标，而非替代它们
