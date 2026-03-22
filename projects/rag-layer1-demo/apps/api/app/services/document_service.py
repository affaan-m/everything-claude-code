import mimetypes
import os
import re
import uuid
from pathlib import Path

from fastapi import UploadFile
from sqlalchemy.orm import Session

from app.config import settings
from app.core.exceptions import ForbiddenError, NotFoundError, ValidationError
from app.models import Document, DocumentStatus, Project, SourceType, User
from app.schemas import DocumentOut
from app.worker.tasks import process_document_task

# Allowed MIME types
_ALLOWED_TYPES = {
    "application/pdf",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "text/plain",
    "text/markdown",
}


def _get_or_403(project_id: uuid.UUID, owner: User, db: Session) -> Project:
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        raise NotFoundError("Project")
    if project.owner_id != owner.id:
        raise ForbiddenError()
    return project


def upload_document(
    project_id: uuid.UUID,
    file: UploadFile,
    owner: User,
    db: Session,
) -> DocumentOut:
    project = _get_or_403(project_id, owner, db)

    # Validate size
    file.file.seek(0, 2)
    size = file.file.tell()
    file.file.seek(0)
    if size > settings.MAX_FILE_SIZE_BYTES:
        raise ValidationError(f"File exceeds maximum size of {settings.MAX_FILE_SIZE_MB}MB")

    # Validate type
    mime = file.content_type or mimetypes.guess_type(file.filename or "")[0]
    if mime not in _ALLOWED_TYPES:
        raise ValidationError(f"Unsupported file type: {mime}")

    # Sanitize filename
    original_filename = file.filename or "upload"
    safe_name = re.sub(r"[^\w.\-]", "_", Path(original_filename).name)
    storage_filename = f"{uuid.uuid4()}_{safe_name}"
    upload_dir = Path(settings.UPLOAD_DIR) / str(project_id)
    upload_dir.mkdir(parents=True, exist_ok=True)
    storage_path = upload_dir / storage_filename

    with storage_path.open("wb") as out:
        out.write(file.file.read())

    doc = Document(
        project_id=project_id,
        filename=safe_name,
        original_filename=original_filename,
        source_type=SourceType.FILE,
        storage_key=str(storage_path),
        file_size=size,
        mime_type=mime,
        status=DocumentStatus.PENDING,
    )
    db.add(doc)
    db.commit()
    db.refresh(doc)

    # Enqueue async processing
    process_document_task.delay(str(doc.id))

    return DocumentOut.model_validate(doc)


def list_documents(project_id: uuid.UUID, owner: User, db: Session) -> list[DocumentOut]:
    _get_or_403(project_id, owner, db)
    docs = db.query(Document).filter(Document.project_id == project_id).order_by(Document.created_at.desc()).all()
    return [DocumentOut.model_validate(d) for d in docs]


def get_document(project_id: uuid.UUID, document_id: uuid.UUID, owner: User, db: Session) -> DocumentOut:
    _get_or_403(project_id, owner, db)
    doc = db.query(Document).filter(Document.id == document_id, Document.project_id == project_id).first()
    if not doc:
        raise NotFoundError("Document")
    return DocumentOut.model_validate(doc)


def delete_document(project_id: uuid.UUID, document_id: uuid.UUID, owner: User, db: Session) -> None:
    _get_or_403(project_id, owner, db)
    doc = db.query(Document).filter(Document.id == document_id, Document.project_id == project_id).first()
    if not doc:
        raise NotFoundError("Document")

    # Remove file from storage
    if doc.storage_key and os.path.exists(doc.storage_key):
        os.remove(doc.storage_key)

    db.delete(doc)
    db.commit()
