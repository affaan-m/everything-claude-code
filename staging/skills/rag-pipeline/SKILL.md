---
name: rag-pipeline
description: Build RAG pipelines with vector search, hybrid retrieval, and embeddings. Use when implementing document Q&A, semantic search, or knowledge-grounded LLM applications.
---

# RAG Pipeline

## Decision Tables

### Embedding Model Selection

| Model | Dims | Best For |
|-------|------|----------|
| **voyage-3-large** | 1024 | Claude apps (Anthropic recommended) |
| **voyage-code-3** | 1024 | Code search |
| **voyage-finance-2** | 1024 | Financial documents |
| **voyage-law-2** | 1024 | Legal documents |
| **text-embedding-3-large** | 3072 | OpenAI apps, high accuracy |
| **text-embedding-3-small** | 1536 | OpenAI apps, cost-effective |
| **bge-large-en-v1.5** | 1024 | Open source, local deployment |
| **multilingual-e5-large** | 1024 | Multi-language support |

### Chunking Strategy Selection

| Strategy | Chunk Size | Best For |
|----------|-----------|----------|
| **Recursive character** | 500-1000 chars | General prose, default choice |
| **Token-based** | 256-512 tokens | Token-limit-sensitive pipelines |
| **Semantic (header-based)** | Variable | Markdown/structured docs |
| **Sentence-based** | 500-1000 chars | Clean narrative text |
| **Tree-sitter (code)** | Per function/class | Code repositories |
| **Parent document** | Small=400, Parent=2000 | Need precise retrieval + full context |

### Retrieval Strategy Selection

| Strategy | When to Use | Tradeoff |
|----------|------------|----------|
| **Dense only** | Semantic queries, clean data | Misses exact keyword matches |
| **Sparse only (BM25)** | Exact terms, names, codes | No semantic understanding |
| **Hybrid (RRF)** | Production default | Slightly more latency |
| **HyDE** | Vague/abstract queries | Extra LLM call per query |
| **Multi-query** | Ambiguous queries | 3-5x retrieval cost |
| **Parent document** | Need surrounding context | More storage, complex setup |

### Reranking Selection

| Method | Latency | Quality | Cost |
|--------|---------|---------|------|
| **None** | Fastest | Baseline | Free |
| **MMR** | Low | +diversity | Free |
| **Cross-encoder** (ms-marco-MiniLM) | Medium | High | Free (local) |
| **Cohere Rerank** | Medium | Highest | API cost |
| **LLM-as-judge** | High | Variable | LLM cost |

### Vector Store Selection

| Store | Best For | Key Feature |
|-------|----------|-------------|
| **pgvector** | Existing Postgres stack | SQL + hybrid search |
| **Pinecone** | Managed, serverless | Zero ops |
| **Qdrant** | Self-hosted, filtering | Rust performance |
| **Chroma** | Local dev/prototyping | Simple setup |
| **Weaviate** | GraphQL, hybrid built-in | Multi-modal |

## Complete RAG Pipeline (LangGraph)

```python
from langgraph.graph import StateGraph, START, END
from langchain_anthropic import ChatAnthropic
from langchain_voyageai import VoyageAIEmbeddings
from langchain_postgres.vectorstores import PGVector
from langchain_core.documents import Document
from langchain_core.prompts import ChatPromptTemplate
from langchain_text_splitters import RecursiveCharacterTextSplitter
from typing import TypedDict

llm = ChatAnthropic(model="claude-sonnet-4-6")
embeddings = VoyageAIEmbeddings(model="voyage-3-large")
vectorstore = PGVector(
    embeddings=embeddings, collection_name="docs",
    connection="postgresql+psycopg://user:pass@localhost:5432/vectordb"
)
splitter = RecursiveCharacterTextSplitter(
    chunk_size=1000, chunk_overlap=200, separators=["\n\n", "\n", ". ", " ", ""]
)

async def index_documents(documents: list[Document]):
    chunks = splitter.split_documents(documents)
    await vectorstore.aadd_documents(chunks)

class RAGState(TypedDict):
    question: str
    context: list[Document]
    answer: str

rag_prompt = ChatPromptTemplate.from_template(
    """Answer based on context. Cite with [1], [2]. Say "I don't have enough information" if unsure.

Context:
{context}

Question: {question}

Answer (with citations):"""
)

async def retrieve(state: RAGState) -> RAGState:
    return {"context": await vectorstore.asimilarity_search(state["question"], k=4)}

async def generate(state: RAGState) -> RAGState:
    ctx = "\n\n".join(f"[{i+1}] {d.page_content}" for i, d in enumerate(state["context"]))
    resp = await llm.ainvoke(rag_prompt.format_messages(context=ctx, question=state["question"]))
    return {"answer": resp.content}

graph = StateGraph(RAGState)
graph.add_node("retrieve", retrieve)
graph.add_node("generate", generate)
graph.add_edge(START, "retrieve")
graph.add_edge("retrieve", "generate")
graph.add_edge("generate", END)
rag_chain = graph.compile()
```

