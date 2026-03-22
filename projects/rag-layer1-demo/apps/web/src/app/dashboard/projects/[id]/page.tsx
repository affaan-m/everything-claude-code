"use client";
import { useEffect, useState } from "react";
import { getProject, createAPIKey, listAPIKeys, revokeAPIKey, listDocuments, uploadDocument } from "@/lib/api";
import type { Project, APIKey, APIKeyCreated, Document } from "@/types";
import { useParams } from "next/navigation";

export default function ProjectPage() {
  const params = useParams();
  const projectId = params.id as string;

  const [project, setProject] = useState<Project | null>(null);
  const [apiKeys, setApiKeys] = useState<APIKey[]>([]);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [newKey, setNewKey] = useState<APIKeyCreated | null>(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    Promise.all([
      getProject(projectId).then(setProject),
      listAPIKeys(projectId).then(setApiKeys),
      listDocuments(projectId).then(setDocuments),
    ]).finally(() => setLoading(false));
  }, [projectId]);

  const handleCreateKey = async () => {
    const key = await createAPIKey(projectId);
    setNewKey(key);
    setApiKeys((k) => [...k, key]);
  };

  const handleRevokeKey = async (keyId: string) => {
    await revokeAPIKey(projectId, keyId);
    setApiKeys((k) => k.map((ka) => (ka.id === keyId ? { ...ka, is_active: false } : ka)));
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.currentTarget.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const doc = await uploadDocument(projectId, file);
      setDocuments((d) => [doc, ...d]);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  if (loading) return <div>Loading project...</div>;
  if (!project) return <div>Project not found</div>;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold mb-2">{project.name}</h1>
        <p className="text-gray-600">{project.description}</p>
      </div>

      {/* API Keys Section */}
      <section className="border-t pt-6">
        <h2 className="text-xl font-bold mb-4">API Keys</h2>
        {newKey && (
          <div className="mb-4 p-4 bg-green-100 text-green-800 rounded">
            <p className="text-sm font-mono break-all">{newKey.plaintext_key}</p>
            <p className="text-xs mt-2 text-green-700">⚠️ Save this key securely — you won't see it again!</p>
          </div>
        )}
        <button
          onClick={handleCreateKey}
          className="mb-4 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
        >
          Generate API Key
        </button>
        <div className="space-y-2">
          {apiKeys.map((k) => (
            <div key={k.id} className="flex justify-between items-center p-3 border border-gray-200 rounded">
              <span className="font-mono text-sm">{k.key_prefix}...</span>
              <span className={`text-xs ${k.is_active ? "text-green-600" : "text-red-600"}`}>
                {k.is_active ? "Active" : "Revoked"}
              </span>
              {k.is_active && (
                <button
                  onClick={() => handleRevokeKey(k.id)}
                  className="text-xs text-red-600 hover:text-red-700"
                >
                  Revoke
                </button>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Documents Section */}
      <section className="border-t pt-6">
        <h2 className="text-xl font-bold mb-4">Documents</h2>
        <div className="mb-4">
          <label className="block px-4 py-2 bg-blue-600 text-white rounded cursor-pointer hover:bg-blue-700 inline-block">
            {uploading ? "Uploading..." : "Upload Document"}
            <input
              type="file"
              accept=".pdf,.txt,.docx"
              onChange={handleFileUpload}
              disabled={uploading}
              className="hidden"
            />
          </label>
        </div>
        <div className="space-y-2">
          {documents.map((d) => (
            <div key={d.id} className="p-3 border border-gray-200 rounded">
              <p className="font-medium">{d.original_filename}</p>
              <p className="text-xs text-gray-500">
                Status: <span className="font-mono">{d.status}</span> • {d.chunk_count} chunks
              </p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
