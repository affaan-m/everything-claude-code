from __future__ import annotations

import logging
import uuid
from datetime import datetime

from sqlalchemy.orm import Session

from app.config import settings
from app.models import Document, DocumentChunk, DocumentStatus
from app.providers.embedding import EmbeddingProvider
from app.worker.pipeline.chunker import Chunk

logger = logging.getLogger(__name__)


def index_chunks(
    document: Document,
    chunks: list[Chunk],
    embedding_provider: EmbeddingProvider,
    db: Session,
) -> int:
    """
    Embed in batches and upsert to DB.
    Returns total chunks indexed.
    Commits once per batch; rolls back only the current batch on failure.
    """
    batch_size = settings.EMBEDDING_BATCH_SIZE
    total = 0

    for batch_start in range(0, len(chunks), batch_size):
        batch = chunks[batch_start : batch_start + batch_size]
        texts = [c.content for c in batch]

        try:
            embeddings = embedding_provider.embed_batch(texts)
        except Exception as exc:
            logger.error("Embedding batch %d failed: %s", batch_start, exc)
            raise

        db_chunks = [
            DocumentChunk(
                id=uuid.uuid4(),
                document_id=document.id,
                project_id=document.project_id,
                chunk_index=chunk.chunk_index,
                content=chunk.content,
                page_number=chunk.page_number,
                section_heading=chunk.section_heading,
                metadata=chunk.metadata,
                embedding=embedding,
                created_at=datetime.utcnow(),
            )
            for chunk, embedding in zip(batch, embeddings)
        ]

        try:
            db.add_all(db_chunks)
            db.commit()
        except Exception:
            db.rollback()
            raise

        total += len(db_chunks)
        logger.debug("Indexed batch: %d/%d chunks", total, len(chunks))

    return total
