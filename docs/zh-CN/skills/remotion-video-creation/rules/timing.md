---
name: timing
description: Remotion中的插值曲线 - 线性、缓动、弹簧动画
metadata:
  tags: spring, bounce, easing, interpolation
---

使用 `interpolate` 函数进行简单的线性插值。

```ts title="Going from 0 to 1 over 100 frames"
import {interpolate} from 'remotion';

const opacity = interpolate(frame, [0, 100], [0, 1]);
```

默认情况下，数值不会被限制，因此值可以超出 \[0, 1] 范围。
以下是限制数值的方法：

```ts title="Going from 0 to 1 over 100 frames with extrapolation"
const opacity = interpolate(frame, [0, 100], [0, 1], {
  extrapolateRight: 'clamp',
  extrapolateLeft: 'clamp',
});
```

## 弹簧动画

弹簧动画具有更自然的运动效果。
它们随时间从 0 变化到 1。

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
这会导致动画在稳定前产生轻微弹跳。

配置可以像这样覆盖：

```ts
const scale = spring({
  frame,
  fps,
  config: {damping: 200},
});
```

无弹跳自然运动的推荐配置为：`{ damping: 200 }`。

以下是一些常见配置：

```tsx
const smooth = {damping: 200}; // Smooth, no bounce (subtle reveals)
const snappy = {damping: 20, stiffness: 200}; // Snappy, minimal bounce (UI elements)
const bouncy = {damping: 8}; // Bouncy entrance (playful animations)
const heavy = {damping: 15, stiffness: 80, mass: 2}; // Heavy, slow, small bounce
```

### 延迟

动画默认立即开始。
使用 `delay` 参数将动画延迟若干帧。

```tsx
const entrance = spring({
  frame: frame - ENTRANCE_DELAY,
  fps,
  delay: 20,
});
```

### 持续时间

`spring()` 根据物理属性具有自然持续时间。
要拉伸动画至特定时长，请使用 `durationInFrames` 参数。

```tsx
const spring = spring({
  frame,
  fps,
  durationInFrames: 40,
});
```

### 结合 spring() 与 interpolate()

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

### 叠加弹簧

弹簧仅返回数值，因此可进行数学运算：

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

可以为 `interpolate` 函数添加缓动效果：

```ts
import {interpolate, Easing} from 'remotion';

const value1 = interpolate(frame, [0, 100], [0, 1], {
  easing: Easing.inOut(Easing.quad),
  extrapolateLeft: 'clamp',
  extrapolateRight: 'clamp',
});
```

默认缓动为 `Easing.linear`。
还有其他各种凸度类型：

* `Easing.in` 用于慢速启动并加速
* `Easing.out` 用于快速启动并减速
* `Easing.inOut`

以及曲线（按从最线性到最弯曲排序）：

* `Easing.quad`
* `Easing.sin`
* `Easing.exp`
* `Easing.circle`

凸度和曲线需要组合成缓动函数：

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
