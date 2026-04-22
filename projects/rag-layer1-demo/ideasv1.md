# RAG Layer 1 Demo OSS - Ideas V1

## Goal

Build an open-source, local-first Layer 1 RAG platform for learning and demos.

The platform should let a user:

1. Register and log in.
2. Create multiple projects.
3. Generate one active API key per project.
4. Upload documents.
5. Process those documents into chunks and embeddings.
6. Store vectors in pgvector under project isolation.
7. Expose a key-validation endpoint for a downstream Layer 2 query service.

## Product Positioning

This is not the full enterprise version.

This V1 is:

1. Open source.
2. Demo friendly.
3. Local first.
4. Cheap to run.
5. Structured so providers can be swapped later.

This V1 is not:

1. OCR heavy.
2. Audio/video ingestion heavy.
3. Billing enabled.
4. Enterprise multi-cloud.
5. Unlimited-scale ingestion.

## Locked Scope

### Included

1. JWT auth.
2. Multi-project support.
3. Project config:
   - `chunking_strategy` (`naive` | `qa` | `one`)
   - `chunk_size` (default: 512 tokens)
   - `chunk_overlap` (default: 64 tokens)
   - `embedding_model`
   - `top_k`
4. One active API key per project.
5. API key revoke and regenerate.
6. Document upload for:
   - PDF
   - DOCX
   - TXT
7. Async ingestion pipeline:
   - upload
   - extract
   - clean
   - chunk
   - embed
   - index
8. Document states:
   - `pending`
   - `processing`
   - `indexed`
   - `failed`
9. Layer 2 key validation endpoint returning:
   - `project_id`
   - `config`
   - `namespace`

### Excluded

1. OCR.
2. Audio/video transcription.
3. Malware scanning.
4. Billing.
5. Advanced quotas.
6. Enterprise observability.
7. Provider switching UI.

## Tech Stack

### Backend

1. FastAPI
2. SQLAlchemy
3. Alembic
4. Pydantic
5. Celery
6. Redis
7. PostgreSQL
8. pgvector

### Frontend

1. Next.js
2. React
3. Tailwind CSS

### Storage and Providers

1. Local filesystem storage in dev mode.
2. S3-compatible adapter for cloud mode.
3. Gemini Embedding 2 adapter.

## Local-First OSS Mode

The project must work locally without paid infrastructure.

### Local development defaults

1. PostgreSQL with pgvector via Docker Compose.
2. Redis via Docker Compose.
3. Local file storage for uploaded files.
4. Mock embedding mode for contributors.
5. Optional Gemini mode when a real API key is available.

### Cloud mode later

1. Railway for API and worker.
2. Vercel for frontend.
3. Supabase PostgreSQL if needed.
4. Upstash Redis if needed.
5. AWS S3 if needed.

## Multi-Tenancy Model

1. A user can own many projects.
2. Each project has its own config.
3. Each project has one active API key at a time.
4. Each project is its own namespace boundary.
5. All retrieval and indexing operations must be scoped by `project_id`.

## Project Lifecycle and API Key Rules

API key creation must stay separate from document ingestion.

### Project lifecycle

1. User creates an account.
2. User creates a project.
3. Project is created with default config even if it has no documents.
4. User may upload documents before generating an API key.
5. User may generate an API key before uploading documents.
6. Project becomes retrieval-ready when:
   - at least one active API key exists
   - at least one document is successfully indexed

### API key rules

1. API keys belong to the project lifecycle, not the upload lifecycle.
2. Uploading a file must not automatically generate an API key.
3. Creating a project should not require document upload.
4. API key generation should be an explicit user action in V1.
5. Regenerating a key revokes the previous active key.

### Demo UX rule

On the project page, show these sections independently:

1. Project details and config.
2. API key state:
   - no active key
   - generate key
   - revoke key
3. Document state:
   - no documents uploaded
   - upload document
   - indexing progress

## API Key Format

Format:

`rag_<env>_<projectId>_<random64hex>`

Rules:

1. Store only the hash.
2. Show plaintext exactly once.
3. Scope the key to a single project.
4. Revoke old key on regeneration.

## Ingestion Pipeline

### Flow

