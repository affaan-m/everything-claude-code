# プロジェクト CLAUDE.md の例

これはプロジェクトレベルの CLAUDE.md ファイルの例です。プロジェクトルートに配置してください。

## プロジェクト概要

[プロジェクトの簡潔な説明 - 何をするか、技術スタック]

## 重要なルール

### 1. コード構成

- 大きなファイルを少なくより、小さなファイルを多く
- 高凝集、低結合
- 通常200-400行、ファイルあたり最大800行
- タイプ別ではなく機能/ドメイン別に整理

### 2. コードスタイル

- コード、コメント、ドキュメントに絵文字を使わない
- 常にイミュータビリティ - オブジェクトや配列を変更しない
- 本番コードで console.log を使わない
- try/catch による適切なエラーハンドリング
- Zod などによる入力バリデーション

### 3. テスト

- TDD: テストを先に書く
- 最低80%カバレッジ
- ユーティリティにはユニットテスト
- API にはインテグレーションテスト
- 重要なフローには E2E テスト

### 4. セキュリティ

- シークレットをハードコードしない
- 機密データには環境変数を使用
- すべてのユーザー入力をバリデート
- パラメータ化クエリのみ使用
- CSRF 保護を有効化

## ファイル構造

```
src/
|-- app/              # Next.js app router
|-- components/       # 再利用可能なUIコンポーネント
|-- hooks/            # カスタムReact hooks
|-- lib/              # ユーティリティライブラリ
|-- types/            # TypeScript定義
```

## 主要パターン

### API レスポンスフォーマット

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

## 利用可能な command

- `/tdd` - テスト駆動開発ワークフロー
- `/plan` - 実装計画の作成
- `/code-review` - コード品質のレビュー
- `/build-fix` - ビルドエラーの修正

## Git ワークフロー

- Conventional commits: `feat:`, `fix:`, `refactor:`, `docs:`, `test:`
- main に直接 commit しない
- PR にはレビューが必要
- マージ前にすべてのテストをパスする必要あり
