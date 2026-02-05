# 验证命令

对当前代码库状态执行全面验证。

## 说明

请严格按照以下顺序执行验证：

1. **构建检查**
   * 运行此项目的构建命令
   * 如果失败，报告错误并**停止**

2. **类型检查**
   * 运行 TypeScript/类型检查器
   * 报告所有错误，包含文件:行号

3. **代码检查**
   * 运行代码检查器
   * 报告警告和错误

4. **测试套件**
   * 运行所有测试
   * 报告通过/失败数量
   * 报告覆盖率百分比

5. **Console.log 审计**
   * 在源文件中搜索 console.log
   * 报告位置

6. **Git 状态**
   * 显示未提交的更改
   * 显示自上次提交以来修改的文件

## 输出

生成一份简洁的验证报告：

```
VERIFICATION: [PASS/FAIL]

Build:    [OK/FAIL]
Types:    [OK/X errors]
Lint:     [OK/X issues]
Tests:    [X/Y passed, Z% coverage]
Secrets:  [OK/X found]
Logs:     [OK/X console.logs]

Ready for PR: [YES/NO]
```

如果存在任何关键问题，列出它们并提供修复建议。

## 参数

$ARGUMENTS 可以是：

* `quick` - 仅构建 + 类型检查
* `full` - 所有检查（默认）
* `pre-commit` - 与提交相关的检查
* `pre-pr` - 完整检查加安全扫描
