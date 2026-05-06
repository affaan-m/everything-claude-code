---
name: assets
description: 将图片、视频、音频和字体导入 Remotion
metadata:
  tags: assets, staticFile, images, fonts, public
---

# 在 Remotion 中导入资源

## public 文件夹

将资源放置在项目根目录的 `public/` 文件夹中。

## 使用 staticFile()

你必须使用 `staticFile()` 来引用 `public/` 文件夹中的文件：

```tsx
import {Img, staticFile} from 'remotion';

export const MyComposition = () => {
  return <Img src={staticFile('logo.png')} />;
};
```

该函数返回一个编码后的 URL，可确保在部署到子目录时正常工作。

## 在组件中使用

**图片：**

```tsx
import {Img, staticFile} from 'remotion';

<Img src={staticFile('photo.png')} />;
```

**视频：**

```tsx
import {Video} from '@remotion/media';
import {staticFile} from 'remotion';

<Video src={staticFile('clip.mp4')} />;
```

**音频：**

```tsx
import {Audio} from '@remotion/media';
import {staticFile} from 'remotion';

<Audio src={staticFile('music.mp3')} />;
```

**字体：**

```tsx
import {staticFile} from 'remotion';

const fontFamily = new FontFace('MyFont', `url(${staticFile('font.woff2')})`);
await fontFamily.load();
document.fonts.add(fontFamily);
```

## 远程 URL

远程 URL 可以直接使用，无需 `staticFile()`：

```tsx
<Img src="https://example.com/image.png" />
<Video src="https://remotion.media/video.mp4" />
```

## 重要说明

* Remotion 组件（`<Img>`、`<Video>`、`<Audio>`）确保资源在渲染前完全加载
* 文件名中的特殊字符（`#`、`?`、`&`）会自动编码
