import uuid

from app.services.retrieval_service import (
    _cosine_similarity,
    _lexical_score,
    _mmr_select,
    _tokenize,
)


def test_tokenize_normalizes_case_and_symbols():
    tokens = _tokenize("Hello, RAG-Pipeline v2!")
    assert tokens == ["hello", "rag", "pipeline", "v2"]


def test_lexical_score_zero_when_no_overlap():
    score = _lexical_score("how to deploy", "apples and oranges")
    assert score == 0.0


def test_lexical_score_positive_for_overlap():
    score = _lexical_score("rag retrieval quality", "improve retrieval quality with reranking")
    assert score > 0.0
    assert score <= 1.0


def test_cosine_similarity_bounds():
    assert _cosine_similarity([1.0, 0.0], [1.0, 0.0]) == 1.0
    assert _cosine_similarity([1.0, 0.0], [0.0, 1.0]) == 0.0


def test_mmr_select_returns_top_k_unique_ids():
    ids = [uuid.uuid4() for _ in range(5)]
    embeddings = {
        ids[0]: [1.0, 0.0, 0.0],
        ids[1]: [0.9, 0.1, 0.0],
        ids[2]: [0.0, 1.0, 0.0],
        ids[3]: [0.0, 0.9, 0.1],
        ids[4]: [0.0, 0.0, 1.0],
    }

    selected = _mmr_select(ids, embeddings, top_k=3, lambda_param=0.75)

    assert len(selected) == 3
    assert len(set(selected)) == 3
    assert all(sid in ids for sid in selected)


def test_mmr_select_returns_all_when_shorter_than_top_k():
    ids = [uuid.uuid4() for _ in range(2)]
    embeddings = {
        ids[0]: [1.0, 0.0],
        ids[1]: [0.0, 1.0],
    }

    selected = _mmr_select(ids, embeddings, top_k=5)
    assert selected == ids
