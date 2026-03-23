from __future__ import annotations

import logging
from abc import ABC, abstractmethod
from functools import lru_cache

import numpy as np

from app.config import settings

logger = logging.getLogger(__name__)


class EmbeddingProvider(ABC):
    @abstractmethod
    def embed(self, text: str) -> list[float]:
        ...

    @abstractmethod
    def embed_batch(self, texts: list[str]) -> list[list[float]]:
        ...


class MockEmbeddingProvider(EmbeddingProvider):
    """Returns deterministic random unit vectors — no API calls needed."""

    def embed(self, text: str) -> list[float]:
        rng = np.random.default_rng(seed=abs(hash(text)) % (2**31))
        vec = rng.standard_normal(settings.EMBEDDING_DIMENSIONS).astype(np.float32)
        vec /= np.linalg.norm(vec) + 1e-10
        return vec.tolist()

    def embed_batch(self, texts: list[str]) -> list[list[float]]:
        return [self.embed(t) for t in texts]


class GeminiEmbeddingProvider(EmbeddingProvider):
    def __init__(self) -> None:
        try:
            import google.generativeai as genai
        except ImportError as exc:
            raise RuntimeError("google-generativeai not installed; pip install langchain-google-genai") from exc

        api_key = settings.GOOGLE_API_KEY
        if not api_key:
            raise RuntimeError("GOOGLE_API_KEY must be set for GeminiEmbeddingProvider")

        import google.generativeai as genai
        genai.configure(api_key=api_key)
        self._genai = genai
        self._model = settings.EMBEDDING_MODEL

    def embed(self, text: str) -> list[float]:
        result = self._genai.embed_content(
            model=f"models/{self._model}",
            content=text,
            task_type="retrieval_query",
        )
        return result["embedding"]

    def embed_batch(self, texts: list[str]) -> list[list[float]]:
        embeddings = []
        for text in texts:
            embeddings.append(self.embed(text))
        return embeddings


@lru_cache(maxsize=1)
def get_embedding_provider() -> EmbeddingProvider:
    """Get singleton embedding provider with thread-safe lazy initialization."""
    if settings.EMBEDDING_PROVIDER == "gemini":
        logger.info("Initializing Gemini embedding provider")
        return GeminiEmbeddingProvider()
    logger.info("Initializing mock embedding provider")
    return MockEmbeddingProvider()
