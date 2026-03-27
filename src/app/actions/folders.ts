"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase-server";

export async function createFolder(formData: FormData) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/admin?error=Unauthorized");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (!profile || profile.role !== "admin") {
    redirect("/admin?error=Only admins can create folders");
  }

  const name = String(formData.get("name") || "").trim();

  if (!name) {
    redirect("/admin?error=Folder name is required");
  }

  const cleanedName = name.replace(/[^a-zA-Z0-9-_ ]/g, "").trim();

  if (!cleanedName) {
    redirect("/admin?error=Invalid folder name");
  }

  const { error } = await supabase.from("folders").insert({
    name: cleanedName,
  });

  if (error && !error.message.toLowerCase().includes("duplicate")) {
    redirect(`/admin?error=${encodeURIComponent(error.message)}`);
  }

  redirect("/admin?success=Folder created successfully");
}