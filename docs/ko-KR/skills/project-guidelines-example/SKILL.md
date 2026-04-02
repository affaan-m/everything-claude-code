---
name: project-guidelines-example
description: "실제 프로덕션 애플리케이션을 기반으로 한 프로젝트별 스킬 템플릿 예시."
origin: ECC
---

# 프로젝트 가이드라인 스킬 (예시)

이것은 프로젝트별 스킬의 예시입니다. 자신의 프로젝트에 맞는 템플릿으로 사용하세요.

실제 프로덕션 애플리케이션을 기반으로 합니다: [Zenith](https://zenith.chat) - AI 기반 고객 발견 플랫폼.

## 사용 시점

이 스킬이 설계된 특정 프로젝트에서 작업할 때 참조하세요. 프로젝트 스킬에는 다음이 포함됩니다:
- 아키텍처 개요
- 파일 구조
- 코드 패턴
- 테스팅 요구사항
- 배포 워크플로우

---

## 아키텍처 개요

**기술 스택:**
- **Frontend**: Next.js 15 (App Router), TypeScript, React
- **Backend**: FastAPI (Python), Pydantic 모델
- **Database**: Supabase (PostgreSQL)
- **AI**: Claude API (도구 호출 및 구조화된 출력)
- **Deployment**: Google Cloud Run
- **Testing**: Playwright (E2E), pytest (백엔드), React Testing Library

**서비스:**
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

---

## 파일 구조

```
project/
├── frontend/
│   └── src/
│       ├── app/              # Next.js app router 페이지
│       │   ├── api/          # API 라우트
│       │   ├── (auth)/       # 인증 보호 라우트
│       │   └── workspace/    # 메인 앱 워크스페이스
│       ├── components/       # React 컴포넌트
│       │   ├── ui/           # 기본 UI 컴포넌트
│       │   ├── forms/        # 폼 컴포넌트
│       │   └── layouts/      # 레이아웃 컴포넌트
│       ├── hooks/            # 커스텀 React hooks
│       ├── lib/              # 유틸리티
│       ├── types/            # TypeScript 정의
│       └── config/           # 설정
│
├── backend/
│   ├── routers/              # FastAPI 라우트 핸들러
│   ├── models.py             # Pydantic 모델
│   ├── main.py               # FastAPI 앱 엔트리
│   ├── auth_system.py        # 인증
│   ├── database.py           # 데이터베이스 작업
│   ├── services/             # 비즈니스 로직
│   └── tests/                # pytest 테스트
│
├── deploy/                   # 배포 설정
├── docs/                     # 문서
└── scripts/                  # 유틸리티 스크립트
```

---

## 코드 패턴

### API 응답 형식 (FastAPI)

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

### Frontend API 호출 (TypeScript)

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

### Claude AI 통합 (구조화된 출력)

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

### 커스텀 Hooks (React)

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

## 테스팅 요구사항

### Backend (pytest)

```bash
# Run all tests
poetry run pytest tests/

# Run with coverage
poetry run pytest tests/ --cov=. --cov-report=html

# Run specific test file
poetry run pytest tests/test_auth.py -v
```

**테스트 구조:**
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

### Frontend (React Testing Library)

```bash
# Run tests
npm run test

# Run with coverage
npm run test -- --coverage

# Run E2E tests
npm run test:e2e
```

**테스트 구조:**
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

## 배포 워크플로우

### 배포 전 체크리스트

- [ ] 모든 테스트가 로컬에서 통과
- [ ] `npm run build` 성공 (frontend)
- [ ] `poetry run pytest` 통과 (backend)
- [ ] 하드코딩된 시크릿 없음
- [ ] 환경 변수 문서화됨
- [ ] 데이터베이스 마이그레이션 준비됨

### 배포 명령어

```bash
# Build and deploy frontend
cd frontend && npm run build
gcloud run deploy frontend --source .

# Build and deploy backend
cd backend
gcloud run deploy backend --source .
```

### 환경 변수

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

---

## 핵심 규칙

1. **코드, 주석, 문서에 이모지 없음**
2. **불변성** - 객체나 배열을 절대 변형하지 않음
3. **TDD** - 구현 전에 테스트 작성
4. **80% 커버리지** 최소
5. **작은 파일 여러 개** - 200-400줄이 일반적, 800줄 최대
6. **프로덕션 코드에 console.log 없음**
7. **적절한 에러 처리** (try/catch 사용)
8. **입력 유효성 검사** (Pydantic/Zod 사용)

---

## 관련 스킬

- `coding-standards.md` - 일반 코딩 모범 사례
- `api-backend.md` - API 및 데이터베이스 패턴
- `frontend-patterns.md` - React 및 Next.js 패턴
- `tdd-workflow/` - 테스트 주도 개발 방법론
