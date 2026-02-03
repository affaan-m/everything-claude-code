---
description: '多模型协作规划 - 上下文检索 + 双模型分析 → 生成 Step-by-step 实施计划'
---

# Plan - 多模型协作规划

$ARGUMENTS

---

## 核心协议

- **语言协议**：与工具/模型交互用**英语**，与用户交互用**中文**
- **强制并行**：Codex/Gemini 调用必须使用 `run_in_background: true`（包含单模型调用，避免阻塞主线程）
- **代码主权**：外部模型对文件系统**零写入权限**，所有修改由 Claude 执行
- **止损机制**：当前阶段输出通过验证前，不进入下一阶段
- **仅规划**：本命令允许读取上下文与写入 `.claude/plan/*` 计划文件，但**禁止修改产品代码**

---

## 多模型调用规范

**调用语法**（并行用 `run_in_background: true`）：

```
Bash({
  command: "~/.claude/bin/codeagent-wrapper {{LITE_MODE_FLAG}}--backend <codex|gemini> {{GEMINI_MODEL_FLAG}}- \"$PWD\" <<'EOF'
ROLE_FILE: <角色提示词路径>
<TASK>
需求：<增强后的需求>
上下文：<检索到的项目上下文>
</TASK>
OUTPUT: Step-by-step implementation plan with pseudo-code. DO NOT modify any files.
EOF",
  run_in_background: true,
  timeout: 3600000,
  description: "简短描述"
})
```

**模型参数说明**：
- `{{GEMINI_MODEL_FLAG}}`：当使用 `--backend gemini` 时，替换为 `--gemini-model gemini-3-pro-preview `（注意末尾空格）；使用 codex 时替换为空字符串

**角色提示词**：

| 阶段 | Codex | Gemini |
|------|-------|--------|
| 分析 | `~/.claude/.ccg/prompts/codex/analyzer.md` | `~/.claude/.ccg/prompts/gemini/analyzer.md` |
| 规划 | `~/.claude/.ccg/prompts/codex/architect.md` | `~/.claude/.ccg/prompts/gemini/architect.md` |

**会话复用**：每次调用返回 `SESSION_ID: xxx`（通常由 wrapper 输出），**必须保存**以供后续 `/ccg:execute` 使用。

**等待后台任务**（最大超时 600000ms = 10 分钟）：

```
TaskOutput({ task_id: "<task_id>", block: true, timeout: 600000 })
```

**重要**：
- 必须指定 `timeout: 600000`，否则默认只有 30 秒会导致提前超时
- 若 10 分钟后仍未完成，继续用 `TaskOutput` 轮询，**绝对不要 Kill 进程**
- 若因等待时间过长跳过了等待，**必须调用 `AskUserQuestion` 询问用户选择继续等待还是 Kill Task**

---

## 执行工作流

**规划任务**：$ARGUMENTS

### 🔍 Phase 1：上下文全量检索

`[模式：研究]`

#### 1.1 Prompt 增强（必须首先执行）

**⚠️ 必须调用 `mcp__ace-tool__enhance_prompt` 工具**：

```
mcp__ace-tool__enhance_prompt({
  prompt: "$ARGUMENTS",
  conversation_history: "<最近5-10轮对话历史>",
  project_root_path: "$PWD"
})
```

等待返回增强后的 prompt，**用增强结果替代原始 $ARGUMENTS** 用于后续所有阶段。

#### 1.2 上下文检索

**调用 `mcp__ace-tool__search_context` 工具**：

```
mcp__ace-tool__search_context({
  query: "<基于增强后需求构建的语义查询>",
  project_root_path: "$PWD"
})
```

- 使用自然语言构建语义查询（Where/What/How）
- **禁止基于假设回答**
- 若 MCP 不可用：回退到 Glob + Grep 进行文件发现与关键符号定位

#### 1.3 完整性检查

- 必须获取相关类、函数、变量的**完整定义与签名**
- 若上下文不足，触发**递归检索**
- 优先输出：入口文件 + 行号 + 关键符号名；必要时补充最小代码片段（仅用于消除歧义）

#### 1.4 需求对齐

- 若需求仍有模糊空间，**必须**向用户输出引导性问题列表
- 直至需求边界清晰（无遗漏、无冗余）

### 💡 Phase 2：多模型协作分析

`[模式：分析]`

#### 2.1 分发输入

**并行调用** Codex 和 Gemini（`run_in_background: true`）：

将**原始需求**（不带预设观点）分发给两个模型：

1. **Codex 后端分析**：
   - ROLE_FILE: `~/.claude/.ccg/prompts/codex/analyzer.md`
   - 关注：技术可行性、架构影响、性能考量、潜在风险
   - OUTPUT: 多角度解决方案 + 优劣势分析

