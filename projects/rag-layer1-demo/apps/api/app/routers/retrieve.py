from fastapi import APIRouter, Depends, Request
from sqlalchemy.orm import Session

from app.core.deps import get_project_from_api_key
from app.core.rate_limit import limiter
from app.database import get_db
from app.models import APIKey
from app.schemas import RetrieveRequest, RetrieveResponse
from app.services import retrieval_service

router = APIRouter(prefix="/retrieve", tags=["retrieve"])


@router.post("", response_model=RetrieveResponse)
@limiter.limit("120/minute")
def retrieve(
    request: Request,
    payload: RetrieveRequest,
    api_key: APIKey = Depends(get_project_from_api_key),
    db: Session = Depends(get_db),
):
    return retrieval_service.retrieve(api_key, payload, db)
