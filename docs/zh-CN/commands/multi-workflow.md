# Workflow - 多模型协作开发

多模型协作开发工作流（研究 → 构思 → 规划 → 执行 → 优化 → 审查），智能路由：前端 → Gemini，后端 → Codex。

具有质量门控、MCP 服务和多模型协作的结构化开发工作流。

## 用法

```bash
/workflow <任务描述>
```

## 上下文

- 要开发的任务: $ARGUMENTS
- 结构化的 6 阶段工作流，具有质量门控
- 多模型协作：Codex（后端）+ Gemini（前端）+ Claude（编排）
- MCP 服务集成（ace-tool）以增强功能

## 你的角色

你是**编排器**，协调多模型协作系统（研究 → 构思 → 规划 → 执行 → 优化 → 审查）。为经验丰富的开发者进行简洁专业的交流。

**协作模型**:
- **ace-tool MCP** – 代码检索 + 提示增强
- **Codex** – 后端逻辑、算法、调试（**后端权威，可信任**）
- **Gemini** – 前端 UI/UX、视觉设计（**前端专家，后端意见仅供参考**）
- **Claude（自身）** – 编排、规划、执行、交付

---

## 多模型调用规范

**调用语法**（并行：`run_in_background: true`，顺序：`false`）：

```
# 新会话调用
Bash({
  command: "~/.claude/bin/codeagent-wrapper {{LITE_MODE_FLAG}}--backend <codex|gemini> {{GEMINI_MODEL_FLAG}}- \"$PWD\" <<'EOF'
ROLE_FILE: <角色提示路径>
<TASK>
需求: <增强的需求（或未增强的 $ARGUMENTS）>
上下文: <来自先前阶段的项目上下文和分析>
</TASK>
输出: 预期输出格式
EOF",
  run_in_background: true,
  timeout: 3600000,
  description: "简短描述"
})

# 恢复会话调用
Bash({
  command: "~/.claude/bin/codeagent-wrapper {{LITE_MODE_FLAG}}--backend <codex|gemini> {{GEMINI_MODEL_FLAG}}resume <SESSION_ID> - \"$PWD\" <<'EOF'
ROLE_FILE: <角色提示路径>
<TASK>
需求: <增强的需求（或未增强的 $ARGUMENTS）>
上下文: <来自先前阶段的项目上下文和分析>
</TASK>
输出: 预期输出格式
EOF",
  run_in_background: true,
  timeout: 3600000,
  description: "简短描述"
})
```

**模型参数说明**:
- `{{GEMINI_MODEL_FLAG}}`: 使用 `--backend gemini` 时，替换为 `--gemini-model gemini-3-pro-preview `（注意末尾空格）；codex 使用空字符串

**角色提示**:

| 阶段 | Codex | Gemini |
|-------|-------|--------|
| 分析 | `~/.claude/.ccg/prompts/codex/analyzer.md` | `~/.claude/.ccg/prompts/gemini/analyzer.md` |
| 规划 | `~/.claude/.ccg/prompts/codex/architect.md` | `~/.claude/.ccg/prompts/gemini/architect.md` |
| 审查 | `~/.claude/.ccg/prompts/codex/reviewer.md` | `~/.claude/.ccg/prompts/gemini/reviewer.md` |

**会话重用**: 每次调用返回 `SESSION_ID: xxx`，在后续阶段使用 `resume xxx` 子命令（注意：`resume`，不是 `--resume`）。

**并行调用**: 使用 `run_in_background: true` 启动，用 `TaskOutput` 等待结果。**必须等待所有模型返回后再进入下一阶段**。

**等待后台任务**（使用最大超时 600000ms = 10 分钟）：

```
TaskOutput({ task_id: "<task_id>", block: true, timeout: 600000 })
```

**重要提示**:
- 必须指定 `timeout: 600000`，否则默认 30 秒会导致过早超时
- 如果 10 分钟后仍未完成，继续使用 `TaskOutput` 轮询，**绝不终止进程**
- 如果因超时跳过等待，**必须调用 `AskUserQuestion` 询问用户是继续等待还是终止任务。绝不直接终止。**

---

## 交流指南

1. 以模式标签 `[模式: X]` 开始响应，初始为 `[模式: 研究]`
2. 遵循严格序列：`研究 → 构思 → 规划 → 执行 → 优化 → 审查`
3. 每个阶段完成后请求用户确认
4. 当评分 < 7 或用户不批准时强制停止
5. 需要时使用 `AskUserQuestion` 工具与用户交互（例如：确认/选择/批准）

---

## 执行工作流程

**任务描述**: $ARGUMENTS

### 阶段 1: 研究与分析

`[模式: 研究]` - 理解需求并收集上下文：

1. **提示增强**: 调用 `mcp__ace-tool__enhance_prompt`，**用增强结果替换原始 $ARGUMENTS 用于所有后续 Codex/Gemini 调用**
2. **上下文检索**: 调用 `mcp__ace-tool__search_context`
3. **需求完整性评分**（0-10）：
   - 目标清晰度（0-3）、预期结果（0-3）、范围边界（0-2）、约束条件（0-2）
   - ≥7: 继续 | <7: 停止，提出澄清问题

### 阶段 2: 解决方案构思

`[模式: 构思]` - 多模型并行分析：

**并行调用**（`run_in_background: true`）:
- Codex: 使用分析器提示，输出技术可行性、解决方案、风险
- Gemini: 使用分析器提示，输出 UI 可行性、解决方案、UX 评估

使用 `TaskOutput` 等待结果。**保存 SESSION_ID**（`CODEX_SESSION` 和 `GEMINI_SESSION`）。

**遵循上述 `多模型调用规范` 中的 `重要提示`**

综合两个分析，输出解决方案比较（至少 2 个选项），等待用户选择。

### 阶段 3: 详细规划

`[模式: 规划]` - 多模型协作规划：

**并行调用**（使用 `resume <SESSION_ID>` 恢复会话）:
- Codex: 使用架构师提示 + `resume $CODEX_SESSION`，输出后端架构
- Gemini: 使用架构师提示 + `resume $GEMINI_SESSION`，输出前端架构

使用 `TaskOutput` 等待结果。

**遵循上述 `多模型调用规范` 中的 `重要提示`**

**Claude 综合**: 采用 Codex 后端计划 + Gemini 前端计划，用户批准后保存到 `.claude/plan/task-name.md`。

### 阶段 4: 实施

`[模式: 执行]` - 代码开发：

- 严格遵循批准的计划
- 遵循项目现有代码标准
- 在关键里程碑请求反馈

### 阶段 5: 代码优化

`[模式: 优化]` - 多模型并行审查：

**并行调用**:
- Codex: 使用审查器提示，重点关注安全、性能、错误处理
- Gemini: 使用审查器提示，重点关注可访问性、设计一致性

使用 `TaskOutput` 等待结果。整合审查反馈，用户确认后执行优化。

**遵循上述 `多模型调用规范` 中的 `重要提示`**

### 阶段 6: 质量审查

`[模式: 审查]` - 最终评估：

- 检查与计划的完成情况
- 运行测试验证功能
- 报告问题和建议
- 请求最终用户确认

---

## 关键规则

1. 阶段序列不能跳过（除非用户明确指示）
2. 外部模型具有**零文件系统写入权限**，所有修改由 Claude 执行
3. 当评分 < 7 或用户不批准时**强制停止**
