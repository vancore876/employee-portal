"use client";

import { createClient } from "@/lib/supabase-browser";

export default function LoginPage() {
  const handleGoogleLogin = async () => {
    const supabase = createClient();

    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
  };

  return (
    <main className="min-h-screen bg-[#0b1020] text-white">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(239,68,68,0.25),transparent_25%),radial-gradient(circle_at_top_right,rgba(59,130,246,0.25),transparent_25%),radial-gradient(circle_at_bottom,rgba(168,85,247,0.25),transparent_30%)]" />
      
      <div className="relative flex min-h-screen items-center justify-center px-6">
        <div className="w-full max-w-md rounded-3xl border border-white/10 bg-white/10 p-8 shadow-2xl backdrop-blur-xl">
          <h1 className="mb-2 text-center text-3xl font-bold">
            Employee Portal
          </h1>
          <p className="mb-8 text-center text-sm text-gray-300">
            Sign in to access your dashboard
          </p>

          <button
            onClick={handleGoogleLogin}
            className="w-full rounded-2xl bg-gradient-to-r from-red-500 via-purple-500 to-blue-500 px-5 py-3 font-semibold text-white shadow-lg transition hover:scale-[1.02] hover:opacity-95"
          >
            Sign in with Google
          </button>
        </div>
      </div>
    </main>
  );
}