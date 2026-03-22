"use client";
import { useEffect, useState } from "react";
import { listProjects, deleteProject } from "@/lib/api";
import type { Project } from "@/types";
import Link from "next/link";

export default function DashboardPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    listProjects().then(setProjects).finally(() => setLoading(false));
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this project?")) return;
    await deleteProject(id);
    setProjects((p) => p.filter((pr) => pr.id !== id));
  };

  if (loading) return <div>Loading projects...</div>;

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Projects</h1>
        <Link
          href="/dashboard/new"
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          New Project
        </Link>
      </div>

      {projects.length === 0 ? (
        <p className="text-gray-600">No projects yet. Create one to get started!</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {projects.map((p) => (
            <div key={p.id} className="border border-gray-200 rounded p-4 hover:shadow-lg transition">
              <Link href={`/dashboard/projects/${p.id}`}>
                <h2 className="text-xl font-semibold cursor-pointer hover:text-blue-600">{p.name}</h2>
              </Link>
              <p className="text-gray-600 text-sm">{p.description}</p>
              <div className="mt-2 text-xs text-gray-500 space-y-1">
                <p>Strategy: <span className="font-mono">{p.chunking_strategy}</span></p>
                <p>Chunk size: {p.chunk_size}</p>
              </div>
              <button
                onClick={() => handleDelete(p.id)}
                className="mt-4 text-sm text-red-600 hover:text-red-700"
              >
                Delete
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
