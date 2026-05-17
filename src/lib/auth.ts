import NextAuth from "next-auth";
import Discord from "next-auth/providers/discord";
import { createClient } from "@supabase/supabase-js";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Discord({
      clientId: process.env.AUTH_DISCORD_ID!,
      clientSecret: process.env.AUTH_DISCORD_SECRET!,
    }),
  ],
  callbacks: {
    async signIn({ user, profile }) {
      if (!user.email) return true;
      const { error } = await supabaseAdmin.from("users").upsert(
        {
          discord_id: (profile as { id?: string })?.id ?? user.id,
          email: user.email,
          username: user.name ?? "",
          avatar_url: user.image ?? "",
        },
        { onConflict: "discord_id" }
      );
      if (error) console.error("signIn: user upsert failed", error);
      return true;
    },
    async session({ session, token }) {
      if (session.user && token.sub) {
        session.user.id = token.sub;
      }
      return session;
    },
  },
});
