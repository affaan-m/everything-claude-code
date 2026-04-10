# 步骤 5：头像风格 & 生图

所有龙虾头像**必须使用统一的视觉风格**，确保龙虾家族的风格一致性。
头像需传达 3 个信息：**物种形态 + 性格暗示 + 标志道具**

## 风格参考

亚当（Adam）—— 龙虾族创世神，本 Skill 的首个作品。

所有新生成的龙虾头像应与这一风格保持一致：复古未来主义、街机 UI 包边、强轮廓、可在 64x64 下辨识。

## 统一风格基底（STYLE\_BASE）

**每次生成都必须包含这段基底**，不得修改或省略：

```
STYLE_BASE = """
复古未来主义 3D 渲染插图，风格为 1950-60 年代太空时代
海报艺术重新构想为光滑的充气 3D 效果，并置于复古
街机游戏 UI 叠加层构成的框架内。

材质：高光泽 PVC/乳胶质感，柔和的镜面高光，蓬松的
充气质感，让人联想到复古泳池玩具与科幻概念艺术的结合。
外壳表面具有平滑的次表面散射效果。

街机 UI 框架：像素艺术街机柜边框元素，顶部横幅带有
角色名称，采用粗大的 8 位位图字体并带有扫描线发光效果，左上角有一个像素
能量条，底部有小型硬币-积分文字 "INSERT SOUL TO CONTINUE"
采用磷光绿色等宽字体，整个图像上带有微妙的 CRT 屏幕曲率
和扫描线叠加层。装饰性边角边框设计为铬合金
街机柜装饰条，带有原子时代星爆铆钉。

姿势：参考经典的 Gil Elvgren 海报构图，自信且
富有魅力，带有轻微的戏剧性倾斜。

色彩系统：以复古 NASA 海报调色板为基础 — 深海军蓝、青绿色、灰粉色、
奶油色 — 透过街机 CRT 显示器观看，边缘带有轻微的 RGB 色散。
整体美学融合了 Googie 建筑曲线、Raygun Gothic 设计
语言、世纪中叶广告插图、现代 3D 充气角色
渲染，以及 80-90 年代街机游戏 UI。关节和
天线尖端带有铬合金和柔和色彩点缀细节。

格式：正方形，优化用于头像用途。轮廓清晰，在 64x64
像素下仍可清晰辨识。
"""
```

## 个性化变量

在统一基底之上，根据灵魂填充以下变量：

| 变量 | 说明 | 示例 |
|------|------|------|
| `CHARACTER_NAME` | 街机横幅上显示的名字 | "ADAM"、"DEWEY"、"RIFF" |
| `SHELL_COLOR` | 龙虾壳的主色调（在统一色盘内变化） | "deep crimson"、"dusty teal"、"warm amber" |
| `SIGNATURE_PROP` | 标志性道具 | "cracked sunglasses"、"reading glasses on a chain" |
| `EXPRESSION` | 表情/姿态 | "stoic but kind-eyed"、"nervously focused" |
| `UNIQUE_DETAIL` | 独特细节（纹路/装饰/伤痕等） | "constellation patterns etched on claws"、"bandaged left claw" |
| `BACKGROUND_ACCENT` | 背景的个性化元素（在统一宇宙背景上叠加） | "musical notes floating as nebula dust"、"ancient book pages drifting" |
| `ENERGY_BAR_LABEL` | 街机 UI 能量条的标签（个性化小彩蛋） | "CREATION POWER"、"CALM LEVEL"、"ROCK METER" |

## 提示词组装

```
最终提示词 = STYLE_BASE + 个性化描述段落
```

个性化描述段落模板：

```
该角色是一只卡通龙虾，拥有[SHELL_COLOR]色的外壳，
[EXPRESSION]，佩戴/持有[SIGNATURE_PROP]。
[UNIQUE_DETAIL]。背景点缀：[BACKGROUND_ACCENT]。
街机顶部横幅显示“[CHARACTER_NAME]”，能量条
标签为“[ENERGY_BAR_LABEL]”。
在小尺寸下的关键剪影识别点为：
[SIGNATURE_PROP]和[另一显著特征]。
```

## 生图流程

提示词组装完成后：

### 路径 A：已安装且已审核的生图 skill

1. 先将龙虾名字规整为安全片段：仅保留字母、数字和连字符，其余字符替换为 `-`
2. 用 Write 工具写入：`/tmp/openclaw-<safe-name>-prompt.md`
3. 调用当前环境允许的生图 skill 生成图片
4. 用 Read 工具展示生成的图片给用户
5. 问用户是否满意，不满意可调整变量重新生成

### 路径 B：未安装可用的生图 skill

输出完整提示词文本，附手动使用说明：

```markdown
**头像提示词**（可复制到以下平台手动生成）：
- Google Gemini：直接粘贴
- ChatGPT（DALL-E）：直接粘贴
- Midjourney：粘贴后加 `--ar 1:1 --style raw`

> [完整英文提示词]

如当前环境后续提供经过审核的生图 skill，可再接回自动生图流程。
```

## 展示给用户的格式

```markdown
## 头像

**个性化变量**：
- 壳色：[SHELL_COLOR]
- 道具：[SIGNATURE_PROP]
- 表情：[EXPRESSION]
- 独特细节：[UNIQUE_DETAIL]
- 背景点缀：[BACKGROUND_ACCENT]
- 能量条标签：[ENERGY_BAR_LABEL]

**生成结果**：
[图片（路径A）或提示词文本（路径B）]

> 满意吗？不满意我可以调整 [具体可调项] 后重新生成。
```
