# RAG Layer 1 — Headless Document Retrieval API

A production-ready, open-source RAG (Retrieval-Augmented Generation) platform for ingesting documents and retrieving semantically similar chunks. Layer 1 focuses on **document ingestion, preprocessing, chunking, and vector indexing** — the foundational retrieval layer that integrates with Layer 2 (LLM service) and Layer 3 (chat applications).

## Features

- **Multi-tenant architecture** with per-project configuration
- **API key lifecycle management** for secure third-party access
- **Pluggable chunking strategies**: Naive (RecursiveCharacter), Q&A pairs, single-chunk
- **Batch embedding with pgvector** for efficient vector indexing
- **Flexible file type support**: PDF, DOCX, TXT
- **Async document processing** via Celery + Redis
- **PostgreSQL + pgvector** for scalable semantic search
- **Docker Compose** local-first development
- **Type-safe FastAPI** backend + Next.js dashboard

## Quick Start

### Prerequisites

- Docker & Docker Compose
- PostgreSQL 15+ with pgvector extension (or use Docker image)
- Redis 7+ (or use Docker image)
- Python 3.12+
- Node.js 18+

### Local Setup (Docker Compose)

```bash
# 1. Clone and enter the project
git clone <repo>
cd projects/rag-layer1-demo

# 2. Create .env from template
cp .env.example .env

# 3. Start all services
docker compose up --build

# 4. Initialize database (in another terminal)
cd apps/api
alembic upgrade head

# 5. Open dashboard
open http://localhost:3000
```

### Manual Setup

**Backend:**

```bash
cd apps/api
python -m venv venv
source venv/bin/activate  # or `venv\Scripts\activate` on Windows
pip install -r requirements.txt

# Start API
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

# In another terminal: run Celery worker
celery -A app.worker.celery_app worker -l info
```

**Frontend:**

```bash
cd apps/web
npm install
npm run dev
```

## Architecture

### Backend Stack

- **FastAPI**: Modern async web framework
- **SQLAlchemy 2.0 (sync)**: ORM for database
- **Alembic**: Database migrations
- **Celery + Redis**: Async task queue for document processing
- **pgvector**: PostgreSQL extension for vector embeddings
- **LangChain**: Document loaders and text splitters
- **Pydantic v2**: Schema validation

### Project Structure

```
apps/api/
├── app/
│   ├── main.py              # FastAPI app factory
│   ├── config.py            # Settings management
│   ├── database.py          # SQLAlchemy setup
│   ├── models.py            # Database models
│   ├── schemas.py           # Request/response schemas
│   ├── core/
│   │   ├── security.py      # JWT + password hashing
│   │   ├── deps.py          # Dependency injection
│   │   └── exceptions.py    # Custom exceptions
│   ├── services/            # Business logic (auth, projects, docs, retrieval)
│   ├── providers/           # Embedding + storage providers
│   ├── routers/             # API endpoints
│   ├── worker/
│   │   ├── celery_app.py
│   │   ├── tasks.py         # Celery task definitions
│   │   └── pipeline/        # Extraction → cleaning → chunking → indexing
│   ├── tests/               # Unit + integration tests
│   └── alembic/             # Migrations
└── requirements.txt

apps/web/
├── src/
│   ├── app/                 # Next.js App Router pages
│   ├── components/          # React components (optional)
│   ├── lib/                 # API client, utilities
│   └── types/               # TypeScript types
└── package.json
```

### Database Schema

**Users** — Email + password hash, tenant root
**Projects** — Owner, configuration (chunking strategy, chunk size, top-k), embedding model
**API Keys** — Project-scoped, hash stored (not plaintext)
**Documents** — Project-scoped, tracks ingestion status + chunk count
**DocumentChunks** — Per-document chunks with embeddings (Vector(768))

Indexes:
- IVFFlat on `document_chunks.embedding` for approximate nearest neighbor search
- B-tree indices on foreign keys and frequently queried fields (project_id, status)

## API Endpoints

### Authentication

- `POST /api/v1/auth/register` — Create account
- `POST /api/v1/auth/login` — Get JWT token
- `GET /api/v1/auth/me` — Current user
- `POST /api/v1/auth/validate-key` — Validate project API key (for Layer 2)

### Projects (CRUD)

- `POST /api/v1/projects` — Create project
- `GET /api/v1/projects` — List user's projects
- `GET /api/v1/projects/{id}` — Get project details
- `PUT /api/v1/projects/{id}` — Update configuration
- `DELETE /api/v1/projects/{id}` — Delete project + documents + chunks

### API Keys

- `POST /api/v1/projects/{project_id}/api-keys` — Generate key
- `GET /api/v1/projects/{project_id}/api-keys` — List keys
- `POST /api/v1/projects/{project_id}/api-keys/{key_id}/revoke` — Revoke key

### Documents

- `POST /api/v1/projects/{project_id}/documents` — Upload file (triggers async processing)
- `GET /api/v1/projects/{project_id}/documents` — List documents
- `GET /api/v1/projects/{project_id}/documents/{id}` — Document status
- `DELETE /api/v1/projects/{project_id}/documents/{id}` — Delete document

### Retrieval (Layer 2 Interface)

