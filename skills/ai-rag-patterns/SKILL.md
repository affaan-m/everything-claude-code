---
name: ai-rag-patterns
description: Production RAG architecture — chunking, embeddings, vector stores, hybrid search, re-ranking, hallucination mitigation, and RAGAS evaluation.
---

# AI RAG Patterns

Architecture patterns for Retrieval-Augmented Generation systems covering ingestion through retrieval, re-ranking, and grounded generation. Complements `cost-aware-llm-pipeline` (LLM API cost optimization) by addressing the retrieval and context-quality layer.

## When to Activate

- Designing or reviewing a RAG pipeline (ingestion, retrieval, or generation)
- Choosing chunking strategies for documents, code, or markdown
- Integrating vector databases (pgvector, Pinecone, Chroma)
- Implementing hybrid search or re-ranking
- Diagnosing hallucination, low recall, or poor answer quality
- Setting up evaluation with RAGAS or golden Q&A datasets

## Core Principles

1. **Retrieval quality bounds generation quality** — no prompt engineering fixes bad retrieval
2. **Chunk for coherence** — chunks must be self-contained enough to answer questions
3. **Hybrid search by default** — combine BM25 keyword matching with vector similarity
4. **Re-rank before generation** — cross-encoder or API re-ranker dramatically improves precision
5. **Measure with retrieval metrics** — track faithfulness, context recall, answer relevance
6. **Namespace for multi-tenancy** — isolate tenant data at the vector store level from day one

## 1. RAG Architecture Overview

A RAG system has two pipelines sharing a vector store.

**Ingestion pipeline** (offline): Documents are loaded, chunked, embedded, and stored in a vector database with metadata. Runs on document add/update.

**Query pipeline** (online): User query is embedded, top-k chunks retrieved, optionally re-ranked to top-n, then passed as context to the LLM for grounded generation. The answer is checked for faithfulness.

Key connections: chunk size affects both indexing cost and retrieval quality; the embedding model must be identical at ingestion and query time; metadata from ingestion enables filtered retrieval.

## 2. Chunking Strategies

### Fixed-Size with Overlap

```python
def fixed_size_chunks(text: str, size: int = 512, overlap: int = 64) -> list[str]:
    chunks, start = [], 0
    while start < len(text):
        chunks.append(text[start : start + size])
        start += size - overlap
    return chunks
```

### Recursive Text Splitter

```python
from langchain_text_splitters import RecursiveCharacterTextSplitter

splitter = RecursiveCharacterTextSplitter(
    chunk_size=1000, chunk_overlap=200,
    separators=["\n\n", "\n", ". ", " ", ""],
)
chunks = splitter.split_text(document_text)
```

### Semantic Chunking

```python
from langchain_experimental.text_splitter import SemanticChunker
from langchain_openai import OpenAIEmbeddings

chunker = SemanticChunker(
    OpenAIEmbeddings(model="text-embedding-3-small"),
    breakpoint_threshold_type="percentile",
    breakpoint_threshold_amount=75,
)
semantic_chunks = chunker.split_text(long_document)
```

### Markdown Header Split

```python
from langchain_text_splitters import MarkdownHeaderTextSplitter

md_splitter = MarkdownHeaderTextSplitter(
    headers_to_split_on=[("#", "h1"), ("##", "h2"), ("###", "h3")]
)
chunks = md_splitter.split_text(markdown_text)
# Each chunk carries metadata: {"h1": "Setup", "h2": "Installation"}
```

| Strategy | Best For | Quality | Complexity |
|----------|----------|---------|------------|
| Fixed-size | Uniform text, prototypes | Low | Minimal |
| Recursive | General docs, mixed format | Medium | Low |
| Semantic | Long-form, topic detection | High | Medium |
| Markdown | Docs, READMEs, wikis | High | Low |

## 3. Embedding Pipelines

### OpenAI text-embedding-3 (Python)

```python
from openai import OpenAI

client = OpenAI()

def embed_texts(texts: list[str], model: str = "text-embedding-3-small") -> list[list[float]]:
    response = client.embeddings.create(input=texts, model=model)
    return [item.embedding for item in response.data]
# text-embedding-3-small: 1536 dims, $0.02/1M tokens — best cost/perf
# text-embedding-3-large: 3072 dims, $0.13/1M tokens — higher accuracy
```

### Batch Embedding with Retry

