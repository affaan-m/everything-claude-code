---
description: 使用专业代理进行全面的PR审查
---

对拉取请求进行全面的多视角审查。

## 使用方法

`/review-pr [PR-number-or-URL] [--focus=comments|tests|errors|types|code|simplify]`

如果未指定 PR，则审查当前分支的 PR。如果未指定审查重点，则运行完整的审查流程。

## 步骤

1. 识别 PR：
   * 使用 `gh pr view` 获取 PR 详情、更改的文件和差异
2. 查找项目指导：
   * 查找 `CLAUDE.md`、lint 配置、TypeScript 配置、仓库约定
3. 运行专项审查代理：
   * `code-reviewer`
   * `comment-analyzer`
   * `pr-test-analyzer`
   * `silent-failure-hunter`
   * `type-design-analyzer`
   * `code-simplifier`
4. 汇总结果：
   * 对重叠的发现进行去重
   * 按严重性排序
5. 按严重性分组报告发现的问题

## 置信度规则

仅报告置信度 >= 80 的问题：

* 严重：错误、安全、数据丢失
* 重要：缺少测试、质量问题、风格违规
* 建议：仅在明确要求时提供建议
