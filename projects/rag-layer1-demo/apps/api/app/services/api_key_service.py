import uuid
from datetime import datetime

from sqlalchemy.orm import Session

from app.config import settings
from app.core.exceptions import ForbiddenError, NotFoundError
from app.core.security import generate_api_key
from app.models import APIKey, Project, User
from app.schemas import APIKeyCreated, APIKeyOut


def create_api_key(project_id: uuid.UUID, owner: User, db: Session) -> APIKeyCreated:
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        raise NotFoundError("Project")
    if project.owner_id != owner.id:
        raise ForbiddenError()

    plaintext, key_hash, key_prefix = generate_api_key(settings.ENVIRONMENT, str(project_id))

    api_key = APIKey(
        project_id=project_id,
        key_hash=key_hash,
        key_prefix=key_prefix,
    )
    db.add(api_key)
    db.commit()
    db.refresh(api_key)

    return APIKeyCreated(
        id=api_key.id,
        project_id=api_key.project_id,
        key_prefix=api_key.key_prefix,
        plaintext_key=plaintext,
        is_active=api_key.is_active,
        created_at=api_key.created_at,
    )


def list_api_keys(project_id: uuid.UUID, owner: User, db: Session) -> list[APIKeyOut]:
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        raise NotFoundError("Project")
    if project.owner_id != owner.id:
        raise ForbiddenError()

    keys = db.query(APIKey).filter(APIKey.project_id == project_id).order_by(APIKey.created_at.desc()).all()
    return [APIKeyOut.model_validate(k) for k in keys]


def revoke_api_key(project_id: uuid.UUID, key_id: uuid.UUID, owner: User, db: Session) -> APIKeyOut:
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        raise NotFoundError("Project")
    if project.owner_id != owner.id:
        raise ForbiddenError()

    api_key = db.query(APIKey).filter(APIKey.id == key_id, APIKey.project_id == project_id).first()
    if not api_key:
        raise NotFoundError("API key")

    api_key.is_active = False
    api_key.revoked_at = datetime.utcnow()
    db.commit()
    db.refresh(api_key)
    return APIKeyOut.model_validate(api_key)
