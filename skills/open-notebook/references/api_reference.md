# Open Notebook API Reference

## Base URL

```
http://localhost:5055/api
```

Interactive API documentation is available at `http://localhost:5055/docs` (Swagger UI) and `http://localhost:5055/redoc` (ReDoc).

## Authentication

If `OPEN_NOTEBOOK_PASSWORD` is configured, include the password in requests. The following routes are excluded from authentication: `/`, `/health`, `/docs`, `/openapi.json`, `/redoc`, `/api/auth/status`, `/api/config`.

---

## Notebooks

### List Notebooks

```
GET /api/notebooks
```

**Query Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| `archived` | boolean | Filter by archived status |
| `order_by` | string | Sort field (default: `updated_at`) |

**Response:** Array of notebook objects with `source_count` and `note_count`.

### Create Notebook

```
POST /api/notebooks
```

**Request Body:**
```json
{
  "name": "My Research",
  "description": "Optional description"
}
```

### Get Notebook

```
GET /api/notebooks/{notebook_id}
```

### Update Notebook

```
PUT /api/notebooks/{notebook_id}
```

**Request Body:**
```json
{
  "name": "Updated Name",
  "description": "Updated description",
  "archived": false
}
```

### Delete Notebook

```
DELETE /api/notebooks/{notebook_id}
```

**Query Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| `delete_sources` | boolean | Also delete exclusive sources (default: false) |

### Delete Preview

```
GET /api/notebooks/{notebook_id}/delete-preview
```

Returns counts of notes and sources that would be affected by deletion.

### Link Source to Notebook

```
POST /api/notebooks/{notebook_id}/sources/{source_id}
```

Idempotent operation to associate a source with a notebook.

### Unlink Source from Notebook

```
DELETE /api/notebooks/{notebook_id}/sources/{source_id}
```

---

## Sources

### List Sources

```
GET /api/sources
```

**Query Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| `notebook_id` | string | Filter by notebook |
| `limit` | integer | Number of results |
| `offset` | integer | Pagination offset |
| `order_by` | string | Sort field |

### Create Source

```
POST /api/sources
```

Accepts multipart form data for file uploads or JSON for URL/text sources.

**Form Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| `file` | file | Upload file (PDF, DOCX, audio, video) |
| `url` | string | Web URL to ingest |
| `text` | string | Raw text content |
| `notebook_id` | string | Associate with notebook |
| `process_async` | boolean | Process asynchronously (default: true) |

### Create Source (JSON)

```
POST /api/sources/json
```

Legacy JSON-based endpoint for source creation.

### Get Source

```
GET /api/sources/{source_id}
```

### Get Source Status

```
GET /api/sources/{source_id}/status
```

Poll processing status for asynchronously ingested sources.

### Update Source

```
PUT /api/sources/{source_id}
```

**Request Body:**
```json
{
  "title": "Updated Title",
  "topic": "Updated topic"
}
```

### Delete Source

```
DELETE /api/sources/{source_id}
```

### Download Source File

```
GET /api/sources/{source_id}/download
```

Returns the original uploaded file.

### Check Source File

```
HEAD /api/sources/{source_id}/download
```

### Retry Failed Source

```
POST /api/sources/{source_id}/retry
```

Requeue a failed source for processing.

### Get Source Insights

```
GET /api/sources/{source_id}/insights
```

Retrieve AI-generated insights for a source.

---

## Notes

### List Notes

```
GET /api/notes
```

**Query Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| `notebook_id` | string | Filter by notebook |

### Create Note

```
POST /api/notes
```

**Request Body:**
```json
{
  "title": "My Note",
  "content": "Note content...",
  "note_type": "human",
  "notebook_id": "notebook:abc123"
}
```

`note_type` must be `"human"` or `"ai"`. AI notes without titles get auto-generated titles.

### Get Note

```
GET /api/notes/{note_id}
```

### Update Note

```
PUT /api/notes/{note_id}
```

**Request Body:**
```json
{
  "title": "Updated Title",
  "content": "Updated content",
  "note_type": "human"
}
```

### Delete Note

```
DELETE /api/notes/{note_id}
```

---

## Chat

### List Sessions

```
GET /api/chat/sessions
```

**Query Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| `notebook_id` | string | Filter by notebook |

### Create Session

```
POST /api/chat/sessions
```

**Request Body:**
```json
{
  "notebook_id": "notebook:abc123",
  "title": "Discussion Topic",
  "model_override": "optional_model_id"
}
```

### Get Session

```
GET /api/chat/sessions/{session_id}
```

Returns session details with message history.

### Update Session

```
PUT /api/chat/sessions/{session_id}
```

### Delete Session

```
DELETE /api/chat/sessions/{session_id}
```

### Execute Chat

```
POST /api/chat/execute
```

**Request Body:**
```json
{
  "session_id": "chat_session:abc123",
  "message": "Your question here",
  "context": {
    "include_sources": true,
    "include_notes": true
  },
  "model_override": "optional_model_id"
}
```

### Build Context

