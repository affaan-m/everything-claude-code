---
name: get-video-duration
description: 使用Mediabunny获取视频文件的时长（以秒为单位）
metadata:
  tags: duration, video, length, time, seconds
---

# 使用 Mediabunny 获取视频时长

Mediabunny 可以提取视频文件的时长。它适用于浏览器、Node.js 和 Bun 环境。

## 获取视频时长

```tsx
import { Input, ALL_FORMATS, UrlSource } from "mediabunny";

export const getVideoDuration = async (src: string) => {
  const input = new Input({
    formats: ALL_FORMATS,
    source: new UrlSource(src, {
      getRetryDelay: () => null,
    }),
  });

  const durationInSeconds = await input.computeDuration();
  return durationInSeconds;
};
```

## 使用方法

```tsx
const duration = await getVideoDuration("https://remotion.media/video.mp4");
console.log(duration); // e.g. 10.5 (seconds)
```

## 使用本地文件

对于本地文件，请使用 `FileSource` 而非 `UrlSource`：

```tsx
import { Input, ALL_FORMATS, FileSource } from "mediabunny";

const input = new Input({
  formats: ALL_FORMATS,
  source: new FileSource(file), // File object from input or drag-drop
});

const durationInSeconds = await input.computeDuration();
```

## 在 Remotion 中使用 staticFile

```tsx
import { staticFile } from "remotion";

const duration = await getVideoDuration(staticFile("video.mp4"));
```
