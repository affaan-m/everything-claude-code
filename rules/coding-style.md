# コーディングスタイル

## イミュータビリティ（重要）

常に新しいオブジェクトを作成し、決してミューテートしない：

```javascript
// 悪い例: ミューテーション
function updateUser(user, name) {
  user.name = name  // ミューテーション！
  return user
}

// 良い例: イミュータビリティ
function updateUser(user, name) {
  return {
    ...user,
    name
  }
}
```

## ファイル構成

少数の大きなファイルより多数の小さなファイル：
- 高凝集、低結合
- 200-400行が標準、最大800行
- 大きなコンポーネントからユーティリティを抽出
- タイプではなく機能/ドメインで整理

## エラーハンドリング

常にエラーを包括的に処理する：

```typescript
try {
  const result = await riskyOperation()
  return result
} catch (error) {
  console.error('操作に失敗しました:', error)
  throw new Error('詳細なユーザー向けメッセージ')
}
```

## 入力バリデーション

常にユーザー入力をバリデートする：

```typescript
import { z } from 'zod'

const schema = z.object({
  email: z.string().email(),
  age: z.number().int().min(0).max(150)
})

const validated = schema.parse(input)
```

## コード品質チェックリスト

作業完了前に確認：
- [ ] コードが読みやすく適切に命名されている
- [ ] 関数が小さい（50行未満）
- [ ] ファイルがフォーカスされている（800行未満）
- [ ] 深いネストがない（4レベル以上）
- [ ] 適切なエラーハンドリング
- [ ] console.log 文がない
- [ ] ハードコードされた値がない
- [ ] ミューテーションがない（イミュータブルパターンを使用）
