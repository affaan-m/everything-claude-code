"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getMe, logout } from "@/lib/api";
import type { User } from "@/types";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getMe()
      .then(setUser)
      .catch(() => {
        router.push("/auth/login");
      })
      .finally(() => setLoading(false));
  }, [router]);

  if (loading) return <div className="p-8">Loading...</div>;
  if (!user) return null;

  const handleLogout = () => {
    logout();
    router.push("/");
  };

  return (
    <div className="flex h-screen">
      <aside className="w-64 bg-gray-800 text-white p-6">
        <h2 className="text-2xl font-bold mb-8">RAG Dashboard</h2>
        <nav className="space-y-4">
          <a href="/dashboard" className="block hover:text-blue-400">
            Projects
          </a>
          <a href="/dashboard/new" className="block hover:text-blue-400">
            New Project
          </a>
        </nav>
        <div className="mt-auto pt-8 border-t border-gray-700">
          <p className="text-sm text-gray-400">{user.email}</p>
          <button
            onClick={handleLogout}
            className="mt-4 text-sm text-red-400 hover:text-red-300"
          >
            Logout
          </button>
        </div>
      </aside>
      <main className="flex-1 overflow-auto p-8">{children}</main>
    </div>
  );
}
