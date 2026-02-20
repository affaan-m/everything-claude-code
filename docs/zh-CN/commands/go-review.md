---
description: 全面的Go代码审查，涵盖惯用模式、并发安全性、错误处理和安全性。调用go-reviewer代理。
---

# Go 代码审查

此命令调用 **go-reviewer** 代理进行全面的 Go 语言特定代码审查。

## 此命令的作用

1. **识别 Go 变更**：通过 `git diff` 查找修改过的 `.go` 文件
2. **运行静态分析**：执行 `go vet`、`staticcheck` 和 `golangci-lint`
3. **安全扫描**：检查 SQL 注入、命令注入、竞态条件
4. **并发性审查**：分析 goroutine 安全性、通道使用、互斥锁模式
5. **惯用 Go 检查**：验证代码是否遵循 Go 约定和最佳实践
6. **生成报告**：按严重程度分类问题

## 使用时机

在以下情况使用 `/go-review`：

* 编写或修改 Go 代码之后
* 提交 Go 变更之前
* 审查包含 Go 代码的拉取请求时
* 接手新的 Go 代码库时
* 学习惯用 Go 模式时

## 审查类别

### 严重（必须修复）

* SQL/命令注入漏洞
* 无同步的竞态条件
* Goroutine 泄漏
* 硬编码凭证
* 不安全的指针使用
* 关键路径中忽略的错误

### 高（应该修复）

* 缺少带上下文的错误包装
* 使用 panic 而非返回错误
* 上下文未传播
* 无缓冲通道导致死锁
* 接口未满足错误
* 缺少互斥锁保护

### 中（考虑修复）

* 非惯用代码模式
* 导出项缺少 godoc 注释
* 低效的字符串拼接
* 切片未预分配
* 未使用表格驱动测试

## 运行的自动化检查

```bash
# Static analysis
go vet ./...

# Advanced checks (if installed)
staticcheck ./...
golangci-lint run

# Race detection
go build -race ./...

# Security vulnerabilities
govulncheck ./...
```

## 使用示例

````text
User: /go-review

Agent:
# Go Code Review Report

## Files Reviewed
- internal/handler/user.go (modified)
- internal/service/auth.go (modified)

## Static Analysis Results
✓ go vet: No issues
✓ staticcheck: No issues

## Issues Found

[CRITICAL] Race Condition
File: internal/service/auth.go:45
Issue: Shared map accessed without synchronization
```go
var cache = map[string]*Session{}  // Concurrent access!

func GetSession(id string) *Session {
    return cache[id]  // Race condition
}
````

修复：使用 sync.RWMutex 或 sync.Map

```go
var (
    cache   = map[string]*Session{}
    cacheMu sync.RWMutex
)

func GetSession(id string) *Session {
    cacheMu.RLock()
    defer cacheMu.RUnlock()
    return cache[id]
}
```

\[高] 缺少错误上下文
文件：internal/handler/user.go:28
问题：返回的错误缺少上下文

```go
return err  // No context
```

修复：使用上下文包装

```go
return fmt.Errorf("get user %s: %w", userID, err)
```

## 摘要

* 严重：1
* 高：1
* 中：0

建议：❌ 在严重问题修复前阻止合并

```

## Approval Criteria

| Status | Condition |
|--------|-----------|
| ✅ Approve | No CRITICAL or HIGH issues |
| ⚠️ Warning | Only MEDIUM issues (merge with caution) |
| ❌ Block | CRITICAL or HIGH issues found |

## Integration with Other Commands

- Use `/go-test` first to ensure tests pass
- Use `/go-build` if build errors occur
- Use `/go-review` before committing
- Use `/code-review` for non-Go specific concerns

## Related

- Agent: `agents/go-reviewer.md`
- Skills: `skills/golang-patterns/`, `skills/golang-testing/`

```
