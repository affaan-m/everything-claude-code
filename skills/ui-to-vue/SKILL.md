---
name: ui-to-vue
description: Use when user has UI screenshots/design images (蓝湖/Figma/etc) needing batch conversion to Vue 3 components, mentions "设计图转代码", or needs rapid UI-to-code workflow with Vant/Element Plus/AntD Vue
---

# UI 设计图转 Vue 组件

批量将 UI 设计截图转换为 Vue 3 Composition API 组件代码。

## When to Use

- 用户提供设计图目录（蓝湖、Figma 截图等）
- 需要快速将设计稿转为可运行 Vue 代码
- 项目初始化阶段需要批量生成页面组件
- 用户指定使用 Vant/Element Plus/Ant Design Vue

**When NOT to use:**
- 单张设计图（建议直接用 Claude 分析生成）
- 非 Vue 项目
- 需要精细交互逻辑（本工具生成静态 UI）

## Core Concepts

| 概念 | 说明 |
|------|------|
| 页面分组 | 自动识别同一页面的不同状态（列表/详情/表单/空态） |
| UI 库适配 | 映射原生元素到 Vant/Element Plus/AntD Vue 组件 |
| 三级切图 | 页面级 > 模块级 > 全局级，同名切图优先使用高层级 |
| 组件抽取 | 出现 2+ 次的公共元素自动抽离为组件 |

## Directory Structure

```
screenshots/
├── 模块名/
│   ├── 页面类型/              # 二级目录（可选）
│   │   ├── 页面截图@3x.png
│   │   └── 切图/              # 页面级切图（最高优先级）
│   ├── 切图/                  # 模块级切图
│   └── 页面截图@3x.png        # 一级目录兼容
├── 切图/                      # 全局切图（所有模块共用）
```

切图目录名支持：`切图`, `assets`, `icons`, `sprites`, `cut`, `images`

## Cut Image Naming

| 前缀 | 类型 | 示例 |
|------|------|------|
| `icon-` | 图标 | `icon-back.png` |
| `btn-` | 按钮 | `btn-primary.png` |
| `logo` | Logo | `logo.png` |
| `tab-` | 标签页 | `tab-active.png` |
| `badge-` | 徽章 | `badge-new.png` |
| `tag-` | 标记 | `tag-urgent.png` |
| `arrow-` | 箭头 | `arrow-left.png` |
| `bg-` | 背景 | `bg-header.png` |

## UI Library Options

| UI 库 | 适用场景 | 设计稿宽度 | 样式单位 |
|-------|---------|-----------|---------|
| `vant` | 移动端 H5/小程序 | 375px | px → rem (rootValue: 37.5) |
| `element-plus` | PC 端后台管理 | 1920px | px |
| `antd-vue` | PC 端企业级应用 | 1920px | px |

**注意**：设计图导出时请按对应宽度基准，否则尺寸转换可能偏差。

## Usage

```bash
# 安装
npm install ui-to-vue-converter

# 配置 API 密钥（通义千问 VL）
export DASHSCOPE_API_KEY=your_key
# 或创建 .ui-to-vue.config.json

# 运行
ui-to-vue --input ./screenshots --ui vant --output ./src

# PC 端项目
ui-to-vue --input ./designs --ui element-plus --output ./src
```

| 参数 | 说明 | 默认值 |
|------|------|--------|
| `--input` | 设计图目录 | `./screenshots` |
| `--ui` | UI 库：vant/element-plus/antd-vue | `vant` |
| `--output` | 输出目录 | `./src` |
| `--config` | 配置文件路径 | `./.ui-to-vue.config.json` |

## Output Structure

```
output/
├── views/          # 页面组件
├── components/     # 公共组件
└── router/         # 路由配置
    └── index.js
```

## API Key Configuration

优先级：`--config` > `.ui-to-vue.config.json` > `DASHSCOPE_API_KEY` 环境变量

```json
// .ui-to-vue.config.json
{
  "apiKey": "your_dashscope_key",
  "input": "./designs",
  "ui": "vant",
  "output": "./src"
}
```

## Common Mistakes

| 问题 | 解决 |
|------|------|
| API 报错 401 | 检查 DASHSCOPE_API_KEY 是否正确配置 |
| 切图未识别 | 确保目录名在支持列表内（切图/assets/icons 等） |
| 生成的组件未使用 UI 库 | 检查 `--ui` 参数是否正确 |
| 图片压缩失败 | 安装 sharp：`npm install sharp` |

## Checklist

使用后验证：
- [ ] 所有页面组件已生成到 `views/`
- [ ] 公共组件已生成到 `components/`
- [ ] 路由配置已生成到 `router/index.js`
- [ ] Vue 代码使用了指定 UI 库组件
- [ ] 代码可正常格式化，无语法错误
- [ ] 页面状态整合在同一组件中

## Resources

- GitHub: https://github.com/EricLeeN1/ui2VueConverter
- npm: ui-to-vue-converter