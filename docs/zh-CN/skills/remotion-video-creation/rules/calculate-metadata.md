---
name: calculate-metadata
description: 动态设置合成时长、尺寸和属性
metadata:
  tags: calculateMetadata, duration, dimensions, props, dynamic
---

# 使用 calculateMetadata

在 `<Composition>` 上使用 `calculateMetadata`，可在渲染前动态设置时长、尺寸和变换属性。

```tsx
<Composition id="MyComp" component={MyComponent} durationInFrames={300} fps={30} width={1920} height={1080} defaultProps={{videoSrc: 'https://remotion.media/video.mp4'}} calculateMetadata={calculateMetadata} />
```

## 根据视频设置时长

使用 mediabunny/metadata 技能中的 `getMediaMetadata()` 函数获取视频时长：

```tsx
import {CalculateMetadataFunction} from 'remotion';
import {getMediaMetadata} from '../get-media-metadata';

const calculateMetadata: CalculateMetadataFunction<Props> = async ({props}) => {
  const {durationInSeconds} = await getMediaMetadata(props.videoSrc);

  return {
    durationInFrames: Math.ceil(durationInSeconds * 30),
  };
};
```

## 匹配视频尺寸

```tsx
const calculateMetadata: CalculateMetadataFunction<Props> = async ({props}) => {
  const {durationInSeconds, dimensions} = await getMediaMetadata(props.videoSrc);

  return {
    durationInFrames: Math.ceil(durationInSeconds * 30),
    width: dimensions?.width ?? 1920,
    height: dimensions?.height ?? 1080,
  };
};
```

## 根据多个视频设置时长

```tsx
const calculateMetadata: CalculateMetadataFunction<Props> = async ({props}) => {
  const metadataPromises = props.videos.map((video) => getMediaMetadata(video.src));
  const allMetadata = await Promise.all(metadataPromises);

  const totalDuration = allMetadata.reduce((sum, meta) => sum + meta.durationInSeconds, 0);

  return {
    durationInFrames: Math.ceil(totalDuration * 30),
  };
};
```

## 设置默认输出文件名

根据属性设置默认输出文件名：

```tsx
const calculateMetadata: CalculateMetadataFunction<Props> = async ({props}) => {
  return {
    defaultOutName: `video-${props.id}.mp4`,
  };
};
```

## 变换属性

在渲染前获取数据或变换属性：

```tsx
const calculateMetadata: CalculateMetadataFunction<Props> = async ({props, abortSignal}) => {
  const response = await fetch(props.dataUrl, {signal: abortSignal});
  const data = await response.json();

  return {
    props: {
      ...props,
      fetchedData: data,
    },
  };
};
```

`abortSignal` 会在 Studio 中属性变化时取消过时的请求。

## 返回值

所有字段均为可选。返回值会覆盖 `<Composition>` 属性：

* `durationInFrames`：帧数
* `width`：合成宽度（像素）
* `height`：合成高度（像素）
* `fps`：每秒帧数
* `props`：传递给组件的变换属性
* `defaultOutName`：默认输出文件名
* `defaultCodec`：渲染的默认编解码器
