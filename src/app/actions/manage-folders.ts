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
    redirect("/admin?error=Only admins can manage folders");
  }

  return { supabase, user };
}

export async function renameFolder(formData: FormData) {
  const { supabase } = await requireAdmin();

  const folderId = String(formData.get("folderId") || "").trim();
  const newName = String(formData.get("newName") || "").trim();

  if (!folderId) {
    redirect("/admin?error=Folder ID is required");
  }

  if (!newName) {
    redirect("/admin?error=New folder name is required");
  }

  const cleanedName = newName.replace(/[^a-zA-Z0-9-_ ]/g, "").trim();

  if (!cleanedName) {
    redirect("/admin?error=Invalid folder name");
  }

  const { data: existingFolder, error: folderFetchError } = await supabase
    .from("folders")
    .select("id, name")
    .eq("id", folderId)
    .single();

  if (folderFetchError || !existingFolder) {
    redirect("/admin?error=Folder not found");
  }

  if (existingFolder.name === cleanedName) {
    redirect("/admin?success=Folder already has that name");
  }

  const { data: duplicateFolder } = await supabase
    .from("folders")
    .select("id")
    .eq("name", cleanedName)
    .maybeSingle();

  if (duplicateFolder) {
    redirect("/admin?error=A folder with that name already exists");
  }

  const oldName = existingFolder.name;

  const { data: docsInFolder, error: docsError } = await supabase
    .from("documents")
    .select("id, file_path")
    .eq("folder", oldName);

  if (docsError) {
    redirect(`/admin?error=${encodeURIComponent(docsError.message)}`);
  }

  for (const doc of docsInFolder || []) {
    const pathParts = doc.file_path.split("/");
    const restOfPath = pathParts.slice(1).join("/");
    const newPath = `${cleanedName}/${restOfPath}`;

    const { error: moveError } = await supabase.storage
      .from("documents")
      .move(doc.file_path, newPath);

    if (moveError) {
      redirect(`/admin?error=${encodeURIComponent(`Could not move file: ${moveError.message}`)}`);
    }

    const { error: updateDocError } = await supabase
      .from("documents")
      .update({
        folder: cleanedName,
        file_path: newPath,
      })
      .eq("id", doc.id);

    if (updateDocError) {
      redirect(`/admin?error=${encodeURIComponent(updateDocError.message)}`);
    }
  }

  const { error: renameError } = await supabase
    .from("folders")
    .update({ name: cleanedName })
    .eq("id", folderId);

  if (renameError) {
    redirect(`/admin?error=${encodeURIComponent(renameError.message)}`);
  }

  redirect("/admin?success=Folder renamed successfully");
}

export async function deleteFolder(formData: FormData) {
  const { supabase } = await requireAdmin();

  const folderId = String(formData.get("folderId") || "").trim();

  if (!folderId) {
    redirect("/admin?error=Folder ID is required");
  }

  const { data: folder, error: folderFetchError } = await supabase
    .from("folders")
    .select("id, name")
    .eq("id", folderId)
    .single();

  if (folderFetchError || !folder) {
    redirect("/admin?error=Folder not found");
  }

  const { count, error: countError } = await supabase
    .from("documents")
    .select("id", { count: "exact", head: true })
    .eq("folder", folder.name);

  if (countError) {
    redirect(`/admin?error=${encodeURIComponent(countError.message)}`);
  }

  if ((count || 0) > 0) {
    redirect("/admin?error=Cannot delete a folder that still contains documents");
  }

  const { error: deleteError } = await supabase
    .from("folders")
    .delete()
    .eq("id", folderId);

  if (deleteError) {
    redirect(`/admin?error=${encodeURIComponent(deleteError.message)}`);
  }

  redirect("/admin?success=Folder deleted successfully");
}