# プロジェクトレベル CLAUDE.md の例

これはプロジェクトレベルの CLAUDE.md ファイルの例です。プロジェクトルートに配置してください。

## プロジェクト概要

[プロジェクトの簡単な説明 - 何をするか、技術スタック]

## 重要なルール

### 1. コード構成

- 少数の大きなファイルよりも多数の小さなファイル
- 高凝集、低結合
- 通常200-400行、ファイルごとに最大800行
- 型ではなく、機能/ドメインごとに整理

### 2. コードスタイル

- コード、コメント、ドキュメントに絵文字を使用しない
- 常に不変性を保つ - オブジェクトや配列を変更しない
- 本番コードに console.log を使用しない
- try/catchで適切なエラーハンドリング
- Zodなどで入力検証

### 3. テスト

- TDD: 最初にテストを書く
- 最低80%のカバレッジ
- ユーティリティのユニットテスト
- APIの統合テスト
- 重要なフローのE2Eテスト

### 4. セキュリティ

- ハードコードされた機密情報を使用しない
- 機密データには環境変数を使用
- すべてのユーザー入力を検証
- パラメータ化クエリのみ使用
- CSRF保護を有効化

## ファイル構造

```
src/
|-- app/              # Next.js app router
|-- components/       # 再利用可能なUIコンポーネント
|-- hooks/            # カスタムReactフック
|-- lib/              # ユーティリティライブラリ
|-- types/            # TypeScript定義
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

# オプション
DEBUG=false
```

## 利用可能なコマンド

- `/tdd` - テスト駆動開発ワークフロー
- `/plan` - 実装計画を作成
- `/code-review` - コード品質をレビュー
- `/build-fix` - ビルドエラーを修正

## Gitワークフロー

- Conventional Commits: `feat:`, `fix:`, `refactor:`, `docs:`, `test:`
- mainに直接コミットしない
- PRにはレビューが必要
- マージ前にすべてのテストが合格する必要がある
