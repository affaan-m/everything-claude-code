---
paths:
  - "**/app/**/*.py"
  - "**/fastapi/**/*.py"
  - "**/*_api.py"
---
# FastAPI Development Rules

> Project-specific FastAPI guidelines. Always use with `python/coding-style.md`.

## Project Structure

Use the application factory pattern with clear separation:

```
app/
├── main.py           # create_app() factory
├── config.py         # Pydantic Settings
├── api/routes/       # Endpoint routers
├── schemas/          # Pydantic models (request/response)
├── models/           # SQLAlchemy/ORM models
├── db/crud.py        # Database operations
└── dependencies.py   # Reusable dependencies
```

## Pydantic Schemas

**Separate request and response schemas:**

```python
# PASS: Separate schemas
class UserCreate(BaseModel):
    email: EmailStr
    password: str = Field(..., min_length=8)

class UserResponse(UserBase):
    model_config = ConfigDict(from_attributes=True)
    id: UUID
    # No password field

# FAIL: Single schema for everything
class User(BaseModel):
    email: str
    password: str  # Leaks in responses!
```

## Dependency Injection

**Always use dependencies for database and auth:**

```python
# PASS: Dependency injection
@router.get("/users/{id}")
async def get_user(
    user_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    ...

# FAIL: Creating sessions inline
@router.get("/users/{id}")
def get_user(user_id: str):
    db = SessionLocal()  # No cleanup, no testability
```

## Async Patterns

**Use async for all I/O operations:**

```python
# PASS: Async endpoint with async DB
@router.get("/items")
async def list_items(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Item))
    return result.scalars().all()

# FAIL: Sync function, sync DB
@router.get("/items")
def list_items():
    return db.query(Item).all()  # Blocks event loop
```

## Error Handling

**Use custom exceptions with centralized handlers:**

```python
# PASS: Custom exception
class NotFoundException(APIException):
    def __init__(self, resource: str, id: str):
        super().__init__(404, "not_found", f"{resource} not found")

@router.get("/users/{id}")
async def get_user(id: str):
    user = await get_user_by_id(id)
    if not user:
        raise NotFoundException("User", id)

# FAIL: Generic HTTPException everywhere
if not user:
    raise HTTPException(404, "not found")  # No structure
```

## Security Checklist

- [ ] Password hashing with bcrypt/passlib
- [ ] JWT tokens with expiry
- [ ] OAuth2 or equivalent auth flow
- [ ] CORS configured per environment (not `*` in prod)
- [ ] Pydantic validation on all inputs
- [ ] Rate limiting on auth endpoints
- [ ] HTTPS in production

## Testing

**Use TestClient with dependency overrides:**

```python
@pytest.fixture
async def client():
    app = create_app()
    app.dependency_overrides[get_db] = override_get_db
    with TestClient(app) as c:
        yield c
    app.dependency_overrides.clear()
```

## See Also

- skill: `fastapi-patterns` - Comprehensive FastAPI guide
- skill: `python-patterns` - Python idioms
- skill: `api-design` - REST API design patterns
