"use client";

import { createClient } from "@/lib/supabase-browser";

export function GoogleSignInButton() {
  const handleLogin = async () => {
    const supabase = createClient();

    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
  };

  return (
    <button
      onClick={handleLogin}
      className="inline-flex w-full items-center justify-center rounded-2xl bg-gradient-to-r from-red-500 via-blue-500 to-purple-600 px-5 py-4 text-base font-bold text-white shadow-[0_18px_50px_rgba(59,130,246,0.3)] hover:scale-[1.01] hover:brightness-110"
    >
      Sign in with Google
    </button>
  );
}