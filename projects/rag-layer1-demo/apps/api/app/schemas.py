from __future__ import annotations

import uuid
from datetime import datetime
from typing import Any, Generic, Literal, TypeVar

from pydantic import BaseModel, EmailStr, Field, field_validator

from app.models import ChunkingStrategy, DocumentStatus, MessageRole, SourceType

T = TypeVar("T")


# ── Generic response envelopes ────────────────────────────────────────────────

class APIResponse(BaseModel, Generic[T]):
    success: bool
    data: T | None = None
    error: str | None = None


class PaginatedResponse(BaseModel, Generic[T]):
    success: bool
    data: list[T]
    total: int
    page: int
    limit: int


# ── Auth ─────────────────────────────────────────────────────────────────────

class RegisterRequest(BaseModel):
    email: EmailStr
    password: str = Field(min_length=8, max_length=128)


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"


class UserOut(BaseModel):
    id: uuid.UUID
    email: str
    is_active: bool
    created_at: datetime

    model_config = {"from_attributes": True}


# ── Projects ─────────────────────────────────────────────────────────────────

class ProjectCreate(BaseModel):
    name: str = Field(min_length=1, max_length=255)
    description: str | None = Field(default=None, max_length=2000)
    chunking_strategy: ChunkingStrategy = ChunkingStrategy.NAIVE
    chunk_size: int = Field(default=512, ge=64, le=4096)
    chunk_overlap: int = Field(default=64, ge=0, le=512)
    top_k: int = Field(default=5, ge=1, le=50)


class ProjectUpdate(BaseModel):
    name: str | None = Field(default=None, min_length=1, max_length=255)
    description: str | None = Field(default=None, max_length=2000)
    chunking_strategy: ChunkingStrategy | None = None
    chunk_size: int | None = Field(default=None, ge=64, le=4096)
    chunk_overlap: int | None = Field(default=None, ge=0, le=512)
    top_k: int | None = Field(default=None, ge=1, le=50)


class ProjectOut(BaseModel):
    id: uuid.UUID
    owner_id: uuid.UUID
    name: str
    description: str | None
    chunking_strategy: ChunkingStrategy
    chunk_size: int
    chunk_overlap: int
    embedding_model: str
    top_k: int
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


# ── API Keys ──────────────────────────────────────────────────────────────────

class APIKeyOut(BaseModel):
    id: uuid.UUID
    project_id: uuid.UUID
    key_prefix: str
    is_active: bool
    created_at: datetime
    revoked_at: datetime | None

    model_config = {"from_attributes": True}


class APIKeyCreated(BaseModel):
    """Returned once on creation — includes the plaintext key."""
    id: uuid.UUID
    project_id: uuid.UUID
    key_prefix: str
    plaintext_key: str
    is_active: bool
    created_at: datetime

    model_config = {"from_attributes": True}


# ── Documents ─────────────────────────────────────────────────────────────────

class DocumentOut(BaseModel):
    id: uuid.UUID
    project_id: uuid.UUID
    filename: str
    original_filename: str
    source_type: SourceType
    source_url: str | None
    file_size: int | None
    mime_type: str | None
    status: DocumentStatus
    error_message: str | None
    chunk_count: int
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class URLIngestRequest(BaseModel):
    url: str = Field(min_length=1)

    @field_validator("url")
    @classmethod
    def must_be_http(cls, v: str) -> str:
        if not v.startswith(("http://", "https://")):
            raise ValueError("URL must start with http:// or https://")
        return v


# ── Sessions ──────────────────────────────────────────────────────────────────

class SessionCreateRequest(BaseModel):
    external_user_id: str | None = Field(default=None, max_length=255)
    title: str | None = Field(default=None, max_length=255)


class SessionOut(BaseModel):
    id: uuid.UUID
    project_id: uuid.UUID
    external_user_id: str | None
    title: str | None
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class SessionMessageCreate(BaseModel):
    role: MessageRole = MessageRole.USER
    content: str = Field(min_length=1, max_length=8000)


class SessionMessageOut(BaseModel):
    id: uuid.UUID
    session_id: uuid.UUID
    project_id: uuid.UUID
    role: MessageRole
    content: str
    created_at: datetime

    model_config = {"from_attributes": True}


# ── Retrieval ─────────────────────────────────────────────────────────────────

class RetrieveRequest(BaseModel):
    question: str = Field(min_length=1, max_length=4096)
    top_k: int | None = Field(default=None, ge=1, le=50)
    session_id: uuid.UUID | None = None
    context_turns: int = Field(default=6, ge=0, le=20)
    persist_question_to_session: bool = True
    retrieval_mode: Literal["semantic", "hybrid"] = "hybrid"
    candidate_pool: int | None = Field(default=None, ge=1, le=200)
    semantic_weight: float = Field(default=0.75, ge=0.0, le=1.0)
    diversify: bool = True
    diversity_lambda: float = Field(default=0.75, ge=0.0, le=1.0)


class ChunkResult(BaseModel):
    id: uuid.UUID
    document_id: uuid.UUID
    chunk_index: int
    content: str
    page_number: int | None
    section_heading: str | None
    metadata: dict[str, Any]
    score: float


class RetrieveResponse(BaseModel):
    project_id: uuid.UUID
    question: str
    chunks: list[ChunkResult]


# ── API Key Validation (for Layer 2) ─────────────────────────────────────────

class ValidateKeyResponse(BaseModel):
    valid: bool
    project_id: uuid.UUID | None = None
    project_name: str | None = None
    top_k: int | None = None
