from __future__ import annotations

import logging
import tempfile
from pathlib import Path

logger = logging.getLogger(__name__)


def extract_text(storage_key: str, mime_type: str) -> list[tuple[str, int]]:
    """
    Returns a list of (page_text, page_number) tuples.
    Page numbers are 1-based.
    """
    path = Path(storage_key)
    if not path.exists():
        raise FileNotFoundError(f"File not found: {storage_key}")

    if mime_type == "application/pdf":
        return _extract_pdf(str(path))
    elif mime_type == "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
        return _extract_docx(str(path))
    else:
        return _extract_text(str(path))


def _extract_pdf(path: str) -> list[tuple[str, int]]:
    from langchain_community.document_loaders import PyPDFLoader

    loader = PyPDFLoader(path)
    pages = loader.load()
    return [(doc.page_content, i + 1) for i, doc in enumerate(pages)]


def _extract_docx(path: str) -> list[tuple[str, int]]:
    from langchain_community.document_loaders import Docx2txtLoader

    loader = Docx2txtLoader(path)
    docs = loader.load()
    return [(doc.page_content, 1) for doc in docs]


def _extract_text(path: str) -> list[tuple[str, int]]:
    from langchain_community.document_loaders import TextLoader

    loader = TextLoader(path, encoding="utf-8", autodetect_encoding=True)
    docs = loader.load()
    return [(doc.page_content, 1) for doc in docs]
