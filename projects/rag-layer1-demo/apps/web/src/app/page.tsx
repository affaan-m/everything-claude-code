"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getMe } from "@/lib/api";

export default function Home() {
  const router = useRouter();
  const [isauth, setIsAuth] = useState<boolean | null>(null);

  useEffect(() => {
    getMe()
      .then(() => {
        setIsAuth(true);
        router.push("/dashboard");
      })
      .catch(() => {
        setIsAuth(false);
      });
  }, [router]);

  if (isauth === null) return <div className="p-8">Loading...</div>;

  return (
    <div className="flex h-screen items-center justify-center bg-gray-100">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold text-gray-900">RAG Layer 1</h1>
        <p className="text-gray-600">Headless document retrieval platform</p>
        <div className="flex gap-4 justify-center">
          <a
            href="/auth/login"
            className="px-6 py-2 bg-blue-600 text-white rounded font-medium hover:bg-blue-700"
          >
            Login
          </a>
          <a
            href="/auth/register"
            className="px-6 py-2 border border-gray-300 text-gray-900 rounded font-medium hover:bg-gray-50"
          >
            Register
          </a>
        </div>
      </div>
    </div>
  );
}
