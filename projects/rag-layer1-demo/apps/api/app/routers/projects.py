import uuid

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.deps import get_current_user
from app.database import get_db
from app.models import User
from app.schemas import APIResponse, ProjectCreate, ProjectOut, ProjectUpdate
from app.services import project_service

router = APIRouter(prefix="/projects", tags=["projects"])


@router.post("", response_model=APIResponse[ProjectOut], status_code=201)
def create_project(
    payload: ProjectCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    project = project_service.create_project(payload, current_user, db)
    return APIResponse(success=True, data=ProjectOut.model_validate(project))


@router.get("", response_model=APIResponse[list[ProjectOut]])
def list_projects(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    projects = project_service.list_projects(current_user, db)
    return APIResponse(success=True, data=[ProjectOut.model_validate(p) for p in projects])


@router.get("/{project_id}", response_model=APIResponse[ProjectOut])
def get_project(
    project_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    project = project_service.get_project(project_id, current_user, db)
    return APIResponse(success=True, data=ProjectOut.model_validate(project))


@router.put("/{project_id}", response_model=APIResponse[ProjectOut])
def update_project(
    project_id: uuid.UUID,
    payload: ProjectUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    project = project_service.update_project(project_id, payload, current_user, db)
    return APIResponse(success=True, data=ProjectOut.model_validate(project))


@router.delete("/{project_id}", response_model=APIResponse[None])
def delete_project(
    project_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    project_service.delete_project(project_id, current_user, db)
    return APIResponse(success=True, data=None)
