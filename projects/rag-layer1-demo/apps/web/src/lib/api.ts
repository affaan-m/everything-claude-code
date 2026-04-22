import type { APIKey, APIKeyCreated, APIResponse, Document, Project, ProjectCreate, TokenResponse, User } from "@/types";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";
const BASE = `${API_URL}/api/v1`;
const IS_DEV = process.env.NODE_ENV !== "production";

function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("access_token");
}

function log(method: string, path: string, status: "start" | "success" | "error", details?: unknown): void {
  if (!IS_DEV) return;
  const timestamp = new Date().toISOString();
  const prefix = `[API ${timestamp}]`;
  if (status === "start") {
    console.log(`${prefix} ${method} ${path}`);
  } else if (status === "success") {
    console.log(`${prefix} ✓ ${method} ${path}`, details);
  } else {
    console.error(`${prefix} ✗ ${method} ${path}`, details);
  }
}

async function req<T>(
  path: string,
  options: RequestInit = {},
  authenticated = true,
): Promise<APIResponse<T>> {
  const method = (options.method ?? "GET").toUpperCase();
  log(method, path, "start");

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };

  if (authenticated) {
    const token = getToken();
    if (token) headers["Authorization"] = `Bearer ${token}`;
  }

  try {
    const res = await fetch(`${BASE}${path}`, { ...options, headers });
    const json = await res.json();

    if (!res.ok) {
      const error = json.detail ?? json.error ?? `Request failed: ${res.status}`;
      log(method, path, "error", error);
      throw new Error(error);
    }
    log(method, path, "success", { status: res.status });
    return json;
  } catch (err) {
    log(method, path, "error", err);
    throw err;
  }
}

// ── Auth ─────────────────────────────────────────────────────────────────────

export async function register(email: string, password: string): Promise<User> {
  const resp = await req<User>("/auth/register", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  }, false);
  return resp.data!;
}

export async function login(email: string, password: string): Promise<void> {
  const resp = await req<TokenResponse>("/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  }, false);
  const token = resp.data!.access_token;
  localStorage.setItem("access_token", token);
}

export function logout(): void {
  localStorage.removeItem("access_token");
}

export async function getMe(): Promise<User> {
  const resp = await req<User>("/auth/me");
  return resp.data!;
}

// ── Projects ─────────────────────────────────────────────────────────────────

export async function listProjects(): Promise<Project[]> {
  const resp = await req<Project[]>("/projects");
  return resp.data!;
}

export async function createProject(payload: ProjectCreate): Promise<Project> {
  const resp = await req<Project>("/projects", {
    method: "POST",
    body: JSON.stringify(payload),
  });
  return resp.data!;
}

export async function getProject(id: string): Promise<Project> {
  const resp = await req<Project>(`/projects/${id}`);
  return resp.data!;
}

export async function deleteProject(id: string): Promise<void> {
  await req<null>(`/projects/${id}`, { method: "DELETE" });
}

// ── API Keys ──────────────────────────────────────────────────────────────────

export async function createAPIKey(projectId: string): Promise<APIKeyCreated> {
  const resp = await req<APIKeyCreated>(`/projects/${projectId}/api-keys`, { method: "POST" });
  return resp.data!;
}

export async function listAPIKeys(projectId: string): Promise<APIKey[]> {
  const resp = await req<APIKey[]>(`/projects/${projectId}/api-keys`);
  return resp.data ?? [];
}

export async function revokeAPIKey(projectId: string, keyId: string): Promise<APIKey> {
  const resp = await req<APIKey>(`/projects/${projectId}/api-keys/${keyId}/revoke`, { method: "POST" });
  return resp.data!;
}

// ── Documents ─────────────────────────────────────────────────────────────────

export async function uploadDocument(projectId: string, file: File): Promise<Document> {
  const formData = new FormData();
  formData.append("file", file);

  const token = getToken();
  const res = await fetch(`${BASE}/projects/${projectId}/documents`, {
    method: "POST",
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    body: formData,
  });
  const json = await res.json();
  if (!res.ok) {
    const error = json.detail ?? "Upload failed";
    log("POST", `/projects/${projectId}/documents`, "error", error);
    throw new Error(error);
  }
  log("POST", `/projects/${projectId}/documents`, "success", { status: res.status });
  return json.data;
}

export async function listDocuments(projectId: string): Promise<Document[]> {
  const resp = await req<Document[]>(`/projects/${projectId}/documents`);
  return resp.data!;
}

export async function deleteDocument(projectId: string, documentId: string): Promise<void> {
  await req<null>(`/projects/${projectId}/documents/${documentId}`, { method: "DELETE" });
}
