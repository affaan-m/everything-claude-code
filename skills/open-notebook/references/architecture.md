# Open Notebook Architecture

## System Overview

Open Notebook is built as a modern Python web application with a clear separation between frontend and backend, using Docker for deployment.

```
┌─────────────────────────────────────────────────────┐
│                   Docker Compose                    │
│                                                     │
│  ┌──────────────┐  ┌──────────────┐  ┌───────────┐  │
│  │   Next.js    │  │   FastAPI    │  │ SurrealDB │  │
│  │   Frontend   │──│   Backend    │──│           │  │
│  │  (port 8502) │  │  (port 5055) │  │ (port 8K) │  │
│  └──────────────┘  └──────────────┘  └───────────┘  │
│                          │                          │
│                    ┌─────┴─────┐                    │
│                    │ LangChain │                    │
│                    │ Esperanto │                    │
│                    └─────┬─────┘                    │
│                          │                          │
│              ┌───────────┼───────────┐              │
│              │           │           │              │
│          ┌───┴───┐   ┌───┴───┐   ┌───┴───┐          │
│          │OpenAI │   │Claude │   │Ollama │  ...     │
│          └───────┘   └───────┘   └───────┘          │
└─────────────────────────────────────────────────────┘
```

## Core Components

### FastAPI Backend

The REST API is built with FastAPI and organized into routers:

- **20 route modules** covering notebooks, sources, notes, chat, search, podcasts, transformations, models, credentials, embeddings, settings, and more
- Async/await throughout for non-blocking I/O
- Pydantic models for request/response validation
- Custom exception handlers mapping domain errors to HTTP status codes
- CORS middleware for cross-origin access
- Optional password authentication middleware

### SurrealDB

SurrealDB serves as the primary data store, providing both document and relational capabilities:

- **Document storage** for notebooks, sources, notes, transformations, and models
- **Relational references** for notebook-source associations
- **Full-text search** across indexed content
- **RocksDB** backend for persistent storage on disk
- Schema migrations run automatically on application startup

### LangChain Integration

AI features are powered by LangChain with the Esperanto multi-provider library:

- **LangGraph** manages conversational state for chat sessions
- **Embedding models** power vector search across content
- **LLM chains** drive transformations, note generation, and podcast scripting
- **Prompt templates** stored in the `prompts/` directory

### Esperanto Multi-Provider Library

Esperanto provides a unified interface to 16+ AI providers:

- Abstracts provider-specific API differences
- Supports LLM, embedding, speech-to-text, and text-to-speech capabilities
- Handles credential management and model discovery
- Enables runtime provider switching without code changes

### Next.js Frontend

The user interface is a React application built with Next.js:

- Responsive design for desktop and tablet use
- Real-time updates for chat and processing status
- File upload with progress tracking
- Audio player for podcast episodes

## Data Flow

### Source Ingestion

```
Upload/URL → Source Record Created → Processing Queue
                                         │
                              ┌──────────┼──────────┐
                              ▼          ▼          ▼
                          Text       Embedding   Metadata
                        Extraction   Generation  Extraction
                              │          │          │
                              └──────────┼──────────┘
                                         ▼
                                  Source Updated
                                  (searchable)
```

### Chat Execution

```
User Message → Build Context (sources + notes)
                    │
                    ▼
              LangGraph State Machine
                    │
                    ├─ Retrieve relevant context
                    ├─ Format prompt with citations
                    └─ Stream LLM response
                         │
                         ▼
                   Response with
                   source citations
```

### Podcast Generation

```
Notebook Content → Episode Profile → Script Generation (LLM)
                                          │
                                          ▼
                                    Speaker Assignment
                                          │
                                          ▼
                                    Text-to-Speech
                                    (per segment)
                                          │
                                          ▼
                                    Audio Assembly
                                          │
                                          ▼
                                    Episode Record
                                    + Audio File
```

## Key Design Decisions

1. **Multi-provider by default**: Not locked to any single AI provider, enabling cost optimization and capability matching
2. **Async processing**: Long-running operations (source ingestion, podcast generation) run asynchronously with status polling
3. **Self-hosted data**: All data stays on the user's infrastructure with encrypted credential storage
4. **REST-first API**: Every UI action is backed by an API endpoint for automation
5. **Docker-native**: Designed for containerized deployment with persistent volumes

## File Structure

```
open-notebook/
├── api/               # FastAPI REST API
│   ├── main.py        # App setup, middleware, routers
│   ├── routers/       # Route handlers (20 modules)
│   ├── models.py      # Pydantic request/response models
│   └── auth.py        # Authentication middleware
├── open_notebook/     # Core library
│   ├── ai/            # AI integration (LangChain, Esperanto)
│   ├── database/      # SurrealDB operations
│   ├── domain/        # Domain models and business logic
│   ├── graphs/        # LangGraph chat and processing graphs
│   ├── podcasts/      # Podcast generation pipeline
│   └── utils/         # Shared utilities
├── frontend/          # Next.js React application
├── prompts/           # AI prompt templates
├── tests/             # Test suite
└── docker-compose.yml # Deployment configuration
```
