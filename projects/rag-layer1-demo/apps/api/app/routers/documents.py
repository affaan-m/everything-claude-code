import uuid

from fastapi import APIRouter, Depends, File, UploadFile
from sqlalchemy.orm import Session

from app.core.deps import get_current_user
from app.database import get_db
from app.models import User
from app.schemas import APIResponse, DocumentOut
from app.services import document_service

router = APIRouter(prefix="/projects/{project_id}/documents", tags=["documents"])


@router.post("", response_model=APIResponse[DocumentOut], status_code=202)
def upload_document(
    project_id: uuid.UUID,
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    doc = document_service.upload_document(project_id, file, current_user, db)
    return APIResponse(success=True, data=doc)


@router.get("", response_model=APIResponse[list[DocumentOut]])
def list_documents(
    project_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    docs = document_service.list_documents(project_id, current_user, db)
    return APIResponse(success=True, data=docs)


@router.get("/{document_id}", response_model=APIResponse[DocumentOut])
def get_document(
    project_id: uuid.UUID,
    document_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    doc = document_service.get_document(project_id, document_id, current_user, db)
    return APIResponse(success=True, data=doc)


@router.delete("/{document_id}", response_model=APIResponse[None])
def delete_document(
    project_id: uuid.UUID,
    document_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    document_service.delete_document(project_id, document_id, current_user, db)
    return APIResponse(success=True, data=None)
