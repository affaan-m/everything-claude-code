---
name: santa-method
description: "多智能体对抗验证与收敛循环。两个独立的审查智能体必须都通过后才能输出结果。"
origin: "Ronald Skelton - Founder, RapportScore.ai"
---

# 圣诞老人方法

多智能体对抗性验证框架。列一份清单，检查两遍。如果是顽皮的，就修复它直到它变得美好。

核心洞察：单个智能体审查自己的输出，会共享产生该输出时存在的相同偏见、知识缺口和系统性错误。两个没有共享上下文、独立的审查者可以打破这种失败模式。

## 何时激活

在以下情况调用此技能：

* 输出将被发布、部署或由最终用户消费
* 必须强制执行合规性、监管或品牌约束
* 代码未经人工审查即投入生产
* 内容准确性很重要（技术文档、教育材料、面向客户的文案）
* 大规模批量生成，其中抽查会遗漏系统性模式
* 幻觉风险较高（声明、统计数据、API 引用、法律语言）

**不要**用于内部草稿、探索性研究或具有确定性验证的任务（对这些任务使用构建/测试/代码检查流水线）。

## 架构

```
┌─────────────┐
│  生成器      │  阶段 1：制定清单
│  (代理 A)   │  产出交付物
└──────┬───────┘
       │ 输出
       ▼
┌──────────────────────────────┐
│     双重独立评审              │  阶段 2：双重核查
│                                │
│  ┌───────────┐ ┌───────────┐  │  两位代理，同一标准，
│  │ 评审员 B  │ │ 评审员 C  │  │  无共享上下文
│  └─────┬─────┘ └─────┬─────┘  │
│        │              │        │
└────────┼──────────────┼────────┘
         │              │
         ▼              ▼
┌──────────────────────────────┐
│        裁决门                 │  阶段 3：通过与否
│                                │
│  B 通过 且 C 通过 → 通过      │  两者必须均通过。
│  否则 → 不通过                │  无例外。
└──────┬──────────────┬─────────┘
       │              │
     通过           不通过
       │              │
       ▼              ▼
   [ 发布 ]    ┌─────────────┐
               │  修复循环    │  阶段 4：修复直至通过
               │              │
               │ 迭代次数++   │  收集所有标记。
               │ 若 i > 最大值:│  修复所有问题。
               │   升级处理    │  重新运行两位评审员。
               │ 否则:        │  循环直至收敛。
               │   跳转至阶段 2│
               └──────────────┘
```

## 阶段详情

### 阶段 1：列清单（生成）

执行主要任务。无需改变你正常的生成工作流程。圣诞老人方法是一个生成后验证层，而非生成策略。

```python
# The generator runs as normal
output = generate(task_spec)
```

### 阶段 2：检查两遍（独立双重审查）

并行启动两个审查智能体。关键不变量：

1. **上下文隔离** — 任一审查者都看不到另一方的评估
2. **相同评估标准** — 双方收到相同的评估标准
3. **相同输入** — 双方都收到原始规格说明**和**生成的输出
4. **结构化输出** — 每个返回一个类型化的裁决，而非散文

```python
REVIEWER_PROMPT = """
You are an independent quality reviewer. You have NOT seen any other review of this output.

## Task Specification
{task_spec}

## Output Under Review
{output}

## Evaluation Rubric
{rubric}

## Instructions
Evaluate the output against EACH rubric criterion. For each:
- PASS: criterion fully met, no issues
- FAIL: specific issue found (cite the exact problem)

Return your assessment as structured JSON:
{
  "verdict": "PASS" | "FAIL",
  "checks": [
    {"criterion": "...", "result": "PASS|FAIL", "detail": "..."}
  ],
  "critical_issues": ["..."],   // blockers that must be fixed
  "suggestions": ["..."]         // non-blocking improvements
}

Be rigorous. Your job is to find problems, not to approve.
"""
```

```python
# Spawn reviewers in parallel (Claude Code subagents)
review_b = Agent(prompt=REVIEWER_PROMPT.format(...), description="Santa Reviewer B")
review_c = Agent(prompt=REVIEWER_PROMPT.format(...), description="Santa Reviewer C")

# Both run concurrently — neither sees the other
```

