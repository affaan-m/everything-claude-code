import mimetypes
import re
import uuid
from pathlib import Path

from fastapi import UploadFile
from sqlalchemy.orm import Session

from app.config import settings
from app.core.exceptions import ForbiddenError, NotFoundError, ValidationError
from app.models import Document, DocumentStatus, Project, SourceType, User
from app.schemas import DocumentOut
from app.storage import get_storage_provider
from app.worker.tasks import process_document_task

# Allowed MIME types
_ALLOWED_TYPES = {
    "application/pdf",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "text/plain",
    "text/markdown",
}


def _get_or_403(project_id: uuid.UUID, owner: User, db: Session, lock_for_update: bool = False) -> Project:
    query = db.query(Project).filter(Project.id == project_id)
    if lock_for_update:
        query = query.with_for_update()

    project = query.first()
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
    project = _get_or_403(project_id, owner, db, lock_for_update=True)

    project_file_count = db.query(Document).filter(Document.project_id == project.id).count()
    if project_file_count >= settings.MAX_FILES_PER_PROJECT:
        raise ValidationError(
            f"Project has reached maximum files limit of {settings.MAX_FILES_PER_PROJECT}"
        )

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

    # Build the storage key.
    # For both local and S3 we use a relative key: "<prefix>/<project_id>/<uuid>_<safe_name>"
    # LocalStorageProvider will prepend UPLOAD_DIR; S3StorageProvider uses it as the object key.
    key = f"{settings.AWS_S3_KEY_PREFIX}/{project_id}/{storage_filename}"
    storage_key = get_storage_provider().save(file.file.read(), key, mime or "application/octet-stream")

    doc = Document(
        project_id=project_id,
        filename=safe_name,
        original_filename=original_filename,
        source_type=SourceType.FILE,
        storage_key=storage_key,
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
    if doc.storage_key:
        get_storage_provider().delete(doc.storage_key)

    db.delete(doc)
    db.commit()
