# Project Guidelines (Example Template)

Use this as a template for project-specific skills.

---

## Tech Stack

- **Frontend**: Next.js 15, TypeScript, TailwindCSS
- **Backend**: FastAPI, Python 3.11, Pydantic
- **Database**: Supabase (PostgreSQL)
- **AI**: Claude API (structured output)
- **Deployment**: Google Cloud Run

## File Structure

```
project/
├── frontend/src/
│   ├── app/           # Next.js pages & API routes
│   ├── components/    # React components
│   ├── hooks/         # Custom hooks
│   └── lib/           # Utilities
├── backend/
│   ├── routers/       # FastAPI routes
│   ├── models.py      # Pydantic models
│   └── services/      # Business logic
```

## Code Patterns

### FastAPI Response
```python
class ApiResponse(BaseModel, Generic[T]):
    success: bool
    data: Optional[T] = None
    error: Optional[str] = None

    @classmethod
    def ok(cls, data: T): return cls(success=True, data=data)
    @classmethod
    def fail(cls, error: str): return cls(success=False, error=error)
```

### Claude Structured Output
```python
from anthropic import Anthropic
from pydantic import BaseModel

class AnalysisResult(BaseModel):
    summary: str
    key_points: list[str]
    confidence: float

async def analyze(content: str) -> AnalysisResult:
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
    tool_use = next(b for b in response.content if b.type == "tool_use")
    return AnalysisResult(**tool_use.input)
```

## Project Rules

- TDD with 80% coverage
- Immutability (spread operator, no mutations)
- No console.log in production
- Input validation with Pydantic/Zod

## Related Skills

- `coding-standards.md`, `backend-patterns.md`, `frontend-patterns.md`, `tdd-workflow/`
