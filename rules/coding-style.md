# コーディングスタイル

## 不変性（イミュータビリティ）（重要）

**常に**新しいオブジェクトを作成し、**絶対に**ミューテート（変更）しない:

```javascript
// 間違い: ミューテーション
function updateUser(user, name) {
  user.name = name  // ミューテーション！
  return user
}

// 正解: 不変性
function updateUser(user, name) {
  return {
    ...user,
    name
  }
}
```

## ファイル構成

多数の小さなファイル > 少数の大きなファイル:
- 高凝集、低結合
- 通常200〜400行、最大800行
- 大きなコンポーネントからユーティリティを抽出
- 型別ではなく、機能/ドメイン別に整理

## エラーハンドリング

**常に**包括的にエラーを処理する:

```typescript
try {
  const result = await riskyOperation()
  return result
} catch (error) {
  console.error('操作失敗:', error)
  throw new Error('詳細でユーザーフレンドリーなメッセージ')
}
```

## 入力バリデーション

**常に**ユーザー入力をバリデートする:

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
- [ ] コードが読みやすく、適切な命名
- [ ] 関数が小さい（50行未満）
- [ ] ファイルが集中している（800行未満）
- [ ] 深いネストなし（4レベル以上）
- [ ] 適切なエラーハンドリング
- [ ] console.log文なし
- [ ] ハードコードされた値なし
- [ ] ミューテーションなし（不変パターン使用）
