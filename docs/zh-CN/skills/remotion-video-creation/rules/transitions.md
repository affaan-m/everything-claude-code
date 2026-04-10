---
name: transitions
description: Remotion 的全屏场景过渡效果。
metadata:
  tags: transitions, fade, slide, wipe, scenes
---

## 全屏过渡效果

使用 `<TransitionSeries>` 在多个场景或片段之间进行动画过渡。
这将绝对定位子元素。

## 前提条件

首先，需要安装 @remotion/transitions 包。
如果尚未安装，请使用以下命令：

```bash
npx remotion add @remotion/transitions # If project uses npm
bunx remotion add @remotion/transitions # If project uses bun
yarn remotion add @remotion/transitions # If project uses yarn
pnpm exec remotion add @remotion/transitions # If project uses pnpm
```

## 使用示例

```tsx
import {TransitionSeries, linearTiming} from '@remotion/transitions';
import {fade} from '@remotion/transitions/fade';

<TransitionSeries>
  <TransitionSeries.Sequence durationInFrames={60}>
    <SceneA />
  </TransitionSeries.Sequence>
  <TransitionSeries.Transition presentation={fade()} timing={linearTiming({durationInFrames: 15})} />
  <TransitionSeries.Sequence durationInFrames={60}>
    <SceneB />
  </TransitionSeries.Sequence>
</TransitionSeries>;
```

## 可用的过渡类型

从各自的模块导入过渡效果：

```tsx
import {fade} from '@remotion/transitions/fade';
import {slide} from '@remotion/transitions/slide';
import {wipe} from '@remotion/transitions/wipe';
import {flip} from '@remotion/transitions/flip';
import {clockWipe} from '@remotion/transitions/clock-wipe';
```

## 带方向的滑动过渡

为进入/退出动画指定滑动方向。

```tsx
import {slide} from '@remotion/transitions/slide';

<TransitionSeries.Transition presentation={slide({direction: 'from-left'})} timing={linearTiming({durationInFrames: 20})} />;
```

方向：`"from-left"`、`"from-right"`、`"from-top"`、`"from-bottom"`

## 时序选项

```tsx
import {linearTiming, springTiming} from '@remotion/transitions';

// Linear timing - constant speed
linearTiming({durationInFrames: 20});

// Spring timing - organic motion
springTiming({config: {damping: 200}, durationInFrames: 25});
```

## 持续时间计算

过渡会与相邻场景重叠，因此合成的总长度**短于**所有序列持续时间之和。

例如，有两个 60 帧的序列和一个 15 帧的过渡：

* 无过渡：`60 + 60 = 120` 帧
* 有过渡：`60 + 60 - 15 = 105` 帧

持续时间被减去是因为在过渡期间两个场景同时播放。

### 获取过渡的持续时间

在时序对象上使用 `getDurationInFrames()` 方法：

```tsx
import {linearTiming, springTiming} from '@remotion/transitions';

const linearDuration = linearTiming({durationInFrames: 20}).getDurationInFrames({fps: 30});
// Returns 20

const springDuration = springTiming({config: {damping: 200}}).getDurationInFrames({fps: 30});
// Returns calculated duration based on spring physics
```

对于没有显式指定 `durationInFrames` 的 `springTiming`，其持续时间取决于 `fps`，因为它计算的是弹簧动画何时稳定。

### 计算合成总持续时间

```tsx
import {linearTiming} from '@remotion/transitions';

const scene1Duration = 60;
const scene2Duration = 60;
const scene3Duration = 60;

const timing1 = linearTiming({durationInFrames: 15});
const timing2 = linearTiming({durationInFrames: 20});

const transition1Duration = timing1.getDurationInFrames({fps: 30});
const transition2Duration = timing2.getDurationInFrames({fps: 30});

const totalDuration = scene1Duration + scene2Duration + scene3Duration - transition1Duration - transition2Duration;
// 60 + 60 + 60 - 15 - 20 = 145 frames
```
