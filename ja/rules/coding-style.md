# コーディングスタイル

## イミュータビリティ（最重要）

常に新しいオブジェクトを作成し、絶対にミューテーションしない:

```javascript
// 悪い例: ミューテーション
function updateUser(user, name) {
  user.name = name  // ミューテーション!
  return user
}

// 正しい例: イミュータビリティ
function updateUser(user, name) {
  return {
    ...user,
    name
  }
}
```

## ファイル構成

多数の小さなファイル > 少数の大きなファイル:
- 高凝集・低結合
- 通常200〜400行、最大800行
- 大きなコンポーネントからユーティリティを抽出
- 型別ではなく、機能/ドメイン別に整理

## エラーハンドリング

常にエラーを包括的に処理する:

```typescript
try {
  const result = await riskyOperation()
  return result
} catch (error) {
  console.error('Operation failed:', error)
  throw new Error('Detailed user-friendly message')
}
```

## 入力バリデーション

常にユーザー入力を検証する:

```typescript
import { z } from 'zod'

const schema = z.object({
  email: z.string().email(),
  age: z.number().int().min(0).max(150)
})

const validated = schema.parse(input)
```

## コード品質チェックリスト

作業完了前に確認:
- [ ] コードが読みやすく、適切な命名がされていること
- [ ] 関数が小さいこと（50行未満）
- [ ] ファイルが集中していること（800行未満）
- [ ] 深いネストがないこと（4階層以上は不可）
- [ ] 適切なエラーハンドリングがされていること
- [ ] console.log文が残っていないこと
- [ ] ハードコードされた値がないこと
- [ ] ミューテーションがないこと（イミュータブルパターンを使用）
