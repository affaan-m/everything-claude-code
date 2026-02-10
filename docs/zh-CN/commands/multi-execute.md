# Execute - 多模型协作执行

多模型协作执行 - 从计划获取原型 → Claude 重构和实施 → 多模型审计和交付。

$ARGUMENTS

---

## 核心协议

- **语言协议**: 与工具/模型交互时使用**英语**，用用户的语言与用户交流
- **代码主权**: 外部模型具有**零文件系统写入权限**，所有修改由 Claude 执行
- **脏原型重构**: 将 Codex/Gemini 的统一差异视为"脏原型"，必须重构为生产级代码
- **止损机制**: 在当前阶段输出经过验证之前，不要进入下一阶段
- **先决条件**: 仅在用户明确回复"Y"给 `/ccg:plan` 输出后执行（如果缺失，必须先确认）

---

## 多模型调用规范

**调用语法**（并行：使用 `run_in_background: true`）：

```
# 恢复会话调用（推荐）- 实施原型
Bash({
  command: "~/.claude/bin/codeagent-wrapper {{LITE_MODE_FLAG}}--backend <codex|gemini> {{GEMINI_MODEL_FLAG}}resume <SESSION_ID> - \"$PWD\" <<'EOF'
ROLE_FILE: <角色提示路径>
<TASK>
需求: <任务描述>
上下文: <计划内容 + 目标文件>
</TASK>
输出: 仅统一差异补丁。严格禁止任何实际修改。
EOF",
  run_in_background: true,
  timeout: 3600000,
  description: "简短描述"
})

# 新会话调用 - 实施原型
Bash({
  command: "~/.claude/bin/codeagent-wrapper {{LITE_MODE_FLAG}}--backend <codex|gemini> {{GEMINI_MODEL_FLAG}}- \"$PWD\" <<'EOF'
ROLE_FILE: <角色提示路径>
<TASK>
需求: <任务描述>
上下文: <计划内容 + 目标文件>
</TASK>
输出: 仅统一差异补丁。严格禁止任何实际修改。
EOF",
  run_in_background: true,
  timeout: 3600000,
  description: "简短描述"
})
```

**审计调用语法**（代码审查/审计）：