2. **Gemini 前端分析**：
   - ROLE_FILE: `~/.claude/.ccg/prompts/gemini/analyzer.md`
   - 关注：UI/UX 影响、用户体验、视觉设计
   - OUTPUT: 多角度解决方案 + 优劣势分析

用 `TaskOutput` 等待两个模型的完整结果。**📌 保存 SESSION_ID**（`CODEX_SESSION` 和 `GEMINI_SESSION`）。

#### 2.2 交叉验证

整合各方思路，进行迭代优化：

1. **识别一致观点**（强信号）
2. **识别分歧点**（需权衡）
3. **互补优势**：后端逻辑以 Codex 为准，前端设计以 Gemini 为准
4. **逻辑推演**：消除方案中的逻辑漏洞

#### 2.3（可选但推荐）双模型产出“计划草案”

为降低 Claude 合成计划的遗漏风险，可并行让两个模型输出“计划草案”（仍然**不允许**修改文件）：

1. **Codex 计划草案**（后端权威）：
   - ROLE_FILE: `~/.claude/.ccg/prompts/codex/architect.md`
   - OUTPUT: Step-by-step plan + pseudo-code（重点：数据流/边界条件/错误处理/测试策略）

2. **Gemini 计划草案**（前端权威）：
   - ROLE_FILE: `~/.claude/.ccg/prompts/gemini/architect.md`
   - OUTPUT: Step-by-step plan + pseudo-code（重点：信息架构/交互/可访问性/视觉一致性）

用 `TaskOutput` 等待两个模型的完整结果，并记录其建议的关键差异点。

#### 2.4 生成实施计划（Claude 最终版）

综合双方分析，生成 **Step-by-step 实施计划**：

```markdown
## 📋 实施计划：<任务名称>

### 任务类型
- [ ] 前端 (→ Gemini)
- [ ] 后端 (→ Codex)
- [ ] 全栈 (→ 并行)

### 技术方案
<综合 Codex + Gemini 分析的最优方案>

### 实施步骤
1. <步骤 1> - 预期产物
2. <步骤 2> - 预期产物
...

### 关键文件
| 文件 | 操作 | 说明 |
|------|------|------|
| path/to/file.ts:L10-L50 | 修改 | 描述 |

### 风险与缓解
| 风险 | 缓解措施 |
|------|----------|

### SESSION_ID（供 /ccg:execute 使用）
- CODEX_SESSION: <session_id>
- GEMINI_SESSION: <session_id>
```

### ⛔ Phase 2 结束：计划交付（非执行）

**`/ccg:plan` 的职责到此结束，必须执行以下动作**：

1. 向用户展示完整实施计划（含伪代码）
2. 将计划保存至 `.claude/plan/<功能名>.md`（功能名从需求中提取，如 `user-auth`、`payment-module` 等）
3. 以**加粗文本**输出提示（必须使用实际保存的文件路径）：

   ---
   **📋 计划已生成并保存至 `.claude/plan/实际功能名.md`**

   **请审查上述计划，您可以：**
   - 🔧 **修改计划**：告诉我需要调整的部分，我会更新计划
   - ▶️ **执行计划**：复制以下命令到新会话执行

   ```
   /ccg:execute .claude/plan/实际功能名.md
   ```
   ---

   **⚠️ 注意**：上面的 `实际功能名.md` 必须替换为你实际保存的文件名！

4. **立即终止当前回复**（Stop here. No more tool calls.）

**⚠️ 绝对禁止**：
- ❌ 问用户 "Y/N" 然后自动执行（执行是 `/ccg:execute` 的职责）
- ❌ 对产品代码进行任何写操作
- ❌ 自动调用 `/ccg:execute` 或任何实施动作
- ❌ 在用户未明确要求修改时继续触发模型调用

---

## 计划保存

规划完成后，将计划保存至：

- **首次规划**：`.claude/plan/<功能名>.md`
- **迭代版本**：`.claude/plan/<功能名>-v2.md`、`.claude/plan/<功能名>-v3.md`...

计划文件写入应在向用户展示计划前完成。

---

## 计划修改流程

如果用户要求修改计划：

1. 根据用户反馈调整计划内容
2. 更新 `.claude/plan/<功能名>.md` 文件
3. 重新展示修改后的计划
4. 再次提示用户审查或执行

---

## 后续步骤

用户审查满意后，**手动**执行：

```bash
/ccg:execute .claude/plan/<功能名>.md
```

---

## 关键规则

1. **仅规划不实施** – 本命令不执行任何代码变更
2. **不问 Y/N** – 只展示计划，让用户决定下一步
3. **信任规则** – 后端以 Codex 为准，前端以 Gemini 为准
4. 外部模型对文件系统**零写入权限**
5. **SESSION_ID 交接** – 计划末尾必须包含 `CODEX_SESSION` / `GEMINI_SESSION`（供 `/ccg:execute resume <SESSION_ID>` 使用）
