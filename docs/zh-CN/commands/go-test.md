---
description: 强制执行 Go 的 TDD 工作流程。先编写表格驱动测试，然后实现。使用 go test -cover 验证 80%+ 覆盖率。
---

# Go TDD 命令

此命令使用惯用的 Go 测试模式，为 Go 代码强制执行测试驱动开发方法。

## 此命令的作用

1. **定义类型/接口**：首先搭建函数签名
2. **编写表驱动测试**：创建全面的测试用例（红）
3. **运行测试**：验证测试因正确的原因而失败
4. **实现代码**：编写最少的代码以通过测试（绿）
5. **重构**：在保持测试通过的同时进行改进
6. **检查覆盖率**：确保 80% 以上的覆盖率

## 何时使用

在以下情况下使用 `/go-test`：

* 实现新的 Go 函数
* 为现有代码添加测试覆盖
* 修复错误（先编写失败的测试）
* 构建关键业务逻辑
* 学习 Go 中的 TDD 工作流程

## TDD 循环

```
RED     → Write failing table-driven test
GREEN   → Implement minimal code to pass
REFACTOR → Improve code, tests stay green
REPEAT  → Next test case
```

## 示例会话

````
User: /go-test I need a function to validate email addresses

Agent:
# TDD Session: Email Validator

## Step 1: Define Interface

```go
// validator/email.go
package validator

// ValidateEmail checks if the given string is a valid email address.
// Returns nil if valid, error describing the issue otherwise.
func ValidateEmail(email string) error {
    panic("not implemented")
}
```

## Step 2: Write Table-Driven Tests (RED)

```go
// validator/email_test.go
package validator

import (
    "testing"
)

func TestValidateEmail(t *testing.T) {
    tests := []struct {
        name    string
        email   string
        wantErr bool
    }{
        // Valid emails
        {"simple email", "user@example.com", false},
        {"with subdomain", "user@mail.example.com", false},
        {"with plus", "user+tag@example.com", false},
        {"with dots", "first.last@example.com", false},

        // Invalid emails
        {"empty string", "", true},
        {"no at sign", "userexample.com", true},
        {"no domain", "user@", true},
        {"no local part", "@example.com", true},
        {"double at", "user@@example.com", true},
        {"spaces", "user @example.com", true},
        {"no tld", "user@example", true},
    }

    for _, tt := range tests {
        t.Run(tt.name, func(t *testing.T) {
            err := ValidateEmail(tt.email)
            if tt.wantErr && err == nil {
                t.Errorf("ValidateEmail(%q) = nil; want error", tt.email)
            }
            if !tt.wantErr && err != nil {
                t.Errorf("ValidateEmail(%q) = %v; want nil", tt.email, err)
            }
        })
    }
}
```

## Step 3: Run Tests - Verify FAIL

```bash
$ go test ./validator/...

--- FAIL: TestValidateEmail (0.00s)
    --- FAIL: TestValidateEmail/simple_email (0.00s)
        panic: not implemented

FAIL
```

✓ Tests fail as expected (panic).

## Step 4: Implement Minimal Code (GREEN)

```go
// validator/email.go
package validator

import (
    "errors"
    "regexp"
)

var emailRegex = regexp.MustCompile(`^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}---
description: 强制执行 Go 的 TDD 工作流程。先编写表格驱动测试，然后实现。使用 go test -cover 验证 80%+ 覆盖率。
---

# Go TDD 命令

此命令使用惯用的 Go 测试模式，为 Go 代码强制执行测试驱动开发方法。

## 此命令的作用

1.  **定义类型/接口**：首先搭建函数签名
2.  **编写表驱动测试**：创建全面的测试用例（红）
3.  **运行测试**：验证测试因正确的原因而失败
4.  **实现代码**：编写最少的代码以通过测试（绿）
5.  **重构**：在保持测试通过的同时进行改进
6.  **检查覆盖率**：确保 80% 以上的覆盖率

## 何时使用

在以下情况下使用 `/go-test`：

*   实现新的 Go 函数
*   为现有代码添加测试覆盖
*   修复错误（先编写失败的测试）
*   构建关键业务逻辑
*   学习 Go 中的 TDD 工作流程

## TDD 循环

```
RED     → Write failing table-driven test
GREEN   → Implement minimal code to pass
REFACTOR → Improve code, tests stay green
REPEAT  → Next test case
```

## 示例会话

)

var (
    ErrEmailEmpty   = errors.New("email cannot be empty")
    ErrEmailInvalid = errors.New("email format is invalid")
)

func ValidateEmail(email string) error {
    if email == "" {
        return ErrEmailEmpty
    }
    if !emailRegex.MatchString(email) {
        return ErrEmailInvalid
    }
    return nil
}
```

## Step 5: Run Tests - Verify PASS

```bash
$ go test ./validator/...

PASS
ok      project/validator    0.003s
```

✓ All tests passing!

## Step 6: Check Coverage

```bash
$ go test -cover ./validator/...

PASS
coverage: 100.0% of statements
ok      project/validator    0.003s
```

✓ Coverage: 100%

## TDD Complete!
````

## 测试模式

### 表驱动测试

```go
tests := []struct {
    name     string
    input    InputType
    want     OutputType
    wantErr  bool
}{
    {"case 1", input1, want1, false},
    {"case 2", input2, want2, true},
}

for _, tt := range tests {
    t.Run(tt.name, func(t *testing.T) {
        got, err := Function(tt.input)
        // assertions
    })
}
```

### 并行测试

```go
for _, tt := range tests {
    tt := tt // Capture
    t.Run(tt.name, func(t *testing.T) {
        t.Parallel()
        // test body
    })
}
```

### 测试辅助函数

```go
func setupTestDB(t *testing.T) *sql.DB {
    t.Helper()
    db := createDB()
    t.Cleanup(func() { db.Close() })
    return db
}
```

## 覆盖率命令

```bash
# Basic coverage
go test -cover ./...

# Coverage profile
go test -coverprofile=coverage.out ./...

# View in browser
go tool cover -html=coverage.out

# Coverage by function
go tool cover -func=coverage.out

# With race detection
go test -race -cover ./...
```

## 覆盖率目标

| 代码类型 | 目标 |
|-----------|--------|
| 关键业务逻辑 | 100% |
| 公共 API | 90%+ |
| 通用代码 | 80%+ |
| 生成的代码 | 排除 |

## TDD 最佳实践

**要做：**

* 在任何实现**之前**先编写测试
* 每次更改后运行测试
* 使用表驱动测试以获得全面的覆盖率
* 测试行为，而非实现细节
* 包含边界情况（空值、nil、最大值）

**不要：**

* 在测试之前编写实现
* 跳过红阶段
* 直接测试私有函数
* 在测试中使用 `time.Sleep`
* 忽略不稳定的测试

## 相关命令

* `/go-build` - 修复构建错误
* `/go-review` - 实现后审查代码
* `/verify` - 运行完整的验证循环

## 相关

* 技能：`skills/golang-testing/`
* 技能：`skills/tdd-workflow/`
