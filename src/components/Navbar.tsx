import { auth } from "@/lib/auth";
import { discordSignIn } from "@/app/actions";
import ThemeToggle from "./ThemeToggle";
import UserMenu from "./UserMenu";

export default async function Navbar() {
  const session = await auth();

  return (
    <header className="border-b border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 flex items-center justify-between px-4 py-3">
      <h1 className="text-xl font-bold tracking-widest uppercase text-zinc-900 dark:text-white">
        Wordies
      </h1>

      <div className="flex items-center gap-2">
        <ThemeToggle />

        {session?.user ? (
          <UserMenu
            name={session.user.name ?? ""}
            image={session.user.image ?? null}
          />
        ) : (
          <form action={discordSignIn}>
            <button className="bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold px-4 py-1.5 rounded-lg transition-colors">
              Sign in with Discord
            </button>
          </form>
        )}
      </div>
    </header>
  );
}