- `POST /api/v1/retrieve` — **Semantic search** (auth: project API key)
  ```json
  {
    "question": "How does RAG work?",
    "top_k": 5  // optional, uses project default
  }
  ```
  Returns: Top-k chunks with cosine similarity scores

## Configuration

### Environment Variables

Copy `.env.example` to `.env` and configure:

```bash
# Database
DATABASE_URL=postgresql://rag:ragpassword@localhost:5432/rag_layer1

# Cache + Queue
REDIS_URL=redis://localhost:6379/0

# Auth
SECRET_KEY=your-secret-key-change-in-production
ACCESS_TOKEN_EXPIRE_MINUTES=60
ALLOWED_ORIGINS=http://localhost:3000

# Embeddings
EMBEDDING_PROVIDER=mock  # or "gemini"
EMBEDDING_DIMENSIONS=768
EMBEDDING_BATCH_SIZE=256
GOOGLE_API_KEY=...  # if using Gemini

# Storage
UPLOAD_DIR=./uploads
MAX_FILE_SIZE_MB=25
MAX_FILES_PER_PROJECT=50

# Dev/Prod
ENVIRONMENT=dev
```

## Chunking Strategies

1. **Naive**: `RecursiveCharacterTextSplitter` (chunk_size, chunk_overlap configurable)
2. **QA**: Extract Q/A pairs from document; fallback to naive without pattern match
3. **One**: Combine all pages into single chunk (for short documents)

## Ingestion Pipeline

```
Upload → FileStore → Extract (LangChain loaders)
  ↓
Clean (normalize whitespace) → Chunk (strategy-specific)
  ↓
Embed (batch via provider) → Index (pgvector)
  ↓
Document marked as `indexed`
```

All steps async via Celery; status tracked in `Document.status`.

## Testing

```bash
cd apps/api

# Unit tests (chunkers, security, etc.)
pytest tests/

# With coverage
pytest --cov=app tests/

# Specific test file
pytest tests/test_auth.py -v
```

**Note:** Tests use `DATABASE_URL_TEST` env var (default: test DB). Configure in `.env` for local testing.

## Security

- ✅ Password hashing (Argon2 via passlib)
- ✅ JWT tokens with configurable expiry
- ✅ API key hash-only storage (not plaintext)
- ✅ Project isolation (all queries filtered by owner/project)
- ✅ Input validation (Pydantic schemas)
- ✅ MIME type whitelist (PDF, DOCX, TXT)
- ✅ File size limits per config
- ❌ SQL injection — Not possible (SQLAlchemy parameterized queries)
- ⚠️ CORS — Open to all in dev; tighten in production

**Before production:**
- Set `SECRET_KEY` to a strong random value
- Set `CORS` to specific origins
- Use HTTPS only
- Enable rate limiting on endpoints
- Rotate API keys regularly

## Production Deployment

### Railway + Vercel Example

**Backend (Railway):**

```bash
# Create PostgreSQL database on Railway
# Deploy FastAPI app:
# - Set DATABASE_URL to Railway PostgreSQL
# - Set REDIS_URL to Railway Redis
# - Set all env vars
# - Run migrations: `alembic upgrade head`
```

**Frontend (Vercel):**

```bash
# Deploy Next.js app
# Set NEXT_PUBLIC_API_URL to Railway backend URL
# Done — auto-deploys on git push
```

## Performance Considerations

- **Batch Embedding**: Embeddings done in batches of `EMBEDDING_BATCH_SIZE` (default 256) for efficiency
- **Vector Index**: IVFFlat index with 100 lists for 1M+ documents; tune `lists` parameter based on dataset size
- **Connection Pooling**: SQLAlchemy `pool_size=10, max_overflow=20`
- **Worker Concurrency**: Start multiple Celery workers for scalability

## Troubleshooting

### "pgvector extension not found"

```sql
-- Connect to database as superuser and run:
CREATE EXTENSION IF NOT EXISTS vector;
```

### Celery tasks not processing

1. Ensure Redis is running: `redis-cli ping`
2. Check worker logs: `celery -A app.worker.celery_app worker -l debug`
3. Verify `DATABASE_URL` and `REDIS_URL` in `.env`

### Embeddings too slow

- Increase `EMBEDDING_BATCH_SIZE` (default 256)
- Use GPU-enabled Gemini if available
- Consider batch retrieval for multiple queries

## Future Roadmap

- [ ] URL ingestion support (fetch + extract)
- [ ] Web scraping ingestion
- [ ] Streaming document uploads
- [ ] Fine-tuning embeddings per project
- [ ] Reranking models (cross-encoder)
- [ ] Multi-language support
- [ ] Export to external vector DBs (Pinecone, Weaviate)
- [ ] Admin dashboard metrics
- [ ] Webhook notifications on document status

## Contributing

1. Fork the repo
2. Create a feature branch (`git checkout -b feature/amazing-thing`)
3. Write tests first (TDD)
4. Commit with conventional commits (`feat:`, `fix:`, `docs:`, etc.)
5. Open a PR

## License

MIT License — see LICENSE file for details.

## Support

- 📧 Email: support@raglayer1.example
- 💬 Discussions: GitHub Discussions
- 🐛 Issues: GitHub Issues

---

**Built with ❤️ using FastAPI, Next.js, and PostgreSQL**
