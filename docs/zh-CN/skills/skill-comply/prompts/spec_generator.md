<!-- markdownlint-disable MD007 -->

你正在分析一个编码代理（Claude Code）的技能/规则文件。
你的任务：提取当此技能激活时，代理应遵循的**可观察行为序列**。

每个步骤都应以自然语言描述。请勿使用正则表达式模式。

仅输出以下确切格式的有效 YAML（无 Markdown 代码块，无注释）：

id: <kebab-case-id>
name: <人类可读名称>
source\_rule: <提供的文件路径>
version: "1.0"

steps:

* id: \<snake\_case>
  description: <代理应做什么>
  required: true|false
  detector:
  description: <对要查找的工具调用的自然语言描述>
  after\_step: <此步骤必须在其后的 step\_id，可选 — 如不需要则省略>
  before\_step: <此步骤必须在其前的 step\_id，可选 — 如不需要则省略>

scoring:
threshold\_promote\_to\_hook: 0.6

规则：

* detector.description 应描述工具调用的**含义**，而非模式
  正确示例："编写或编辑测试文件（非实现文件）"
  错误示例："Write|Edit with input matching test.\*\\.py"
* 对于**顺序**重要的技能（例如 TDD：测试在实现之前），使用 before\_step/after\_step
* 对于仅**存在性**重要的技能，省略顺序约束
* 仅当技能说明中提到"可选地"或"如适用"时，才将步骤标记为 required: false
* 3-7 个步骤为理想范围。不要过度分解
* 重要提示：所有包含冒号的 YAML 字符串值都必须用双引号引起来
  正确示例：description: "使用约定式提交格式（type: description）"
  错误示例：description: 使用约定式提交格式（type: description）

要分析的技能文件：

***

## {skill\_content}
