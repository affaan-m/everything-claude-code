---
name: tailwind
description: 在Remotion中使用TailwindCSS。
metadata:
---

你可以在 Remotion 中使用 TailwindCSS，前提是 TailwindCSS 已安装在项目中。

不要使用 `transition-*` 或 `animate-*` 类——始终使用 `useCurrentFrame()` 钩子进行动画处理。

Tailwind 必须首先在 Remotion 项目中安装并启用——请通过 WebFetch 获取 <https://www.remotion.dev/docs/tailwind> 以获取说明。
