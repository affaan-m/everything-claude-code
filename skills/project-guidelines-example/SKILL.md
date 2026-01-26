# プロジェクトガイドライン skill（例）

これはプロジェクト固有のskillの例です。これを独自のプロジェクトのテンプレートとして使用してください。

実際の本番アプリケーションに基づいています：[Zenith](https://zenith.chat) - AI搭載の顧客発見プラットフォーム。

---

## 使用するタイミング

設計対象の特定のプロジェクトで作業する際にこのskillを参照してください。プロジェクトskillには以下が含まれます：
- アーキテクチャの概要
- ファイル構造
- コードパターン
- テスト要件
- デプロイワークフロー

---

## アーキテクチャ概要

**技術スタック：**
- **フロントエンド**: Next.js 15（App Router）、TypeScript、React
- **バックエンド**: FastAPI（Python）、Pydanticモデル
- **データベース**: Supabase（PostgreSQL）
- **AI**: Claude API（ツール呼び出しと構造化出力）
- **デプロイ**: Google Cloud Run
- **テスト**: Playwright（E2E）、pytest（バックエンド）、React Testing Library

**サービス：**
```
┌─────────────────────────────────────────────────────────────┐
│                         フロントエンド                       │
│  Next.js 15 + TypeScript + TailwindCSS                     │
│  デプロイ先: Vercel / Cloud Run                            │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                         バックエンド                         │
│  FastAPI + Python 3.11 + Pydantic                          │
│  デプロイ先: Cloud Run                                      │
└─────────────────────────────────────────────────────────────┘
                              │
              ┌───────────────┼───────────────┐
              ▼               ▼               ▼
        ┌──────────┐   ┌──────────┐   ┌──────────┐
        │ Supabase │   │  Claude  │   │  Redis   │
        │ Database │   │   API    │   │  Cache   │
        └──────────┘   └──────────┘   └──────────┘
```

---

## ファイル構造

```
project/
├── frontend/
│   └── src/
│       ├── app/              # Next.js app routerページ
│       │   ├── api/          # APIルート
│       │   ├── (auth)/       # 認証保護ルート
│       │   └── workspace/    # メインアプリワークスペース
│       ├── components/       # Reactコンポーネント
│       │   ├── ui/           # 基本UIコンポーネント
│       │   ├── forms/        # フォームコンポーネント
│       │   └── layouts/      # レイアウトコンポーネント
│       ├── hooks/            # カスタムReact hooks
│       ├── lib/              # ユーティリティ
│       ├── types/            # TypeScript定義
│       └── config/           # 設定
│
├── backend/
│   ├── routers/              # FastAPIルートハンドラー
│   ├── models.py             # Pydanticモデル
│   ├── main.py               # FastAPIアプリエントリ
│   ├── auth_system.py        # 認証
│   ├── database.py           # データベース操作
│   ├── services/             # ビジネスロジック
│   └── tests/                # pytestテスト
│
├── deploy/                   # デプロイ設定
├── docs/                     # ドキュメント
└── scripts/                  # ユーティリティスクリプト
```

---

## コードパターン

### APIレスポンス形式（FastAPI）

```python
from pydantic import BaseModel
from typing import Generic, TypeVar, Optional

T = TypeVar('T')

class ApiResponse(BaseModel, Generic[T]):
    success: bool
    data: Optional[T] = None
    error: Optional[str] = None

    @classmethod
    def ok(cls, data: T) -> "ApiResponse[T]":
        return cls(success=True, data=data)

    @classmethod
    def fail(cls, error: str) -> "ApiResponse[T]":
        return cls(success=False, error=error)
```

### フロントエンドAPI呼び出し（TypeScript）

```typescript
interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
}

async function fetchApi<T>(
  endpoint: string,
  options?: RequestInit
): Promise<ApiResponse<T>> {
  try {
    const response = await fetch(`/api${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
    })

    if (!response.ok) {
      return { success: false, error: `HTTP ${response.status}` }
    }

    return await response.json()
  } catch (error) {
    return { success: false, error: String(error) }
  }
}
```

### Claude AI統合（構造化出力）

```python
from anthropic import Anthropic
from pydantic import BaseModel

class AnalysisResult(BaseModel):
    summary: str
    key_points: list[str]
    confidence: float