### 评估标准设计

评估标准是最重要的输入。模糊的标准会产生模糊的审查。每个标准都必须有一个客观的通过/失败条件。

| 标准 | 通过条件 | 失败信号 |
|-----------|---------------|----------------|
| 事实准确性 | 所有声明均可根据源材料或常识验证 | 捏造的统计数据、错误的版本号、不存在的 API |
| 无幻觉 | 没有捏造的实体、引用、URL 或参考文献 | 链接到不存在的页面、没有来源的引用 |
| 完整性 | 规格说明中的每个要求都已解决 | 缺失章节、跳过的边缘情况、覆盖不完整 |
| 合规性 | 通过所有项目特定约束 | 使用了禁用术语、语气违规、不合规 |
| 内部一致性 | 输出内部没有矛盾 | A 部分说 X，B 部分说非 X |
| 技术正确性 | 代码编译/运行，算法正确 | 语法错误、逻辑错误、错误的复杂度声明 |

#### 领域特定评估标准扩展

**内容/营销：**

* 品牌声音一致性
* 满足 SEO 要求（关键词密度、元标签、结构）
* 无竞争对手商标滥用
* 存在 CTA 且链接正确

**代码：**

* 类型安全（无 `any` 泄漏，正确处理空值）
* 错误处理覆盖
* 安全性（代码中无秘密、输入验证、防止注入）
* 新路径的测试覆盖

**合规敏感（受监管、法律、金融）：**

* 无结果保证或无根据的声明
* 存在所需的免责声明
* 仅使用批准的术语
* 符合司法管辖区的语言

### 阶段 3：顽皮还是美好（裁决门）

```python
def santa_verdict(review_b, review_c):
    """Both reviewers must pass. No partial credit."""
    if review_b.verdict == "PASS" and review_c.verdict == "PASS":
        return "NICE"  # Ship it

    # Merge flags from both reviewers, deduplicate
    all_issues = dedupe(review_b.critical_issues + review_c.critical_issues)
    all_suggestions = dedupe(review_b.suggestions + review_c.suggestions)

    return "NAUGHTY", all_issues, all_suggestions
```

为什么两者都必须通过：如果只有一个审查者发现问题，那么该问题是真实存在的。另一个审查者的盲点正是圣诞老人方法旨在消除的失败模式。

### 阶段 4：修复直到美好（收敛循环）

```python
MAX_ITERATIONS = 3

for iteration in range(MAX_ITERATIONS):
    verdict, issues, suggestions = santa_verdict(review_b, review_c)

    if verdict == "NICE":
        log_santa_result(output, iteration, "passed")
        return ship(output)

    # Fix all critical issues (suggestions are optional)
    output = fix_agent.execute(
        output=output,
        issues=issues,
        instruction="Fix ONLY the flagged issues. Do not refactor or add unrequested changes."
    )

    # Re-run BOTH reviewers on fixed output (fresh agents, no memory of previous round)
    review_b = Agent(prompt=REVIEWER_PROMPT.format(output=output, ...))
    review_c = Agent(prompt=REVIEWER_PROMPT.format(output=output, ...))

# Exhausted iterations — escalate
log_santa_result(output, MAX_ITERATIONS, "escalated")
escalate_to_human(output, issues)
```

关键点：每一轮审查都使用**全新的智能体**。审查者不得携带前几轮的记忆，因为先前的上下文会产生锚定偏见。

## 实现模式

### 模式 A：Claude 代码子智能体（推荐）

子智能体提供真正的上下文隔离。每个审查者都是一个没有共享状态的独立进程。

```bash
# In a Claude Code session, use the Agent tool to spawn reviewers
# Both agents run in parallel for speed
```

```python
# Pseudocode for Agent tool invocation
reviewer_b = Agent(
    description="Santa Review B",
    prompt=f"Review this output for quality...\n\nRUBRIC:\n{rubric}\n\nOUTPUT:\n{output}"
)
reviewer_c = Agent(
    description="Santa Review C",
    prompt=f"Review this output for quality...\n\nRUBRIC:\n{rubric}\n\nOUTPUT:\n{output}"
)
```

