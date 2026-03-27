"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase-server";

export async function deleteDocument(formData: FormData) {
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
    redirect("/admin?error=Only admins can delete documents");
  }

  const documentId = String(formData.get("documentId") || "").trim();

  if (!documentId) {
    redirect("/admin?error=Document ID is required");
  }

  const { data: document, error: fetchError } = await supabase
    .from("documents")
    .select("id, file_path")
    .eq("id", documentId)
    .single();

  if (fetchError || !document) {
    redirect("/admin?error=Document not found");
  }

  const { error: storageError } = await supabase.storage
    .from("documents")
    .remove([document.file_path]);

  if (storageError) {
    redirect(`/admin?error=${encodeURIComponent(storageError.message)}`);
  }

  const { error: deleteError } = await supabase
    .from("documents")
    .delete()
    .eq("id", documentId);

  if (deleteError) {
    redirect(`/admin?error=${encodeURIComponent(deleteError.message)}`);
  }

  redirect("/admin?success=Document deleted successfully");
}