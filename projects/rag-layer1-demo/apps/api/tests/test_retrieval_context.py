from datetime import UTC, datetime
import uuid

from app.models import ConversationMessage, MessageRole
from app.services.retrieval_service import _compose_query_with_context


def _msg(role: MessageRole, content: str) -> ConversationMessage:
    return ConversationMessage(
        id=uuid.uuid4(),
        session_id=uuid.uuid4(),
        project_id=uuid.uuid4(),
        role=role,
        content=content,
        created_at=datetime.now(UTC),
    )


def test_compose_query_without_context_returns_question():
    question = "How does retrieval work?"
    assert _compose_query_with_context(question, []) == question


def test_compose_query_with_recent_turns_includes_roles_and_question():
    question = "what is top-k"
    turns = [
        _msg(MessageRole.USER, "Tell me about vector search"),
        _msg(MessageRole.ASSISTANT, "Vector search finds nearest embeddings."),
    ]

    out = _compose_query_with_context(question, turns)

    assert "Conversation context:" in out
    assert "user: Tell me about vector search" in out
    assert "assistant: Vector search finds nearest embeddings." in out
    assert "Current user question: what is top-k" in out
