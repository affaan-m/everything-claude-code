import "@/styles/globals.css";

export const metadata = {
  title: "RAG Layer 1 — Document Retrieval",
  description: "Headless RAG platform",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-white text-gray-900">{children}</body>
    </html>
  );
}
