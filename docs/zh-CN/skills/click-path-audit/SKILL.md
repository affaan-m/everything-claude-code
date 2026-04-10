---
name: click-path-audit
description: "追踪每个面向用户的按钮/接触点，通过其完整的状态变化序列，以发现功能单独工作但相互抵消、产生错误最终状态或使UI处于不一致状态的错误。使用时机：系统调试未发现错误但用户报告按钮损坏，或在任何涉及共享状态存储的重大重构之后。"
origin: community
---

# /click-path-audit — 行为流审计

发现静态代码阅读会遗漏的缺陷：状态交互副作用、顺序调用间的竞态条件，以及相互静默撤销的处理函数。

## 此技能解决的问题

传统调试检查：

* 函数是否存在？（缺少连接）
* 是否会崩溃？（运行时错误）
* 是否返回正确的类型？（数据流）

但它不检查：

* **最终 UI 状态是否与按钮标签承诺的一致？**
* **函数 B 是否会静默撤销函数 A 刚执行的操作？**
* **共享状态（Zustand/Redux/上下文）是否具有抵消预期操作的副作用？**

真实示例：一个“新邮件”按钮调用了 `setComposeMode(true)` 然后 `selectThread(null)`。两个函数单独运行都正常。但 `selectThread` 有一个副作用会重置 `composeMode: false`。按钮点击后没有任何效果。通过系统化调试发现了 54 个缺陷——这一个被遗漏了。

***

## 工作原理

对于目标区域内的每一个交互触点：

```
1. 识别处理函数（onClick、onSubmit、onChange 等）
2. 按顺序追踪处理函数中的每一个函数调用
3. 对于每一个函数调用：
   a. 它读取了哪些状态？
   b. 它写入了哪些状态？
   c. 它是否对共享状态产生了副作用？
   d. 它是否作为副作用重置/清除了任何状态？
4. 检查：是否有后续调用撤销了先前调用所做的状态更改？
5. 检查：最终状态是否符合用户基于按钮标签所期望的结果？
6. 检查：是否存在竞态条件（异步调用以错误的顺序解析）？
```

***

## 执行步骤

### 步骤 1：映射状态存储

在审计任何触点之前，构建每个状态存储操作的副作用映射：

```
对于每个在作用域内的 Zustand store / React context：
  对于每个 action/setter：
    - 它设置哪些字段？
    - 它是否作为副作用 RESET 其他字段？
    - 文档记录：actionName → {sets: [...], resets: [...]}
```

这是关键的参考依据。如果不了解 `selectThread` 会重置 `composeMode`，“新邮件”缺陷将是不可见的。

**输出格式：**

```
STORE: emailStore
  setComposeMode(bool) → 设置: {composeMode}
  selectThread(thread|null) → 设置: {selectedThread, selectedThreadId, messages, drafts, selectedDraft, summary} 重置: {composeMode: false, composeData: null, redraftOpen: false}
  setDraftGenerating(bool) → 设置: {draftGenerating}
  ...

危险的重置操作（会清除不属于它们的状态）:
  selectThread → 重置 composeMode（由 setComposeMode 拥有）
  reset → 重置所有状态
```

### 步骤 2：审计每个触点

对于目标区域内的每个按钮/开关/表单提交：

```
接触点: [按钮标签] 位于 [组件:行]
  处理程序: onClick → {
    调用 1: functionA() → 设置 {X: true}
    调用 2: functionB() → 设置 {Y: null} 重置 {X: false}  ← 冲突
  }
  预期: 用户看到 [按钮标签承诺的描述]
  实际: X 为 false，因为 functionB 重置了它
  判定: 缺陷 — [描述]
```

**检查以下每种缺陷模式：**

#### 模式 1：顺序撤销

```
handler() {
  setState_A(true)     // 设置 X = true
  setState_B(null)     // 副作用：重置 X = false
}
// 结果：X 为 false。第一次调用毫无意义。
```

#### 模式 2：异步竞态

```
handler() {
  fetchA().then(() => setState({ loading: false }))
  fetchB().then(() => setState({ loading: true }))
}
// 结果：最终的加载状态取决于哪个先解析完成
```

#### 模式 3：过时闭包

```
const [count, setCount] = useState(0)
const handler = useCallback(() => {
  setCount(count + 1)  // 捕获了过时的 count 值
  setCount(count + 1)  // 相同的过时 count 值 — 只增加 1，而不是 2
}, [count])
```

