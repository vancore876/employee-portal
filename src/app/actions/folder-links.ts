"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase-server";

async function requireAdmin() {
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
    redirect("/admin?error=Only admins can manage links");
  }

  return { supabase, user };
}

export async function createFolderLink(formData: FormData) {
  const { supabase, user } = await requireAdmin();

  const title = String(formData.get("title") || "").trim();
  const url = String(formData.get("url") || "").trim();
  const folder = String(formData.get("folder") || "").trim();

  if (!title) {
    redirect("/admin?error=Link title is required");
  }

  if (!url) {
    redirect("/admin?error=URL is required");
  }

  if (!folder) {
    redirect("/admin?error=Folder is required");
  }

  let parsedUrl: URL;
  try {
    parsedUrl = new URL(url);
  } catch {
    redirect("/admin?error=Please enter a valid URL");
  }

  if (!["http:", "https:"].includes(parsedUrl.protocol)) {
    redirect("/admin?error=Only http and https links are allowed");
  }

  const { data: folderExists, error: folderError } = await supabase
    .from("folders")
    .select("name")
    .eq("name", folder)
    .single();

  if (folderError || !folderExists) {
    redirect("/admin?error=Selected folder does not exist");
  }

  const { error } = await supabase.from("folder_links").insert({
    title,
    url: parsedUrl.toString(),
    folder,
    created_by: user.id,
  });

  if (error) {
    redirect(`/admin?error=${encodeURIComponent(error.message)}`);
  }

  redirect("/admin?success=Link added successfully");
}

export async function deleteFolderLink(formData: FormData) {
  const { supabase } = await requireAdmin();

  const linkId = String(formData.get("linkId") || "").trim();

  if (!linkId) {
    redirect("/admin?error=Link ID is required");
  }

  const { error } = await supabase
    .from("folder_links")
    .delete()
    .eq("id", linkId);

  if (error) {
    redirect(`/admin?error=${encodeURIComponent(error.message)}`);
  }

  redirect("/admin?success=Link deleted successfully");
}