```python
import time
from openai import RateLimitError

def batch_embed(texts: list[str], batch_size: int = 256, model: str = "text-embedding-3-small") -> list[list[float]]:
    all_embeddings: list[list[float]] = []
    for i in range(0, len(texts), batch_size):
        batch = texts[i : i + batch_size]
        for attempt in range(3):
            try:
                all_embeddings.extend(embed_texts(batch, model=model))
                break
            except RateLimitError:
                time.sleep(2**attempt)
        else:
            raise RuntimeError(f"Failed after 3 retries at batch {i}")
    return all_embeddings
```

### Embedding Cache (TypeScript)

```typescript
import { createHash } from "crypto";
import OpenAI from "openai";

const openai = new OpenAI();
const cache = new Map<string, number[]>();

function contentHash(text: string): string {
  return createHash("sha256").update(text).digest("hex");
}

async function embedWithCache(texts: string[], model = "text-embedding-3-small"): Promise<number[][]> {
  const results: number[][] = new Array(texts.length);
  const uncached: { index: number; text: string }[] = [];

  for (let i = 0; i < texts.length; i++) {
    const hash = contentHash(texts[i]);
    const hit = cache.get(hash);
    if (hit) { results[i] = hit; } else { uncached.push({ index: i, text: texts[i] }); }
  }
  if (uncached.length > 0) {
    const resp = await openai.embeddings.create({ input: uncached.map((u) => u.text), model });
    for (let j = 0; j < uncached.length; j++) {
      const emb = resp.data[j].embedding;
      cache.set(contentHash(uncached[j].text), emb);
      results[uncached[j].index] = emb;
    }
  }
  return results;
}
```

## 4. Vector Database Patterns

### pgvector (TypeScript)

```typescript
import pg from "pg";
const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });

// Schema:
// CREATE EXTENSION IF NOT EXISTS vector;
// CREATE TABLE documents (
//   id SERIAL PRIMARY KEY, tenant_id TEXT NOT NULL,
//   content TEXT NOT NULL, metadata JSONB DEFAULT '{}',
//   embedding vector(1536)
// );
// CREATE INDEX ON documents USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);

async function upsertDocument(
  tenantId: string, content: string, embedding: number[], metadata: Record<string, unknown>
): Promise<number> {
  const { rows } = await pool.query(
    `INSERT INTO documents (tenant_id, content, embedding, metadata)
     VALUES ($1, $2, $3::vector, $4) RETURNING id`,
    [tenantId, content, JSON.stringify(embedding), metadata]
  );
  return rows[0].id;
}

async function searchSimilar(
  tenantId: string, queryEmbedding: number[], topK = 10
): Promise<{ id: number; content: string; score: number }[]> {
  const { rows } = await pool.query(
    `SELECT id, content, 1 - (embedding <=> $1::vector) AS score
     FROM documents WHERE tenant_id = $2
     ORDER BY embedding <=> $1::vector LIMIT $3`,
    [JSON.stringify(queryEmbedding), tenantId, topK]
  );
  return rows;
}
```

### Pinecone (Python)

```python
from pinecone import Pinecone

pc = Pinecone(api_key=os.environ["PINECONE_API_KEY"])
index = pc.Index("rag-index")

def upsert_chunks(chunks: list[dict], embeddings: list[list[float]], namespace: str) -> None:
    vectors = [
        {"id": c["id"], "values": emb, "metadata": {"text": c["text"], "source": c["source"]}}
        for c, emb in zip(chunks, embeddings)
    ]
    for i in range(0, len(vectors), 100):
        index.upsert(vectors=vectors[i : i + 100], namespace=namespace)

def query_namespace(query_emb: list[float], namespace: str, top_k: int = 10, filter_dict: dict | None = None) -> list[dict]:
    results = index.query(
        vector=query_emb, top_k=top_k, namespace=namespace,
        filter=filter_dict, include_metadata=True,
    )
    return [{"id": m.id, "score": m.score, "text": m.metadata.get("text", "")} for m in results.matches]
```

### Chroma (Local Dev)

```python
import chromadb

client = chromadb.PersistentClient(path="./chroma_data")
collection = client.get_or_create_collection("documents", metadata={"hnsw:space": "cosine"})

collection.add(
    ids=["doc1", "doc2"],
    documents=["First document text.", "Second document text."],
    metadatas=[{"source": "a.pdf"}, {"source": "b.pdf"}],
)
results = collection.query(query_texts=["setup process?"], n_results=5, where={"source": "a.pdf"})
```

### Multi-Tenant Namespace Strategy

| Vector DB | Isolation | Pros | Cons |
|-----------|-----------|------|------|
| pgvector | `WHERE tenant_id = $1` | Uses existing DB | Scans all tenants |
| Pinecone | `namespace` param | True isolation | One index per project |
| Chroma | Separate collection | Easy local dev | No built-in auth |

