import { auth } from "@/lib/auth";
import GameContainer from "@/components/GameContainer";

export default async function Home() {
  const session = await auth();
  const userId = session?.user?.id ?? null;

  return (
    <div className="w-full flex flex-col items-center">
      <GameContainer userId={userId} />
    </div>
  );
}
