from __future__ import annotations

import json
import math
from dataclasses import dataclass
from pathlib import Path


@dataclass(frozen=True)
class RetrievalEvalCase:
    id: str
    question: str
    relevant_chunk_ids: tuple[str, ...]
    predicted_chunk_ids: tuple[str, ...]


def load_eval_cases(path: str | Path) -> list[RetrievalEvalCase]:
    raw = json.loads(Path(path).read_text(encoding="utf-8"))
    cases: list[RetrievalEvalCase] = []
    for item in raw:
        cases.append(
            RetrievalEvalCase(
                id=item["id"],
                question=item["question"],
                relevant_chunk_ids=tuple(item["relevant_chunk_ids"]),
                predicted_chunk_ids=tuple(item["predicted_chunk_ids"]),
            )
        )
    return cases


def hit_at_k(relevant: set[str], predicted: list[str], k: int) -> float:
    if k <= 0:
        return 0.0
    top = predicted[:k]
    return 1.0 if any(cid in relevant for cid in top) else 0.0


def mrr_at_k(relevant: set[str], predicted: list[str], k: int) -> float:
    if k <= 0:
        return 0.0
    for idx, cid in enumerate(predicted[:k], start=1):
        if cid in relevant:
            return 1.0 / idx
    return 0.0


def ndcg_at_k(relevant: set[str], predicted: list[str], k: int) -> float:
    if k <= 0:
        return 0.0

    dcg = 0.0
    for idx, cid in enumerate(predicted[:k], start=1):
        rel = 1.0 if cid in relevant else 0.0
        if rel > 0.0:
            dcg += rel / math.log2(idx + 1)

    ideal_hits = min(len(relevant), k)
    if ideal_hits == 0:
        return 0.0

    idcg = sum(1.0 / math.log2(idx + 1) for idx in range(1, ideal_hits + 1))
    if idcg == 0.0:
        return 0.0
    return dcg / idcg


def evaluate_cases(cases: list[RetrievalEvalCase], k_values: tuple[int, ...] = (1, 3, 5)) -> dict[str, float]:
    if not cases:
        return {f"hit@{k}": 0.0 for k in k_values} | {f"mrr@{k}": 0.0 for k in k_values} | {f"ndcg@{k}": 0.0 for k in k_values}

    summary: dict[str, float] = {}
    for k in k_values:
        hit_total = 0.0
        mrr_total = 0.0
        ndcg_total = 0.0

        for case in cases:
            relevant = set(case.relevant_chunk_ids)
            predicted = list(case.predicted_chunk_ids)
            hit_total += hit_at_k(relevant, predicted, k)
            mrr_total += mrr_at_k(relevant, predicted, k)
            ndcg_total += ndcg_at_k(relevant, predicted, k)

        n = float(len(cases))
        summary[f"hit@{k}"] = hit_total / n
        summary[f"mrr@{k}"] = mrr_total / n
        summary[f"ndcg@{k}"] = ndcg_total / n

    return summary
