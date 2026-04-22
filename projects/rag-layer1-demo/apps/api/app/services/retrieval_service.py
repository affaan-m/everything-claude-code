import math
import re
import uuid

from sqlalchemy.orm import Session

from app.core.exceptions import NotFoundError
from app.models import APIKey, ConversationMessage, ConversationSession, DocumentChunk, MessageRole
from app.providers.embedding import get_embedding_provider
from app.schemas import ChunkResult, RetrieveRequest, RetrieveResponse


_TOKEN_RE = re.compile(r"[a-zA-Z0-9_]+")
_RRF_K = 60
_MAX_CONTEXT_CHARS = 6000


def _tokenize(text: str) -> list[str]:
    return [t.lower() for t in _TOKEN_RE.findall(text)]


def _lexical_score(question: str, content: str) -> float:
    """Simple lexical relevance score in [0, 1] based on token overlap."""
    q_tokens = _tokenize(question)
    c_tokens = _tokenize(content)
    if not q_tokens or not c_tokens:
        return 0.0

    q_set = set(q_tokens)
    c_set = set(c_tokens)
    overlap = len(q_set.intersection(c_set))
    if overlap == 0:
        return 0.0

    precision = overlap / len(c_set)
    recall = overlap / len(q_set)
    if precision + recall == 0:
        return 0.0
    return 2 * precision * recall / (precision + recall)


def _rrf(rank: int, weight: float) -> float:
    return weight * (1.0 / (_RRF_K + rank))


def _cosine_similarity(a: list[float], b: list[float]) -> float:
    if not a or not b or len(a) != len(b):
        return 0.0
    dot = sum(x * y for x, y in zip(a, b))
    norm_a = math.sqrt(sum(x * x for x in a))
    norm_b = math.sqrt(sum(y * y for y in b))
    if norm_a == 0.0 or norm_b == 0.0:
        return 0.0
    return dot / (norm_a * norm_b)


def _to_float_list(embedding: list[float] | None) -> list[float] | None:
    if embedding is None:
        return None
    return [float(x) for x in embedding]


def _compose_query_with_context(question: str, turns: list[ConversationMessage]) -> str:
    """Build a retrieval query augmented with short recent conversation context."""
    if not turns:
        return question

    lines = ["Conversation context:"]
    total_chars = 0
    for turn in turns:
        role = turn.role.value
        content = turn.content.strip()
        if not content:
            continue
        line = f"{role}: {content}"
        total_chars += len(line)
        if total_chars > _MAX_CONTEXT_CHARS:
            break
        lines.append(line)

    lines.append("")
    lines.append(f"Current user question: {question}")
    return "\n".join(lines)


def _get_session_or_404(project_id: uuid.UUID, session_id: uuid.UUID, db: Session) -> ConversationSession:
    session = (
        db.query(ConversationSession)
        .filter(ConversationSession.id == session_id, ConversationSession.project_id == project_id)
        .first()
    )
    if not session:
        raise NotFoundError("Session")
    return session


def _get_recent_session_turns(project_id: uuid.UUID, session_id: uuid.UUID, context_turns: int, db: Session) -> list[ConversationMessage]:
    if context_turns <= 0:
        return []

    rows = (
        db.query(ConversationMessage)
        .filter(
            ConversationMessage.project_id == project_id,
            ConversationMessage.session_id == session_id,
            ConversationMessage.role.in_([MessageRole.USER, MessageRole.ASSISTANT]),
        )
        .order_by(ConversationMessage.created_at.desc())
        .limit(context_turns)
        .all()
    )
    rows.reverse()
    return rows


def _mmr_select(
    ordered_chunk_ids: list[uuid.UUID],
    id_to_embedding: dict[uuid.UUID, list[float]],
    top_k: int,
    lambda_param: float = 0.75,
) -> list[uuid.UUID]:
    """Select a diverse subset while preserving relevance via MMR."""
    if top_k <= 0:
        return []
    if len(ordered_chunk_ids) <= top_k:
        return ordered_chunk_ids

    selected: list[uuid.UUID] = []
    remaining = ordered_chunk_ids.copy()

    while remaining and len(selected) < top_k:
        best_id = remaining[0]
        best_score = float("-inf")

        for candidate_id in remaining:
            relevance_rank = ordered_chunk_ids.index(candidate_id) + 1
            relevance = 1.0 / relevance_rank
            candidate_emb = id_to_embedding.get(candidate_id)

            if not selected or candidate_emb is None:
                diversity_penalty = 0.0
            else:
                max_sim = 0.0
                for selected_id in selected:
                    selected_emb = id_to_embedding.get(selected_id)
                    if selected_emb is None:
                        continue
                    sim = _cosine_similarity(candidate_emb, selected_emb)
                    if sim > max_sim:
                        max_sim = sim
                diversity_penalty = max_sim

            score = (lambda_param * relevance) - ((1 - lambda_param) * diversity_penalty)
            if score > best_score:
                best_score = score
                best_id = candidate_id

        selected.append(best_id)
        remaining.remove(best_id)

    return selected


