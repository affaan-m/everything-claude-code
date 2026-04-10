from __future__ import annotations

import logging
import uuid

from app.database import SessionLocal
from app.models import Document, DocumentStatus
from app.providers.embedding import get_embedding_provider
from app.worker.celery_app import celery_app
from app.worker.pipeline.chunker import apply_chunking
from app.worker.pipeline.cleaner import clean_pages
from app.worker.pipeline.extractor import extract_text
from app.worker.pipeline.indexer import index_chunks

logger = logging.getLogger(__name__)


@celery_app.task(bind=True, max_retries=3, name="app.worker.tasks.process_document_task")
def process_document_task(self, document_id: str) -> dict:
    db = SessionLocal()
    doc = None
    try:
        doc = db.query(Document).filter(Document.id == document_id).first()
        if not doc:
            logger.warning("Document %s not found", document_id)
            return {"status": "not_found"}

        # Mark processing
        doc.status = DocumentStatus.PROCESSING
        db.commit()

        project = doc.project

        # Step 1: Extract
        pages = extract_text(doc.storage_key, doc.mime_type or "text/plain")

        # Step 2: Clean
        cleaned = clean_pages(pages)

        # Step 3: Chunk
        chunks = apply_chunking(
            cleaned,
            project.chunking_strategy,
            project.chunk_size,
            project.chunk_overlap,
        )

        # Step 4: Embed + index (batched)
        provider = get_embedding_provider()
        total = index_chunks(doc, chunks, provider, db)

        # Step 5: Mark indexed
        doc.status = DocumentStatus.INDEXED
        doc.chunk_count = total
        db.commit()

        logger.info("Document %s indexed: %d chunks", document_id, total)
        return {"status": "indexed", "chunks": total}

    except Exception as exc:
        if doc:
            doc.status = DocumentStatus.FAILED
            doc.error_message = str(exc)[:500]
            try:
                db.commit()
            except Exception:
                db.rollback()

        logger.exception("Failed to process document %s", document_id)
        raise self.retry(exc=exc, countdown=60 * (self.request.retries + 1))
    finally:
        db.close()
