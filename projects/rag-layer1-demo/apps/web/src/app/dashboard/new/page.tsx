"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { createProject } from "@/lib/api";
import type { ChunkingStrategy } from "@/types";

export default function NewProjectPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [strategy, setStrategy] = useState<ChunkingStrategy>("naive");
  const [chunkSize, setChunkSize] = useState(512);
  const [topK, setTopK] = useState(5);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const project = await createProject({
        name,
        description: description || undefined,
        chunking_strategy: strategy,
        chunk_size: chunkSize,
        top_k: topK,
      });
      router.push(`/dashboard/projects/${project.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create project");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md">
      <h1 className="text-2xl font-bold mb-4">New Project</h1>
      {error && <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">{error}</div>}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Project Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded"
            rows={3}
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Chunking Strategy</label>
          <select
            value={strategy}
            onChange={(e) => setStrategy(e.target.value as ChunkingStrategy)}
            className="w-full px-3 py-2 border border-gray-300 rounded"
          >
            <option value="naive">Naive (RecursiveCharacter)</option>
            <option value="qa">Q&A Pairs</option>
            <option value="one">Single Chunk</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Chunk Size</label>
          <input
            type="number"
            value={chunkSize}
            onChange={(e) => setChunkSize(parseInt(e.target.value))}
            className="w-full px-3 py-2 border border-gray-300 rounded"
            min="64"
            max="4096"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Top-K Results</label>
          <input
            type="number"
            value={topK}
            onChange={(e) => setTopK(parseInt(e.target.value))}
            className="w-full px-3 py-2 border border-gray-300 rounded"
            min="1"
            max="50"
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="w-full py-2 bg-blue-600 text-white rounded font-medium hover:bg-blue-700 disabled:bg-gray-400"
        >
          {loading ? "Creating..." : "Create Project"}
        </button>
      </form>
    </div>
  );
}
