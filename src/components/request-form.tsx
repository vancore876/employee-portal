"use client";

import { useState } from "react";

export function RequestForm({
  targetType,
  targetId,
}: {
  targetType: "file" | "folder" | "link";
  targetId: string;
}) {
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  async function submit() {
    setLoading(true);
    setDone(false);

    const response = await fetch("/api/requests", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ targetType, targetId, reason }),
    });

    setLoading(false);

    if (response.ok) {
      setReason("");
      setDone(true);
    }
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <input
        value={reason}
        onChange={(e) => setReason(e.target.value)}
        placeholder="Reason for removal request"
        className="rounded-2xl border border-white/10 bg-slate-950/60 px-3 py-2 text-white placeholder:text-slate-400 outline-none ring-0 backdrop-blur-xl"
      />
      <button
        type="button"
        onClick={submit}
        disabled={loading || !reason.trim()}
        className="rounded-2xl bg-gradient-to-r from-red-500 via-blue-500 to-purple-600 px-4 py-2 font-semibold text-white shadow-lg disabled:opacity-50"
      >
        {loading ? "Sending..." : "Request removal"}
      </button>
      {done ? <span className="text-sm text-emerald-400">Request submitted</span> : null}
    </div>
  );
}