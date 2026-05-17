"use server";
import { signIn, signOut } from "@/lib/auth";

export async function discordSignIn() {
  await signIn("discord");
}

export async function handleSignOut() {
  await signOut({ redirectTo: "/" });
}