1. User uploads a file.
2. Backend creates a document row with `pending` status.
3. Backend stores the file in local storage or S3-compatible storage.
4. Backend enqueues an ingestion job.
5. Worker extracts text based on file type.
6. Worker cleans the text.
7. Worker chunks the text.
8. Worker embeds the chunks.
9. Worker stores embeddings in pgvector.
10. Worker marks the document `indexed` or `failed`.

### File types

1. PDF
2. DOCX
3. TXT

## Retrieval Quality Technique

The V1 retrieval strategy should stay simple, reliable, and explainable.

### V1 retrieval technique

1. Clean extracted text before indexing.
2. Use semantic-aware chunking with overlap.
3. Attach retrieval-useful metadata to every chunk.
4. Generate dense embeddings with a single consistent embedding model.
5. Search with pgvector inside a strict `project_id` boundary.
6. Return the top `k` chunks using the project config.
7. Pass retrieved chunks to Layer 2 for answer generation.

### What improves retrieval quality in V1

#### 1. Text cleaning

1. Remove repeated headers and footers.
2. Remove boilerplate where possible.
3. Normalize whitespace and noisy formatting.

#### 2. Chunking strategy

Inspired by RAGFlow's template-based chunking model (Apache-2.0). Three strategies supported in V1, configured per project:

| Strategy | Description | Best for |
|---|---|---|
| `naive` | Fixed-size sliding window with overlap | General documents, default |
| `qa` | Splits on Q&A pairs (Q: / A: patterns) | FAQ docs, support knowledge bases |
| `one` | Entire document as a single chunk | Very short docs, metadata-only use |

Rules:
1. Strategy is set on the project, not per-document.
2. Default strategy is `naive` with `chunk_size: 512` and `chunk_overlap: 64`.
3. `chunk_size` and `chunk_overlap` apply only when strategy is `naive`.
4. Prefer semantic boundaries (headings, paragraphs) within `naive` splits where detectable.
5. Use overlap to reduce context loss between chunks.
6. Avoid arbitrarily splitting mid-sentence where possible.

#### 3. Metadata tagging

1. `project_id`
2. `document_id`
3. source file name or URL
4. page number if present
5. section heading if present
6. chunk index

#### 4. Tenant isolation

1. Retrieval must always be filtered by `project_id`.
2. Retrieved chunks from different projects must never be mixed.

### Deliberately excluded from V1

These techniques are useful, but they are not part of the first implementation pass.

1. Hybrid search with BM25 plus dense retrieval.
2. Cross-encoder reranking.
3. Query rewriting.
4. Multi-hop retrieval.
5. Parent-child retrieval.
6. Graph retrieval.
7. Agentic retrieval loops.

### Planned retrieval upgrades after V1

The recommended upgrade order is:

1. Better metadata filtering.
2. Hybrid retrieval.
3. Reranking on the top retrieved candidates.
4. Query rewriting or expansion.
5. Parent-document reconstruction.

## Retrieval Evaluation Technique

V1 should also include a simple evaluation plan for retrieval quality.

### Evaluation method

1. Create a small golden dataset of representative questions.
2. Track whether the correct chunk or document appears in top `k`.
3. Review answer grounding against retrieved context.
4. Keep regression examples for each ingestion type.

### Initial evaluation metrics

1. Top-`k` chunk hit rate.
2. Top-`k` document hit rate.
3. Retrieval latency.
4. Grounded-answer pass rate in manual review.

### Evaluation rule

Any retrieval change to chunking, metadata, embeddings, or indexing should be checked against the golden dataset before adopting it.

## Retrieval Contract for Layer 2

Layer 2 sends:

`Authorization: Bearer <api_key>`

Layer 1 responds with:

1. `project_id`
2. `config`
3. `namespace`
4. `is_active`

Layer 2 must then retrieve only within that project namespace.

## Layer 1 and Layer 2 Architecture

Layer 2 should be built once as a reusable service.

It must not be rebuilt for each project.

### Recommended split

#### Layer 1 responsibilities

1. User auth and project management.
2. API key lifecycle.
3. Document ingestion and indexing.
4. Project config storage.
5. Tenant isolation.
6. Retrieval APIs over project-scoped vectors.

#### Layer 2 responsibilities

