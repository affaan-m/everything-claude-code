import io
import uuid

import pytest
from fastapi import UploadFile

from app.config import settings
from app.core.exceptions import ValidationError
from app.models import Document, DocumentStatus, Project, SourceType, User
from app.services import document_service


class _StubStorageProvider:
    def save(self, _data: bytes, key: str, _content_type: str) -> str:
        return key

    def delete(self, _key: str) -> None:
        return None


def _create_owner_and_project(db_session):
    owner = User(
        email=f"owner-{uuid.uuid4()}@example.com",
        password_hash="hashed",
        is_active=True,
    )
    db_session.add(owner)
    db_session.flush()

    project = Project(owner_id=owner.id, name="Limits Project")
    db_session.add(project)
    db_session.commit()
    db_session.refresh(owner)
    db_session.refresh(project)
    return owner, project


def _seed_documents(db_session, project_id, count: int) -> None:
    docs = [
        Document(
            project_id=project_id,
            filename=f"file-{i}.txt",
            original_filename=f"file-{i}.txt",
            source_type=SourceType.FILE,
            status=DocumentStatus.INDEXED,
        )
        for i in range(count)
    ]
    db_session.add_all(docs)
    db_session.commit()


def test_upload_document_allows_when_below_project_file_limit(db_session, monkeypatch):
    monkeypatch.setattr(settings, "MAX_FILES_PER_PROJECT", 2)
    monkeypatch.setattr(document_service, "get_storage_provider", lambda: _StubStorageProvider())
    monkeypatch.setattr(document_service.process_document_task, "delay", lambda _id: None)

    owner, project = _create_owner_and_project(db_session)
    _seed_documents(db_session, project.id, 1)

    upload = UploadFile(filename="new-file.txt", file=io.BytesIO(b"hello world"))
    created = document_service.upload_document(project.id, upload, owner, db_session)

    assert created.filename == "new-file.txt"
    count = db_session.query(Document).filter(Document.project_id == project.id).count()
    assert count == 2


def test_upload_document_rejects_when_project_file_limit_reached(db_session, monkeypatch):
    monkeypatch.setattr(settings, "MAX_FILES_PER_PROJECT", 2)
    monkeypatch.setattr(document_service, "get_storage_provider", lambda: _StubStorageProvider())
    monkeypatch.setattr(document_service.process_document_task, "delay", lambda _id: None)

    owner, project = _create_owner_and_project(db_session)
    _seed_documents(db_session, project.id, 2)

    upload = UploadFile(filename="overflow.txt", file=io.BytesIO(b"hello world"))

    with pytest.raises(ValidationError, match="maximum files limit of 2"):
        document_service.upload_document(project.id, upload, owner, db_session)
