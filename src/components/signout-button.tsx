"use client";

import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function SignOutButton() {
  const router = useRouter();

  const handleSignOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  };

  return (
    <button
      onClick={handleSignOut}
      className="rounded-xl bg-gradient-to-r from-purple-600 via-blue-500 to-red-500 px-5 py-2 text-lg font-medium text-white shadow-md transition hover:scale-105"
    >
      Sign Out
    </button>
  );
}