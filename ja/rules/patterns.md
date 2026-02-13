# 共通パターン

## APIレスポンスフォーマット

```typescript
interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
  meta?: {
    total: number
    page: number
    limit: number
  }
}
```

## カスタムフックパターン

```typescript
export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value)

  useEffect(() => {
    const handler = setTimeout(() => setDebouncedValue(value), delay)
    return () => clearTimeout(handler)
  }, [value, delay])

  return debouncedValue
}
```

## リポジトリパターン

```typescript
interface Repository<T> {
  findAll(filters?: Filters): Promise<T[]>
  findById(id: string): Promise<T | null>
  create(data: CreateDto): Promise<T>
  update(id: string, data: UpdateDto): Promise<T>
  delete(id: string): Promise<void>
}
```

## スケルトンプロジェクト

新しい機能を実装する場合:
1. 実績のあるスケルトンプロジェクトを検索
2. 並列エージェントでオプションを評価:
   - セキュリティ評価
   - 拡張性分析
   - 適合性スコアリング
   - 実装計画
3. 最適なものをクローンして基盤とする
4. 実績のある構造の中で反復開発
