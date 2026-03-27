"use server";

import { createClient } from "@/lib/supabase-server";

export async function getDownloadUrl(filePath: string) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Unauthorized");
  }

  const { data: signed, error } = await supabase.storage
    .from("documents")
    .createSignedUrl(filePath, 60);

  if (error || !signed?.signedUrl) {
    throw new Error(error?.message || "Could not create download link");
  }

  return signed.signedUrl;
}