"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

type FolderOption = {
  id: string;
  name: string;
};

export function AdminUploadForm({ folders }: { folders: FolderOption[] }) {
  const router = useRouter();
  const [folderId, setFolderId] = useState(folders[0]?.id ?? "");
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();

    if (!file || !folderId) {
      setError("Choose a folder and a file first.");
      return;
    }

    setLoading(true);
    setError(null);

    const formData = new FormData();
    formData.append("folderId", folderId);
    formData.append("file", file);

    const response = await fetch("/api/files/upload", {
      method: "POST",
      body: formData,
    });

    setLoading(false);

    if (!response.ok) {
      const data = await response.json().catch(() => ({ error: "Upload failed" }));
      setError(data.error ?? "Upload failed");
      return;
    }

    setFile(null);
    const input = document.getElementById("admin-file-input") as HTMLInputElement | null;
    if (input) input.value = "";
    router.refresh();
  }

  return (
    <form
      onSubmit={submit}
      className="mb-6 grid gap-3 rounded-[2rem] border border-white/10 bg-white/5 p-4 shadow-[0_20px_60px_rgba(0,0,0,0.35)] backdrop-blur-2xl md:grid-cols-[1fr_1fr_auto] md:items-end"
    >
      <div>
        <label className="mb-2 block text-sm font-medium text-slate-300">Folder</label>
        <select
          value={folderId}
          onChange={(e) => setFolderId(e.target.value)}
          className="w-full rounded-2xl border border-white/10 bg-slate-950/60 px-4 py-3 text-white outline-none"
        >
          {folders.map((folder) => (
            <option key={folder.id} value={folder.id}>
              {folder.name}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="mb-2 block text-sm font-medium text-slate-300">File</label>
        <input
          id="admin-file-input"
          type="file"
          onChange={(e) => setFile(e.target.files?.[0] ?? null)}
          className="w-full rounded-2xl border border-white/10 bg-slate-950/60 px-4 py-3 text-white file:mr-4 file:rounded-xl file:border-0 file:bg-white/10 file:px-3 file:py-2 file:text-white"
        />
      </div>

      <button
        type="submit"
        disabled={loading || !file || !folderId}
        className="rounded-2xl bg-gradient-to-r from-red-500 via-blue-500 to-purple-600 px-5 py-3 font-semibold text-white shadow-lg disabled:opacity-50"
      >
        {loading ? "Uploading..." : "Upload File"}
      </button>

      {error ? <p className="text-sm text-red-300 md:col-span-3">{error}</p> : null}
    </form>
  );
}