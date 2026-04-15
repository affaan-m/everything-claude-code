---
name: hipaa-compliance
description: HIPAA专用入口点，用于医疗保健隐私和安全工作。当任务明确围绕HIPAA、PHI处理、覆盖实体、BAAs、违规态势或美国医疗保健合规要求时使用。
origin: ECC direct-port adaptation
version: "1.0.0"
---

# HIPAA 合规性

当任务明确涉及美国医疗保健合规性时，将此作为 HIPAA 专用入口点。此技能有意保持精简和规范：

* `healthcare-phi-compliance` 仍然是处理 PHI/PII、数据分类、审计日志记录、加密和防泄漏的主要实现技能。
* `healthcare-reviewer` 仍然是当代码、架构或产品行为需要具备医疗保健意识的二次审查时的专业审查者。
* `security-review` 仍然适用于通用的身份验证、输入处理、密钥管理、API 和部署加固。

## 何时使用

* 请求明确提及 HIPAA、PHI、受保实体、业务伙伴或 BAA
* 构建或审查存储、处理、导出或传输 PHI 的美国医疗保健软件
* 评估日志记录、分析、LLM 提示、存储或支持工作流是否会造成 HIPAA 风险暴露
* 设计面向患者或临床医生的系统，其中最小必要访问和可审计性至关重要

## 工作原理

将 HIPAA 视为叠加在更广泛的医疗保健隐私技能之上的一个层面：

1. 从 `healthcare-phi-compliance` 开始，获取具体的实施规则。
2. 应用 HIPAA 特定的决策关卡：
   * 这是 PHI 数据吗？
   * 此参与者是受保实体还是业务伙伴？
   * 供应商或模型提供商在处理数据前是否需要 BAA？
   * 访问是否限制在最小必要范围内？
   * 读/写/导出事件是否可审计？
3. 如果任务影响患者安全、临床工作流或受监管的生产架构，则升级到 `healthcare-reviewer`。

## HIPAA 特定防护措施

* 切勿将 PHI 放入日志、分析事件、崩溃报告、提示或客户端可见的错误字符串中。
* 切勿在 URL、浏览器存储、屏幕截图或复制的示例负载中暴露 PHI。
* 对 PHI 的读取和写入要求经过身份验证的访问、限定范围的授权和审计跟踪。
* 默认将第三方 SaaS、可观测性工具、支持工具和 LLM 提供商视为禁止使用，直到其 BAA 状态和数据边界明确为止。
* 遵循最小必要访问原则：正确的用户应仅能看到完成任务所需的最小 PHI 片段。
* 优先使用不透明的内部 ID，而非姓名、病历号、电话号码、地址或其他标识符。

## 示例

### 示例 1：以 HIPAA 为框架的产品请求

用户请求：

> 在我们的临床医生仪表板中添加 AI 生成的就诊摘要。我们为美国诊所提供服务，需要保持 HIPAA 合规。

响应模式：

* 激活 `hipaa-compliance`
* 使用 `healthcare-phi-compliance` 来审查 PHI 的流动、日志记录、存储和提示边界
* 在发送任何 PHI 之前，验证摘要生成提供商是否受 BAA 覆盖
* 如果摘要影响临床决策，则升级到 `healthcare-reviewer`

### 示例 2：供应商/工具决策

用户请求：

> 我们能否将支持记录和患者消息发送到我们的分析堆栈中？

响应模式：

* 假设这些消息可能包含 PHI
* 除非分析供应商已获准用于 HIPAA 约束的工作负载且数据路径最小化，否则阻止该设计
* 在可能的情况下，要求进行脱敏处理或使用非 PHI 事件模型

## 相关技能

* `healthcare-phi-compliance`
* `healthcare-reviewer`
* `healthcare-emr-patterns`
* `healthcare-eval-harness`
* `security-review`
