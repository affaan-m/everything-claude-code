---
description: 对抗性双重审查收敛循环——两个独立的模型审查员必须都批准后，代码才能发布。
---

# 圣诞循环

使用 santa-method 技能进行对抗性双审收敛循环。两位独立审阅者——不同模型，无共享上下文——必须都返回 NICE 才能推送代码。

## 目的

针对当前任务输出运行两位独立审阅者（Claude Opus + 一个外部模型）。两者都必须返回 NICE 才能推送代码。如果任何一方返回 NAUGHTY，则修复所有标记的问题，提交，并重新运行新的审阅者——最多 3 轮。

## 用法

```
/santa-loop [文件或通配符 | 描述]
```

## 工作流程

### 步骤 1：确定审阅范围

从 `$ARGUMENTS` 确定范围，或回退到未提交的更改：

```bash
git diff --name-only HEAD
```

读取所有更改的文件以构建完整的审阅上下文。如果 `$ARGUMENTS` 指定了路径、文件或描述，则将其用作范围。

### 步骤 2：构建评估标准

构建适合审阅文件类型的评估标准。每个标准都必须有客观的通过/失败条件。至少包括：

| 标准 | 通过条件 |
|-----------|---------------|
| 正确性 | 逻辑正确，无错误，处理边界情况 |
| 安全性 | 无密钥、注入、XSS 或 OWASP Top 10 问题 |
| 错误处理 | 错误被显式处理，无静默吞没 |
| 完整性 | 所有需求都已解决，无遗漏情况 |
| 内部一致性 | 文件或部分之间无矛盾 |
| 无回归 | 更改不会破坏现有行为 |

根据文件类型添加特定领域的标准（例如，TS 的类型安全，Rust 的内存安全，SQL 的迁移安全）。

### 步骤 3：双重独立审阅

使用 Agent 工具**并行**启动两位审阅者（两者都在一条消息中以便并发执行）。两者都必须在进入裁决门之前完成。

每位审阅者将每个评估标准评估为 PASS 或 FAIL，然后返回结构化的 JSON：

```json
{
  "verdict": "PASS" | "FAIL",
  "checks": [
    {"criterion": "...", "result": "PASS|FAIL", "detail": "..."}
  ],
  "critical_issues": ["..."],
  "suggestions": ["..."]
}
```

裁决门（步骤 4）将这些映射到 NICE/NAUGHTY：两者都 PASS → NICE，任一 FAIL → NAUGHTY。

#### 审阅者 A：Claude Agent（始终运行）

启动一个 Agent（subagent\_type: `code-reviewer`, model: `opus`），附带完整的评估标准 + 所有待审阅的文件。提示必须包括：

* 完整的评估标准
* 所有待审阅的文件内容
* "你是一位独立的质量审阅者。你**没有**看过任何其他审阅。你的工作是发现问题，而不是批准。"
* 返回上述结构化的 JSON 裁决

#### 审阅者 B：外部模型（仅当未安装外部 CLI 时回退到 Claude）

首先，检测可用的 CLI：

```bash
command -v codex >/dev/null 2>&1 && echo "codex" || true
command -v gemini >/dev/null 2>&1 && echo "gemini" || true
```

构建审阅者提示（与审阅者 A 相同的评估标准 + 指令）并将其写入唯一的临时文件：

```bash
PROMPT_FILE=$(mktemp /tmp/santa-reviewer-b-XXXXXX.txt)
cat > "$PROMPT_FILE" << 'EOF'
... full rubric + file contents + reviewer instructions ...
EOF
```

使用第一个可用的 CLI：

**Codex CLI**（如果已安装）

```bash
codex exec --sandbox read-only -m gpt-5.4 -C "$(pwd)" - < "$PROMPT_FILE"
rm -f "$PROMPT_FILE"
```

**Gemini CLI**（如果已安装且未安装 codex）

```bash
gemini -p "$(cat "$PROMPT_FILE")" -m gemini-2.5-pro
rm -f "$PROMPT_FILE"
```

**Claude Agent 回退**（仅当 `codex` 和 `gemini` 都未安装时）
启动第二个 Claude Agent（subagent\_type: `code-reviewer`, model: `opus`）。记录警告：两位审阅者共享同一模型家族——未实现真正的模型多样性，但上下文隔离仍然强制执行。

在所有情况下，审阅者必须返回与审阅者 A 相同的结构化 JSON 裁决。

### 步骤 4：裁决门

* **两者都 PASS** → **NICE** — 继续步骤 6（推送）
* **任一 FAIL** → **NAUGHTY** — 合并两位审阅者的所有关键问题，去重，继续步骤 5

### 步骤 5：修复周期（NAUGHTY 路径）

1. 显示两位审阅者的所有关键问题
2. 修复每个标记的问题——仅更改被标记的内容，不进行无关的重构
3. 在单个提交中提交所有修复：
   ```
   fix: address santa-loop review findings (round N)
   ```
4. 使用**新的审阅者**重新运行步骤 3（不保留先前轮次的记忆）
5. 重复直到两者都返回 PASS

**最多 3 次迭代。** 如果 3 轮后仍为 NAUGHTY，则停止并呈现剩余问题：

```
SANTA LOOP ESCALATION (超过 3 次迭代)

经过 3 轮后仍存在的问题：
- [列出所有未解决的关键问题，来自两位评审者]

在继续之前需要手动审查。
```

请勿推送。

### 步骤 6：推送（NICE 路径）

当两位审阅者都返回 PASS 时：

```bash
git push -u origin HEAD
```

### 步骤 7：最终报告

打印输出报告（见下方输出部分）。

## 输出

```
SANTA 裁决：[好孩子 / 淘气鬼（已升级）]

审核员 A (Claude Opus)：   [通过/不通过]
审核员 B ([使用的模型])：  [通过/不通过]

一致性：
  双方均标记：      [双方均发现的问题]
  仅审核员 A：   [仅 A 发现的问题]
  仅审核员 B：   [仅 B 发现的问题]

迭代次数：[N]/3
结果：     [已推送 / 已升级至用户]
```

## 注意事项

* 审阅者 A（Claude Opus）始终运行——保证无论工具如何，至少有一位强大的审阅者。
* 审阅者 B 的目标是模型多样性。GPT-5.4 或 Gemini 2.5 Pro 提供了真正的独立性——不同的训练数据、不同的偏见、不同的盲点。仅使用 Claude 的回退方案仍然通过上下文隔离提供价值，但失去了模型多样性。
* 使用可用的最强模型：Opus 用于审阅者 A，GPT-5.4 或 Gemini 2.5 Pro 用于审阅者 B。
* 外部审阅者使用 `--sandbox read-only`（Codex）运行，以防止在审阅期间仓库发生变更。
* 每轮使用新的审阅者可以防止先前发现的锚定偏见。
* 评估标准是最重要的输入。如果审阅者草率批准或标记主观风格问题，请收紧标准。
* 在 NAUGHTY 轮次进行提交，以便即使循环中断，修复也能被保留。
* 仅在 NICE 之后推送——绝不中途推送。
