---
name: charts
description: Remotion的图表和数据可视化模式。适用于创建条形图、饼图、直方图、进度条或任何数据驱动的动画。
metadata:
  tags: charts, data, visualization, bar-chart, pie-chart, graphs
---

# Remotion 中的图表

你可以使用常规的 React 代码在 Remotion 中创建条形图——允许使用 HTML 和 SVG，也可以使用 D3.js。

## 不由 `useCurrentFrame()` 驱动的动画

禁用所有第三方库的动画。
它们会在渲染过程中导致闪烁。
相反，所有动画都应通过 `useCurrentFrame()` 来驱动。

## 条形图动画

查看 [条形图示例](../../../../../skills/remotion-video-creation/rules/assets/charts/bar-chart.tsx) 了解一个基本的示例实现。

### 交错条形

你可以像这样为条形的高度设置动画并使其交错出现：

```tsx
const STAGGER_DELAY = 5;
const frame = useCurrentFrame();
const {fps} = useVideoConfig();

const bars = data.map((item, i) => {
  const delay = i * STAGGER_DELAY;
  const height = spring({
    frame,
    fps,
    delay,
    config: {damping: 200},
  });
  return <div style={{height: height * item.value}} />;
});
```

## 饼图动画

使用 stroke-dashoffset 为扇区设置动画，从 12 点钟方向开始。

```tsx
const frame = useCurrentFrame();
const {fps} = useVideoConfig();

const progress = interpolate(frame, [0, 100], [0, 1]);

const circumference = 2 * Math.PI * radius;
const segmentLength = (value / total) * circumference;
const offset = interpolate(progress, [0, 1], [segmentLength, 0]);

<circle r={radius} cx={center} cy={center} fill="none" stroke={color} strokeWidth={strokeWidth} strokeDasharray={`${segmentLength} ${circumference}`} strokeDashoffset={offset} transform={`rotate(-90 ${center} ${center})`} />;
```
