---
description: '前端专项工作流（研究→构思→计划→执行→优化→评审），Gemini 主导'
---

# Frontend - 前端专项开发

## 使用方法

```bash
/frontend <UI任务描述>
```

## 上下文

- 前端任务：$ARGUMENTS
- Gemini 主导，Codex 辅助参考
- 适用：组件设计、响应式布局、UI 动画、样式优化

## 你的角色

你是**前端编排者**，协调多模型完成 UI/UX 任务（研究 → 构思 → 计划 → 执行 → 优化 → 评审），用中文协助用户。

**协作模型**：
- **Gemini** – 前端 UI/UX（**前端权威，可信赖**）
- **Codex** – 后端视角（**前端意见仅供参考**）
- **Claude (自己)** – 编排、计划、执行、交付

---

## 多模型调用规范

**调用语法**：

```
# 新会话调用
Bash({
  command: "~/.claude/bin/codeagent-wrapper {{LITE_MODE_FLAG}}--backend gemini --gemini-model gemini-3-pro-preview - \"$PWD\" <<'EOF'
ROLE_FILE: <角色提示词路径>
<TASK>
需求：<增强后的需求（如未增强则用 $ARGUMENTS）>
上下文：<前序阶段收集的项目上下文、分析结果等>
</TASK>
OUTPUT: 期望输出格式
EOF",
  run_in_background: false,
  timeout: 3600000,
  description: "简短描述"
})

# 复用会话调用
Bash({
  command: "~/.claude/bin/codeagent-wrapper {{LITE_MODE_FLAG}}--backend gemini --gemini-model gemini-3-pro-preview resume <SESSION_ID> - \"$PWD\" <<'EOF'
ROLE_FILE: <角色提示词路径>
<TASK>
需求：<增强后的需求（如未增强则用 $ARGUMENTS）>
上下文：<前序阶段收集的项目上下文、分析结果等>
</TASK>
OUTPUT: 期望输出格式
EOF",
  run_in_background: false,
  timeout: 3600000,
  description: "简短描述"
})
```

**角色提示词**：

| 阶段 | Gemini |
|------|--------|
| 分析 | `~/.claude/.ccg/prompts/gemini/analyzer.md` |
| 规划 | `~/.claude/.ccg/prompts/gemini/architect.md` |
| 审查 | `~/.claude/.ccg/prompts/gemini/reviewer.md` |

**会话复用**：每次调用返回 `SESSION_ID: xxx`，后续阶段用 `resume xxx` 复用上下文。阶段 2 保存 `GEMINI_SESSION`，阶段 3 和 5 使用 `resume` 复用。

---

## 沟通守则

1. 响应以模式标签 `[模式：X]` 开始，初始为 `[模式：研究]`
2. 严格按 `研究 → 构思 → 计划 → 执行 → 优化 → 评审` 顺序流转
3. 在需要询问用户时，尽量使用 `AskUserQuestion` 工具进行交互，举例场景：请求用户确认/选择/批准

---

## 核心工作流

### 🔍 阶段 0：Prompt 增强（可选）

`[模式：准备]` - 如 ace-tool MCP 可用，调用 `mcp__ace-tool__enhance_prompt`，**用增强结果替代原始 $ARGUMENTS，后续调用 Gemini 时传入增强后的需求**

### 🔍 阶段 1：研究

`[模式：研究]` - 理解需求并收集上下文

1. **代码检索**（如 ace-tool MCP 可用）：调用 `mcp__ace-tool__search_context` 检索现有组件、样式、设计系统
2. 需求完整性评分（0-10 分）：≥7 继续，<7 停止补充

### 💡 阶段 2：构思

`[模式：构思]` - Gemini 主导分析

**⚠️ 必须调用 Gemini**（参照上方调用规范）：
- ROLE_FILE: `~/.claude/.ccg/prompts/gemini/analyzer.md`
- 需求：增强后的需求（如未增强则用 $ARGUMENTS）
- 上下文：阶段 1 收集的项目上下文
- OUTPUT: UI 可行性分析、推荐方案（至少 2 个）、用户体验评估

**📌 保存 SESSION_ID**（`GEMINI_SESSION`）用于后续阶段复用。

输出方案（至少 2 个），等待用户选择。

### 📋 阶段 3：计划

`[模式：计划]` - Gemini 主导规划

**⚠️ 必须调用 Gemini**（使用 `resume <GEMINI_SESSION>` 复用会话）：
- ROLE_FILE: `~/.claude/.ccg/prompts/gemini/architect.md`
- 需求：用户选择的方案
- 上下文：阶段 2 的分析结果
- OUTPUT: 组件结构、UI 流程、样式方案

Claude 综合规划，请求用户批准后存入 `.claude/plan/任务名.md`

### ⚡ 阶段 4：执行

`[模式：执行]` - 代码开发

- 严格按批准的计划实施
- 遵循项目现有设计系统和代码规范
- 确保响应式、可访问性

### 🚀 阶段 5：优化

`[模式：优化]` - Gemini 主导审查

**⚠️ 必须调用 Gemini**（参照上方调用规范）：
- ROLE_FILE: `~/.claude/.ccg/prompts/gemini/reviewer.md`
- 需求：审查以下前端代码变更
- 上下文：git diff 或代码内容
- OUTPUT: 可访问性、响应式、性能、设计一致性问题列表

整合审查意见，用户确认后执行优化。

### ✅ 阶段 6：评审

`[模式：评审]` - 最终评估

- 对照计划检查完成情况
- 验证响应式和可访问性
- 报告问题与建议

---

## 关键规则

1. **Gemini 前端意见可信赖**
2. **Codex 前端意见仅供参考**
3. 外部模型对文件系统**零写入权限**
4. Claude 负责所有代码写入和文件操作
