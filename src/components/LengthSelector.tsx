"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { DEFAULT_LENGTH, VALID_LENGTHS, WordLength } from "@/lib/words";

function Inner() {
  const router = useRouter();
  const params = useSearchParams();
  const current = (Number(params.get("len")) || DEFAULT_LENGTH) as WordLength;

  return (
    <div className="flex items-center gap-1">
      {VALID_LENGTHS.map((len) => (
        <button
          key={len}
          onClick={() => router.push(`/?len=${len}`)}
          className={[
            "w-8 h-8 rounded text-xs font-bold transition-colors",
            current === len
              ? "bg-indigo-600 text-white"
              : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700",
          ].join(" ")}
        >
          {len}
        </button>
      ))}
    </div>
  );
}

export default function LengthSelector() {
  return (
    <Suspense fallback={null}>
      <Inner />
    </Suspense>
  );
}
