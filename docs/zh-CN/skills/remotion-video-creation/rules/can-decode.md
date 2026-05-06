---
name: can-decode
description: 检查浏览器是否可以使用Mediabunny解码视频
metadata:
  tags: decode, validation, video, audio, compatibility, browser
---

# 检查视频能否解码

在尝试播放视频前，使用 Mediabunny 检查浏览器能否解码该视频。

## `canDecode()` 函数

此函数可直接复制粘贴到任何项目中使用。

```tsx
import { Input, ALL_FORMATS, UrlSource } from "mediabunny";

export const canDecode = async (src: string) => {
  const input = new Input({
    formats: ALL_FORMATS,
    source: new UrlSource(src, {
      getRetryDelay: () => null,
    }),
  });

  try {
    await input.getFormat();
  } catch {
    return false;
  }

  const videoTrack = await input.getPrimaryVideoTrack();
  if (videoTrack && !(await videoTrack.canDecode())) {
    return false;
  }

  const audioTrack = await input.getPrimaryAudioTrack();
  if (audioTrack && !(await audioTrack.canDecode())) {
    return false;
  }

  return true;
};
```

## 使用方法

```tsx
const src = "https://remotion.media/video.mp4";
const isDecodable = await canDecode(src);

if (isDecodable) {
  console.log("Video can be decoded");
} else {
  console.log("Video cannot be decoded by this browser");
}
```

## 与 Blob 结合使用

对于文件上传或拖放操作，请使用 `BlobSource`：

```tsx
import { Input, ALL_FORMATS, BlobSource } from "mediabunny";

export const canDecodeBlob = async (blob: Blob) => {
  const input = new Input({
    formats: ALL_FORMATS,
    source: new BlobSource(blob),
  });

  // Same validation logic as above
};
```
