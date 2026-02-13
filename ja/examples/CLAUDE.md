# プロジェクト CLAUDE.md の例

これはプロジェクトレベルの CLAUDE.md ファイルの例です。プロジェクトのルートに配置してください。

## プロジェクト概要

[プロジェクトの概要 - 機能、技術スタック]

## 重要なルール

### 1. コード構成

- 大きなファイルよりも小さなファイルを多く
- 高凝集、低結合
- 通常200〜400行、最大800行
- 種類別ではなく機能/ドメイン別に整理

### 2. コードスタイル

- コード、コメント、ドキュメントに絵文字を使用しない
- 常にイミュータビリティ - オブジェクトや配列を直接変更しない
- 本番コードに console.log を残さない
- try/catch による適切なエラーハンドリング
- Zod等によるバリデーション

### 3. テスト

- TDD: テストを先に書く
- 最低80%のカバレッジ
- ユーティリティのユニットテスト
- APIの統合テスト
- 重要なフローのE2Eテスト

### 4. セキュリティ

- 秘密情報をハードコードしない
- 機密データは環境変数で管理
- すべてのユーザー入力を検証
- パラメータ化クエリのみ使用
- CSRF保護を有効にする

## ファイル構成

```
src/
|-- app/              # Next.js アプリルーター
|-- components/       # 再利用可能なUIコンポーネント
|-- hooks/            # カスタム React フック
|-- lib/              # ユーティリティライブラリ
|-- types/            # TypeScript 型定義
```

## 主要パターン

### APIレスポンス形式

```typescript
interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
}
```

### エラーハンドリング

```typescript
try {
  const result = await operation()
  return { success: true, data: result }
} catch (error) {
  console.error('Operation failed:', error)
  return { success: false, error: 'User-friendly message' }
}
```

## 環境変数

```bash
# 必須
DATABASE_URL=
API_KEY=

# 任意
DEBUG=false
```

## 利用可能なコマンド

- `/tdd` - テスト駆動開発ワークフロー
- `/plan` - 実装計画の作成
- `/code-review` - コード品質のレビュー
- `/build-fix` - ビルドエラーの修正

## Git ワークフロー

- コンベンショナルコミット: `feat:`, `fix:`, `refactor:`, `docs:`, `test:`
- main ブランチに直接コミットしない
- PRにはレビューが必要
- マージ前にすべてのテストを通過させる
