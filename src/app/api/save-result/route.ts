import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { guesses, solved, wordLength, currentStreak, longestStreak } =
    await req.json() as {
      guesses: string[];
      solved: boolean;
      wordLength: number;
      currentStreak: number;
      longestStreak: number;
    };

  // Look up user by discord_id, creating them on-the-fly if missing
  let { data: user, error: userError } = await supabaseAdmin
    .from("users")
    .select("id")
    .eq("discord_id", session.user.id)
    .single();

  if (userError || !user) {
    const { data: upserted, error: upsertError } = await supabaseAdmin
      .from("users")
      .upsert(
        {
          discord_id: session.user.id,
          email: session.user.email ?? "",
          username: session.user.name ?? "",
          avatar_url: session.user.image ?? "",
        },
        { onConflict: "discord_id" }
      )
      .select("id")
      .single();

    if (upsertError || !upserted) {
      console.error("save-result: user upsert failed", upsertError);
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }
    user = upserted;
  }

  // Save game result — always attempt this regardless of streak table status
  const { error: resultError } = await supabaseAdmin.from("game_results").insert({
    user_id: user.id,
    word_length: wordLength,
    guesses,
    solved,
    attempts: guesses.length,
  });

  if (resultError) {
    console.error("save-result: insert failed", resultError);
    return NextResponse.json({ error: resultError.message }, { status: 500 });
  }

  // Upsert streak — non-fatal if streaks table doesn't exist yet
  const { error: streakError } = await supabaseAdmin.from("streaks").upsert(
    {
      user_id: user.id,
      word_length: wordLength,
      current_streak: currentStreak,
      longest_streak: longestStreak,
    },
    { onConflict: "user_id,word_length" }
  );

  if (streakError) {
    console.warn("save-result: streak upsert failed (table may not exist yet)", streakError.message);
  }

  return NextResponse.json({ ok: true });
}
