# Plan - 多模型协作规划

多模型协作规划 - 上下文检索 + 双模型分析 → 生成分步实施计划。

$ARGUMENTS

---

## 核心协议

- **语言协议**: 与工具/模型交互时使用**英语**，用用户的语言与用户交流
- **强制并行**: Codex/Gemini 调用必须使用 `run_in_background: true`（包括单模型调用，以避免阻塞主线程）
- **代码主权**: 外部模型具有**零文件系统写入权限**，所有修改由 Claude 执行
- **止损机制**: 在当前阶段输出经过验证之前，不要进入下一阶段
- **仅规划**: 此命令允许读取上下文和写入 `.claude/plan/*` 计划文件，但**绝不修改生产代码**

---

## 多模型调用规范

**调用语法**（并行：使用 `run_in_background: true`）：

```
Bash({
  command: "~/.claude/bin/codeagent-wrapper {{LITE_MODE_FLAG}}--backend <codex|gemini> {{GEMINI_MODEL_FLAG}}- \"$PWD\" <<'EOF'
ROLE_FILE: <角色提示路径>
<TASK>
需求: <增强的需求>
上下文: <检索的项目上下文>
</TASK>
输出: 分步实施计划，包含伪代码。不要修改任何文件。
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

**会话重用**: 每次调用返回 `SESSION_ID: xxx`（通常由 wrapper 输出），**必须保存**供后续 `/ccg:execute` 使用。

**等待后台任务**（最大超时 600000ms = 10 分钟）：

```
TaskOutput({ task_id: "<task_id>", block: true, timeout: 600000 })
```

**重要提示**:
- 必须指定 `timeout: 600000`，否则默认 30 秒会导致过早超时
- 如果 10 分钟后仍未完成，继续使用 `TaskOutput` 轮询，**绝不终止进程**
- 如果因超时跳过等待，**必须调用 `AskUserQuestion` 询问用户是继续等待还是终止任务**

---

## 执行工作流程

**规划任务**: $ARGUMENTS

### 阶段 1：完整上下文检索

`[模式: 研究]`

#### 1.1 提示增强（必须首先执行）

**必须调用 `mcp__ace-tool__enhance_prompt` 工具**：

```
mcp__ace-tool__enhance_prompt({
  prompt: "$ARGUMENTS",
  conversation_history: "<最近 5-10 轮对话>",
  project_root_path: "$PWD"
})
```

等待增强的提示，**用增强结果替换原始 $ARGUMENTS** 用于所有后续阶段。

#### 1.2 上下文检索

**调用 `mcp__ace-tool__search_context` 工具**：

```
mcp__ace-tool__search_context({
  query: "<基于增强需求的语义查询>",
  project_root_path: "$PWD"
})
```

- 使用自然语言构建语义查询（Where/What/How）
- **绝不基于假设回答**
- 如果 MCP 不可用：回退到 Glob + Grep 进行文件发现和关键符号定位

#### 1.3 完整性检查

- 必须获得相关类、函数、变量的**完整定义和签名**
- 如果上下文不足，触发**递归检索**
- 优先输出：入口文件 + 行号 + 关键符号名称；仅在必要时添加最少的代码片段以解决歧义

#### 1.4 需求对齐

- 如果需求仍有歧义，**必须**向用户输出引导性问题
- 直到需求边界清晰（无遗漏、无冗余）

### 阶段 2：多模型协作分析

`[模式: 分析]`

#### 2.1 分发输入

**并行调用** Codex 和 Gemini（`run_in_background: true`）：

将**原始需求**（不预设观点）分发给两个模型：

1. **Codex 后端分析**:
   - ROLE_FILE: `~/.claude/.ccg/prompts/codex/analyzer.md`
   - 重点: 技术可行性、架构影响、性能考虑、潜在风险
   - 输出: 多视角解决方案 + 优缺点分析

2. **Gemini 前端分析**:
   - ROLE_FILE: `~/.claude/.ccg/prompts/gemini/analyzer.md`
   - 重点: UI/UX 影响、用户体验、视觉设计
   - 输出: 多视角解决方案 + 优缺点分析

使用 `TaskOutput` 等待两个模型的完整结果。**保存 SESSION_ID**（`CODEX_SESSION` 和 `GEMINI_SESSION`）。

#### 2.2 交叉验证

整合视角并迭代优化：

1. **识别共识**（强信号）
2. **识别分歧**（需要权衡）
3. **互补优势**: 后端逻辑遵循 Codex，前端设计遵循 Gemini
4. **逻辑推理**: 消除解决方案中的逻辑漏洞

#### 2.3 （可选但推荐）双模型计划草案

为减少 Claude 合成计划的遗漏风险，可以并行让两个模型输出"计划草案"（仍**不允许**修改文件）：

1. **Codex 计划草案**（后端权威）:
   - ROLE_FILE: `~/.claude/.ccg/prompts/codex/architect.md`
   - 输出: 分步计划 + 伪代码（重点: 数据流/边界情况/错误处理/测试策略）

2. **Gemini 计划草案**（前端权威）:
   - ROLE_FILE: `~/.claude/.ccg/prompts/gemini/architect.md`
   - 输出: 分步计划 + 伪代码（重点: 信息架构/交互/可访问性/视觉一致性）

使用 `TaskOutput` 等待两个模型的完整结果，记录其建议中的关键差异。

#### 2.4 生成实施计划（Claude 最终版本）

综合两个分析，生成**分步实施计划**：

```markdown
## 实施计划: <任务名称>

