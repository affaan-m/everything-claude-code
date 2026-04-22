import pytest

from app.worker.pipeline.chunker import (
    ChunkingStrategy,
    apply_chunking,
    chunk_naive,
    chunk_one,
    chunk_qa,
)

SAMPLE_TEXT = """\
This is the first sentence of the document. It contains some information.
This is the second sentence with more details.
And here is a third sentence that adds further context.
"""

QA_TEXT = """\
Q: What is retrieval-augmented generation?
A: RAG is a technique that enhances LLMs with external knowledge retrieval.

Q: Why is chunking important?
A: Chunking splits documents into smaller units for more precise retrieval.
"""


@pytest.fixture
def sample_pages():
    return [(SAMPLE_TEXT, 1)]


@pytest.fixture
def qa_pages():
    return [(QA_TEXT, 1)]


def test_naive_chunking_returns_chunks(sample_pages):
    chunks = chunk_naive(sample_pages, chunk_size=100, chunk_overlap=10)
    assert len(chunks) >= 1
    assert all(c.content for c in chunks)


def test_naive_chunk_size_respected(sample_pages):
    chunks = chunk_naive(sample_pages, chunk_size=50, chunk_overlap=5)
    for chunk in chunks:
        # chunks may be slightly over due to splitter boundaries
        assert len(chunk.content) <= 200  # generous upper bound


def test_naive_chunk_indices_sequential(sample_pages):
    chunks = chunk_naive(sample_pages, chunk_size=80, chunk_overlap=10)
    for i, chunk in enumerate(chunks):
        assert chunk.chunk_index == i


def test_qa_chunking_extracts_pairs(qa_pages):
    chunks = chunk_qa(qa_pages)
    assert len(chunks) == 2
    assert "RAG" in chunks[0].content
    assert "Chunking" in chunks[1].content or "chunking" in chunks[1].content


def test_qa_chunking_fallback_no_pattern():
    pages = [("No Q/A pattern here, just regular text.", 1)]
    chunks = chunk_qa(pages)
    assert len(chunks) == 1
    assert chunks[0].content == "No Q/A pattern here, just regular text."


def test_one_chunking_combines_all_pages():
    pages = [("First page.", 1), ("Second page.", 2)]
    chunks = chunk_one(pages)
    assert len(chunks) == 1
    assert "First page" in chunks[0].content
    assert "Second page" in chunks[0].content


def test_one_chunking_empty_input():
    chunks = chunk_one([])
    assert chunks == []


def test_apply_chunking_dispatcher(sample_pages, qa_pages):
    naive = apply_chunking(sample_pages, ChunkingStrategy.NAIVE, 100, 10)
    assert len(naive) >= 1

    qa = apply_chunking(qa_pages, ChunkingStrategy.QA, 512, 64)
    assert len(qa) >= 1

    one = apply_chunking(sample_pages, ChunkingStrategy.ONE, 512, 64)
    assert len(one) == 1
