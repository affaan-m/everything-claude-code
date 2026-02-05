---
description: 逐步修复Go构建错误、go vet警告和linter问题。调用go-build-resolver代理进行最小化、精确的修复。
---

# Go 构建与修复

此命令调用 **go-build-resolver** 代理，以最小的更改增量修复 Go 构建错误。

## 此命令的作用

1. **运行诊断**：执行 `go build`、`go vet`、`staticcheck`
2. **解析错误**：按文件分组并按严重性排序
3. **增量修复**：一次修复一个错误
4. **验证每次修复**：每次更改后重新运行构建
5. **报告摘要**：显示已修复的内容和剩余问题

## 何时使用

在以下情况使用 `/go-build`：

* `go build ./...` 因错误而失败
* `go vet ./...` 报告问题
* `golangci-lint run` 显示警告
* 模块依赖关系损坏
* 拉取更改后导致构建失败

## 运行的诊断命令

```bash
# Primary build check
go build ./...

# Static analysis
go vet ./...

# Extended linting (if available)
staticcheck ./...
golangci-lint run

# Module issues
go mod verify
go mod tidy -v
```

## 示例会话

````text
User: /go-build

Agent:
# Go Build Resolution

## Initial Diagnostics

```bash
$ go build ./...
internal/service/user.go:25:15: undefined: UserRepository
internal/handler/api.go:42:9: cannot use x (type string) as type int
internal/handler/api.go:58:2: missing return at end of function
````

发现错误：3

## 修复 1：未定义的标识符

文件：internal/service/user.go:25
错误：undefined: UserRepository
原因：缺少导入

```go
// Added import
import "project/internal/repository"

// Changed
var repo UserRepository
// To
var repo repository.UserRepository
```

```bash
$ go build ./...
# 2 errors remaining
```

## 修复 2：类型不匹配

文件：internal/handler/api.go:42
错误：cannot use x (type string) as type int

```go
// Changed
count := params.Get("count")
// To
countStr := params.Get("count")
count, _ := strconv.Atoi(countStr)
```

```bash
$ go build ./...
# 1 error remaining
```

## 修复 3：缺少返回

文件：internal/handler/api.go:58
错误：missing return at end of function

```go
func GetUser(id string) (*User, error) {
    if id == "" {
        return nil, ErrInvalidID
    }
    user := findUser(id)
    // Added missing return
    return user, nil
}
```

```bash
$ go build ./...
# Build successful!
```

## 最终验证

```bash
$ go vet ./...
# No issues

$ go test ./...
ok      project/internal/service   0.015s
ok      project/internal/handler   0.023s
```

## 摘要

| 指标 | 数量 |
|--------|-------|
| 已修复的构建错误 | 3 |
| 已修复的 Vet 警告 | 0 |
| 已修改的文件 | 2 |
| 剩余问题 | 0 |

构建状态：✅ 成功

```

## Common Errors Fixed

| Error | Typical Fix |
|-------|-------------|
| `undefined: X` | Add import or fix typo |
| `cannot use X as Y` | Type conversion or fix assignment |
| `missing return` | Add return statement |
| `X does not implement Y` | Add missing method |
| `import cycle` | Restructure packages |
| `declared but not used` | Remove or use variable |
| `cannot find package` | `go get` or `go mod tidy` |

## Fix Strategy

1. **Build errors first** - Code must compile
2. **Vet warnings second** - Fix suspicious constructs
3. **Lint warnings third** - Style and best practices
4. **One fix at a time** - Verify each change
5. **Minimal changes** - Don't refactor, just fix

## Stop Conditions

The agent will stop and report if:
- Same error persists after 3 attempts
- Fix introduces more errors
- Requires architectural changes
- Missing external dependencies

## Related Commands

- `/go-test` - Run tests after build succeeds
- `/go-review` - Review code quality
- `/verify` - Full verification loop

## Related

- Agent: `agents/go-build-resolver.md`
- Skill: `skills/golang-patterns/`

```
