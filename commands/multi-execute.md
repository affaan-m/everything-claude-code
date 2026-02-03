---
description: '多模型协作执行 - 根据计划获取原型 → Claude 重构实施 → 多模型审计交付'
---

# Execute - 多模型协作执行

$ARGUMENTS

---

## 核心协议

- **语言协议**：与工具/模型交互用**英语**，与用户交互用**中文**
- **代码主权**：外部模型对文件系统**零写入权限**，所有修改由 Claude 执行
- **脏原型重构**：将 Codex/Gemini 的 Unified Diff 视为"脏原型"，必须重构为生产级代码
- **止损机制**：当前阶段输出通过验证前，不进入下一阶段
- **前置条件**：仅在用户对 `/ccg:plan` 输出明确回复 "Y" 后执行（如缺失，必须先二次确认）

---

## 多模型调用规范

**调用语法**（并行用 `run_in_background: true`）：

```
# 复用会话调用（推荐）- 原型生成（Implementation Prototype）
Bash({
  command: "~/.claude/bin/codeagent-wrapper {{LITE_MODE_FLAG}}--backend <codex|gemini> {{GEMINI_MODEL_FLAG}}resume <SESSION_ID> - \"$PWD\" <<'EOF'
ROLE_FILE: <角色提示词路径>
<TASK>
需求：<任务描述>
上下文：<计划内容 + 目标文件>
</TASK>
OUTPUT: Unified Diff Patch ONLY. Strictly prohibit any actual modifications.
EOF",
  run_in_background: true,
  timeout: 3600000,
  description: "简短描述"
})

# 新会话调用 - 原型生成（Implementation Prototype）
Bash({
  command: "~/.claude/bin/codeagent-wrapper {{LITE_MODE_FLAG}}--backend <codex|gemini> {{GEMINI_MODEL_FLAG}}- \"$PWD\" <<'EOF'
ROLE_FILE: <角色提示词路径>
<TASK>
需求：<任务描述>
上下文：<计划内容 + 目标文件>
</TASK>
OUTPUT: Unified Diff Patch ONLY. Strictly prohibit any actual modifications.
EOF",
  run_in_background: true,
  timeout: 3600000,
  description: "简短描述"
})
```

**审计调用语法**（Code Review / Audit）：