#### 模式 4：缺失状态转换

```
// 按钮显示为“保存”，但处理程序仅进行验证，从未实际保存
// 按钮显示为“删除”，但处理程序仅设置标志而不调用 API
// 按钮显示为“发送”，但 API 端点已被移除或损坏
```

#### 模式 5：条件死路径

```
handler() {
  if (someState) {        // 此时 someState 始终为 false
    doTheActualThing()    // 永远不会执行
  }
}
```

#### 模式 6：useEffect 干扰

```
// 按钮设置 stateX = true
// useEffect 监听 stateX 并将其重置为 false
// 用户看不到任何变化
```

### 步骤 3：报告

对于发现的每个缺陷：

```
CLICK-PATH-NNN: [严重性: 严重/高/中/低]
  接触点: [按钮标签] 位于 [文件:行号]
  模式: [顺序撤销 / 异步竞争 / 陈旧闭包 / 缺失过渡 / 死路径 / useEffect 干扰]
  处理函数: [函数名或内联函数]
  追踪:
    1. [调用] → 设置 {字段: 值}
    2. [调用] → 重置 {字段: 值}  ← 冲突
  预期: [用户期望的结果]
  实际: [实际发生的情况]
  修复: [具体修复方案]
```

***

## 范围控制

此审计成本较高。请适当限定范围：

* **完整应用审计：** 在发布时或重大重构后使用。为每个页面启动并行代理。
* **单页审计：** 在构建新页面后或用户报告按钮失效后使用。
* **存储聚焦审计：** 在修改 Zustand 存储后使用——审计所有已变更操作的消费者。

### 完整应用推荐的代理拆分：

```
Agent 1: 映射所有状态存储（步骤 1）——这是所有其他代理的共享上下文
Agent 2: 仪表板（任务、笔记、日志、想法）
Agent 3: 聊天（DanteChatColumn、JustChatPage）
Agent 4: 电子邮件（ThreadList、DraftArea、EmailsPage）
Agent 5: 项目（ProjectsPage、ProjectOverviewTab、NewProjectWizard）
Agent 6: CRM（所有子标签页）
Agent 7: 个人资料、设置、保险库、通知
Agent 8: 管理套件（所有页面）
```

代理 1 必须首先完成。其输出是所有其他代理的输入。

***

## 何时使用

* 当系统化调试发现“无缺陷”但用户报告 UI 失效时
* 在修改任何 Zustand 存储操作后（检查所有调用者）
* 在任何涉及共享状态的重构之后
* 发布前，针对关键用户流程
* 当按钮“无反应”时——这是解决此问题的专用工具

## 何时不使用

* 针对 API 级别缺陷（错误的响应结构、缺少端点）——使用系统化调试
* 针对样式/布局问题——视觉检查
* 针对性能问题——性能分析工具

***

## 与其他技能的集成

* 在 `/superpowers:systematic-debugging` 之后运行（该技能发现其他 54 种缺陷类型）
* 在 `/superpowers:verification-before-completion` 之前运行（该技能验证修复是否有效）
* 为 `/superpowers:test-driven-development` 提供输入——此处发现的每个缺陷都应获得一个测试

***

## 示例：启发此技能的缺陷

**ThreadList.tsx 中的“新邮件”按钮：**

```
onClick={() => {
  useEmailStore.getState().setComposeMode(true)   // ✓ 设置 composeMode = true
  useEmailStore.getState().selectThread(null)      // ✗ 重置 composeMode = false
}}
```

存储定义：

```
selectThread: (thread) => set({
  selectedThread: thread,
  selectedThreadId: thread?.id ?? null,
  messages: [],
  drafts: [],
  selectedDraft: null,
  summary: null,
  composeMode: false,     // ← 这个静默重置导致了按钮失效
  composeData: null,
  redraftOpen: false,
})
```

**系统化调试遗漏了它**，因为：

* 按钮有 onClick 处理函数（非死代码）
* 两个函数都存在（无缺失连接）
* 两个函数均未崩溃（无运行时错误）
* 数据类型正确（无类型不匹配）

**点击路径审计捕获了它**，因为：

* 步骤 1 映射出 `selectThread` 会重置 `composeMode`
* 步骤 2 追踪处理函数：调用 1 设为 true，调用 2 重置为 false
* 判定：顺序撤销——最终状态与按钮意图相矛盾
