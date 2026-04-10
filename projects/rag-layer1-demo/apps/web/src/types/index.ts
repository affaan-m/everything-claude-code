// All API types matching the FastAPI schemas

export interface APIResponse<T> {
  success: boolean;
  data: T | null;
  error?: string;
}

export interface User {
  id: string;
  email: string;
  is_active: boolean;
  created_at: string;
}

export interface TokenResponse {
  access_token: string;
  token_type: string;
}

export type ChunkingStrategy = "naive" | "qa" | "one";
export type DocumentStatus = "pending" | "processing" | "indexed" | "failed";

export interface Project {
  id: string;
  owner_id: string;
  name: string;
  description: string | null;
  chunking_strategy: ChunkingStrategy;
  chunk_size: number;
  chunk_overlap: number;
  embedding_model: string;
  top_k: number;
  created_at: string;
  updated_at: string;
}

export interface ProjectCreate {
  name: string;
  description?: string;
  chunking_strategy?: ChunkingStrategy;
  chunk_size?: number;
  chunk_overlap?: number;
  top_k?: number;
}

export interface APIKey {
  id: string;
  project_id: string;
  key_prefix: string;
  is_active: boolean;
  created_at: string;
  revoked_at: string | null;
}

export interface APIKeyCreated extends APIKey {
  plaintext_key: string;
}

export interface Document {
  id: string;
  project_id: string;
  filename: string;
  original_filename: string;
  source_type: "file" | "url";
  source_url: string | null;
  file_size: number | null;
  mime_type: string | null;
  status: DocumentStatus;
  error_message: string | null;
  chunk_count: number;
  created_at: string;
  updated_at: string;
}