```
POST /api/chat/context
```

Build contextual data from sources and notes for a chat session.

---

## Search

### Search Knowledge Base

```
POST /api/search
```

**Request Body:**
```json
{
  "query": "search terms",
  "search_type": "vector",
  "limit": 10,
  "source_ids": [],
  "note_ids": [],
  "min_similarity": 0.7
}
```

`search_type` can be `"vector"` (requires embedding model) or `"text"` (keyword matching).

### Ask with Streaming

```
POST /api/search/ask
```

Returns Server-Sent Events with AI-generated answers based on knowledge base content.

### Ask Simple

```
POST /api/search/ask/simple
```

Non-streaming version that returns a complete response.

---

## Podcasts

### Generate Podcast

```
POST /api/podcasts/generate
```

**Request Body:**
```json
{
  "notebook_id": "notebook:abc123",
  "episode_profile_id": "episode_profile:xyz",
  "speaker_profile_ids": ["speaker:a", "speaker:b"]
}
```

Returns a `job_id` for tracking generation progress.

### Get Job Status

```
GET /api/podcasts/jobs/{job_id}
```

### List Episodes

```
GET /api/podcasts/episodes
```

### Get Episode

```
GET /api/podcasts/episodes/{episode_id}
```

### Get Episode Audio

```
GET /api/podcasts/episodes/{episode_id}/audio
```

Streams the podcast audio file.

### Retry Failed Episode

```
POST /api/podcasts/episodes/{episode_id}/retry
```

### Delete Episode

```
DELETE /api/podcasts/episodes/{episode_id}
```

---

## Transformations

### List Transformations

```
GET /api/transformations
```

### Create Transformation

```
POST /api/transformations
```

**Request Body:**
```json
{
  "name": "summarize",
  "title": "Summarize Content",
  "description": "Generate a concise summary",
  "prompt": "Summarize the following text...",
  "apply_default": false
}
```

### Execute Transformation

```
POST /api/transformations/execute
```

**Request Body:**
```json
{
  "transformation_id": "transformation:abc",
  "input_text": "Text to transform...",
  "model_id": "model:xyz"
}
```

### Get Default Prompt

```
GET /api/transformations/default-prompt
```

### Update Default Prompt

```
PUT /api/transformations/default-prompt
```

### Get Transformation

```
GET /api/transformations/{transformation_id}
```

### Update Transformation

```
PUT /api/transformations/{transformation_id}
```

### Delete Transformation

```
DELETE /api/transformations/{transformation_id}
```

---

## Models

### List Models

```
GET /api/models
```

**Query Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| `model_type` | string | Filter by type (llm, embedding, stt, tts) |

### Create Model

```
POST /api/models
```

### Delete Model

```
DELETE /api/models/{model_id}
```

### Test Model

```
POST /api/models/{model_id}/test
```

### Get Default Models

```
GET /api/models/defaults
```

Returns default model assignments for seven service slots: chat, transformation, embedding, speech-to-text, text-to-speech, podcast, and summary.

### Update Default Models

```
PUT /api/models/defaults
```

### Get Providers

```
GET /api/models/providers
```

### Discover Models

```
GET /api/models/discover/{provider}
```

### Sync Models (Single Provider)

```
POST /api/models/sync/{provider}
```

### Sync All Models

```
POST /api/models/sync
```

### Auto-Assign Defaults

```
POST /api/models/auto-assign
```

Automatically populate empty default model slots using provider priority rankings.

### Get Model Count

```
GET /api/models/count/{provider}
```

### Get Models by Provider

```
GET /api/models/by-provider/{provider}
```

---

## Credentials

### Get Status

```
GET /api/credentials/status
```

### Get Environment Status

```
GET /api/credentials/env-status
```

### List Credentials

```
GET /api/credentials
```

**Query Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| `provider` | string | Filter by provider |

### List by Provider

```
GET /api/credentials/by-provider/{provider}
```

### Create Credential

```
POST /api/credentials
```

**Request Body:**
```json
{
  "provider": "openai",
  "name": "My OpenAI Key",
  "api_key": "sk-...",
  "base_url": null
}
```

### Get Credential

```
GET /api/credentials/{credential_id}
```

Note: API key values are never returned.

### Update Credential

```
PUT /api/credentials/{credential_id}
```

### Delete Credential

```
DELETE /api/credentials/{credential_id}
```

### Test Credential

```
POST /api/credentials/{credential_id}/test
```

### Discover Models via Credential

```
POST /api/credentials/{credential_id}/discover
```

### Register Models via Credential

```
POST /api/credentials/{credential_id}/register-models
```

---

## Error Responses

The API returns standard HTTP status codes with JSON error bodies:

| Status | Meaning |
|--------|---------|
| 400 | Invalid input |
| 401 | Authentication required |
| 404 | Resource not found |
| 422 | Configuration error |
| 429 | Rate limited |
| 500 | Internal server error |
| 502 | External service error |

**Error Response Format:**
```json
{
  "detail": "Description of the error"
}
```
