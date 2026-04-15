---
name: videos
description: 在Remotion中嵌入视频 - 修剪、音量、速度、循环、音高
metadata:
  tags: video, media, trim, volume, speed, loop, pitch
---

# 在 Remotion 中使用视频

## 先决条件

首先，需要安装 @remotion/media 包。
如果尚未安装，请使用以下命令：

```bash
npx remotion add @remotion/media # If project uses npm
bunx remotion add @remotion/media # If project uses bun
yarn remotion add @remotion/media # If project uses yarn
pnpm exec remotion add @remotion/media # If project uses pnpm
```

使用来自 `@remotion/media` 的 `<Video>` 将视频嵌入到你的合成中。

```tsx
import { Video } from "@remotion/media";
import { staticFile } from "remotion";

export const MyComposition = () => {
  return <Video src={staticFile("video.mp4")} />;
};
```

也支持远程 URL：

```tsx
<Video src="https://remotion.media/video.mp4" />
```

## 修剪

使用 `trimBefore` 和 `trimAfter` 来移除视频的部分片段。值以秒为单位。

```tsx
const { fps } = useVideoConfig();

return (
  <Video
    src={staticFile("video.mp4")}
    trimBefore={2 * fps} // Skip the first 2 seconds
    trimAfter={10 * fps} // End at the 10 second mark
  />
);
```

## 延迟

将视频包裹在 `<Sequence>` 中以延迟其出现时间：

```tsx
import { Sequence, staticFile } from "remotion";
import { Video } from "@remotion/media";

const { fps } = useVideoConfig();

return (
  <Sequence from={1 * fps}>
    <Video src={staticFile("video.mp4")} />
  </Sequence>
);
```

视频将在 1 秒后出现。

## 尺寸和位置

使用 `style` 属性来控制尺寸和位置：

```tsx
<Video
  src={staticFile("video.mp4")}
  style={{
    width: 500,
    height: 300,
    position: "absolute",
    top: 100,
    left: 50,
    objectFit: "cover",
  }}
/>
```

## 音量

设置静态音量（0 到 1）：

```tsx
<Video src={staticFile("video.mp4")} volume={0.5} />
```

或者使用回调函数根据当前帧动态调整音量：

```tsx
import { interpolate } from "remotion";

const { fps } = useVideoConfig();

return (
  <Video
    src={staticFile("video.mp4")}
    volume={(f) =>
      interpolate(f, [0, 1 * fps], [0, 1], { extrapolateRight: "clamp" })
    }
  />
);
```

使用 `muted` 来完全静音视频：

```tsx
<Video src={staticFile("video.mp4")} muted />
```

## 速度

使用 `playbackRate` 来改变播放速度：

```tsx
<Video src={staticFile("video.mp4")} playbackRate={2} /> {/* 2x speed */}
<Video src={staticFile("video.mp4")} playbackRate={0.5} /> {/* Half speed */}
```

不支持反向播放。

## 循环

使用 `loop` 来无限循环视频：

```tsx
<Video src={staticFile("video.mp4")} loop />
```

使用 `loopVolumeCurveBehavior` 来控制循环时帧计数的行为：

* `"repeat"`：每次循环帧计数重置为 0（适用于 `volume` 回调）
* `"extend"`：帧计数持续递增

```tsx
<Video
  src={staticFile("video.mp4")}
  loop
  loopVolumeCurveBehavior="extend"
  volume={(f) => interpolate(f, [0, 300], [1, 0])} // Fade out over multiple loops
/>
```

## 音高

使用 `toneFrequency` 来调整音高而不影响速度。值范围从 0.01 到 2：

```tsx
<Video
  src={staticFile("video.mp4")}
  toneFrequency={1.5} // Higher pitch
/>
<Video
  src={staticFile("video.mp4")}
  toneFrequency={0.8} // Lower pitch
/>
```

音高变换仅在服务器端渲染时有效，在 Remotion Studio 预览或 `<Player />` 中无效。
