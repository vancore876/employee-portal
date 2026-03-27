"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function AdminReviewActions({ requestId }: { requestId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState<string | null>(null);

  async function review(status: "approved" | "rejected") {
    setLoading(status);

    const response = await fetch("/api/admin/requests/review", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ requestId, status }),
    });

    setLoading(null);

    if (response.ok) {
      router.refresh();
    }
  }

  return (
    <div className="flex gap-2">
      <button
        onClick={() => review("approved")}
        disabled={loading !== null}
        className="rounded-2xl bg-gradient-to-r from-red-500 via-blue-500 to-purple-600 px-4 py-2 font-semibold text-white shadow-lg disabled:opacity-50"
      >
        {loading === "approved" ? "Approving..." : "Approve"}
      </button>
      <button
        onClick={() => review("rejected")}
        disabled={loading !== null}
        className="rounded-2xl border border-white/10 bg-white/5 px-4 py-2 font-semibold text-white hover:bg-white/10 disabled:opacity-50"
      >
        {loading === "rejected" ? "Rejecting..." : "Reject"}
      </button>
    </div>
  );
}