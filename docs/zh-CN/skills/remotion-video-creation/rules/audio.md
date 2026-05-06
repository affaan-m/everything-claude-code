---
name: audio
description: 在Remotion中使用音频和声音 - 导入、修剪、音量、速度、音调
metadata:
  tags: audio, media, trim, volume, speed, loop, pitch, mute, sound, sfx
---

# 在 Remotion 中使用音频

## 前置条件

首先需要安装 @remotion/media 包。
如果尚未安装，请使用以下命令：

```bash
npx remotion add @remotion/media # If project uses npm
bunx remotion add @remotion/media # If project uses bun
yarn remotion add @remotion/media # If project uses yarn
pnpm exec remotion add @remotion/media # If project uses pnpm
```

## 导入音频

使用 `<Audio>` 从 `@remotion/media` 导入音频到你的合成中。

```tsx
import { Audio } from "@remotion/media";
import { staticFile } from "remotion";

export const MyComposition = () => {
  return <Audio src={staticFile("audio.mp3")} />;
};
```

也支持远程 URL：

```tsx
<Audio src="https://remotion.media/audio.mp3" />
```

默认情况下，音频从开头开始播放，以最大音量和完整长度播放。
可以通过添加多个 `<Audio>` 组件来叠加多个音轨。

## 裁剪

使用 `trimBefore` 和 `trimAfter` 移除音频的某些部分。数值以帧为单位。

```tsx
const { fps } = useVideoConfig();

return (
  <Audio
    src={staticFile("audio.mp3")}
    trimBefore={2 * fps} // Skip the first 2 seconds
    trimAfter={10 * fps} // End at the 10 second mark
  />
);
```

音频仍然从合成开始时开始播放——仅播放指定的部分。

## 延迟

将音频包裹在 `<Sequence>` 中以延迟其开始时间：

```tsx
import { Sequence, staticFile } from "remotion";
import { Audio } from "@remotion/media";

const { fps } = useVideoConfig();

return (
  <Sequence from={1 * fps}>
    <Audio src={staticFile("audio.mp3")} />
  </Sequence>
);
```

音频将在 1 秒后开始播放。

## 音量

设置静态音量（0 到 1）：

```tsx
<Audio src={staticFile("audio.mp3")} volume={0.5} />
```

或使用基于当前帧的动态音量回调函数：

```tsx
import { interpolate } from "remotion";

const { fps } = useVideoConfig();

return (
  <Audio
    src={staticFile("audio.mp3")}
    volume={(f) =>
      interpolate(f, [0, 1 * fps], [0, 1], { extrapolateRight: "clamp" })
    }
  />
);
```

`f` 的值从音频开始播放时开始计算，而非合成帧。

## 静音

使用 `muted` 使音频静音。可以动态设置：

```tsx
const frame = useCurrentFrame();
const { fps } = useVideoConfig();

return (
  <Audio
    src={staticFile("audio.mp3")}
    muted={frame >= 2 * fps && frame <= 4 * fps} // Mute between 2s and 4s
  />
);
```

## 速度

使用 `playbackRate` 更改播放速度：

```tsx
<Audio src={staticFile("audio.mp3")} playbackRate={2} /> {/* 2x speed */}
<Audio src={staticFile("audio.mp3")} playbackRate={0.5} /> {/* Half speed */}
```

不支持反向播放。

## 循环

使用 `loop` 无限循环播放音频：

```tsx
<Audio src={staticFile("audio.mp3")} loop />
```

使用 `loopVolumeCurveBehavior` 控制循环时帧计数的行为：

* `"repeat"`：每次循环帧计数重置为 0（默认）
* `"extend"`：帧计数持续递增

```tsx
<Audio
  src={staticFile("audio.mp3")}
  loop
  loopVolumeCurveBehavior="extend"
  volume={(f) => interpolate(f, [0, 300], [1, 0])} // Fade out over multiple loops
/>
```

## 音调

使用 `toneFrequency` 在不影响速度的情况下调整音调。取值范围为 0.01 到 2：

```tsx
<Audio
  src={staticFile("audio.mp3")}
  toneFrequency={1.5} // Higher pitch
/>
<Audio
  src={staticFile("audio.mp3")}
  toneFrequency={0.8} // Lower pitch
/>
```

音调偏移仅在服务端渲染时生效，在 Remotion Studio 预览或 `<Player />` 中无效。
