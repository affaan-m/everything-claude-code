---
name: ui-to-vue
description: Use when user has UI screenshots/design images (LanHu/Figma/etc) needing batch conversion to Vue 3 components, mentions "design to code", or needs rapid UI-to-code workflow with Vant/Element Plus/AntD Vue
origin: community
---

# UI Design to Vue Components

Batch convert UI design screenshots to Vue 3 Composition API component code.

## When to Use

- User provides design screenshot directory (LanHu, Figma exports, etc.)
- Need to quickly convert design drafts to runnable Vue code
- Project initialization phase requiring batch page component generation
- User specifies Vant/Element Plus/Ant Design Vue as UI library

**When NOT to use:**
- Single design image (recommend direct Claude analysis)
- Non-Vue projects
- Complex interaction logic needed (this tool generates static UI)

## Core Concepts

| Concept | Description |
|---------|-------------|
| Page Grouping | Auto-detect different states of same page (list/detail/form/empty) |
| UI Library Mapping | Map native elements to Vant/Element Plus/AntD Vue components |
| Three-level Cut Images | Page-level > Module-level > Global-level priority |
| Component Extraction | Public elements appearing 2+ times auto-extracted as components |

## Directory Structure

```
screenshots/
├── HomePage/                     # Module name
│   ├── List/                     # Page type (optional secondary directory)
│   │   ├── HomePage-List-Default@3x.png
│   │   └── cut-images/           # Page-level cut images (highest priority)
│   ├── cut-images/               # Module-level cut images
│   └── HomePage-Default@3x.png   # Primary directory structure (compatible)
├── cut-images/                   # Global cut images (shared across modules)
```

Supported cut-image directory names: `切图`, `assets`, `icons`, `sprites`, `cut`, `images`, `cut-images`

## Cut Image Naming

| Prefix | Type | Example |
|--------|------|---------|
| `icon-` | Icon | `icon-back.png` |
| `btn-` | Button | `btn-primary.png` |
| `logo` | Logo | `logo.png` |
| `tab-` | Tab | `tab-active.png` |
| `badge-` | Badge | `badge-new.png` |
| `tag-` | Tag | `tag-urgent.png` |
| `arrow-` | Arrow | `arrow-left.png` |
| `bg-` | Background | `bg-header.png` |

## UI Library Options

| UI Library | Use Case | Design Width | Style Unit |
|------------|----------|--------------|------------|
| `vant` | Mobile H5/App | 375px | px → rem (rootValue: 37.5) |
| `element-plus` | PC Admin Dashboard | 1920px | px |
| `antd-vue` | PC Enterprise App | 1920px | px |

**Note**: Export design images at corresponding width baseline, otherwise size conversion may be inaccurate.

## Usage

```bash
# Install
npm install ui-to-vue-converter

# Configure API key (Qwen VL - Alibaba DashScope)
export DASHSCOPE_API_KEY=your_key
# Or create .ui-to-vue.config.json

# Run
ui-to-vue --input ./screenshots --ui vant --output ./src

# PC project
ui-to-vue --input ./designs --ui element-plus --output ./src
```

| Parameter | Description | Default |
|-----------|-------------|---------|
| `--input` | Design image directory | `./screenshots` |
| `--ui` | UI library: vant/element-plus/antd-vue | `vant` |
| `--output` | Output directory | `./src` |
| `--config` | Config file path | `./.ui-to-vue.config.json` |

## Output Structure

```
output/
├── views/          # Page components
├── components/     # Public/shared components
└── router/         # Router configuration
    └── index.js
```

## API Key Configuration

Priority: `--config` > `.ui-to-vue.config.json` > `DASHSCOPE_API_KEY` environment variable

```json
// .ui-to-vue.config.json
{
  "apiKey": "your_dashscope_key",
  "input": "./designs",
  "ui": "vant",
  "output": "./src"
}
```

**⚠️ Security Warning**: Add `.ui-to-vue.config.json` to `.gitignore` to prevent accidental API key exposure in version control.

```gitignore
# .gitignore
.ui-to-vue.config.json
```

## Common Mistakes

| Issue | Solution |
|-------|----------|
| API error 401 | Check if DASHSCOPE_API_KEY is correctly configured |
| Cut images not recognized | Ensure directory name is in supported list |
| Generated components not using UI library | Check `--ui` parameter is correct |
| Image compression failed | Install sharp: `npm install sharp` |

## Checklist

Verify after use:
- [ ] All page components generated in `views/`
- [ ] Public components generated in `components/`
- [ ] Router config generated in `router/index.js`
- [ ] Vue code uses specified UI library components
- [ ] Code formats correctly, no syntax errors
- [ ] Page states integrated in single component

## Resources

- GitHub: https://github.com/EricLeeN1/ui2VueConverter
- npm: ui-to-vue-converter