## 5. Hybrid Search

### BM25 + Vector Fusion

```python
from rank_bm25 import BM25Okapi
import numpy as np

class HybridSearcher:
    def __init__(self, corpus: list[str], embeddings: list[list[float]]):
        self.bm25 = BM25Okapi([doc.lower().split() for doc in corpus])
        self.corpus = corpus
        self.embeddings = np.array(embeddings)

    def search(self, query: str, query_embedding: list[float], top_k: int = 10, alpha: float = 0.5) -> list[dict]:
        """alpha=1 pure vector, alpha=0 pure BM25."""
        bm25_scores = self.bm25.get_scores(query.lower().split())
        bm25_norm = bm25_scores / (bm25_scores.max() + 1e-8)

        qvec = np.array(query_embedding)
        cos_scores = self.embeddings @ qvec / (
            np.linalg.norm(self.embeddings, axis=1) * np.linalg.norm(qvec) + 1e-8
        )
        cos_norm = (cos_scores - cos_scores.min()) / (cos_scores.max() - cos_scores.min() + 1e-8)

        combined = alpha * cos_norm + (1 - alpha) * bm25_norm
        top_idx = combined.argsort()[::-1][:top_k]
        return [{"index": int(i), "text": self.corpus[i], "score": float(combined[i])} for i in top_idx]
```

### Reciprocal Rank Fusion (RRF)

```python
def reciprocal_rank_fusion(ranked_lists: list[list[str]], k: int = 60) -> list[tuple[str, float]]:
    """Fuse ranked lists using RRF. k=60 per original paper."""
    scores: dict[str, float] = {}
    for ranked in ranked_lists:
        for rank, doc_id in enumerate(ranked, start=1):
            scores[doc_id] = scores.get(doc_id, 0.0) + 1.0 / (k + rank)
    return sorted(scores.items(), key=lambda x: x[1], reverse=True)

# Combine BM25 + vector rankings
bm25_ranking = ["doc3", "doc1", "doc7", "doc2"]
vector_ranking = ["doc1", "doc3", "doc5", "doc2"]
fused = reciprocal_rank_fusion([bm25_ranking, vector_ranking])
```

## 6. Re-ranking

### Cross-Encoder (Python)

```python
from sentence_transformers import CrossEncoder

reranker = CrossEncoder("cross-encoder/ms-marco-MiniLM-L-6-v2")

def rerank(query: str, documents: list[str], top_n: int = 5) -> list[dict]:
    """Re-rank with cross-encoder. Input top-k, output top-n."""
    scores = reranker.predict([[query, doc] for doc in documents])
    ranked = sorted(
        [{"text": doc, "score": float(s)} for doc, s in zip(documents, scores)],
        key=lambda x: x["score"], reverse=True,
    )
    return ranked[:top_n]
```

### Cohere Re-rank API

```python
import cohere

co = cohere.Client(os.environ["COHERE_API_KEY"])

def cohere_rerank(query: str, documents: list[str], top_n: int = 5) -> list[dict]:
    response = co.rerank(query=query, documents=documents, top_n=top_n, model="rerank-v3.5")
    return [
        {"index": r.index, "text": documents[r.index], "relevance_score": r.relevance_score}
        for r in response.results
    ]
```

### Top-k to Top-n Pipeline

```python
async def retrieve_and_rerank(
    query: str, query_embedding: list[float], searcher: HybridSearcher, top_k: int = 50, top_n: int = 5,
) -> list[dict]:
    """Broad recall (top-k=50) then precise re-ranking (top-n=5)."""
    candidates = searcher.search(query, query_embedding, top_k=top_k)
    return rerank(query, [c["text"] for c in candidates], top_n=top_n)
```

## 7. Hallucination Mitigation

### Grounded Generation Prompt

```python
GROUNDED_SYSTEM = """Answer ONLY from the provided context.
Rules:
1. Use ONLY context information. Never add training data.
2. If context is insufficient, say "I don't have enough information to answer this."
3. Quote relevant passages to support your answer.
4. State what is partially answerable and what is missing."""

def build_grounded_prompt(query: str, chunks: list[str]) -> list[dict]:
    ctx = "\n\n".join(f"[{i+1}] {c}" for i, c in enumerate(chunks))
    return [
        {"role": "system", "content": GROUNDED_SYSTEM},
        {"role": "user", "content": f"Context:\n{ctx}\n\nQuestion: {query}"},
    ]
```