### 任务类型
- [ ] 前端（→ Gemini）
- [ ] 后端（→ Codex）
- [ ] 全栈（→ 并行）

### 技术方案
<从 Codex + Gemini 分析综合出的最优方案>

### 实施步骤
1. <步骤 1> - 预期交付物
2. <步骤 2> - 预期交付物
...

### 关键文件
| 文件 | 操作 | 描述 |
|------|-----------|-------------|
| path/to/file.ts:L10-L50 | 修改 | 描述 |

### 风险和缓解
| 风险 | 缓解措施 |
|------|------------|

### SESSION_ID（供 /ccg:execute 使用）
- CODEX_SESSION: <session_id>
- GEMINI_SESSION: <session_id>
```

### 阶段 2 结束：计划交付（不执行）

**`/ccg:plan` 责任到此结束，必须执行以下操作**：

1. 将计划保存到 `.claude/plan/<feature-name>.md`（从需求中提取功能名称，例如 `user-auth`、`payment-module`）
2. 向用户呈现完整的实施计划（包括伪代码）
3. 以**粗体文本**输出提示（必须使用实际保存的文件路径）：

   ---
   **计划已生成并保存到 `.claude/plan/actual-feature-name.md`**

   **请查看上述计划。你可以：**
   - **修改计划**: 告诉我需要调整的内容，我会更新计划
   - **执行计划**: 将以下命令复制到新会话中

   ```
   /ccg:execute .claude/plan/actual-feature-name.md
   ```
   ---

   **注意**: 上面的 `actual-feature-name.md` 必须替换为实际保存的文件名！

4. **立即终止当前响应**（在此停止。不再进行工具调用。）

**绝对禁止**:
- 询问用户"Y/N"然后自动执行（执行是 `/ccg:execute` 的责任）
- 对生产代码的任何写入操作
- 自动调用 `/ccg:execute` 或任何实施操作
- 当用户未明确请求修改时继续触发模型调用

---

## 计划保存

规划完成后，将计划保存到：

- **首次规划**: `.claude/plan/<feature-name>.md`
- **迭代版本**: `.claude/plan/<feature-name>-v2.md`、`.claude/plan/<feature-name>-v3.md`...

计划文件写入应在向用户展示计划之前完成。

---

## 计划修改流程

如果用户请求修改计划：

1. 根据用户反馈调整计划内容
2. 更新 `.claude/plan/<feature-name>.md` 文件
3. 重新展示修改后的计划
4. 再次提示用户审查或执行

---

## 后续步骤

用户批准后，**手动**执行：

```bash
/ccg:execute .claude/plan/<feature-name>.md
```

---

## 关键规则

1. **仅规划，不实施** – 此命令不执行任何代码更改
2. **无 Y/N 提示** – 仅展示计划，让用户决定后续步骤
3. **信任规则** – 后端遵循 Codex，前端遵循 Gemini
4. 外部模型具有**零文件系统写入权限**
5. **SESSION_ID 传递** – 计划必须包含末尾的 `CODEX_SESSION` / `GEMINI_SESSION`（供 `/ccg:execute resume <SESSION_ID>` 使用）
