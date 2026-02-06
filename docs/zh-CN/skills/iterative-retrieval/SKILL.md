---
name: iterative-retrieval
description: 用于逐步优化上下文检索以解决子代理上下文问题的模式
---

# 迭代检索模式

解决多智能体工作流中的“上下文问题”，即子智能体在开始工作前不知道需要哪些上下文。

## 问题

子智能体被生成时上下文有限。它们不知道：

* 哪些文件包含相关代码
* 代码库中存在哪些模式
* 项目使用什么术语

标准方法会失败：

* **发送所有内容**：超出上下文限制
* **不发送任何内容**：智能体缺乏关键信息
* **猜测所需内容**：经常出错

## 解决方案：迭代检索

一个逐步优化上下文的 4 阶段循环：

```
┌─────────────────────────────────────────────┐
│                                             │
│   ┌──────────┐      ┌──────────┐            │
│   │ DISPATCH │─────▶│ EVALUATE │            │
│   └──────────┘      └──────────┘            │
│        ▲                  │                 │
│        │                  ▼                 │
│   ┌──────────┐      ┌──────────┐            │
│   │   LOOP   │◀─────│  REFINE  │            │
│   └──────────┘      └──────────┘            │
│                                             │
│        Max 3 cycles, then proceed           │
└─────────────────────────────────────────────┘
```

### 阶段 1：调度

初始的广泛查询以收集候选文件：

```javascript
// Start with high-level intent
const initialQuery = {
  patterns: ['src/**/*.ts', 'lib/**/*.ts'],
  keywords: ['authentication', 'user', 'session'],
  excludes: ['*.test.ts', '*.spec.ts']
};

// Dispatch to retrieval agent
const candidates = await retrieveFiles(initialQuery);
```

### 阶段 2：评估

评估检索到的内容的相关性：

```javascript
function evaluateRelevance(files, task) {
  return files.map(file => ({
    path: file.path,
    relevance: scoreRelevance(file.content, task),
    reason: explainRelevance(file.content, task),
    missingContext: identifyGaps(file.content, task)
  }));
}
```

评分标准：

* **高 (0.8-1.0)**：直接实现目标功能
* **中 (0.5-0.7)**：包含相关模式或类型
* **低 (0.2-0.4)**：略微相关
* **无 (0-0.2)**：不相关，排除

### 阶段 3：优化

根据评估结果更新搜索条件：

```javascript
function refineQuery(evaluation, previousQuery) {
  return {
    // Add new patterns discovered in high-relevance files
    patterns: [...previousQuery.patterns, ...extractPatterns(evaluation)],

    // Add terminology found in codebase
    keywords: [...previousQuery.keywords, ...extractKeywords(evaluation)],

    // Exclude confirmed irrelevant paths
    excludes: [...previousQuery.excludes, ...evaluation
      .filter(e => e.relevance < 0.2)
      .map(e => e.path)
    ],

    // Target specific gaps
    focusAreas: evaluation
      .flatMap(e => e.missingContext)
      .filter(unique)
  };
}
```

### 阶段 4：循环

使用优化后的条件重复（最多 3 个周期）：

```javascript
async function iterativeRetrieve(task, maxCycles = 3) {
  let query = createInitialQuery(task);
  let bestContext = [];

  for (let cycle = 0; cycle < maxCycles; cycle++) {
    const candidates = await retrieveFiles(query);
    const evaluation = evaluateRelevance(candidates, task);

    // Check if we have sufficient context
    const highRelevance = evaluation.filter(e => e.relevance >= 0.7);
    if (highRelevance.length >= 3 && !hasCriticalGaps(evaluation)) {
      return highRelevance;
    }

    // Refine and continue
    query = refineQuery(evaluation, query);
    bestContext = mergeContext(bestContext, highRelevance);
  }

  return bestContext;
}
```

## 实际示例

### 示例 1：错误修复上下文

```
Task: "Fix the authentication token expiry bug"

Cycle 1:
  DISPATCH: Search for "token", "auth", "expiry" in src/**
  EVALUATE: Found auth.ts (0.9), tokens.ts (0.8), user.ts (0.3)
  REFINE: Add "refresh", "jwt" keywords; exclude user.ts

Cycle 2:
  DISPATCH: Search refined terms
  EVALUATE: Found session-manager.ts (0.95), jwt-utils.ts (0.85)
  REFINE: Sufficient context (2 high-relevance files)

Result: auth.ts, tokens.ts, session-manager.ts, jwt-utils.ts
```

### 示例 2：功能实现

```
Task: "Add rate limiting to API endpoints"

Cycle 1:
  DISPATCH: Search "rate", "limit", "api" in routes/**
  EVALUATE: No matches - codebase uses "throttle" terminology
  REFINE: Add "throttle", "middleware" keywords

Cycle 2:
  DISPATCH: Search refined terms
  EVALUATE: Found throttle.ts (0.9), middleware/index.ts (0.7)
  REFINE: Need router patterns

Cycle 3:
  DISPATCH: Search "router", "express" patterns
  EVALUATE: Found router-setup.ts (0.8)
  REFINE: Sufficient context

Result: throttle.ts, middleware/index.ts, router-setup.ts
```

## 与智能体集成

在智能体提示中使用：

```markdown
在为该任务检索上下文时：
1. 从广泛的关键词搜索开始
2. 评估每个文件的相关性（0-1 分制）
3. 识别仍缺失哪些上下文
4. 优化搜索条件并重复（最多 3 个循环）
5. 返回相关性 >= 0.7 的文件

```

## 最佳实践

1. **先宽泛，后逐步细化** - 不要过度指定初始查询
2. **学习代码库术语** - 第一轮循环通常能揭示命名约定
3. **跟踪缺失内容** - 明确识别差距以驱动优化
4. **在“足够好”时停止** - 3 个高相关性文件胜过 10 个中等相关性文件
5. **自信地排除** - 低相关性文件不会变得相关

## 相关

* [长篇指南](https://x.com/affaanmustafa/status/2014040193557471352) - 子智能体编排部分
* `continuous-learning` 技能 - 用于随时间改进的模式
* 在 `~/.claude/agents/` 中的智能体定义
