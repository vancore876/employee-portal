import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase-server";
import { serviceSupabase } from "@/lib/service-supabase";

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const formData = await request.formData();
  const fileId = String(formData.get("fileId") || "");

  const { data: file, error: fetchError } = await serviceSupabase
    .from("files")
    .select("id, file_path")
    .eq("id", fileId)
    .single();

  if (fetchError || !file) {
    return NextResponse.json({ error: "File not found" }, { status: 404 });
  }

  const removeResult = await serviceSupabase.storage.from("portal-files").remove([file.file_path]);

  if (removeResult.error) {
    return NextResponse.json({ error: removeResult.error.message }, { status: 500 });
  }

  const { error: deleteError } = await serviceSupabase.from("files").delete().eq("id", fileId);

  if (deleteError) {
    return NextResponse.json({ error: deleteError.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}