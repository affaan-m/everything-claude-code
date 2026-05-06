# 步骤 5：头像风格 & 图像生成

所有龙虾头像**必须使用统一的视觉风格**，确保龙虾家族的风格一致性。
头像需传达 3 个信息：**物种形态 + 性格暗示 + 标志道具**

## 风格参考

亚当（Adam）—— 龙虾族创世神，本 Skill 的首个作品。

所有新生成的龙虾头像应与这一风格保持一致：复古未来主义、街机 UI 包边、强轮廓、可在 64x64 下辨识。

## 统一风格基底（STYLE\_BASE）

**每次生成都必须包含这段基底**，不得修改或省略：

```
STYLE_BASE = """
复古未来主义3D渲染插画，风格为1950-60年代太空时代
海报女郎艺术重新构想为高光泽充气3D，镶嵌在复古
街机游戏UI叠加层中。

材质：高光泽PVC/乳胶质感，柔和的高光反射，蓬松
充气质感，融合复古泳池玩具与科幻概念艺术风格。外壳表面具有平滑的次表面散射。

街机UI边框：像素艺术街机框体边框元素，顶部横幅以
粗体8位位图字体显示角色名称，带有扫描线辉光效果，左上角有像素能量条，
底部以磷光绿等宽字体显示"INSERT SOUL TO CONTINUE"投币提示文字，整个图像带有微妙的CRT屏幕曲率和
扫描线叠加效果。装饰性边角边框采用镀铬街机框体装饰，带有原子时代星形铆钉。

姿态：参考经典Gil Elvgren海报女郎构图，自信且
富有魅力，略带戏剧性倾斜。

色彩系统：以复古NASA海报调色板为基础——深海军蓝、蓝绿色、灰珊瑚色、奶油色——通过街机CRT显示器观看，边缘带有轻微RGB色散。
整体美学融合Googie建筑曲线、Raygun Gothic设计
语言、世纪中叶广告插画、现代3D充气角色
渲染以及80-90年代街机游戏UI。关节和触角尖端采用镀铬和粉彩装饰细节。

格式：方形，针对头像使用优化。在64x64像素下仍保持清晰轮廓。
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
角色是一只卡通龙虾，拥有[SHELL_COLOR]色的外壳，
[EXPRESSION]，佩戴/持有[SIGNATURE_PROP]。
[UNIQUE_DETAIL]。背景点缀：[BACKGROUND_ACCENT]。
街机顶部横幅写着"[CHARACTER_NAME]"，能量条
标注为"[ENERGY_BAR_LABEL]"。
小尺寸下的关键剪影识别点为：
[SIGNATURE_PROP]和[另一个显著特征]。
```

## 图像生成流程

提示词组装完成后：

### 路径 A：已安装且已审核的图像生成 skill

1. 先将龙虾名字规整为安全片段：仅保留字母、数字和连字符，其余字符替换为 `-`
2. 用 Write 工具写入：`/tmp/openclaw-<safe-name>-prompt.md`
3. 调用当前环境允许的图像生成 skill 生成图片
4. 用 Read 工具展示生成的图片给用户
5. 问用户是否满意，不满意可调整变量重新生成

### 路径 B：未安装可用的图像生成 skill

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
## Avatar

**Personalization Variables**:
- Shell Color: [SHELL_COLOR]
- Prop: [SIGNATURE_PROP]
- Expression: [EXPRESSION]
- Unique Detail: [UNIQUE_DETAIL]
- Background Accent: [BACKGROUND_ACCENT]
- Energy Bar Label: [ENERGY_BAR_LABEL]

**Generated Result**:
[Image (Path A) or Prompt Text (Path B)]

> Satisfied? If not, I can adjust [specific adjustable items] and regenerate.
```
