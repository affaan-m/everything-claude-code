---
name: images
description: 在Remotion中使用<Img>组件嵌入图像
metadata:
  tags: images, img, staticFile, png, jpg, svg, webp
---

# 在 Remotion 中使用图像

## `<Img>` 组件

始终使用来自 `remotion` 的 `<Img>` 组件来显示图像：

```tsx
import { Img, staticFile } from "remotion";

export const MyComposition = () => {
  return <Img src={staticFile("photo.png")} />;
};
```

## 重要限制

**你必须使用来自 `remotion` 的 `<Img>` 组件。** 不要使用：

* 原生 HTML `<img>` 元素
* Next.js `<Image>` 组件
* CSS `background-image`

`<Img>` 组件确保图像在渲染前完全加载，防止视频导出时出现闪烁和空白帧。

## 使用 staticFile() 处理本地图像

将图像放在 `public/` 文件夹中，并使用 `staticFile()` 来引用它们：

```
my-video/
├─ public/
│  ├─ logo.png
│  ├─ avatar.jpg
│  └─ icon.svg
├─ src/
├─ package.json
```

```tsx
import { Img, staticFile } from "remotion";

<Img src={staticFile("logo.png")} />
```

## 远程图像

远程 URL 可以直接使用，无需 `staticFile()`：

```tsx
<Img src="https://example.com/image.png" />
```

确保远程图像已启用 CORS。

对于动画 GIF，请改用来自 `@remotion/gif` 的 `<Gif>` 组件。

## 尺寸和定位

使用 `style` 属性来控制大小和位置：

```tsx
<Img
  src={staticFile("photo.png")}
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

## 动态图像路径

使用模板字面量进行动态文件引用：

```tsx
import { Img, staticFile, useCurrentFrame } from "remotion";

const frame = useCurrentFrame();

// Image sequence
<Img src={staticFile(`frames/frame${frame}.png`)} />

// Selecting based on props
<Img src={staticFile(`avatars/${props.userId}.png`)} />

// Conditional images
<Img src={staticFile(`icons/${isActive ? "active" : "inactive"}.svg`)} />
```

这种模式适用于：

* 图像序列（逐帧动画）
* 用户特定的头像或个人资料图片
* 基于主题的图标
* 状态相关的图形

## 获取图像尺寸

使用 `getImageDimensions()` 来获取图像的尺寸：

```tsx
import { getImageDimensions, staticFile } from "remotion";

const { width, height } = await getImageDimensions(staticFile("photo.png"));
```

这对于计算宽高比或调整合成大小很有用：

```tsx
import { getImageDimensions, staticFile, CalculateMetadataFunction } from "remotion";

const calculateMetadata: CalculateMetadataFunction = async () => {
  const { width, height } = await getImageDimensions(staticFile("photo.png"));
  return {
    width,
    height,
  };
};
```