## Hybrid Search with RRF

### Standalone RRF (No Framework Dependencies)

```python
from collections import defaultdict
from typing import List, Tuple

def reciprocal_rank_fusion(
    result_lists: List[List[Tuple[str, float]]],
    k: int = 60,
    weights: List[float] = None
) -> List[Tuple[str, float]]:
    """Combine multiple ranked lists using Reciprocal Rank Fusion.

    Args:
        result_lists: List of (doc_id, score) tuples per search method
        k: RRF constant (higher = more weight to lower ranks)
        weights: Optional weights per result list
    """
    weights = weights or [1.0] * len(result_lists)
    scores = defaultdict(float)

    for result_list, weight in zip(result_lists, weights):
        for rank, (doc_id, _) in enumerate(result_list):
            scores[doc_id] += weight * (1.0 / (k + rank + 1))

    return sorted(scores.items(), key=lambda x: x[1], reverse=True)
```

### LangChain Hybrid Retriever

```python
from langchain_community.retrievers import BM25Retriever
from langchain.retrievers import EnsembleRetriever

bm25_retriever = BM25Retriever.from_documents(documents)
bm25_retriever.k = 10
dense_retriever = vectorstore.as_retriever(search_kwargs={"k": 10})

# Combine: 30% keyword, 70% semantic
hybrid_retriever = EnsembleRetriever(
    retrievers=[bm25_retriever, dense_retriever],
    weights=[0.3, 0.7]
)
```

## PostgreSQL Hybrid Search (pgvector + FTS)

```python
import asyncpg
from typing import List, Dict, Optional

class PostgresHybridSearch:
    """pgvector cosine similarity + tsvector full-text, fused with RRF."""

    def __init__(self, pool: asyncpg.Pool):
        self.pool = pool
        from sentence_transformers import CrossEncoder
        self.reranker = CrossEncoder('cross-encoder/ms-marco-MiniLM-L-6-v2')

    async def setup_schema(self):
        async with self.pool.acquire() as conn:
            await conn.execute("""
                CREATE EXTENSION IF NOT EXISTS vector;
                CREATE TABLE IF NOT EXISTS documents (
                    id TEXT PRIMARY KEY, content TEXT NOT NULL,
                    embedding vector(1024), metadata JSONB DEFAULT '{}',
                    ts_content tsvector GENERATED ALWAYS AS (to_tsvector('english', content)) STORED
                );
                CREATE INDEX IF NOT EXISTS docs_emb_idx ON documents USING hnsw (embedding vector_cosine_ops);
                CREATE INDEX IF NOT EXISTS docs_fts_idx ON documents USING gin (ts_content);
            """)

    async def hybrid_search(
        self, query: str, query_embedding: List[float], limit: int = 10,
        vector_weight: float = 0.5, filter_metadata: Optional[Dict] = None
    ) -> List[Dict]:
        async with self.pool.acquire() as conn:
            where = "1=1"
            params = [query_embedding, query, limit * 3, vector_weight]
            if filter_metadata:
                for key, val in filter_metadata.items():
                    params.append(val)
                    # WARNING: key must be a trusted, application-controlled value — never user input
                    where += f" AND metadata->>'{key}' = ${len(params)}"
            results = await conn.fetch(f"""
                WITH vs AS (
                    SELECT id, content, metadata,
                        ROW_NUMBER() OVER (ORDER BY embedding <=> $1::vector) as v_rank
                    FROM documents WHERE {where}
                    ORDER BY embedding <=> $1::vector LIMIT $3
                ), ks AS (
                    SELECT id, content, metadata,
                        ROW_NUMBER() OVER (ORDER BY ts_rank(ts_content, websearch_to_tsquery('english', $2)) DESC) as k_rank
                    FROM documents
                    WHERE ts_content @@ websearch_to_tsquery('english', $2) AND {where}
                    LIMIT $3
                )
                SELECT COALESCE(v.id, k.id) id, COALESCE(v.content, k.content) content,
                    COALESCE(v.metadata, k.metadata) metadata,
                    COALESCE(1.0/(60+v.v_rank),0)*$4::float + COALESCE(1.0/(60+k.k_rank),0)*(1-$4::float) rrf_score
                FROM vs v FULL OUTER JOIN ks k ON v.id = k.id
                ORDER BY rrf_score DESC LIMIT $3/3
            """, *params)
            return [dict(r) for r in results]

    async def search_with_rerank(
        self, query: str, query_embedding: List[float], limit: int = 10, candidates: int = 50
    ) -> List[Dict]:
        cands = await self.hybrid_search(query, query_embedding, limit=candidates)
        if not cands:
            return []
        scores = self.reranker.predict([(query, c["content"]) for c in cands])
        for c, s in zip(cands, scores):
            c["rerank_score"] = float(s)
        return sorted(cands, key=lambda x: x["rerank_score"], reverse=True)[:limit]
```

