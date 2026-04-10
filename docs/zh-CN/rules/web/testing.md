> 此文件在 [common/testing.md](../common/testing.md) 的基础上扩展了特定于 Web 的测试内容。

# Web 测试规则

## 优先级顺序

### 1. 视觉回归

* 截取关键断点的屏幕截图：320、768、1024、1440
* 测试英雄区域、滚动叙事区域以及有意义的状态
* 对于视觉密集型工作，使用 Playwright 截图
* 如果存在两种主题，则测试两者

### 2. 可访问性

* 运行自动化可访问性检查
* 测试键盘导航
* 验证减少动画效果的行为
* 验证颜色对比度

### 3. 性能

* 对重要页面运行 Lighthouse 或等效工具
* 保持 [performance.md](performance.md) 中的 CWV 目标

### 4. 跨浏览器

* 最低要求：Chrome、Firefox、Safari
* 测试滚动、动画和回退行为

### 5. 响应式

* 测试 320、375、768、1024、1440、1920
* 验证无内容溢出
* 验证触摸交互

## E2E 结构

```ts
import { test, expect } from '@playwright/test';

test('landing hero loads', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('h1')).toBeVisible();
});
```

* 避免使用不稳定的基于超时的断言
* 优先使用确定性等待

## 单元测试

* 测试工具函数、数据转换和自定义钩子
* 对于高度视觉化的组件，视觉回归通常比脆弱的标记断言提供更多信息
* 视觉回归补充覆盖率目标；它不能替代它们
