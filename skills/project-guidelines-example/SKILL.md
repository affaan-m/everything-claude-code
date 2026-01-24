---
name: project-guidelines-example
description: プロジェクト固有のスキルの例。独自のプロジェクト用テンプレートとして使用してください。実際の本番アプリケーション「Zenith」（AI搭載カスタマーディスカバリープラットフォーム）に基づいています。
---

# プロジェクトガイドラインスキル（例）

これはプロジェクト固有のスキルの例です。独自のプロジェクト用テンプレートとして使用してください。
実際の本番アプリケーション: [Zenith](https://zenith.chat) - AI搭載カスタマーディスカバリープラットフォームに基づいています。

---

## 使用するタイミング

設計対象の特定プロジェクトで作業する際にこのスキルを参照してください。
プロジェクトスキルには以下が含まれます:

- アーキテクチャ概要
- ファイル構造
- コードパターン
- テスト要件
- デプロイワークフロー

---

## アーキテクチャ概要

**技術スタック:**

- **フロントエンド**: Next.js 15（App Router）、TypeScript、React
- **バックエンド**: FastAPI（Python）、Pydanticモデル
- **データベース**: Supabase（PostgreSQL）
- **AI**: Claude APIとツール呼び出しと構造化出力
- **デプロイ**: Google Cloud Run
- **テスト**: Playwright（E2E）、pytest（バックエンド）、React Testing Library

**サービス:**

```
┌─────────────────────────────────────────────────────────────┐
│                      フロントエンド                          │
│            Next.js 15 + TypeScript + TailwindCSS            │
│                 デプロイ: Vercel / Cloud Run                 │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                       バックエンド                           │
│              FastAPI + Python 3.11 + Pydantic               │
│                   デプロイ: Cloud Run                        │
└─────────────────────────────────────────────────────────────┘
                              │
          ┌───────────────────┼───────────────────┐
          ▼                   ▼                   ▼
    ┌──────────┐        ┌──────────┐        ┌──────────┐
    │ Supabase │        │  Claude  │        │  Redis   │
    │ Database │        │   API    │        │  Cache   │
    └──────────┘        └──────────┘        └──────────┘
```

---

## ファイル構造

```
project/
├── frontend/
│   └── src/
│       ├── app/           # Next.js App Routerページ
│       │   ├── api/       # APIルート
│       │   ├── (auth)/    # 認証保護ルート
│       │   └── workspace/ # メインアプリワークスペース
│       ├── components/    # Reactコンポーネント
│       │   ├── ui/        # 基本UIコンポーネント
│       │   ├── forms/     # フォームコンポーネント
│       │   └── layouts/   # レイアウトコンポーネント
│       ├── hooks/         # カスタムReactフック
│       ├── lib/           # ユーティリティ
│       ├── types/         # TypeScript定義
│       └── config/        # 設定
│
├── backend/
│   ├── routers/           # FastAPIルートハンドラー
│   ├── models.py          # Pydanticモデル
│   ├── main.py            # FastAPIアプリエントリー
│   ├── auth_system.py     # 認証
│   ├── database.py        # データベース操作
│   ├── services/          # ビジネスロジック
│   └── tests/             # pytestテスト
│
├── deploy/                # デプロイ設定
├── docs/                  # ドキュメント
└── scripts/               # ユーティリティスクリプト
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
            "description": "構造化された分析を提供",
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

### カスタムフック（React）

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

**テスト構造:**

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

---

## デプロイワークフロー

### デプロイ前チェックリスト

- [ ] すべてのテストがローカルでパス
- [ ] `npm run build`が成功（フロントエンド）
- [ ] `poetry run pytest`がパス（バックエンド）
- [ ] ハードコードされたシークレットなし
- [ ] 環境変数がドキュメント化
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
# フロントエンド（.env.local）
NEXT_PUBLIC_API_URL=https://api.example.com
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...

# バックエンド（.env）
DATABASE_URL=postgresql://...
ANTHROPIC_API_KEY=sk-ant-...
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_KEY=eyJ...
```

---

## 重要なルール

1. **絵文字なし** - コード、コメント、ドキュメントに
2. **イミュータビリティ** - オブジェクトや配列を変更しない
3. **TDD** - 実装前にテストを書く
4. **80%カバレッジ** - 最低限
5. **多くの小さなファイル** - 200-400行が典型的、最大800
6. **console.logなし** - 本番コードに
7. **適切なエラーハンドリング** - try/catchで
8. **入力検証** - Pydantic/Zodで

---

## 関連スキル

- `coding-standards.md` - 一般的なコーディングベストプラクティス
- `backend-patterns.md` - APIとデータベースパターン
- `frontend-patterns.md` - ReactとNext.jsパターン
- `tdd-workflow/` - テスト駆動開発方法論
