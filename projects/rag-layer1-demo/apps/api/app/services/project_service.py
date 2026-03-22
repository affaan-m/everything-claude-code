import uuid

from sqlalchemy.orm import Session

from app.core.exceptions import ForbiddenError, NotFoundError
from app.models import Project, User
from app.schemas import ProjectCreate, ProjectUpdate


def create_project(payload: ProjectCreate, owner: User, db: Session) -> Project:
    project = Project(
        owner_id=owner.id,
        name=payload.name,
        description=payload.description,
        chunking_strategy=payload.chunking_strategy,
        chunk_size=payload.chunk_size,
        chunk_overlap=payload.chunk_overlap,
        top_k=payload.top_k,
    )
    db.add(project)
    db.commit()
    db.refresh(project)
    return project


def list_projects(owner: User, db: Session) -> list[Project]:
    return db.query(Project).filter(Project.owner_id == owner.id).order_by(Project.created_at.desc()).all()


def get_project(project_id: uuid.UUID, owner: User, db: Session) -> Project:
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        raise NotFoundError("Project")
    if project.owner_id != owner.id:
        raise ForbiddenError()
    return project


def update_project(project_id: uuid.UUID, payload: ProjectUpdate, owner: User, db: Session) -> Project:
    project = get_project(project_id, owner, db)
    updates = payload.model_dump(exclude_unset=True)
    for field, value in updates.items():
        setattr(project, field, value)
    db.commit()
    db.refresh(project)
    return project


def delete_project(project_id: uuid.UUID, owner: User, db: Session) -> None:
    project = get_project(project_id, owner, db)
    db.delete(project)
    db.commit()
