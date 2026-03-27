"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase-server";

export async function updateUserRole(formData: FormData) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/admin?error=Unauthorized");
  }

  const { data: currentProfile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (!currentProfile || currentProfile.role !== "admin") {
    redirect("/admin?error=Only admins can update roles");
  }

  const userId = String(formData.get("userId") || "").trim();
  const role = String(formData.get("role") || "").trim();

  if (!userId) {
    redirect("/admin?error=User ID is required");
  }

  if (role !== "admin" && role !== "employee") {
    redirect("/admin?error=Invalid role");
  }

  if (userId === user.id && role !== "admin") {
    redirect("/admin?error=You cannot remove your own admin role");
  }

  const { error } = await supabase
    .from("profiles")
    .update({ role })
    .eq("id", userId);

  if (error) {
    redirect(`/admin?error=${encodeURIComponent(error.message)}`);
  }

  redirect("/admin?success=User role updated successfully");
}