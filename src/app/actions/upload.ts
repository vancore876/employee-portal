"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase-server";

export async function uploadDocument(formData: FormData) {
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
    redirect("/admin?error=Only admins can upload documents");
  }

  const title = String(formData.get("title") || "").trim();
  const folder = String(formData.get("folder") || "").trim();
  const file = formData.get("file") as File | null;

  if (!title) {
    redirect("/admin?error=Title is required");
  }

  if (!folder) {
    redirect("/admin?error=Folder is required");
  }

  if (!file || file.size === 0) {
    redirect("/admin?error=File is required");
  }

  const { data: folderExists, error: folderError } = await supabase
    .from("folders")
    .select("name")
    .eq("name", folder)
    .single();

  if (folderError || !folderExists) {
    redirect("/admin?error=Selected folder does not exist");
  }

  const safeFolder = folder.replace(/[^a-zA-Z0-9-_ ]/g, "").trim();
  const fileExt = file.name.split(".").pop() || "";
  const baseName = file.name
    .replace(/\.[^/.]+$/, "")
    .replace(/[^a-zA-Z0-9-_ ]/g, "")
    .trim();

  const finalBaseName = baseName || "document";
  const filePath = `${safeFolder}/${Date.now()}-${finalBaseName}${fileExt ? `.${fileExt}` : ""}`;

  const arrayBuffer = await file.arrayBuffer();
  const fileBuffer = Buffer.from(arrayBuffer);

  const { error: uploadError } = await supabase.storage
    .from("documents")
    .upload(filePath, fileBuffer, {
      contentType: file.type || "application/octet-stream",
      upsert: false,
    });

  if (uploadError) {
    redirect(`/admin?error=${encodeURIComponent(uploadError.message)}`);
  }

  const { error: insertError } = await supabase.from("documents").insert({
    title,
    file_name: file.name,
    file_path: filePath,
    folder: safeFolder,
    uploaded_by: user.id,
  });

  if (insertError) {
    await supabase.storage.from("documents").remove([filePath]);
    redirect(`/admin?error=${encodeURIComponent(insertError.message)}`);
  }

  redirect("/admin?success=Document uploaded successfully");
}