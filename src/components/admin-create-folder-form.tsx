"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function AdminCreateFolderForm() {
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    const response = await fetch("/api/admin/folders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, parentFolderId: null }),
    });

    setLoading(false);

    if (response.ok) {
      setName("");
      router.refresh();
    }
  }

  return (
    <form
      onSubmit={submit}
      className="mb-6 flex flex-wrap gap-3 rounded-[2rem] border border-white/10 bg-white/5 p-4 shadow-[0_20px_60px_rgba(0,0,0,0.35)] backdrop-blur-2xl"
    >
      <input
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Create a new folder"
        className="min-w-[240px] flex-1 rounded-2xl border border-white/10 bg-slate-950/60 px-4 py-3 text-white placeholder:text-slate-400 outline-none"
      />
      <button
        type="submit"
        disabled={loading || !name.trim()}
        className="rounded-2xl bg-gradient-to-r from-red-500 via-blue-500 to-purple-600 px-5 py-3 font-semibold text-white shadow-lg disabled:opacity-50"
      >
        {loading ? "Creating..." : "Create Folder"}
      </button>
    </form>
  );
}