1. Accept user question.
2. Forward project API key to Layer 1.
3. Ask Layer 1 for project validation and retrieval context.
4. Build the LLM prompt from retrieved context.
5. Return the answer.

### Recommended query flow

1. End user sends a query to Layer 2 with a project API key.
2. Layer 2 calls Layer 1 `validate-key`.
3. Layer 1 returns:
   - `project_id`
   - `namespace`
   - `config`
   - `is_active`
4. Layer 2 calls Layer 1 retrieval endpoint.
5. Layer 1 returns top matching chunks for that project only.
6. Layer 2 sends the retrieved context to the answer-generation model.
7. Layer 2 returns the final answer.

### Contract design rule

Layer 2 must stay generic and config-driven.

That means:

1. The same Layer 2 instance can serve many projects.
2. Project behavior is determined by the API key and Layer 1 response.
3. Changing projects must not require rebuilding Layer 2.

### Why this split is preferred

1. Better tenant isolation.
2. Layer 2 stays thin and reusable.
3. Layer 1 can change vector storage later without breaking Layer 2.
4. Client-specific retrieval behavior can stay in Layer 1 policies and config.

## Main Entities

1. `users`
2. `projects`
3. `project_configs`
4. `api_keys`
5. `documents`
6. `document_chunks`
7. `chunk_embeddings`
8. `usage_events`
9. `audit_logs`

## Main Endpoints

1. `POST /auth/register`
2. `POST /auth/login`
3. `POST /projects`
4. `GET /projects`
5. `GET /projects/{project_id}`
6. `PUT /projects/{project_id}`
7. `POST /projects/{project_id}/api-keys`
8. `GET /projects/{project_id}/api-keys`
9. `POST /projects/{project_id}/api-keys/{key_id}/revoke`
10. `POST /projects/{project_id}/documents/upload`
11. `GET /projects/{project_id}/documents`
12. `GET /projects/{project_id}/documents/{document_id}`
13. `POST /auth/validate-key`
14. `POST /retrieve`

## Suggested Project Structure

```text
projects/
  rag-layer1-demo/
    ideasv1.md
```

Future implementation repo shape:

```text
apps/
  api/
  web/
  worker/
docs/
docker/
```

## Demo Constraints

1. Max file size: 25 MB.
2. Max files per project: 50.
3. Max total project storage: 500 MB.
4. No OCR.
5. No audio/video.
6. No bulk 10 GB to 100 GB ingestion in V1.

## Planning Gate Before Implementation

Implementation should not start until these planning decisions are locked.

### Must-lock decisions

1. Local-first mode is the default contributor path.
2. Direct file upload is the primary ingestion path.
3. URL ingestion is allowed only for public, fetchable documents in V1.
4. File ingestion and URL ingestion must both create the same `documents` lifecycle.
5. API key creation stays separate from ingestion.

### Go/No-Go rule

Proceed to implementation only after these are accepted:

1. Upload limits.
2. Supported URL types.
3. URL safety restrictions.
4. Storage mode in local dev.
5. Mock embedding mode behavior.

## Upload Limits for Demo V1

These limits are intentionally strict for learning, cost control, and easier OSS setup.

### File upload limits

1. Max single file size: 25 MB.
2. Max files per project: 50.
3. Max total storage per project: 500 MB.
4. Max upload requests per minute per user: 10.
5. Max concurrent processing jobs per project: 3.

### Supported uploaded file types

1. PDF
2. DOCX
3. TXT

### Rejected in V1

1. Images
2. Audio
3. Video
4. ZIP archives
5. Password-protected documents
6. Remote files larger than allowed limits

## URL Ingestion Plan for Demo V1

URL ingestion can be supported, but only in a constrained form.

### Included URL ingestion modes

1. Public HTML pages.
2. Public PDF URLs.
3. Public TXT URLs.
4. Public DOCX URLs.

### Excluded URL ingestion modes

1. Authenticated pages.
2. JavaScript-rendered websites that require a browser session.
3. Google Drive private links.
4. Dropbox private links.
5. YouTube or media URLs.
6. Sitemap-wide crawling.
7. Recursive website crawling.

### URL ingestion limits

1. Max URLs per request: 5.
2. Max total URLs per project: 100.
3. Max fetched asset size per URL: 10 MB.
4. Max HTML pages fetched from one domain in one run: 20.
5. Timeout per URL fetch: 15 seconds.

