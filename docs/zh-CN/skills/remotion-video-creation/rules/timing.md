---
name: timing
description: Remotion 中的插值曲线 - 线性、缓动、弹簧动画
metadata:
  tags: spring, bounce, easing, interpolation
---

简单的线性插值使用 `interpolate` 函数完成。

```ts title="Going from 0 to 1 over 100 frames"
import {interpolate} from 'remotion';

const opacity = interpolate(frame, [0, 100], [0, 1]);
```

默认情况下，数值不会被钳制，因此值可能超出范围 \[0, 1]。
以下是如何进行钳制：

```ts title="Going from 0 to 1 over 100 frames with extrapolation"
const opacity = interpolate(frame, [0, 100], [0, 1], {
  extrapolateRight: 'clamp',
  extrapolateLeft: 'clamp',
});
```

## 弹簧动画

弹簧动画具有更自然的运动效果。
它们会随时间从 0 变化到 1。

```ts title="Spring animation from 0 to 1 over 100 frames"
import {spring, useCurrentFrame, useVideoConfig} from 'remotion';

const frame = useCurrentFrame();
const {fps} = useVideoConfig();

const scale = spring({
  frame,
  fps,
});
```

### 物理属性

默认配置为：`mass: 1, damping: 10, stiffness: 100`。
这会导致动画在稳定前有一些反弹。

可以像这样覆盖配置：

```ts
const scale = spring({
  frame,
  fps,
  config: {damping: 200},
});
```

推荐用于无反弹自然运动的配置是：`{ damping: 200 }`。

以下是一些常见配置：

```tsx
const smooth = {damping: 200}; // Smooth, no bounce (subtle reveals)
const snappy = {damping: 20, stiffness: 200}; // Snappy, minimal bounce (UI elements)
const bouncy = {damping: 8}; // Bouncy entrance (playful animations)
const heavy = {damping: 15, stiffness: 80, mass: 2}; // Heavy, slow, small bounce
```

### 延迟

默认情况下，动画立即开始。
使用 `delay` 参数可以将动画延迟指定的帧数。

```tsx
const entrance = spring({
  frame: frame - ENTRANCE_DELAY,
  fps,
  delay: 20,
});
```

### 持续时间

`spring()` 具有基于物理属性的自然持续时间。
要将动画拉伸到特定持续时间，请使用 `durationInFrames` 参数。

```tsx
const spring = spring({
  frame,
  fps,
  durationInFrames: 40,
});
```

### 将 spring() 与 interpolate() 结合使用

将弹簧输出（0-1）映射到自定义范围：

```tsx
const springProgress = spring({
  frame,
  fps,
});

// Map to rotation
const rotation = interpolate(springProgress, [0, 1], [0, 360]);

<div style={{rotate: rotation + 'deg'}} />;
```

### 添加弹簧

弹簧仅返回数字，因此可以进行数学运算：

```tsx
const frame = useCurrentFrame();
const {fps, durationInFrames} = useVideoConfig();

const inAnimation = spring({
  frame,
  fps,
});
const outAnimation = spring({
  frame,
  fps,
  durationInFrames: 1 * fps,
  delay: durationInFrames - 1 * fps,
});

const scale = inAnimation - outAnimation;
```

## 缓动

可以在 `interpolate` 函数中添加缓动效果：

```ts
import {interpolate, Easing} from 'remotion';

const value1 = interpolate(frame, [0, 100], [0, 1], {
  easing: Easing.inOut(Easing.quad),
  extrapolateLeft: 'clamp',
  extrapolateRight: 'clamp',
});
```

默认的缓动函数是 `Easing.linear`。
还有其他各种凸度：

* `Easing.in` 用于缓慢开始并加速
* `Easing.out` 用于快速开始并减速
* `Easing.inOut`

以及曲线（从最线性到最弯曲排序）：

* `Easing.quad`
* `Easing.sin`
* `Easing.exp`
* `Easing.circle`

凸度和曲线需要组合以形成缓动函数：

```ts
const value1 = interpolate(frame, [0, 100], [0, 1], {
  easing: Easing.inOut(Easing.quad),
  extrapolateLeft: 'clamp',
  extrapolateRight: 'clamp',
});
```

也支持三次贝塞尔曲线：

```ts
const value1 = interpolate(frame, [0, 100], [0, 1], {
  easing: Easing.bezier(0.8, 0.22, 0.96, 0.65),
  extrapolateLeft: 'clamp',
  extrapolateRight: 'clamp',
});
```