### 模式 B：顺序内联（备用方案）

当子智能体不可用时，通过显式上下文重置来模拟隔离：

1. 生成输出
2. 新上下文："你是审查者 1。**仅**根据此评估标准进行评估。发现问题。"
3. 逐字记录发现的问题
4. 完全清除上下文
5. 新上下文："你是审查者 2。**仅**根据此评估标准进行评估。发现问题。"
6. 比较两次审查结果，修复，重复

子智能体模式严格更优 — 内联模拟存在审查者之间上下文泄露的风险。

### 模式 C：批量抽样

对于大批量（100+ 项），对每一项都运行完整的圣诞老人方法成本过高。使用分层抽样：

1. 对随机样本（批次的 10-15%，最少 5 项）运行圣诞老人方法
2. 按类型（幻觉、合规性、完整性等）对失败进行分类
3. 如果出现系统性模式，则对整个批次应用针对性修复
4. 对修复后的批次重新抽样并重新验证
5. 继续直到干净的样本通过

```python
import random

def santa_batch(items, rubric, sample_rate=0.15):
    sample = random.sample(items, max(5, int(len(items) * sample_rate)))

    for item in sample:
        result = santa_full(item, rubric)
        if result.verdict == "NAUGHTY":
            pattern = classify_failure(result.issues)
            items = batch_fix(items, pattern)  # Fix all items matching pattern
            return santa_batch(items, rubric)   # Re-sample

    return items  # Clean sample → ship batch
```

## 失败模式与缓解措施

| 失败模式 | 症状 | 缓解措施 |
|-------------|---------|------------|
| 无限循环 | 修复后审查者不断发现新问题 | 最大迭代次数上限（3）。上报。 |
| 橡皮图章 | 两个审查者都通过所有内容 | 对抗性提示："你的工作是发现问题，而不是批准。" |
| 主观漂移 | 审查者标记风格偏好，而非错误 | 仅包含客观通过/失败标准的严格评估标准 |
| 修复回归 | 修复问题 A 引入了问题 B | 每轮使用新的审查者以捕捉回归 |
| 审查者一致性偏见 | 两个审查者都遗漏了同一问题 | 通过独立性缓解，但无法消除。对于关键输出，增加第三位审查者或人工抽查。 |
| 成本爆炸 | 大型输出迭代次数过多 | 批量抽样模式。每个验证周期的预算上限。 |

## 与其他技能的集成

| 技能 | 关系 |
|-------|-------------|
| 验证循环 | 用于确定性检查（构建、代码检查、测试）。圣诞老人方法用于语义检查（准确性、幻觉）。先运行验证循环，再运行圣诞老人方法。 |
| 评估工具 | 圣诞老人方法的结果作为评估指标。跟踪多次圣诞老人方法运行的 pass@k 以衡量生成器质量随时间的变化。 |
| 持续学习 v2 | 圣诞老人方法的发现成为本能。同一标准上重复失败 → 学习避免该模式的行为。 |
| 战略契约 | 在压缩**之前**运行圣诞老人方法。不要在验证中途丢失审查上下文。 |

## 指标

跟踪这些指标以衡量圣诞老人方法的有效性：

* **首次通过率**：第一轮通过圣诞老人方法的输出百分比（目标：>70%）
* **收敛平均迭代次数**：达到"美好"状态的平均轮数（目标：<1.5）
* **问题分类**：失败类型的分布（幻觉 vs. 完整性 vs. 合规性）
* **审查者一致性**：被两个审查者标记的问题 vs. 仅被一个审查者标记的问题百分比（一致性低 = 需要收紧评估标准）
* **逃逸率**：发布后发现但圣诞老人方法本应捕捉到的问题（目标：0）

## 成本分析

每个验证周期，圣诞老人方法的成本大约是单独生成成本的 2-3 倍。对于大多数高风险输出来说，这是值得的：

```
圣诞老人的成本 = (生成代币) + 2×(每轮审核代币) × (平均轮数)
非圣诞老人的成本 = (声誉损害) + (纠正努力) + (信任侵蚀)
```

对于批量操作，抽样模式将成本降低到完整验证的约 15-20%，同时能捕捉到 >90% 的系统性问题。
