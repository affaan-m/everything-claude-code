from __future__ import annotations

import logging
import uuid
from dataclasses import dataclass, field

from app.models import ChunkingStrategy

logger = logging.getLogger(__name__)


@dataclass
class Chunk:
    content: str
    chunk_index: int
    page_number: int | None = None
    section_heading: str | None = None
    metadata: dict = field(default_factory=dict)


def chunk_naive(
    pages: list[tuple[str, int]],  # (text, page_number)
    chunk_size: int,
    chunk_overlap: int,
) -> list[Chunk]:
    """Split using LangChain RecursiveCharacterTextSplitter."""
    from langchain_text_splitters import RecursiveCharacterTextSplitter

    splitter = RecursiveCharacterTextSplitter(
        chunk_size=chunk_size,
        chunk_overlap=chunk_overlap,
        length_function=len,
    )
    chunks: list[Chunk] = []
    idx = 0
    for text, page_num in pages:
        for piece in splitter.split_text(text):
            if piece.strip():
                chunks.append(Chunk(content=piece.strip(), chunk_index=idx, page_number=page_num))
                idx += 1
    return chunks


def chunk_qa(pages: list[tuple[str, int]]) -> list[Chunk]:
    """Extract Q/A pairs. Falls back to naive if no Q/A pattern found."""
    import re

    qa_pattern = re.compile(r"(?:^|\n)\s*(Q[:\.].*?)(?=\n\s*A[:\.]|\Z)", re.DOTALL | re.IGNORECASE)
    answer_pattern = re.compile(r"\n\s*A[:\.](.+?)(?=\n\s*Q[:\.]|\Z)", re.DOTALL | re.IGNORECASE)

    chunks: list[Chunk] = []
    idx = 0
    for text, page_num in pages:
        questions = qa_pattern.findall(text)
        answers = answer_pattern.findall(text)

        if questions:
            for q, a in zip(questions, answers):
                combined = f"{q.strip()}\n{a.strip()}"
                chunks.append(Chunk(content=combined, chunk_index=idx, page_number=page_num))
                idx += 1
        else:
            # Fallback: treat whole page as a single chunk
            if text.strip():
                chunks.append(Chunk(content=text.strip(), chunk_index=idx, page_number=page_num))
                idx += 1

    return chunks


def chunk_one(pages: list[tuple[str, int]]) -> list[Chunk]:
    """Combine all pages into a single chunk."""
    full_text = "\n\n".join(t for t, _ in pages if t.strip())
    if not full_text:
        return []
    return [Chunk(content=full_text, chunk_index=0)]


def apply_chunking(
    pages: list[tuple[str, int]],
    strategy: ChunkingStrategy,
    chunk_size: int,
    chunk_overlap: int,
) -> list[Chunk]:
    if strategy == ChunkingStrategy.QA:
        return chunk_qa(pages)
    if strategy == ChunkingStrategy.ONE:
        return chunk_one(pages)
    return chunk_naive(pages, chunk_size, chunk_overlap)
