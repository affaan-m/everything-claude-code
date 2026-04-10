---
name: compositions
description: 定义合成、静帧、文件夹、默认属性和动态元数据
metadata:
  tags: composition, still, folder, props, metadata
---

`<Composition>` 定义了可渲染视频的组件、宽度、高度、帧率和时长。

它通常放置在 `src/Root.tsx` 文件中。

```tsx
import { Composition } from "remotion";
import { MyComposition } from "./MyComposition";

export const RemotionRoot = () => {
  return (
    <Composition
      id="MyComposition"
      component={MyComposition}
      durationInFrames={100}
      fps={30}
      width={1080}
      height={1080}
    />
  );
};
```

## 默认属性

传递 `defaultProps` 来为你的组件提供初始值。
值必须是可 JSON 序列化的（支持 `Date`、`Map`、`Set` 和 `staticFile()`）。

```tsx
import { Composition } from "remotion";
import { MyComposition, MyCompositionProps } from "./MyComposition";

export const RemotionRoot = () => {
  return (
    <Composition
      id="MyComposition"
      component={MyComposition}
      durationInFrames={100}
      fps={30}
      width={1080}
      height={1080}
      defaultProps={{
        title: "Hello World",
        color: "#ff0000",
      } satisfies MyCompositionProps}
    />
  );
};
```

使用 `type` 声明而非 `interface` 来确保 `defaultProps` 类型安全。

## 文件夹

使用 `<Folder>` 来在侧边栏中组织合成。
文件夹名称只能包含字母、数字和连字符。

```tsx
import { Composition, Folder } from "remotion";

export const RemotionRoot = () => {
  return (
    <>
      <Folder name="Marketing">
        <Composition id="Promo" /* ... */ />
        <Composition id="Ad" /* ... */ />
      </Folder>
      <Folder name="Social">
        <Folder name="Instagram">
          <Composition id="Story" /* ... */ />
          <Composition id="Reel" /* ... */ />
        </Folder>
      </Folder>
    </>
  );
};
```

## 静态图像

使用 `<Still>` 来创建单帧图像。它不需要 `durationInFrames` 或 `fps`。

```tsx
import { Still } from "remotion";
import { Thumbnail } from "./Thumbnail";

export const RemotionRoot = () => {
  return (
    <Still
      id="Thumbnail"
      component={Thumbnail}
      width={1280}
      height={720}
    />
  );
};
```

## 计算元数据

使用 `calculateMetadata` 来使尺寸、时长或属性基于数据动态变化。

```tsx
import { Composition, CalculateMetadataFunction } from "remotion";
import { MyComposition, MyCompositionProps } from "./MyComposition";

const calculateMetadata: CalculateMetadataFunction<MyCompositionProps> = async ({
  props,
  abortSignal,
}) => {
  const data = await fetch(`https://api.example.com/video/${props.videoId}`, {
    signal: abortSignal,
  }).then((res) => res.json());

  return {
    durationInFrames: Math.ceil(data.duration * 30),
    props: {
      ...props,
      videoUrl: data.url,
    },
  };
};

export const RemotionRoot = () => {
  return (
    <Composition
      id="MyComposition"
      component={MyComposition}
      durationInFrames={100} // Placeholder, will be overridden
      fps={30}
      width={1080}
      height={1080}
      defaultProps={{ videoId: "abc123" }}
      calculateMetadata={calculateMetadata}
    />
  );
};
```

该函数可以返回 `props`、`durationInFrames`、`width`、`height`、`fps` 以及编解码器相关的默认值。它在渲染开始前运行一次。
