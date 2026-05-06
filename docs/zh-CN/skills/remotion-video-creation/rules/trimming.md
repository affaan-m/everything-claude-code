---
name: trimming
description: Remotion 的修剪模式 - 裁剪动画的开头或结尾
metadata:
  tags: sequence, trim, clip, cut, offset
---

使用 `<Sequence>` 并设置负值的 `from` 来裁剪动画的开头部分。

## 裁剪开头

负值的 `from` 会使时间向后偏移，让动画从中间部分开始播放：

```tsx
import { Sequence, useVideoConfig } from "remotion";

const fps = useVideoConfig();

<Sequence from={-0.5 * fps}>
  <MyAnimation />
</Sequence>
```

动画会从其进度的第15帧开始显示——前15帧被裁剪掉了。
在 `<MyAnimation>` 内部，`useCurrentFrame()` 从15开始计数，而非0。

## 裁剪结尾

使用 `durationInFrames` 在指定时长后卸载内容：

```tsx

<Sequence durationInFrames={1.5 * fps}>
  <MyAnimation />
</Sequence>
```

动画播放45帧后，组件会卸载。

## 裁剪与延迟

通过嵌套序列，可以同时实现裁剪开头和延迟显示：

```tsx
<Sequence from={30}>
  <Sequence from={-15}>
    <MyAnimation />
  </Sequence>
</Sequence>
```

内部序列从开头裁剪了15帧，外部序列则将结果延迟了30帧显示。
