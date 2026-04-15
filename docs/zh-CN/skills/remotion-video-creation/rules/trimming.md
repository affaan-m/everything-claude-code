---
name: trimming
description: Remotion 的修剪模式 - 裁剪动画的开头或结尾
metadata:
  tags: sequence, trim, clip, cut, offset
---

使用负值的 `<Sequence>` 来裁剪动画的开头。

## 裁剪开头

负值的 `from` 会将时间向后推移，使动画从中间开始播放：

```tsx
import { Sequence, useVideoConfig } from "remotion";

const fps = useVideoConfig();

<Sequence from={-0.5 * fps}>
  <MyAnimation />
</Sequence>
```

动画从其进度的第 15 帧处开始出现——前 15 帧被裁剪掉了。
在 `<MyAnimation>` 内部，`useCurrentFrame()` 从 15 开始，而不是 0。

## 裁剪结尾

使用 `durationInFrames` 在指定时长后卸载内容：

```tsx

<Sequence durationInFrames={1.5 * fps}>
  <MyAnimation />
</Sequence>
```

动画播放 45 帧，然后组件卸载。

## 裁剪与延迟

嵌套序列可以同时裁剪开头并延迟其出现时间：

```tsx
<Sequence from={30}>
  <Sequence from={-15}>
    <MyAnimation />
  </Sequence>
</Sequence>
```

内部序列裁剪掉开头的 15 帧，外部序列将结果延迟 30 帧。
