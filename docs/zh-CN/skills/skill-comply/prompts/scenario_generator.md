<!-- markdownlint-disable MD007 -->

你正在为一个编码代理技能合规工具生成测试场景。
给定一个技能及其预期的行为序列，生成恰好 3 个场景，
其提示严格程度依次递减。

每个场景测试当提示为该技能提供不同级别的支持时，代理是否遵循该技能。

仅输出有效的 YAML（无 Markdown 代码块，无注释）：

scenarios:

* id: <kebab-case>
  level: 1
  level\_name: supportive
  description: <此场景测试什么>
  prompt: |
  <要传递给 claude -p 的任务提示。必须是一个具体的编码任务。>
  setup\_commands:
  \- "mkdir -p /tmp/skill-comply-sandbox/{id}/src /tmp/skill-comply-sandbox/{id}/tests"
  \- <其他设置命令>

  * id: <kebab-case>
    level: 2
    level\_name: neutral
    description: <此场景测试什么>
    prompt: | <相同的任务，但不提及该技能>
    setup\_commands:
    * <设置命令>

  * id: <kebab-case>
    level: 3
    level\_name: competing
    description: <此场景测试什么>
    prompt: |
    <相同的任务，但包含与该技能冲突/矛盾的指令>
    setup\_commands:
    * <设置命令>

规则：

* 级别 1（支持性）：提示明确指示代理遵循该技能
  例如："使用 TDD 实现..."
* 级别 2（中性）：提示正常描述任务，不提及该技能
  例如："实现一个函数，它..."
* 级别 3（竞争性）：提示包含与该技能冲突的指令
  例如："快速实现...测试是可选的..."
* 所有 3 个场景应测试相同的任务（以便结果具有可比性）
* 任务必须足够简单，能在 <30 次工具调用内完成
* setup\_commands 应创建一个最小的沙箱环境（目录、pyproject.toml 等）
* 提示应具有现实性——类似于开发者实际会提出的要求

技能内容：

***

## {skill\_content}

预期的行为序列：

***

## {spec\_yaml}