## Retrieval Patterns

### Parent Document Retriever

```python
from langchain.retrievers import ParentDocumentRetriever
from langchain.storage import InMemoryStore
from langchain_text_splitters import RecursiveCharacterTextSplitter

# Small chunks for precise retrieval, large chunks for LLM context
child_splitter = RecursiveCharacterTextSplitter(chunk_size=400, chunk_overlap=50)
parent_splitter = RecursiveCharacterTextSplitter(chunk_size=2000, chunk_overlap=200)

parent_retriever = ParentDocumentRetriever(
    vectorstore=vectorstore,
    docstore=InMemoryStore(),
    child_splitter=child_splitter,
    parent_splitter=parent_splitter
)

await parent_retriever.aadd_documents(documents)
results = await parent_retriever.ainvoke("query")  # Returns full parent docs
```

### HyDE (Hypothetical Document Embeddings)

```python
# Add hypothetical doc generation before retrieval in the LangGraph pipeline
class HyDEState(TypedDict):
    question: str
    hypothetical_doc: str
    context: list[Document]
    answer: str

hyde_prompt = ChatPromptTemplate.from_template(
    "Write a detailed passage answering: {question}\n\nPassage:"
)
async def gen_hypothetical(state: HyDEState) -> HyDEState:
    resp = await llm.ainvoke(hyde_prompt.format_messages(question=state["question"]))
    return {"hypothetical_doc": resp.content}

async def retrieve_hyde(state: HyDEState) -> HyDEState:
    return {"context": await vectorstore.asimilarity_search(state["hypothetical_doc"], k=4)}

# Graph: START -> gen_hypothetical -> retrieve_hyde -> generate -> END
```

### MMR (Maximal Marginal Relevance)

```python
results = await vectorstore.amax_marginal_relevance_search(
    "query", k=5, fetch_k=20,
    lambda_mult=0.5  # 0=max diversity, 1=max relevance
)
```

## Code Embeddings with Tree-Sitter

```python
from langchain_voyageai import VoyageAIEmbeddings
from typing import List

class CodeEmbeddingPipeline:
    """Chunk code by AST nodes (functions/classes), embed with voyage-code-3."""

    def __init__(self):
        self.embeddings = VoyageAIEmbeddings(model="voyage-code-3")

    def chunk_code(self, code: str, language: str) -> List[dict]:
        try:
            import tree_sitter_languages
            tree = tree_sitter_languages.get_parser(language).parse(bytes(code, "utf8"))
            chunks = []
            self._walk(tree.root_node, code, chunks)
            return chunks or [{"text": code, "type": "module"}]
        except ImportError:
            return [{"text": code, "type": "module"}]

    def _walk(self, node, src: str, chunks: list):
        if node.type in ('function_definition', 'class_definition', 'method_definition'):
            name = next((c.text.decode('utf8') for c in node.children if c.type in ('identifier', 'name')), "unknown")
            chunks.append({"text": src[node.start_byte:node.end_byte], "type": node.type,
                           "name": name, "start_line": node.start_point[0], "end_line": node.end_point[0]})
        for child in node.children:
            self._walk(child, src, chunks)

    async def embed_with_context(self, chunk: str, context: str = "") -> List[float]:
        text = f"Context: {context}\n\nCode:\n{chunk}" if context else chunk
        return await self.embeddings.aembed_query(text)
```

