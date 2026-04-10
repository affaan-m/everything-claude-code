import uuid

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.deps import get_current_user
from app.database import get_db
from app.models import User
from app.schemas import APIKeyCreated, APIKeyOut, APIResponse
from app.services import api_key_service

router = APIRouter(prefix="/projects/{project_id}/api-keys", tags=["api-keys"])


@router.post("", response_model=APIResponse[APIKeyCreated], status_code=201)
def create_api_key(
    project_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    created = api_key_service.create_api_key(project_id, current_user, db)
    return APIResponse(success=True, data=created)


@router.get("", response_model=APIResponse[list[APIKeyOut]])
def list_api_keys(
    project_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    keys = api_key_service.list_api_keys(project_id, current_user, db)
    return APIResponse(success=True, data=keys)


@router.post("/{key_id}/revoke", response_model=APIResponse[APIKeyOut])
def revoke_api_key(
    project_id: uuid.UUID,
    key_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    key = api_key_service.revoke_api_key(project_id, key_id, current_user, db)
    return APIResponse(success=True, data=key)
