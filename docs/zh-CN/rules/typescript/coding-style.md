# TypeScript/JavaScript 编码风格

> 本文件基于 [common/coding-style.md](../common/coding-style.md) 扩展，包含 TypeScript/JavaScript 特定内容。

## 不可变性

使用展开运算符进行不可变更新：

```typescript
// WRONG: Mutation
function updateUser(user, name) {
  user.name = name  // MUTATION!
  return user
}

// CORRECT: Immutability
function updateUser(user, name) {
  return {
    ...user,
    name
  }
}
```

## 错误处理

使用 async/await 配合 try-catch：

```typescript
try {
  const result = await riskyOperation()
  return result
} catch (error) {
  console.error('Operation failed:', error)
  throw new Error('Detailed user-friendly message')
}
```

## 输入验证

使用 Zod 进行基于模式的验证：

```typescript
import { z } from 'zod'

const schema = z.object({
  email: z.string().email(),
  age: z.number().int().min(0).max(150)
})

const validated = schema.parse(input)
```

## Console.log

* 生产代码中不允许出现 `console.log` 语句
* 请使用适当的日志库替代
* 查看钩子以进行自动检测