```
Bash({
  command: "~/.claude/bin/codeagent-wrapper {{LITE_MODE_FLAG}}--backend <codex|gemini> {{GEMINI_MODEL_FLAG}}resume <SESSION_ID> - \"$PWD\" <<'EOF'
ROLE_FILE: <角色提示词路径>
<TASK>
Scope: Audit the final code changes.
Inputs:
- The applied patch (git diff / final unified diff)
- The touched files (relevant excerpts if needed)
Constraints:
- Do NOT modify any files.
- Do NOT output tool commands that assume filesystem access.
</TASK>
OUTPUT:
1) A prioritized list of issues (severity, file, rationale)
2) Concrete fixes; if code changes are needed, include a Unified Diff Patch in a fenced code block.
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
| 实施 | `~/.claude/.ccg/prompts/codex/architect.md` | `~/.claude/.ccg/prompts/gemini/frontend.md` |
| 审查 | `~/.claude/.ccg/prompts/codex/reviewer.md` | `~/.claude/.ccg/prompts/gemini/reviewer.md` |

**会话复用**：如果 `/ccg:plan` 提供了 SESSION_ID，使用 `resume <SESSION_ID>` 复用上下文。

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

**执行任务**：$ARGUMENTS

### 📖 Phase 0：读取计划

`[模式：准备]`

1. **识别输入类型**：
   - 计划文件路径（如 `.claude/plan/xxx.md`）
   - 直接的任务描述

2. **读取计划内容**：
   - 若提供了计划文件路径，读取并解析
   - 提取：任务类型、实施步骤、关键文件、SESSION_ID

3. **执行前确认**：
   - 若输入为"直接任务描述"或计划中缺失 `SESSION_ID` / 关键文件：先向用户确认补全信息
   - 若无法确认用户是否已对计划回复 "Y"：必须二次询问确认后再进入下一阶段

4. **任务类型判断**：

   | 任务类型 | 判断依据 | 路由 |
   |----------|----------|------|
   | **前端** | 页面、组件、UI、样式、布局 | Gemini |
   | **后端** | API、接口、数据库、逻辑、算法 | Codex |
   | **全栈** | 同时包含前后端 | Codex ∥ Gemini 并行 |

---

### 🔍 Phase 1：上下文快速检索

`[模式：检索]`

**⚠️ 必须使用 MCP 工具快速检索上下文，禁止手动逐个读取文件**

根据计划中的"关键文件"列表，调用 `mcp__ace-tool__search_context` 检索相关代码：

```
mcp__ace-tool__search_context({
  query: "<基于计划内容构建的语义查询，包含关键文件、模块、函数名>",
  project_root_path: "$PWD"
})
```

**检索策略**：
- 从计划的"关键文件"表格提取目标路径
- 构建语义查询覆盖：入口文件、依赖模块、相关类型定义
- 若检索结果不足，可追加 1-2 次递归检索
- **禁止**使用 Bash + find/ls 手动探索项目结构

**检索完成后**：
- 整理检索到的代码片段
- 确认已获取实施所需的完整上下文
- 进入 Phase 3

---

### 🎨 Phase 3：原型获取

`[模式：原型]`

**根据任务类型路由**：

#### Route A: 前端/UI/样式 → Gemini

**限制**：上下文 < 32k tokens

1. 调用 Gemini（使用 `~/.claude/.ccg/prompts/gemini/frontend.md`）
2. 输入：计划内容 + 检索到的上下文 + 目标文件
3. OUTPUT: `Unified Diff Patch ONLY. Strictly prohibit any actual modifications.`
4. **Gemini 是前端设计的权威，其 CSS/React/Vue 原型为最终视觉基准**
5. ⚠️ **警告**：忽略 Gemini 对后端逻辑的建议
6. 若计划包含 `GEMINI_SESSION`：优先 `resume <GEMINI_SESSION>`

#### Route B: 后端/逻辑/算法 → Codex

1. 调用 Codex（使用 `~/.claude/.ccg/prompts/codex/architect.md`）
2. 输入：计划内容 + 检索到的上下文 + 目标文件
3. OUTPUT: `Unified Diff Patch ONLY. Strictly prohibit any actual modifications.`
4. **Codex 是后端逻辑的权威，利用其逻辑运算与 Debug 能力**
5. 若计划包含 `CODEX_SESSION`：优先 `resume <CODEX_SESSION>`

#### Route C: 全栈 → 并行调用

1. **并行调用**（`run_in_background: true`）：
   - Gemini：处理前端部分
   - Codex：处理后端部分
2. 用 `TaskOutput` 等待两个模型的完整结果
3. 各自使用计划中对应的 `SESSION_ID` 进行 `resume`（若缺失则创建新会话）

**务必遵循上方 `多模型调用规范` 的 `重要` 指示**

---

### ⚡ Phase 4：编码实施

`[模式：实施]`

**Claude 作为代码主权者执行以下步骤**：

1. **读取 Diff**：解析 Codex/Gemini 返回的 Unified Diff Patch

2. **思维沙箱**：
   - 模拟应用 Diff 到目标文件
   - 检查逻辑一致性
   - 识别潜在冲突或副作用

3. **重构清理**：
   - 将"脏原型"重构为**高可读、高可维护性、企业发布级代码**
   - 去除冗余代码
   - 确保符合项目现有代码规范
   - **非必要不生成注释与文档**，代码自解释

4. **最小作用域**：
   - 变更仅限需求范围
   - **强制审查**变更是否引入副作用
   - 做针对性修正

5. **应用变更**：
   - 使用 Edit/Write 工具执行实际修改
   - **仅修改必要的代码**，严禁影响用户现有的其他功能
6. **自检验证**（强烈建议）：
   - 运行项目既有的 lint / typecheck / tests（优先最小相关范围）
   - 若失败：优先修复回归，再继续进入 Phase 5

---

### ✅ Phase 5：审计与交付

`[模式：审计]`

#### 5.1 自动审计

**变更生效后，强制立即并行调用** Codex 和 Gemini 进行 Code Review：

1. **Codex 审查**（`run_in_background: true`）：
   - ROLE_FILE: `~/.claude/.ccg/prompts/codex/reviewer.md`
   - 输入：变更的 Diff + 目标文件
   - 关注：安全性、性能、错误处理、逻辑正确性

2. **Gemini 审查**（`run_in_background: true`）：
   - ROLE_FILE: `~/.claude/.ccg/prompts/gemini/reviewer.md`
   - 输入：变更的 Diff + 目标文件
   - 关注：可访问性、设计一致性、用户体验

用 `TaskOutput` 等待两个模型的完整审查结果。优先复用 Phase 3 的会话（`resume <SESSION_ID>`）以保持上下文一致。

#### 5.2 整合修复

1. 综合 Codex + Gemini 的审查意见
2. 按信任规则权衡：后端以 Codex 为准，前端以 Gemini 为准
3. 执行必要的修复
4. 修复后按需重复 Phase 5.1（直到风险可接受）

#### 5.3 交付确认

审计通过后，向用户报告：

```markdown
## ✅ 执行完成

### 变更摘要
| 文件 | 操作 | 说明 |
|------|------|------|
| path/to/file.ts | 修改 | 描述 |

### 审计结果
- Codex：<通过/发现 N 个问题>
- Gemini：<通过/发现 N 个问题>

### 后续建议
1. [ ] <建议的测试步骤>
2. [ ] <建议的验证步骤>
```

---

## 关键规则

1. **代码主权** – 所有文件修改由 Claude 执行，外部模型零写入权限
2. **脏原型重构** – Codex/Gemini 的输出视为草稿，必须重构
3. **信任规则** – 后端以 Codex 为准，前端以 Gemini 为准
4. **最小变更** – 仅修改必要的代码，不引入副作用
5. **强制审计** – 变更后必须进行多模型 Code Review

---

## 使用方法

```bash
# 执行计划文件
/ccg:execute .claude/plan/功能名.md

# 直接执行任务（适用于已在上下文中讨论过的计划）
/ccg:execute 根据之前的计划实施用户认证功能
```

---

## 与 /ccg:plan 的关系

1. `/ccg:plan` 生成计划 + SESSION_ID
2. 用户确认 "Y" 后
3. `/ccg:execute` 读取计划，复用 SESSION_ID，执行实施
