import uuid

from sqlalchemy.orm import Session

from app.core.exceptions import NotFoundError
from app.models import APIKey, ConversationMessage, ConversationSession
from app.schemas import SessionCreateRequest, SessionMessageCreate


def create_session(project_id: uuid.UUID, payload: SessionCreateRequest, db: Session) -> ConversationSession:
    session = ConversationSession(
        project_id=project_id,
        external_user_id=payload.external_user_id,
        title=payload.title,
    )
    db.add(session)
    db.commit()
    db.refresh(session)
    return session


def list_sessions(project_id: uuid.UUID, limit: int, db: Session) -> list[ConversationSession]:
    return (
        db.query(ConversationSession)
        .filter(ConversationSession.project_id == project_id)
        .order_by(ConversationSession.updated_at.desc())
        .limit(limit)
        .all()
    )


def get_session(project_id: uuid.UUID, session_id: uuid.UUID, db: Session) -> ConversationSession:
    session = (
        db.query(ConversationSession)
        .filter(ConversationSession.id == session_id, ConversationSession.project_id == project_id)
        .first()
    )
    if not session:
        raise NotFoundError("Session")
    return session


def add_message(
    project_id: uuid.UUID,
    session_id: uuid.UUID,
    payload: SessionMessageCreate,
    db: Session,
) -> ConversationMessage:
    _ = get_session(project_id, session_id, db)

    message = ConversationMessage(
        session_id=session_id,
        project_id=project_id,
        role=payload.role,
        content=payload.content,
    )
    db.add(message)
    db.commit()
    db.refresh(message)
    return message


def list_messages(project_id: uuid.UUID, session_id: uuid.UUID, limit: int, db: Session) -> list[ConversationMessage]:
    _ = get_session(project_id, session_id, db)

    return (
        db.query(ConversationMessage)
        .filter(
            ConversationMessage.project_id == project_id,
            ConversationMessage.session_id == session_id,
        )
        .order_by(ConversationMessage.created_at.desc())
        .limit(limit)
        .all()
    )
