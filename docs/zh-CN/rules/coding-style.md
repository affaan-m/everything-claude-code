# 编码风格

## 不可变性（关键）

始终创建新对象，切勿修改：

```javascript
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

## 文件组织

多个小文件 > 少数大文件：

* 高内聚，低耦合
* 典型 200-400 行，最多 800 行
* 从大型组件中提取实用工具
* 按功能/领域组织，而非按类型

## 错误处理

始终全面处理错误：

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

始终验证用户输入：

```typescript
import { z } from 'zod'

const schema = z.object({
  email: z.string().email(),
  age: z.number().int().min(0).max(150)
})

const validated = schema.parse(input)
```

## 代码质量检查清单

在标记工作完成之前：

* \[ ] 代码可读且命名良好
* \[ ] 函数短小（<50 行）
* \[ ] 文件专注（<800 行）
* \[ ] 无深层嵌套（>4 层）
* \[ ] 正确的错误处理
* \[ ] 无 console.log 语句
* \[ ] 无硬编码值
* \[ ] 无修改（使用不可变模式）
