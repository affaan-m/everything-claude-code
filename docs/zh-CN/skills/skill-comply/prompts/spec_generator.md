<!-- markdownlint-disable MD007 -->

你正在分析一个编码代理（Claude Code）的技能/规则文件。
你的任务：提取当此技能激活时代理应遵循的**可观察行为序列**。

每一步都应用自然语言描述。不要使用正则表达式模式。

仅输出此确切格式的有效YAML（无markdown围栏，无注释）：

id: <kebab-case-id>
name: <人类可读名称>
source\_rule: <提供的文件路径>
version: "1.0"

steps:

* id: \<snake\_case>
  description: <代理应执行的操作>
  required: true|false
  detector:
  description: <要查找的工具调用的自然语言描述>
  after\_step: <此步骤必须在其后的步骤ID，可选——如不需要则省略>
  before\_step: <此步骤必须在其前的步骤ID，可选——如不需要则省略>

scoring:
threshold\_promote\_to\_hook: 0.6

规则：

* detector.description 应描述工具调用的含义，而非模式
  好："编写或编辑测试文件（非实现文件）"
  坏："Write|Edit with input matching test.\*\\.py"
* 对于顺序重要的技能（例如TDD：测试先于实现），使用 before\_step/after\_step
* 对于仅关注存在性的技能，省略顺序约束
* 仅当技能说明“可选”或“如适用”时，将步骤标记为 required: false
* 3-7步为理想。不要过度分解
* 重要：所有包含冒号的YAML字符串值请用双引号括起来
  好：description: "使用常规提交格式（type: description）"
  坏：description: 使用常规提交格式（type: description）

要分析的技能文件：

***

## {skill\_content}