```
Bash({
  command: "~/.claude/bin/codeagent-wrapper {{LITE_MODE_FLAG}}--backend <codex|gemini> {{GEMINI_MODEL_FLAG}}resume <SESSION_ID> - \"$PWD\" <<'EOF'
ROLE_FILE: <角色提示路径>
<TASK>
范围: 审计最终代码更改。
输入:
- 应用的补丁（git diff / 最终统一差异）
- 涉及的文件（如需要则摘录相关部分）
约束:
- 不要修改任何文件。
- 不要输出假设文件系统访问的工具命令。
</TASK>
输出:
1) 按优先级排列的问题列表（严重程度、文件、理由）
2) 具体修复；如果需要代码更改，在围栏代码块中包含统一差异补丁。
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
| 实施 | `~/.claude/.ccg/prompts/codex/architect.md` | `~/.claude/.ccg/prompts/gemini/frontend.md` |
| 审查 | `~/.claude/.ccg/prompts/codex/reviewer.md` | `~/.claude/.ccg/prompts/gemini/reviewer.md` |

**会话重用**: 如果 `/ccg:plan` 提供了 SESSION_ID，使用 `resume <SESSION_ID>` 重用上下文。

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

**执行任务**: $ARGUMENTS

### 阶段 0：读取计划

`[模式: 准备]`

1. **识别输入类型**:
   - 计划文件路径（例如 `.claude/plan/xxx.md`）
   - 直接任务描述

2. **读取计划内容**:
   - 如果提供计划文件路径，读取并解析
   - 提取：任务类型、实施步骤、关键文件、SESSION_ID

3. **执行前确认**:
   - 如果输入是"直接任务描述"或计划缺少 `SESSION_ID` / 关键文件：先确认用户
   - 如果无法确认用户已回复"Y"给计划：必须在继续之前再次确认

4. **任务类型路由**:

   | 任务类型 | 检测方式 | 路由 |
   |-----------|-----------|-------|
   | **前端** | 页面、组件、UI、样式、布局 | Gemini |
   | **后端** | API、接口、数据库、逻辑、算法 | Codex |
   | **全栈** | 同时包含前端和后端 | Codex ∥ Gemini 并行 |

---

### 阶段 1：快速上下文检索

`[模式: 检索]`

**必须使用 MCP 工具进行快速上下文检索，不要手动逐个读取文件**

根据计划中的"关键文件"列表，调用 `mcp__ace-tool__search_context`：

```
mcp__ace-tool__search_context({
  query: "<基于计划内容的语义查询，包括关键文件、模块、函数名>",
  project_root_path: "$PWD"
})
```

**检索策略**:
- 从计划的"关键文件"表中提取目标路径
- 构建涵盖以下内容的语义查询：入口文件、依赖模块、相关类型定义
- 如果结果不足，添加 1-2 次递归检索
- **绝不**使用 Bash + find/ls 手动探索项目结构

**检索后**:
- 整理检索到的代码片段
- 确认实施的完整上下文
- 进入阶段 2

---

### 阶段 2：原型获取

`[模式: 原型]`

**根据任务类型路由**:

#### 路由 A: 前端/UI/样式 → Gemini

**限制**: 上下文 < 32k 令牌

1. 调用 Gemini（使用 `~/.claude/.ccg/prompts/gemini/frontend.md`）
2. 输入：计划内容 + 检索的上下文 + 目标文件
3. 输出：`仅统一差异补丁。严格禁止任何实际修改。`
4. **Gemini 是前端设计权威，其 CSS/React/Vue 原型是最终视觉基线**
5. **警告**: 忽略 Gemini 的后端逻辑建议
6. 如果计划包含 `GEMINI_SESSION`: 优先使用 `resume <GEMINI_SESSION>`

#### 路由 B: 后端/逻辑/算法 → Codex

1. 调用 Codex（使用 `~/.claude/.ccg/prompts/codex/architect.md`）
2. 输入：计划内容 + 检索的上下文 + 目标文件
3. 输出：`仅统一差异补丁。严格禁止任何实际修改。`
4. **Codex 是后端逻辑权威，利用其逻辑推理和调试能力**
5. 如果计划包含 `CODEX_SESSION`: 优先使用 `resume <CODEX_SESSION>`

#### 路由 C: 全栈 → 并行调用

1. **并行调用**（`run_in_background: true`）:
   - Gemini: 处理前端部分
   - Codex: 处理后端部分
2. 使用 `TaskOutput` 等待两个模型的完整结果
3. 各自使用计划中相应的 `SESSION_ID` 进行 `resume`（如果缺失则创建新会话）

**遵循上述 `多模型调用规范` 中的 `重要提示`**

---

### 阶段 3：代码实施

`[模式: 实施]`

**Claude 作为代码主权执行以下步骤**：

1. **读取差异**: 解析 Codex/Gemini 返回的统一差异补丁

2. **思维沙盒**:
   - 模拟将差异应用到目标文件
   - 检查逻辑一致性
   - 识别潜在冲突或副作用

3. **重构和清理**:
   - 将"脏原型"重构为**高度可读、可维护、企业级代码**
   - 移除冗余代码
   - 确保符合项目现有代码标准
   - **除非必要，不生成注释/文档**，代码应自解释

4. **最小范围**:
   - 更改仅限于需求范围
   - **必须审查**副作用
   - 进行有针对性的修正

5. **应用更改**:
   - 使用 Edit/Write 工具执行实际修改
   - **仅修改必要的代码**，绝不影响用户的其他现有功能

6. **自我验证**（强烈推荐）:
   - 运行项目现有的 lint / typecheck / tests（优先最小相关范围）
   - 如果失败：先修复回归，然后进入阶段 5

---

### 阶段 4：审计和交付

`[模式: 审计]`

#### 5.1 自动审计

**更改生效后，必须立即并行调用** Codex 和 Gemini 进行代码审查：

1. **Codex 审查**（`run_in_background: true`）:
   - ROLE_FILE: `~/.claude/.ccg/prompts/codex/reviewer.md`
   - 输入：更改的差异 + 目标文件
   - 重点: 安全、性能、错误处理、逻辑正确性

2. **Gemini 审查**（`run_in_background: true`）:
   - ROLE_FILE: `~/.claude/.ccg/prompts/gemini/reviewer.md`
   - 输入：更改的差异 + 目标文件
   - 重点: 可访问性、设计一致性、用户体验

使用 `TaskOutput` 等待两个模型的完整审查结果。优先重用阶段 3 的会话（`resume <SESSION_ID>`）以保持上下文一致性。

#### 5.2 整合和修复

1. 综合 Codex + Gemini 审查反馈
2. 按信任规则权衡：后端遵循 Codex，前端遵循 Gemini
3. 执行必要的修复
4. 根据需要重复阶段 5.1（直到风险可接受）

#### 5.3 交付确认

审计通过后，向用户报告：

```markdown
## 执行完成

### 更改摘要
| 文件 | 操作 | 描述 |
|------|-----------|-------------|
| path/to/file.ts | 修改 | 描述 |

### 审计结果
- Codex: <通过/发现 N 个问题>
- Gemini: <通过/发现 N 个问题>

### 建议
1. [ ] <建议的测试步骤>
2. [ ] <建议的验证步骤>
```

---

## 关键规则

1. **代码主权** – 所有文件修改由 Claude 执行，外部模型零写入权限
2. **脏原型重构** – Codex/Gemini 输出视为草稿，必须重构
3. **信任规则** – 后端遵循 Codex，前端遵循 Gemini
4. **最小更改** – 仅修改必要的代码，无副作用
5. **强制审计** – 更改后必须进行多模型代码审查

---

## 用法

```bash
# 执行计划文件
/ccg:execute .claude/plan/feature-name.md

# 直接执行任务（针对上下文中已讨论的计划）
/ccg:execute 基于之前的计划实施用户认证
```

---

## 与 /ccg:plan 的关系

1. `/ccg:plan` 生成计划 + SESSION_ID
2. 用户确认"Y"
3. `/ccg:execute` 读取计划，重用 SESSION_ID，执行实施
