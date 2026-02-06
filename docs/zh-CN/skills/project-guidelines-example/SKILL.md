# 项目指南技能（示例）

这是一个项目特定技能的示例。将其用作您自己项目的模板。

基于一个真实的生产应用程序：[Zenith](https://zenith.chat) - 由 AI 驱动的客户发现平台。

***

## 何时使用

在为其设计的特定项目上工作时，请参考此技能。项目技能包含：

* 架构概述
* 文件结构
* 代码模式
* 测试要求
* 部署工作流

***

## 架构概述

**技术栈：**

* **前端**: Next.js 15 (App Router), TypeScript, React
* **后端**: FastAPI (Python), Pydantic 模型
* **数据库**: Supabase (PostgreSQL)
* **AI**: Claude API，支持工具调用和结构化输出
* **部署**: Google Cloud Run
* **测试**: Playwright (E2E), pytest (后端), React Testing Library

**服务：**

```
┌─────────────────────────────────────────────────────────────┐
│                         Frontend                            │
│  Next.js 15 + TypeScript + TailwindCSS                     │
│  Deployed: Vercel / Cloud Run                              │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                         Backend                             │
│  FastAPI + Python 3.11 + Pydantic                          │
│  Deployed: Cloud Run                                       │
└─────────────────────────────────────────────────────────────┘
                              │
              ┌───────────────┼───────────────┐
              ▼               ▼               ▼
        ┌──────────┐   ┌──────────┐   ┌──────────┐
        │ Supabase │   │  Claude  │   │  Redis   │
        │ Database │   │   API    │   │  Cache   │
        └──────────┘   └──────────┘   └──────────┘
```

***

## 文件结构

```
project/
├── frontend/
│   └── src/
│       ├── app/              # Next.js app router pages
│       │   ├── api/          # API routes
│       │   ├── (auth)/       # Auth-protected routes
│       │   └── workspace/    # Main app workspace
│       ├── components/       # React components
│       │   ├── ui/           # Base UI components
│       │   ├── forms/        # Form components
│       │   └── layouts/      # Layout components
│       ├── hooks/            # Custom React hooks
│       ├── lib/              # Utilities
│       ├── types/            # TypeScript definitions
│       └── config/           # Configuration
│
├── backend/
│   ├── routers/              # FastAPI route handlers
│   ├── models.py             # Pydantic models
│   ├── main.py               # FastAPI app entry
│   ├── auth_system.py        # Authentication
│   ├── database.py           # Database operations
│   ├── services/             # Business logic
│   └── tests/                # pytest tests
│
├── deploy/                   # Deployment configs
├── docs/                     # Documentation
└── scripts/                  # Utility scripts
```

***

## 代码模式

### API 响应格式 (FastAPI)

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

### 前端 API 调用 (TypeScript)

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

### Claude AI 集成 (结构化输出)

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

    # Extract tool use result
    tool_use = next(
        block for block in response.content
        if block.type == "tool_use"
    )

    return AnalysisResult(**tool_use.input)
```

### 自定义 Hooks (React)

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

***

## 测试要求

### 后端 (pytest)

```bash
# Run all tests
poetry run pytest tests/

# Run with coverage
poetry run pytest tests/ --cov=. --cov-report=html

# Run specific test file
poetry run pytest tests/test_auth.py -v
```

**测试结构：**

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

### 前端 (React Testing Library)

```bash
# Run tests
npm run test

# Run with coverage
npm run test -- --coverage

# Run E2E tests
npm run test:e2e
```

**测试结构：**

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

***

## 部署工作流

### 部署前检查清单

* \[ ] 所有测试在本地通过
* \[ ] `npm run build` 成功 (前端)
* \[ ] `poetry run pytest` 通过 (后端)
* \[ ] 没有硬编码的密钥
* \[ ] 环境变量已记录
* \[ ] 数据库迁移就绪

### 部署命令

```bash
# Build and deploy frontend
cd frontend && npm run build
gcloud run deploy frontend --source .

# Build and deploy backend
cd backend
gcloud run deploy backend --source .
```

### 环境变量

```bash
# Frontend (.env.local)
NEXT_PUBLIC_API_URL=https://api.example.com
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...

# Backend (.env)
DATABASE_URL=postgresql://...
ANTHROPIC_API_KEY=sk-ant-...
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_KEY=eyJ...
```

***

## 关键规则

1. 在代码、注释或文档中**不使用表情符号**
2. **不可变性** - 永不改变对象或数组
3. **测试驱动开发 (TDD)** - 在实现之前编写测试
4. **最低 80% 覆盖率**
5. **许多小文件** - 典型 200-400 行，最多 800 行
6. 在生产代码中**不使用 console.log**
7. 使用 try/catch 进行**适当的错误处理**
8. 使用 Pydantic/Zod 进行**输入验证**

***

## 相关技能

* `coding-standards.md` - 通用编码最佳实践
* `backend-patterns.md` - API 和数据库模式
* `frontend-patterns.md` - React 和 Next.js 模式
* `tdd-workflow/` - 测试驱动开发方法论
