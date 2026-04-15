> 此文件在 [common/performance.md](../common/performance.md) 的基础上扩展了特定于 Web 的性能内容。

# Web 性能规则

## 核心 Web 指标目标

| 指标 | 目标 |
|--------|--------|
| LCP | < 2.5s |
| INP | < 200ms |
| CLS | < 0.1 |
| FCP | < 1.5s |
| TBT | < 200ms |

## 包预算

| 页面类型 | JS 预算 (gzipped) | CSS 预算 |
|-----------|---------------------|------------|
| 着陆页 | < 150kb | < 30kb |
| 应用页面 | < 300kb | < 50kb |
| 微型网站 | < 80kb | < 15kb |

## 加载策略

1. 在合理的情况下，内联首屏关键 CSS
2. 仅预加载首屏图片和主要字体
3. 延迟加载非关键 CSS 或 JS
4. 动态导入重型库

```js
const gsapModule = await import('gsap');
const { ScrollTrigger } = await import('gsap/ScrollTrigger');
```

## 图片优化

* 显式指定 `width` 和 `height`
* 仅对首屏媒体使用 `loading="eager"` 加 `fetchpriority="high"`
* 对首屏以下资源使用 `loading="lazy"`
* 优先使用 AVIF 或 WebP 格式并提供回退方案
* 切勿提供远超渲染尺寸的源图片

## 字体加载

* 最多使用两种字体族，除非有明确例外
* `font-display: swap`
* 在可能的情况下使用子集
* 仅预加载真正关键的字体粗细/样式

## 动画性能

* 仅对合成器友好的属性进行动画处理
* 谨慎使用 `will-change`，并在完成后移除
* 对于简单过渡，优先使用 CSS
* 对于 JS 动画，使用 `requestAnimationFrame` 或成熟的动画库
* 避免滚动处理程序频繁触发；使用 IntersectionObserver 或行为良好的库

## 性能检查清单

* \[ ] 所有图片都有明确的尺寸
* \[ ] 没有意外的渲染阻塞资源
* \[ ] 动态内容不会导致布局偏移
* \[ ] 动画保持在合成器友好的属性上
* \[ ] 第三方脚本异步/延迟加载，且仅在需要时加载
