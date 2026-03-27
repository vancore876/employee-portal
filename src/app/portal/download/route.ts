import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase-server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const path = searchParams.get("path");

  if (!path) {
    return NextResponse.redirect(new URL("/portal", request.url));
  }

  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  const { data: signed, error } = await supabase.storage
    .from("documents")
    .createSignedUrl(path, 60);

  if (error || !signed?.signedUrl) {
    console.error("Signed URL error:", error);
    return NextResponse.redirect(new URL("/portal", request.url));
  }

  return NextResponse.redirect(signed.signedUrl);
}