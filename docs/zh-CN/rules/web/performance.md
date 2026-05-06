> 此文件在 [common/performance.md](../common/performance.md) 基础上扩展了 Web 专属性能内容。

# Web 性能规则

## 核心 Web 指标目标

| 指标 | 目标 |
|--------|--------|
| LCP | < 2.5s |
| INP | < 200ms |
| CLS | < 0.1 |
| FCP | < 1.5s |
| TBT | < 200ms |

## 打包预算

| 页面类型 | JS 预算（gzip 压缩后） | CSS 预算 |
|-----------|---------------------|------------|
| 落地页 | < 150kb | < 30kb |
| 应用页 | < 300kb | < 50kb |
| 微站点 | < 80kb | < 15kb |

## 加载策略

1. 在合理情况下内联首屏关键 CSS
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
* 对非首屏资源使用 `loading="lazy"`
* 优先使用 AVIF 或 WebP 格式并设置回退
* 切勿提供远超实际渲染尺寸的源图片

## 字体加载

* 最多使用两种字体族，除非有明确例外
* `font-display: swap`
* 尽可能进行子集化
* 仅预加载真正关键的粗细/样式

## 动画性能

* 仅对合成器友好属性进行动画处理
* 谨慎使用 `will-change`，完成后立即移除
* 简单过渡优先使用 CSS
* JS 动画使用 `requestAnimationFrame` 或成熟的动画库
* 避免滚动处理程序频繁触发；使用 IntersectionObserver 或行为良好的库

## 性能检查清单

* \[ ] 所有图片均已指定尺寸
* \[ ] 无意外阻塞渲染的资源
* \[ ] 动态内容未导致布局偏移
* \[ ] 动画仅使用合成器友好属性
* \[ ] 第三方脚本仅在需要时以 async/defer 方式加载