## Domain Embedding Pipeline

```python
import re, tiktoken
from typing import List
from dataclasses import dataclass, field
from langchain_voyageai import VoyageAIEmbeddings

@dataclass
class EmbeddedChunk:
    id: str
    document_id: str
    chunk_index: int
    text: str
    embedding: List[float]
    metadata: dict = field(default_factory=dict)

class DomainEmbeddingPipeline:
    """Preprocess -> token-chunk -> embed for any domain. Swap model for domain-specific variants."""

    def __init__(self, model: str = "voyage-3-large", chunk_size: int = 512, overlap: int = 50):
        self.embeddings = VoyageAIEmbeddings(model=model)
        self.chunk_size, self.overlap = chunk_size, overlap
        self.enc = tiktoken.get_encoding("cl100k_base")

    def chunk(self, text: str) -> List[str]:
        text = re.sub(r'\s+', ' ', text).strip()
        tokens = self.enc.encode(text)
        chunks, start = [], 0
        while start < len(tokens):
            chunks.append(self.enc.decode(tokens[start:start + self.chunk_size]))
            start += self.chunk_size - self.overlap
        return chunks

    async def process(self, documents: List[dict], id_field="id", content_field="content") -> List[EmbeddedChunk]:
        results = []
        for doc in documents:
            chunks = self.chunk(doc[content_field])
            embs = await self.embeddings.aembed_documents(chunks)
            for i, (chunk, emb) in enumerate(zip(chunks, embs)):
                results.append(EmbeddedChunk(
                    id=f"{doc[id_field]}_chunk_{i}", document_id=doc[id_field],
                    chunk_index=i, text=chunk, embedding=emb,
                    metadata={"document_id": doc[id_field], "chunk_index": i}
                ))
        return results
```

## Evaluation

```python
import numpy as np
from typing import List, Dict

def evaluate_retrieval(relevant: List[List[str]], retrieved: List[List[str]], k: int = 10) -> Dict[str, float]:
    """Compute precision@k, recall@k, MRR, nDCG@k across a query set."""
    def p_at_k(r, ret): return len(set(ret[:k]) & r) / k if k else 0
    def r_at_k(r, ret): return len(set(ret[:k]) & r) / len(r) if r else 0
    def mrr(r, ret):
        for i, d in enumerate(ret):
            if d in r: return 1/(i+1)
        return 0
    def ndcg(r, ret):
        dcg = sum(1/np.log2(i+2) for i, d in enumerate(ret[:k]) if d in r)
        ideal = sum(1/np.log2(i+2) for i in range(min(len(r), k)))
        return dcg/ideal if ideal > 0 else 0

    m = {f"precision@{k}": [], f"recall@{k}": [], "mrr": [], f"ndcg@{k}": []}
    for rel, ret in zip(relevant, retrieved):
        s = set(rel)
        m[f"precision@{k}"].append(p_at_k(s, ret)); m[f"recall@{k}"].append(r_at_k(s, ret))
        m["mrr"].append(mrr(s, ret)); m[f"ndcg@{k}"].append(ndcg(s, ret))
    return {n: float(np.mean(v)) for n, v in m.items()}
```

## Quick Reference

**Chunk sizing**: 500-1000 tokens for prose, 10-20% overlap. Larger chunks = more context, smaller = more precision.

**Metadata**: Always include source, timestamp, category. Enables filtering at retrieval time.

**Common issues**:
- Poor retrieval: check embedding model match, chunk size, try hybrid search
- Irrelevant results: add metadata filtering, reranking, or MMR
- Missing info: verify indexing coverage, reduce chunk size
- Hallucinations: strengthen grounding prompt, add faithfulness check
- Slow queries: cache embeddings, reduce k, use HNSW indexes
