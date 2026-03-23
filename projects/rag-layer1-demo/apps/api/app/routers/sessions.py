import uuid

from fastapi import APIRouter, Depends, Query, Request
from sqlalchemy.orm import Session

from app.core.deps import get_project_from_api_key
from app.core.rate_limit import limiter
from app.database import get_db
from app.models import APIKey
from app.schemas import (
    APIResponse,
    SessionCreateRequest,
    SessionMessageCreate,
    SessionMessageOut,
    SessionOut,
)
from app.services import session_service

router = APIRouter(prefix="/sessions", tags=["sessions"])


@router.post("", response_model=APIResponse[SessionOut], status_code=201)
@limiter.limit("120/minute")
def create_session(
    request: Request,
    payload: SessionCreateRequest,
    api_key: APIKey = Depends(get_project_from_api_key),
    db: Session = Depends(get_db),
):
    session = session_service.create_session(api_key.project_id, payload, db)
    return APIResponse(success=True, data=SessionOut.model_validate(session))


@router.get("", response_model=APIResponse[list[SessionOut]])
@limiter.limit("120/minute")
def list_sessions(
    request: Request,
    limit: int = Query(default=20, ge=1, le=100),
    api_key: APIKey = Depends(get_project_from_api_key),
    db: Session = Depends(get_db),
):
    sessions = session_service.list_sessions(api_key.project_id, limit, db)
    return APIResponse(success=True, data=[SessionOut.model_validate(s) for s in sessions])


@router.post("/{session_id}/messages", response_model=APIResponse[SessionMessageOut], status_code=201)
@limiter.limit("240/minute")
def add_session_message(
    request: Request,
    session_id: uuid.UUID,
    payload: SessionMessageCreate,
    api_key: APIKey = Depends(get_project_from_api_key),
    db: Session = Depends(get_db),
):
    message = session_service.add_message(api_key.project_id, session_id, payload, db)
    return APIResponse(success=True, data=SessionMessageOut.model_validate(message))


@router.get("/{session_id}/messages", response_model=APIResponse[list[SessionMessageOut]])
@limiter.limit("240/minute")
def list_session_messages(
    request: Request,
    session_id: uuid.UUID,
    limit: int = Query(default=50, ge=1, le=200),
    api_key: APIKey = Depends(get_project_from_api_key),
    db: Session = Depends(get_db),
):
    messages = session_service.list_messages(api_key.project_id, session_id, limit, db)
    return APIResponse(success=True, data=[SessionMessageOut.model_validate(m) for m in messages])