def retrieve(
    api_key: APIKey,
    payload: RetrieveRequest,
    db: Session,
) -> RetrieveResponse:
    project = api_key.project
    top_k = payload.top_k if payload.top_k is not None else project.top_k

    query_for_retrieval = payload.question
    active_session: ConversationSession | None = None

    if payload.session_id:
        active_session = _get_session_or_404(project.id, payload.session_id, db)
        turns = _get_recent_session_turns(project.id, active_session.id, payload.context_turns, db)
        query_for_retrieval = _compose_query_with_context(payload.question, turns)

    embedding_provider = get_embedding_provider()
    query_vector = embedding_provider.embed(query_for_retrieval)

    # Pull a broader semantic candidate pool first, then rerank.
    candidate_pool = payload.candidate_pool if payload.candidate_pool is not None else min(max(top_k * 6, top_k), 200)
    semantic_results = (
        db.query(
            DocumentChunk,
            DocumentChunk.embedding.cosine_distance(query_vector).label("distance"),
        )
        .filter(
            DocumentChunk.project_id == project.id,
            DocumentChunk.embedding.isnot(None),
        )
        .order_by("distance")
        .limit(candidate_pool)
        .all()
    )

    if payload.retrieval_mode == "semantic":
        final_results = semantic_results[:top_k]
        final_scores: dict[uuid.UUID, float] = {
            chunk.id: float(1.0 - distance) for chunk, distance in final_results
        }
    else:
        # Build ranks for semantic and lexical signals.
        semantic_rank: dict[uuid.UUID, int] = {}
        lexical_rank: dict[uuid.UUID, int] = {}

        for idx, (chunk, _distance) in enumerate(semantic_results, start=1):
            semantic_rank[chunk.id] = idx

        lexical_scored = [
            (chunk.id, _lexical_score(payload.question, chunk.content or ""))
            for chunk, _distance in semantic_results
        ]
        lexical_scored.sort(key=lambda x: x[1], reverse=True)
        for idx, (chunk_id, score) in enumerate(lexical_scored, start=1):
            if score > 0.0:
                lexical_rank[chunk_id] = idx

        fused_scores: dict[uuid.UUID, float] = {}
        for chunk, _distance in semantic_results:
            sid = chunk.id
            s_rank = semantic_rank.get(sid)
            l_rank = lexical_rank.get(sid)
            score = 0.0
            if s_rank is not None:
                score += _rrf(s_rank, payload.semantic_weight)
            if l_rank is not None:
                score += _rrf(l_rank, 1.0 - payload.semantic_weight)
            fused_scores[sid] = score

        ranked = sorted(semantic_results, key=lambda row: fused_scores[row[0].id], reverse=True)

        if payload.diversify:
            id_to_embedding = {
                chunk.id: emb
                for chunk, _distance in ranked
                if (emb := _to_float_list(chunk.embedding)) is not None
            }
            ranked_ids = [chunk.id for chunk, _distance in ranked]
            selected_ids = _mmr_select(
                ranked_ids,
                id_to_embedding,
                top_k=top_k,
                lambda_param=payload.diversity_lambda,
            )
            selected_id_set = set(selected_ids)
            final_results = [row for row in ranked if row[0].id in selected_id_set]
            final_results.sort(key=lambda row: selected_ids.index(row[0].id))
        else:
            final_results = ranked[:top_k]

        final_scores = {chunk.id: fused_scores[chunk.id] for chunk, _distance in final_results}

    chunks = [
        ChunkResult(
            id=chunk.id,
            document_id=chunk.document_id,
            chunk_index=chunk.chunk_index,
            content=chunk.content,
            page_number=chunk.page_number,
            section_heading=chunk.section_heading,
            metadata=chunk.meta or {},
            score=float(final_scores.get(chunk.id, 0.0)),
        )
        for chunk, distance in final_results
    ]

    if active_session and payload.persist_question_to_session:
        message = ConversationMessage(
            session_id=active_session.id,
            project_id=project.id,
            role=MessageRole.USER,
            content=payload.question,
        )
        db.add(message)
        db.commit()

    return RetrieveResponse(
        project_id=project.id,
        question=payload.question,
        chunks=chunks,
    )
