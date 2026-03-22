from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.deps import get_current_user, get_project_from_api_key
from app.core.security import hash_api_key
from app.database import get_db
from app.models import APIKey, User
from app.schemas import APIResponse, TokenResponse, UserOut, ValidateKeyResponse
from app.services import auth_service
from app.schemas import LoginRequest, RegisterRequest

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/register", response_model=APIResponse[UserOut], status_code=201)
def register(payload: RegisterRequest, db: Session = Depends(get_db)):
    user = auth_service.register_user(payload, db)
    return APIResponse(success=True, data=UserOut.model_validate(user))


@router.post("/login", response_model=APIResponse[TokenResponse])
def login(payload: LoginRequest, db: Session = Depends(get_db)):
    token = auth_service.login_user(payload, db)
    return APIResponse(success=True, data=token)


@router.get("/me", response_model=APIResponse[UserOut])
def me(current_user: User = Depends(get_current_user)):
    return APIResponse(success=True, data=UserOut.model_validate(current_user))


@router.post("/validate-key", response_model=ValidateKeyResponse)
def validate_key(api_key: APIKey = Depends(get_project_from_api_key)):
    """Validates a project API key — used by Layer 2 services."""
    return ValidateKeyResponse(
        valid=True,
        project_id=api_key.project_id,
        project_name=api_key.project.name,
        top_k=api_key.project.top_k,
    )
