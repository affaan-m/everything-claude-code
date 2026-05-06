---
name: transitions
description: Remotion 的全屏场景过渡效果。
metadata:
  tags: transitions, fade, slide, wipe, scenes
---

## 全屏过渡

使用 `<TransitionSeries>` 在多个场景或片段之间制作动画效果。
这会将子元素设置为绝对定位。

## 前置条件

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

## 时间选项

```tsx
import {linearTiming, springTiming} from '@remotion/transitions';

// Linear timing - constant speed
linearTiming({durationInFrames: 20});

// Spring timing - organic motion
springTiming({config: {damping: 200}, durationInFrames: 25});
```

## 时长计算

过渡效果会使相邻场景重叠，因此合成总时长**小于**所有序列时长的总和。

例如，两个 60 帧的序列加上 15 帧的过渡：

* 无过渡：`60 + 60 = 120` 帧
* 有过渡：`60 + 60 - 15 = 105` 帧

过渡时长被减去，因为过渡期间两个场景会同时播放。

### 获取过渡时长

使用时间对象上的 `getDurationInFrames()` 方法：

```tsx
import {linearTiming, springTiming} from '@remotion/transitions';

const linearDuration = linearTiming({durationInFrames: 20}).getDurationInFrames({fps: 30});
// Returns 20

const springDuration = springTiming({config: {damping: 200}}).getDurationInFrames({fps: 30});
// Returns calculated duration based on spring physics
```

对于没有显式 `durationInFrames` 的 `springTiming`，时长取决于 `fps`，因为它会计算弹簧动画何时稳定。

### 计算合成总时长

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
