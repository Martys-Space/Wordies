"use client";

import { LetterState } from "@/lib/words";

const ROWS = [
  ["q", "w", "e", "r", "t", "y", "u", "i", "o", "p"],
  ["a", "s", "d", "f", "g", "h", "j", "k", "l"],
  ["Enter", "z", "x", "c", "v", "b", "n", "m", "⌫"],
];

const keyColors: Record<LetterState, string> = {
  correct: "bg-green-600 text-white",
  present: "bg-yellow-500 text-white",
  absent:  "bg-zinc-400 dark:bg-zinc-600 text-white",
  empty:   "bg-zinc-200 dark:bg-zinc-700 text-zinc-900 dark:text-white hover:bg-zinc-300 dark:hover:bg-zinc-600",
};

interface Props {
  letterStates: Record<string, LetterState>;
  onKey: (key: string) => void;
  disabled: boolean;
}

export default function Keyboard({ letterStates, onKey, disabled }: Props) {
  return (
    <div className="flex flex-col gap-1.5 w-full max-w-[500px] mx-auto select-none px-1">
      {ROWS.map((row, i) => (
        <div key={i} className="flex justify-center gap-1">
          {row.map((key) => {
            const state = letterStates[key] ?? "empty";
            const isWide = key === "Enter" || key === "⌫";
            return (
              <button
                key={key}
                onClick={() => !disabled && onKey(key)}
                // flex-1 lets all keys share space proportionally; wide keys get 1.5×
                className={[
                  "flex-1 h-14 rounded font-bold text-xs sm:text-sm",
                  "flex items-center justify-center transition-colors duration-150",
                  isWide ? "flex-[1.5] max-w-[4rem]" : "max-w-[2.75rem]",
                  keyColors[state],
                ].join(" ")}
                disabled={disabled}
              >
                {key}
              </button>
            );
          })}
        </div>
      ))}
    </div>
  );
}
