---
name: import-srt-captions
description: 使用 @remotion/captions 将 .srt 字幕文件导入 Remotion
metadata:
  tags: captions, subtitles, srt, import, parse
---

# 将 .srt 字幕导入 Remotion

如果你有一个现有的 `.srt` 字幕文件，你可以使用 `parseSrt()` 从 `@remotion/captions` 将其导入 Remotion。

## 先决条件

首先，需要安装 @remotion/captions 包。
如果尚未安装，请使用以下命令：

```bash
npx remotion add @remotion/captions # If project uses npm
bunx remotion add @remotion/captions # If project uses bun
yarn remotion add @remotion/captions # If project uses yarn
pnpm exec remotion add @remotion/captions # If project uses pnpm
```

## 读取 .srt 文件

使用 `staticFile()` 来引用 `.srt` 文件夹中的 `public` 文件，然后获取并解析它：

```tsx
import {useState, useEffect, useCallback} from 'react';
import {AbsoluteFill, staticFile, useDelayRender} from 'remotion';
import {parseSrt} from '@remotion/captions';
import type {Caption} from '@remotion/captions';

export const MyComponent: React.FC = () => {
  const [captions, setCaptions] = useState<Caption[] | null>(null);
  const {delayRender, continueRender, cancelRender} = useDelayRender();
  const [handle] = useState(() => delayRender());

  const fetchCaptions = useCallback(async () => {
    try {
      const response = await fetch(staticFile('subtitles.srt'));
      const text = await response.text();
      const {captions: parsed} = parseSrt({input: text});
      setCaptions(parsed);
      continueRender(handle);
    } catch (e) {
      cancelRender(e);
    }
  }, [continueRender, cancelRender, handle]);

  useEffect(() => {
    fetchCaptions();
  }, [fetchCaptions]);

  if (!captions) {
    return null;
  }

  return <AbsoluteFill>{/* Use captions here */}</AbsoluteFill>;
};
```

也支持远程 URL - 你可以通过 URL `fetch()` 一个远程文件，而不是使用 `staticFile()`。

## 使用导入的字幕

解析后，字幕将采用 `Caption` 格式，并且可以与所有 `@remotion/captions` 工具一起使用。
