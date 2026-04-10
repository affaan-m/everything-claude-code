---
name: lottie
description: 在Remotion中嵌入Lottie动画。
metadata:
  category: Animation
---

# 在 Remotion 中使用 Lottie 动画

## 先决条件

首先，需要安装 @remotion/lottie 包。
如果尚未安装，请使用以下命令：

```bash
npx remotion add @remotion/lottie # If project uses npm
bunx remotion add @remotion/lottie # If project uses bun
yarn remotion add @remotion/lottie # If project uses yarn
pnpm exec remotion add @remotion/lottie # If project uses pnpm
```

## 显示 Lottie 文件

要导入 Lottie 动画：

* 获取 Lottie 资源
* 将加载过程包裹在 `delayRender()` 和 `continueRender()` 中
* 将动画数据保存在状态中
* 使用 `@remotion/lottie` 包中的 `Lottie` 组件渲染 Lottie 动画

```tsx
import {Lottie, LottieAnimationData} from '@remotion/lottie';
import {useEffect, useState} from 'react';
import {cancelRender, continueRender, delayRender} from 'remotion';

export const MyAnimation = () => {
  const [handle] = useState(() => delayRender('Loading Lottie animation'));

  const [animationData, setAnimationData] = useState<LottieAnimationData | null>(null);

  useEffect(() => {
    fetch('https://assets4.lottiefiles.com/packages/lf20_zyquagfl.json')
      .then((data) => data.json())
      .then((json) => {
        setAnimationData(json);
        continueRender(handle);
      })
      .catch((err) => {
        cancelRender(err);
      });
  }, [handle]);

  if (!animationData) {
    return null;
  }

  return <Lottie animationData={animationData} />;
};
```

## 样式与动画

Lottie 支持 `style` 属性以允许应用样式和动画：

```tsx
return <Lottie animationData={animationData} style={{width: 400, height: 400}} />;
```
