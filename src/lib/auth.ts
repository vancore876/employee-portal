import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase-server";

export type AppProfile = {
  id: string;
  email: string;
  full_name: string | null;
  role: "admin" | "employee";
};

export async function getProfile(): Promise<AppProfile | null> {
  const supabase = await createClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) return null;

  const { data, error } = await supabase
    .from("profiles")
    .select("id, email, full_name, role")
    .eq("id", user.id)
    .maybeSingle();

  if (error) {
    console.error("getProfile error:", error.message);
    return null;
  }

  return (data as AppProfile | null) ?? null;
}

export async function requireUser() {
  const profile = await getProfile();
  if (!profile) redirect("/login");
  return profile;
}

export async function requireAdmin() {
  const profile = await requireUser();
  if (profile.role !== "admin") redirect("/portal");
  return profile;
}