### Faithfulness Check (TypeScript)

```typescript
import Anthropic from "@anthropic-ai/sdk";
const anthropic = new Anthropic();

interface FaithfulnessResult {
  faithful: boolean;
  unsupportedClaims: string[];
  confidence: number;
}

async function checkFaithfulness(answer: string, chunks: string[]): Promise<FaithfulnessResult> {
  const ctx = chunks.map((c, i) => `[${i + 1}] ${c}`).join("\n\n");
  const response = await anthropic.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 1024,
    messages: [{
      role: "user",
      content: `Given context and answer, identify claims NOT supported by context.

Context:\n${ctx}\n\nAnswer:\n${answer}

Respond in JSON: {"faithful": bool, "unsupported_claims": string[], "confidence": float 0-1}`,
    }],
  });
  const block = response.content.find((b) => b.type === "text");
  if (!block) throw new Error("Faithfulness check returned no text content");
  const cleaned = block.text.replace(/^```(?:json)?\n?|\n?```$/g, "").trim();
  return JSON.parse(cleaned) as FaithfulnessResult;
}
```

### Confidence Thresholding

```python
def should_answer(scores: list[float], min_top: float = 0.7, min_avg: float = 0.5) -> bool:
    """Reject answer when retrieval confidence is too low."""
    if not scores or max(scores) < min_top:
        return False
    top3 = sorted(scores, reverse=True)[:3]
    return sum(top3) / len(top3) >= min_avg
```

## 8. Evaluation

### RAGAS Metrics

```python
from ragas import evaluate
from ragas.metrics import faithfulness, answer_relevancy, context_precision, context_recall
from datasets import Dataset

eval_data = {
    "question": ["What is the return policy?", "How do I reset my password?"],
    "answer": ["Returns within 30 days.", "Click 'Forgot Password' on login."],
    "contexts": [
        ["Our return policy allows returns within 30 days of purchase."],
        ["To reset your password, click 'Forgot Password' on the login page."],
    ],
    "ground_truth": [
        "Items can be returned within 30 days for a full refund.",
        "Use the 'Forgot Password' link on the login page.",
    ],
}

results = evaluate(Dataset.from_dict(eval_data),
    metrics=[faithfulness, answer_relevancy, context_precision, context_recall])
# {'faithfulness': 0.95, 'answer_relevancy': 0.92, 'context_precision': 0.88, 'context_recall': 0.90}
```

### Golden Q&A Test Set

```python
from dataclasses import dataclass

@dataclass
class GoldenQA:
    question: str
    expected_answer: str
    required_sources: list[str]
    tags: list[str]

GOLDEN_SET = [
    GoldenQA("What is the SLA?", "4-hour response time.", ["enterprise-support.md"], ["support"]),
    GoldenQA("How to configure SSO?", "Admin > Settings > Auth.", ["admin-guide.md"], ["auth"]),
]

def run_golden_eval(rag_pipeline, golden_set: list[GoldenQA]) -> dict:
    results = {"total": len(golden_set), "passed": 0, "failed": []}
    for qa in golden_set:
        answer, sources = rag_pipeline(qa.question)
        source_hit = any(s in sources for s in qa.required_sources)
        relevant = qa.expected_answer.lower() in answer.lower() or source_hit
        if relevant and source_hit:
            results["passed"] += 1
        else:
            results["failed"].append({"question": qa.question, "got": answer, "sources": sources})
    results["pass_rate"] = results["passed"] / results["total"]
    return results
```

## 9. Checklist

- [ ] Chunking strategy chosen based on document type (not default 1000 chars)
- [ ] Chunk overlap 10-20% of chunk size to preserve boundary context
- [ ] Same embedding model at ingestion and query time
- [ ] Embedding dimensions match vector index configuration
- [ ] Batch embedding with rate-limit retries
- [ ] Embedding cache for re-indexing unchanged documents
- [ ] Multi-tenant namespace isolation configured
- [ ] Hybrid search enabled (BM25 + vector), not vector-only
- [ ] Re-ranker in pipeline (cross-encoder or Cohere), top-k=50 to top-n=5
- [ ] Grounded generation prompt prevents hallucination from training data
- [ ] Faithfulness check on generated answers
- [ ] Confidence threshold rejects low-quality retrieval
- [ ] RAGAS evaluation baseline established (faithfulness > 0.9 target)
- [ ] Golden Q&A set with 20+ pairs per domain
- [ ] Metadata filters tested (source, date, tenant)
- [ ] Index rebuild procedure documented
- [ ] Monitoring on retrieval latency p95 and embedding costs