async def analyze_with_claude(content: str) -> AnalysisResult:
    client = Anthropic()

    response = client.messages.create(
        model="claude-sonnet-4-5-20250514",
        max_tokens=1024,
        messages=[{"role": "user", "content": content}],
        tools=[{
            "name": "provide_analysis",
            "description": "Provide structured analysis",
            "input_schema": AnalysisResult.model_json_schema()
        }],
        tool_choice={"type": "tool", "name": "provide_analysis"}
    )

    # ツール使用結果を抽出
    tool_use = next(
        block for block in response.content
        if block.type == "tool_use"
    )

    return AnalysisResult(**tool_use.input)
```

### カスタムHooks（React）

```typescript
import { useState, useCallback } from 'react'

interface UseApiState<T> {
  data: T | null
  loading: boolean
  error: string | null
}

export function useApi<T>(
  fetchFn: () => Promise<ApiResponse<T>>
) {
  const [state, setState] = useState<UseApiState<T>>({
    data: null,
    loading: false,
    error: null,
  })

  const execute = useCallback(async () => {
    setState(prev => ({ ...prev, loading: true, error: null }))

    const result = await fetchFn()

    if (result.success) {
      setState({ data: result.data!, loading: false, error: null })
    } else {
      setState({ data: null, loading: false, error: result.error! })
    }
  }, [fetchFn])

  return { ...state, execute }
}
```

---

## テスト要件

### バックエンド（pytest）

```bash
# すべてのテストを実行
poetry run pytest tests/

# カバレッジ付きで実行
poetry run pytest tests/ --cov=. --cov-report=html

# 特定のテストファイルを実行
poetry run pytest tests/test_auth.py -v
```

**テスト構造：**
```python
import pytest
from httpx import AsyncClient
from main import app

@pytest.fixture
async def client():
    async with AsyncClient(app=app, base_url="http://test") as ac:
        yield ac

@pytest.mark.asyncio
async def test_health_check(client: AsyncClient):
    response = await client.get("/health")
    assert response.status_code == 200
    assert response.json()["status"] == "healthy"
```

### フロントエンド（React Testing Library）

```bash
# テストを実行
npm run test

# カバレッジ付きで実行
npm run test -- --coverage

# E2Eテストを実行
npm run test:e2e
```

**テスト構造：**
```typescript
import { render, screen, fireEvent } from '@testing-library/react'
import { WorkspacePanel } from './WorkspacePanel'

describe('WorkspacePanel', () => {
  it('renders workspace correctly', () => {
    render(<WorkspacePanel />)
    expect(screen.getByRole('main')).toBeInTheDocument()
  })

  it('handles session creation', async () => {
    render(<WorkspacePanel />)
    fireEvent.click(screen.getByText('New Session'))
    expect(await screen.findByText('Session created')).toBeInTheDocument()
  })
})
```

---

## デプロイワークフロー

### デプロイ前チェックリスト

- [ ] すべてのテストがローカルで合格
- [ ] `npm run build`が成功（フロントエンド）
- [ ] `poetry run pytest`が合格（バックエンド）
- [ ] ハードコードされたシークレットなし
- [ ] 環境変数がドキュメント化されている
- [ ] データベースマイグレーション準備完了

### デプロイコマンド

```bash
# フロントエンドをビルドしてデプロイ
cd frontend && npm run build
gcloud run deploy frontend --source .

# バックエンドをビルドしてデプロイ
cd backend
gcloud run deploy backend --source .
```

### 環境変数

```bash
# フロントエンド (.env.local)
NEXT_PUBLIC_API_URL=https://api.example.com
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...

# バックエンド (.env)
DATABASE_URL=postgresql://...
ANTHROPIC_API_KEY=sk-ant-...
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_KEY=eyJ...
```

---

## 重要なルール

1. コード、コメント、ドキュメントに**絵文字禁止**
2. **不変性** - オブジェクトや配列を変更しない
3. **TDD** - 実装前にテストを書く
4. **80%カバレッジ**が最小要件
5. **多くの小さなファイル** - 通常200-400行、最大800行
6. 本番コードに**console.log禁止**
7. try/catchによる**適切なエラー処理**
8. Pydantic/Zodによる**入力バリデーション**

---

## 関連skill

- `coding-standards.md` - 一般的なコーディングベストプラクティス
- `backend-patterns.md` - APIとデータベースパターン
- `frontend-patterns.md` - ReactとNext.jsパターン
- `tdd-workflow/` - TDD方法論
