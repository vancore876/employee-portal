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
  const intent = String(formData.get("intent") || "create");

  if (intent === "delete") {
    const linkId = String(formData.get("linkId") || "");
    const { error } = await serviceSupabase.from("links").delete().eq("id", linkId);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  }

  const folderId = String(formData.get("folderId") || "");
  const title = String(formData.get("title") || "");
  const url = String(formData.get("url") || "");

  const { error } = await serviceSupabase.from("links").insert({
    folder_id: folderId,
    title,
    url,
    created_by: user.id,
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}