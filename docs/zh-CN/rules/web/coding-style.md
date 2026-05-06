> 此文件扩展了 [common/coding-style.md](../common/coding-style.md)，增加了 Web 前端专属内容。

# Web 编码规范

## 文件组织

按功能或领域组织文件，而非按文件类型：

```text
src/
├── components/
│   ├── hero/
│   │   ├── Hero.tsx
│   │   ├── HeroVisual.tsx
│   │   └── hero.css
│   ├── scrolly-section/
│   │   ├── ScrollySection.tsx
│   │   ├── StickyVisual.tsx
│   │   └── scrolly.css
│   └── ui/
│       ├── Button.tsx
│       ├── SurfaceCard.tsx
│       └── AnimatedText.tsx
├── hooks/
│   ├── useReducedMotion.ts
│   └── useScrollProgress.ts
├── lib/
│   ├── animation.ts
│   └── color.ts
└── styles/
    ├── tokens.css
    ├── typography.css
    └── global.css
```

## CSS 自定义属性

将设计令牌定义为变量。不要重复硬编码调色板、排版或间距：

```css
:root {
  --color-surface: oklch(98% 0 0);
  --color-text: oklch(18% 0 0);
  --color-accent: oklch(68% 0.21 250);

  --text-base: clamp(1rem, 0.92rem + 0.4vw, 1.125rem);
  --text-hero: clamp(3rem, 1rem + 7vw, 8rem);

  --space-section: clamp(4rem, 3rem + 5vw, 10rem);

  --duration-fast: 150ms;
  --duration-normal: 300ms;
  --ease-out-expo: cubic-bezier(0.16, 1, 0.3, 1);
}
```

## 仅动画属性

优先使用对合成器友好的动效：

* `transform`
* `opacity`
* `clip-path`
* `filter`（谨慎使用）

避免对布局相关属性进行动画处理：

* `width`
* `height`
* `top`
* `left`
* `margin`
* `padding`
* `border`
* `font-size`

## 语义化 HTML 优先

```html
<header>
  <nav aria-label="Main navigation">...</nav>
</header>
<main>
  <section aria-labelledby="hero-heading">
    <h1 id="hero-heading">...</h1>
  </section>
</main>
<footer>...</footer>
```

当存在语义元素时，不要使用通用包装器 `div` 堆栈。

## 命名

* 组件：大驼峰命名法（`ScrollySection`、`SurfaceCard`）
* 钩子：`use` 前缀（`useReducedMotion`）
* CSS 类：短横线命名法或工具类
* 动画时间线：带意图的小驼峰命名法（`heroRevealTl`）
