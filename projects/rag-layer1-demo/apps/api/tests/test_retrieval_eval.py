from pathlib import Path

import pytest

from app.services.retrieval_eval import (
    evaluate_cases,
    hit_at_k,
    load_eval_cases,
    mrr_at_k,
    ndcg_at_k,
)


def test_point_metrics_behave_as_expected():
    relevant = {"a", "b"}
    predicted = ["x", "b", "z", "a"]

    assert hit_at_k(relevant, predicted, 1) == 0.0
    assert hit_at_k(relevant, predicted, 2) == 1.0
    assert mrr_at_k(relevant, predicted, 4) == pytest.approx(0.5)
    assert 0.0 <= ndcg_at_k(relevant, predicted, 4) <= 1.0


def test_load_eval_cases_from_fixture():
    fixture = Path(__file__).parent / "fixtures" / "retrieval_eval_cases.json"
    cases = load_eval_cases(fixture)

    assert len(cases) == 3
    assert cases[0].id == "q1"
    assert cases[1].relevant_chunk_ids == ("c3", "c4")


def test_evaluate_cases_returns_expected_aggregate_metrics():
    fixture = Path(__file__).parent / "fixtures" / "retrieval_eval_cases.json"
    cases = load_eval_cases(fixture)

    metrics = evaluate_cases(cases, k_values=(1, 3))

    assert metrics["hit@1"] == pytest.approx(1.0 / 3.0, rel=1e-4)
    assert metrics["hit@3"] == pytest.approx(2.0 / 3.0, rel=1e-4)
    assert metrics["mrr@1"] == pytest.approx(1.0 / 3.0, rel=1e-4)
    assert metrics["mrr@3"] == pytest.approx(0.5, rel=1e-4)
    assert metrics["ndcg@1"] == pytest.approx(1.0 / 3.0, rel=1e-4)
    assert metrics["ndcg@3"] == pytest.approx(0.564475, rel=1e-4)
