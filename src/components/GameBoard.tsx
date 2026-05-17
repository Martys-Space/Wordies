"use client";

import { GuessResult, LetterState, getMaxGuesses, WordLength } from "@/lib/words";

const tileStyle: Record<LetterState, string> = {
  correct: "border-green-600  bg-green-600  text-white",
  present: "border-yellow-500 bg-yellow-500 text-white",
  absent:  "border-zinc-500   bg-zinc-500   text-white",
  empty:   "border-zinc-300 dark:border-zinc-600 text-zinc-900 dark:text-white",
};

// Font size scales down for longer words
const fontSize: Record<number, string> = {
  4: "text-2xl sm:text-3xl",
  5: "text-2xl sm:text-3xl",
  6: "text-xl  sm:text-2xl",
  7: "text-lg  sm:text-xl",
  8: "text-base sm:text-lg",
};

interface Props {
  guesses: GuessResult[][];
  currentGuess: string;
  currentRow: number;
  wordLength: WordLength;
  shake: boolean;
}

export default function GameBoard({ guesses, currentGuess, currentRow, wordLength, shake }: Props) {
  const maxGuesses = getMaxGuesses(wordLength);
  const size = fontSize[wordLength] ?? "text-lg";

  return (
    <div className="flex flex-col gap-1.5 w-full max-w-[360px] mx-auto my-4 px-2">
      {Array.from({ length: maxGuesses }).map((_, rowIdx) => {
        const isCurrentRow = rowIdx === currentRow;
        const guess = guesses[rowIdx];

        return (
          <div
            key={rowIdx}
            className={`flex gap-1.5 ${isCurrentRow && shake ? "animate-shake" : ""}`}
          >
            {Array.from({ length: wordLength }).map((_, colIdx) => {
              let letter = "";
              let state: LetterState = "empty";

              if (guess?.[colIdx]) {
                letter = guess[colIdx].letter;
                state = guess[colIdx].state;
              } else if (isCurrentRow) {
                letter = currentGuess[colIdx] ?? "";
              }

              const isFilled = !guess && isCurrentRow && letter !== "";

              return (
                <div
                  key={colIdx}
                  className={[
                    // flex-1 + aspect-square = equal tiles that auto-fit the container
                    "flex-1 aspect-square border-2 flex items-center justify-center",
                    "font-bold uppercase transition-all duration-300 select-none",
                    size,
                    tileStyle[state],
                    isFilled ? "scale-105 border-zinc-400 dark:border-zinc-400" : "",
                  ].join(" ")}
                >
                  {letter}
                </div>
              );
            })}
          </div>
        );
      })}
    </div>
  );
}