### URL ingestion safety rules

1. Only fetch `http` and `https` URLs.
2. Block localhost, private network ranges, and internal addresses.
3. Reject redirects to private or unsupported destinations.
4. Normalize and store the canonical URL.
5. Save fetch failure reasons on the document record.

### URL ingestion lifecycle

1. User submits URL.
2. Backend validates scheme and safety rules.
3. Backend creates document row with source type `url` and status `pending`.
4. Worker fetches the content.
5. Worker converts the remote content to raw text.
6. Worker runs cleaning, chunking, embedding, and indexing.
7. Worker marks the document `indexed` or `failed`.

### URL metadata to capture

1. Original URL.
2. Canonical URL.
3. Content type.
4. Domain.
5. Fetch timestamp.
6. HTTP status code.
7. Last modified header if present.

## Recommended V1 Product Decision

For the first implementation pass:

1. Build direct file upload first.
2. Keep URL ingestion as a planned V1.1 feature or a guarded endpoint.
3. Reuse the same extraction and indexing pipeline after the fetch step.

This keeps the initial implementation smaller while preserving a clean expansion path.

## Adapter Boundaries

These parts should be abstracted behind interfaces:

1. `EmbeddingProvider`
2. `VectorStore`
3. `ObjectStorage`
4. `Extractor`
5. `QueueBackend`

For V1, implement only one provider per abstraction.

## Build Order

1. Scaffold FastAPI app.
2. Add PostgreSQL and Alembic.
3. Add auth and JWT.
4. Add project CRUD.
5. Add API key lifecycle.
6. Add document upload and tracking.
7. Add Celery worker pipeline.
8. Add file extraction, chunking, and embedding.
9. Add pgvector indexing.
10. Add validate-key endpoint.
11. Add optional URL ingestion endpoint after file ingestion is stable.
12. Add Next.js dashboard.
13. Add Docker Compose local setup.

## Reference Implementations

### rag_api (danny-avila/rag_api) — MIT License

The closest public reference to this project. An ID-based RAG FastAPI using LangChain + pgvector for LibreChat integration. Studied for patterns; not forked.

**Adopted patterns:**
- `EMBEDDING_BATCH_SIZE` + `EMBEDDING_MAX_QUEUE_SIZE` approach for memory-bounded batch embedding in the Celery worker
- LangChain document loaders (`PyPDFLoader`, `UnstructuredWordDocumentLoader`, `TextLoader`) as the extraction layer — no custom parser needed
- `EMBEDDINGS_PROVIDER` enum pattern maps to our `EmbeddingProvider` abstraction interface

**What we add on top:**
- Full multi-tenancy via `project_id` namespace (rag_api has none)
- User auth: register / login / refresh JWT (rag_api only verifies JWTs issued elsewhere)
- Per-project API key lifecycle: generate / revoke / rotate
- Per-project config: `chunking_strategy`, `chunk_size`, `chunk_overlap`, `top_k`, `embedding_model`
- Document state machine: `pending → processing → indexed / failed`
- Celery + Redis async worker queue (rag_api processes synchronously in-request)
- Layer 2 key-validation endpoint returning project config + namespace

### RAGFlow (infiniflow/ragflow) — Apache-2.0 License

A full end-to-end RAG chat engine with agentic workflows. Not used as a base; too heavy for this scope.

**Adopted concept:**
- Template-based chunking strategies (`naive`, `qa`, `one`) per project config — the idea of strategy-per-project rather than global env vars

## Open Source Release Requirements

1. MIT license.
2. `README.md` with quickstart.
3. `.env.example`.
4. Docker Compose local startup.
5. Seed/demo data.
6. Contributing guide.
7. Security note that V1 is demo-focused, not enterprise hardened.

## Accounts Needed Later

Only for optional cloud mode:

1. GitHub
2. Railway
3. Vercel
4. AWS
5. Supabase
6. Redis provider
7. Gemini API access

## Immediate Next Step

Create a local-first implementation plan with:

1. Docker Compose services.
2. Backend folder structure.
3. Database schema.
4. Environment variable template.
5. Day 1 scaffolding tasks.