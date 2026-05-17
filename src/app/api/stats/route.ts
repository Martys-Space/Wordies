import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data: user } = await supabaseAdmin
    .from("users")
    .select("id")
    .eq("discord_id", session.user.id)
    .single();

  if (!user) {
    return NextResponse.json([]);
  }

  const { data, error } = await supabaseAdmin
    .from("user_stats")
    .select("*")
    .eq("user_id", user.id)
    .order("word_length");

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data ?? []);
}
