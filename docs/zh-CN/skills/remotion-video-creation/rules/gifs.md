---
name: gif
description: 在Remotion中显示GIF、APNG、AVIF和WebP
metadata:
  tags: gif, animation, images, animated, apng, avif, webp
---

# 在 Remotion 中使用动画图像

## 基本用法

使用 `<AnimatedImage>` 来显示与 Remotion 时间线同步的 GIF、APNG、AVIF 或 WebP 图像：

```tsx
import {AnimatedImage, staticFile} from 'remotion';

export const MyComposition = () => {
  return <AnimatedImage src={staticFile('animation.gif')} width={500} height={500} />;
};
```

也支持远程 URL（必须启用 CORS）：

```tsx
<AnimatedImage src="https://example.com/animation.gif" width={500} height={500} />
```

## 尺寸与适配

使用 `fit` 属性控制图像如何填充其容器：

```tsx
// Stretch to fill (default)
<AnimatedImage src={staticFile("animation.gif")} width={500} height={300} fit="fill" />

// Maintain aspect ratio, fit inside container
<AnimatedImage src={staticFile("animation.gif")} width={500} height={300} fit="contain" />

// Fill container, crop if needed
<AnimatedImage src={staticFile("animation.gif")} width={500} height={300} fit="cover" />
```

## 播放速度

使用 `playbackRate` 控制动画速度：

```tsx
<AnimatedImage src={staticFile("animation.gif")} width={500} height={500} playbackRate={2} /> {/* 2x speed */}
<AnimatedImage src={staticFile("animation.gif")} width={500} height={500} playbackRate={0.5} /> {/* Half speed */}
```

## 循环行为

控制动画结束时的行为：

```tsx
// Loop indefinitely (default)
<AnimatedImage src={staticFile("animation.gif")} width={500} height={500} loopBehavior="loop" />

// Play once, show final frame
<AnimatedImage src={staticFile("animation.gif")} width={500} height={500} loopBehavior="pause-after-finish" />

// Play once, then clear canvas
<AnimatedImage src={staticFile("animation.gif")} width={500} height={500} loopBehavior="clear-after-finish" />
```

## 样式

使用 `style` 属性添加额外的 CSS（使用 `width` 和 `height` 属性控制尺寸）：

```tsx
<AnimatedImage
  src={staticFile('animation.gif')}
  width={500}
  height={500}
  style={{
    borderRadius: 20,
    position: 'absolute',
    top: 100,
    left: 50,
  }}
/>
```

## 获取 GIF 时长

使用 `@remotion/gif` 中的 `getGifDurationInSeconds()` 来获取 GIF 的时长。

```bash
npx remotion add @remotion/gif # If project uses npm
bunx remotion add @remotion/gif # If project uses bun
yarn remotion add @remotion/gif # If project uses yarn
pnpm exec remotion add @remotion/gif # If project uses pnpm
```

```tsx
import {getGifDurationInSeconds} from '@remotion/gif';
import {staticFile} from 'remotion';

const duration = await getGifDurationInSeconds(staticFile('animation.gif'));
console.log(duration); // e.g. 2.5
```

这对于将合成时长设置为与 GIF 匹配非常有用：

```tsx
import {getGifDurationInSeconds} from '@remotion/gif';
import {staticFile, CalculateMetadataFunction} from 'remotion';

const calculateMetadata: CalculateMetadataFunction = async () => {
  const duration = await getGifDurationInSeconds(staticFile('animation.gif'));
  return {
    durationInFrames: Math.ceil(duration * 30),
  };
};
```

## 替代方案

如果 `<AnimatedImage>` 不工作（仅 Chrome 和 Firefox 支持），你可以改用 `@remotion/gif` 中的 `<Gif>`。

```bash
npx remotion add @remotion/gif # If project uses npm
bunx remotion add @remotion/gif # If project uses bun
yarn remotion add @remotion/gif # If project uses yarn
pnpm exec remotion add @remotion/gif # If project uses pnpm
```

```tsx
import {Gif} from '@remotion/gif';
import {staticFile} from 'remotion';

export const MyComposition = () => {
  return <Gif src={staticFile('animation.gif')} width={500} height={500} />;
};
```

`<Gif>` 组件具有与 `<AnimatedImage>` 相同的属性，但仅支持 GIF 文件。
