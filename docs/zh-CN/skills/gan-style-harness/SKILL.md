---
name: gan-style-harness
description: "基于GAN启发的生成器-评估器代理框架，用于自主构建高质量应用程序。基于Anthropic的2026年3月框架设计论文。"
origin: ECC-community
tools: Read, Write, Edit, Bash, Grep, Glob, Task
---

# GAN 风格约束技能

> 灵感来源于 [Anthropic 的长周期应用开发约束设计](https://www.anthropic.com/engineering/harness-design-long-running-apps) (2026年3月24日)

一种多智能体约束，将**生成**与**评估**分离，创建一个对抗性反馈循环，将质量推向远超单个智能体所能达到的水平。

## 核心洞察

> 当被要求评估自己的工作时，智能体是病态的乐观主义者——他们会赞扬平庸的输出，并为合理的问题找借口。但设计一个**独立的评估器**使其极其严格，远比教导生成器进行自我批评要容易得多。

这与 GAN（生成对抗网络）的动态相同：生成器负责生产，评估器负责批判，而反馈则驱动下一次迭代。

## 使用时机

* 从一行提示构建完整的应用程序
* 需要高视觉质量的前端设计任务
* 需要可运行功能而不仅仅是代码的全栈项目
* 任何无法接受"AI 粗制滥造"美学的任务
* 你愿意投入 50-200 美元以获得生产级质量输出的项目

## 不适用时机

* 快速的单文件修复（使用标准的 `claude -p`）
* 预算紧张的任务（<10 美元）
* 简单的重构（使用去粗制滥造化模式代替）
* 已有良好测试规范的任务（使用 TDD 工作流）

## 架构

```
                    ┌─────────────┐
                    │   规划器    │
                    │  (Opus 4.6) │
                    └──────┬──────┘
                           │ 产品规格
                           │ (功能、迭代、设计方向)
                           ▼
              ┌────────────────────────┐
              │                        │
              │   生成器-评估器        │
              │       反馈循环         │
              │                        │
              │  ┌──────────┐          │
              │  │生成器    │--构建--> │──┐
              │  │(Opus 4.6)│          │  │
              │  └────▲─────┘          │  │ 实时应用
              │       │                │  │
              │    反馈                │  │
              │       │                │  │
              │  ┌────┴─────┐          │  │
              │  │评估器    │<-测试----│──┘
              │  │(Opus 4.6)│          │
              │  │+Playwright│         │
              │  └──────────┘          │
              │                        │
              │   5-15 次迭代          │
              └────────────────────────┘
```

## 三个智能体

### 1. 规划器智能体

**角色：** 产品经理——将简要提示扩展为完整的产品规格。

**关键行为：**

* 接收一行提示，生成包含 16 个功能、多个冲刺周期的规格说明
* 定义用户故事、技术要求和视觉设计方向
* 刻意保持**雄心勃勃**——保守的规划会导致结果平庸
* 生成评估器后续将使用的评估标准

**模型：** Opus 4.6（需要深度推理能力以扩展规格）

### 2. 生成器智能体

**角色：** 开发者——根据规格实现功能。

**关键行为：**

* 以结构化的冲刺周期工作（或使用较新模型进行连续模式）
* 在编写代码前与评估器协商"冲刺合同"
* 使用全栈工具：React、FastAPI/Express、数据库、CSS
* 在迭代之间使用 git 进行版本控制
* 读取评估器反馈并在下一次迭代中整合

**模型：** Opus 4.6（需要强大的编码能力）

### 3. 评估器智能体

**角色：** QA 工程师——测试实际运行的应用程序，而不仅仅是代码。

**关键行为：**

* 使用 **Playwright MCP** 与实时运行的应用程序交互
* 点击功能、填写表单、测试 API 端点
* 根据四个标准（可配置）进行评分：
  1. **设计质量**——是否感觉像一个连贯的整体？
  2. **原创性**——是自定义决策还是模板/AI 模式？
  3. **工艺**——排版、间距、动画、微交互？
  4. **功能性**——所有功能是否真的有效？
* 返回带有分数和具体问题的结构化反馈
* 被设计为**极其严格**——绝不赞扬平庸的工作

**模型：** Opus 4.6（需要强大的判断力 + 工具使用能力）

## 评估标准

默认的四个标准，每个评分 1-10：

```markdown
## 评估标准

### 设计质量（权重：0.3）
- 1-3：通用、模板化，具有“AI 垃圾”美学
- 4-6：合格但不出彩，遵循常规
- 7-8：独特、协调的视觉识别
- 9-10：可媲美专业设计师的作品

### 原创性（权重：0.2）
- 1-3：默认颜色、现成布局，缺乏个性
- 4-6：部分自定义选择，主要为标准模式
- 7-8：清晰的创意愿景，独特方法
- 9-10：令人惊喜、愉悦，真正新颖

### 工艺（权重：0.3）
- 1-3：布局混乱、状态缺失、无动画效果
- 4-6：可用但感觉粗糙，间距不一致
- 7-8：精致、过渡流畅、响应式
- 9-10：像素级完美，令人愉悦的微交互

### 功能性（权重：0.2）
- 1-3：核心功能损坏或缺失
- 4-6：主要流程可用，边缘情况失败
- 7-8：所有功能正常，良好的错误处理
- 9-10：坚固可靠，处理所有边缘情况
```

### 评分

* **加权分数** = 总和（标准分数 \* 权重）
* **通过阈值** = 7.0（可配置）
* **最大迭代次数** = 15（可配置，通常 5-15 次足够）

## 使用方法

### 通过命令

```bash
# Full three-agent harness
/project:gan-build "Build a project management app with Kanban boards, team collaboration, and dark mode"

# With custom config
/project:gan-build "Build a recipe sharing platform" --max-iterations 10 --pass-threshold 7.5

# Frontend design mode (generator + evaluator only, no planner)
/project:gan-design "Create a landing page for a crypto portfolio tracker"
```

### 通过 Shell 脚本

```bash
# Basic usage
./scripts/gan-harness.sh "Build a music streaming dashboard"

# With options
GAN_MAX_ITERATIONS=10 \
GAN_PASS_THRESHOLD=7.5 \
GAN_EVAL_CRITERIA="functionality,performance,security" \
./scripts/gan-harness.sh "Build a REST API for task management"
```

### 通过 Claude Code（手动）

```bash
# Step 1: Plan
claude -p --model opus "You are a Product Planner. Read PLANNER_PROMPT.md. Expand this brief into a full product spec: 'Build a Kanban board app'. Write spec to spec.md"

# Step 2: Generate (iteration 1)
claude -p --model opus "You are a Generator. Read spec.md. Implement Sprint 1. Start the dev server on port 3000."

# Step 3: Evaluate (iteration 1)
claude -p --model opus --allowedTools "Read,Bash,mcp__playwright__*" "You are an Evaluator. Read EVALUATOR_PROMPT.md. Test the live app at http://localhost:3000. Score against the rubric. Write feedback to feedback-001.md"

# Step 4: Generate (iteration 2 — reads feedback)
claude -p --model opus "You are a Generator. Read spec.md and feedback-001.md. Address all issues. Improve the scores."

# Repeat steps 3-4 until pass threshold met
```

## 随模型能力发展的演进

约束应随着模型的改进而简化。遵循 Anthropic 的演进路径：

### 阶段 1 —— 较弱模型（Sonnet 级别）

* 需要完整的冲刺周期分解
* 冲刺周期之间重置上下文（避免上下文焦虑）
* 至少需要 2 个智能体：初始化器 + 编码智能体
* 大量脚手架以弥补模型限制

### 阶段 2 —— 能力较强的模型（Opus 4.5 级别）

* 完整的 3 智能体约束：规划器 + 生成器 + 评估器
* 每个实现阶段前签订冲刺合同
* 复杂应用分解为 10 个冲刺周期
* 上下文重置仍然有用但不再至关重要

### 阶段 3 —— 前沿模型（Opus 4.6 级别）

* 简化的约束：单次规划，连续生成
* 评估简化为单次最终检查（模型更智能）
* 无需冲刺结构
* 自动压缩处理上下文增长

> **关键原则：** 每个约束组件都编码了一个关于模型无法单独完成什么的假设。当模型改进时，重新测试这些假设。剥离不再需要的部分。

## 配置

### 环境变量

| 变量 | 默认值 | 描述 |
|----------|---------|-------------|
| `GAN_MAX_ITERATIONS` | `15` | 生成器-评估器最大循环次数 |
| `GAN_PASS_THRESHOLD` | `7.0` | 通过的加权分数（1-10） |
| `GAN_PLANNER_MODEL` | `opus` | 规划器智能体模型 |
| `GAN_GENERATOR_MODEL` | `opus` | 生成器智能体模型 |
| `GAN_EVALUATOR_MODEL` | `opus` | 评估器智能体模型 |
| `GAN_EVAL_CRITERIA` | `design,originality,craft,functionality` | 逗号分隔的评估标准 |
| `GAN_DEV_SERVER_PORT` | `3000` | 实时应用端口 |
| `GAN_DEV_SERVER_CMD` | `npm run dev` | 启动开发服务器的命令 |
| `GAN_PROJECT_DIR` | `.` | 项目工作目录 |
| `GAN_SKIP_PLANNER` | `false` | 跳过规划器，直接使用规格 |
| `GAN_EVAL_MODE` | `playwright` | `playwright`, `screenshot`, 或 `code-only` |

### 评估模式

| 模式 | 工具 | 最适合 |
|------|-------|----------|
| `playwright` | 浏览器 MCP + 实时交互 | 带有 UI 的全栈应用 |
| `screenshot` | 截图 + 视觉分析 | 静态网站、纯设计 |
| `code-only` | 测试 + 代码检查 + 构建 | API、库、CLI 工具 |

## 反模式

1. **评估器过于宽松**——如果评估器在第 1 次迭代就通过了所有内容，那么你的评分标准太宽松了。收紧评分标准，并为常见的 AI 模式添加明确的扣分项。

2. **生成器忽略反馈**——确保反馈以文件形式传递，而不是内联。生成器应在每次迭代开始时读取 `feedback-NNN.md`。

3. **无限循环**——始终设置 `GAN_MAX_ITERATIONS`。如果生成器在 3 次迭代后仍无法突破分数瓶颈，则停止并标记为需要人工审查。

4. **评估器测试流于表面**——评估器必须使用 Playwright **交互**实时应用，而不仅仅是截图。点击按钮、填写表单、测试错误状态。

5. **评估器赞扬自己的修复**——绝不能让评估器建议修复，然后评估这些修复。评估器只负责批判；生成器负责修复。

6. **上下文耗尽**——对于长时间会话，使用 Claude Agent SDK 的自动压缩功能或在主要阶段之间重置上下文。

## 结果：预期效果

基于 Anthropic 已发布的结果：

| 指标 | 单智能体 | GAN 约束 | 改进 |
|--------|-----------|-------------|-------------|
| 时间 | 20 分钟 | 4-6 小时 | 12-18 倍更长 |
| 成本 | 9 美元 | 125-200 美元 | 14-22 倍更多 |
| 质量 | 勉强可用 | 生产就绪 | 质变 |
| 核心功能 | 损坏 | 全部正常工作 | 不适用 |
| 设计 | 通用的 AI 粗制滥造 | 独特、精致 | 不适用 |

**权衡是明确的：** 以约 20 倍的时间和成本，换取输出质量的质的飞跃。这适用于质量至关重要的项目。

## 参考文献

* [Anthropic：长周期应用的约束设计](https://www.anthropic.com/engineering/harness-design-long-running-apps) —— Prithvi Rajasekaran 的原始论文
* [Epsilla：GAN 风格的智能体循环](https://www.epsilla.com/blogs/anthropic-harness-engineering-multi-agent-gan-architecture) —— 架构解构
* [Martin Fowler：约束工程](https://martinfowler.com/articles/exploring-gen-ai/harness-engineering.html) —— 更广泛的行业背景
* [OpenAI：约束工程](https://openai.com/index/harness-engineering/) —— OpenAI 的并行工作
