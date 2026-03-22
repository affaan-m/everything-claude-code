import uuid

from sqlalchemy.orm import Session

from app.models import APIKey, DocumentChunk
from app.providers.embedding import get_embedding_provider
from app.schemas import ChunkResult, RetrieveRequest, RetrieveResponse


def retrieve(
    api_key: APIKey,
    payload: RetrieveRequest,
    db: Session,
) -> RetrieveResponse:
    project = api_key.project
    top_k = payload.top_k if payload.top_k is not None else project.top_k

    embedding_provider = get_embedding_provider()
    query_vector = embedding_provider.embed(payload.question)

    # Cosine similarity search, filtered by project
    results = (
        db.query(
            DocumentChunk,
            DocumentChunk.embedding.cosine_distance(query_vector).label("distance"),
        )
        .filter(
            DocumentChunk.project_id == project.id,
            DocumentChunk.embedding.isnot(None),
        )
        .order_by("distance")
        .limit(top_k)
        .all()
    )

    chunks = [
        ChunkResult(
            id=chunk.id,
            document_id=chunk.document_id,
            chunk_index=chunk.chunk_index,
            content=chunk.content,
            page_number=chunk.page_number,
            section_heading=chunk.section_heading,
            metadata=chunk.metadata or {},
            score=float(1.0 - distance),  # cosine similarity from distance
        )
        for chunk, distance in results
    ]

    return RetrieveResponse(
        project_id=project.id,
        question=payload.question,
        chunks=chunks,
    )
