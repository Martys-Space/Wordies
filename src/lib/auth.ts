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
    async signIn({ user, account, profile }) {
      // account.providerAccountId is always the real Discord user ID
      const discordId = account?.providerAccountId ?? (profile as { id?: string })?.id;
      if (!discordId || !user.email) return true;

      const { error } = await supabaseAdmin.from("users").upsert(
        {
          discord_id: discordId,
          email: user.email,
          username: user.name ?? "",
          avatar_url: user.image ?? "",
        },
        { onConflict: "discord_id" }
      );
      if (error) console.error("signIn: user upsert failed", error);
      return true;
    },
    async jwt({ token, account }) {
      // Persist the Discord ID into the token on first sign-in
      if (account?.providerAccountId) {
        token.discordId = account.providerAccountId;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = (token.discordId as string) ?? token.sub ?? "";
      }
      return session;
    },
  },
});
