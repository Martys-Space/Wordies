"use client";

import { useCallback, useEffect, useReducer, useRef, useState } from "react";
import GameBoard from "./GameBoard";
import Keyboard from "./Keyboard";
import {
  evaluateGuess,
  getMaxGuesses,
  getNextWord,
  GuessResult,
  isValidGuess,
  LetterState,
  WordLength,
} from "@/lib/words";

// ── localStorage helpers ────────────────────────────────────────────────────

const gameKey = (len: number) => `wordies_game_${len}`;
const STREAK_KEY = "wordies_streaks";

interface StreakData { current: number; longest: number }
interface SavedGame {
  answer: string;
  guesses: GuessResult[][];
  currentGuess: string;
  gameOver: boolean;
  won: boolean;
  submitted?: boolean;
}

function loadGame(len: WordLength): SavedGame | null {
  try {
    const s = localStorage.getItem(gameKey(len));
    return s ? JSON.parse(s) : null;
  } catch { return null; }
}

function saveGame(len: WordLength, state: GameState) {
  try {
    const { answer, guesses, currentGuess, gameOver, won, submitted } = state;
    localStorage.setItem(gameKey(len), JSON.stringify({ answer, guesses, currentGuess, gameOver, won, submitted }));
  } catch { /* ignore */ }
}

function loadStreaks(): Record<number, StreakData> {
  try { return JSON.parse(localStorage.getItem(STREAK_KEY) ?? "{}"); }
  catch { return {}; }
}
function getStreak(len: WordLength): StreakData {
  return loadStreaks()[len] ?? { current: 0, longest: 0 };
}
function updateStreak(len: WordLength, won: boolean): StreakData {
  const prev = getStreak(len);
  const next: StreakData = won
    ? { current: prev.current + 1, longest: Math.max(prev.longest, prev.current + 1) }
    : { current: 0, longest: prev.longest };
  const all = loadStreaks();
  all[len] = next;
  localStorage.setItem(STREAK_KEY, JSON.stringify(all));
  return next;
}

// ── Game state ──────────────────────────────────────────────────────────────

interface GameState {
  answer: string;
  guesses: GuessResult[][];
  currentGuess: string;
  gameOver: boolean;
  won: boolean;
  shake: boolean;
  message: string;
  submitted: boolean;
}

type Action =
  | { type: "ADD_LETTER"; letter: string }
  | { type: "DELETE_LETTER" }
  | { type: "SUBMIT_GUESS"; wordLength: WordLength }
  | { type: "SHAKE_OFF" }
  | { type: "CLEAR_MESSAGE" }
  | { type: "RESET"; answer: string }
  | { type: "RESTORE"; saved: SavedGame }
  | { type: "MARK_SUBMITTED" };

const WIN_MESSAGES = ["Genius!", "Magnificent!", "Impressive!", "Splendid!", "Great!", "Phew!", "Lucky!"];

function getLetterStates(guesses: GuessResult[][]): Record<string, LetterState> {
  const priority: LetterState[] = ["correct", "present", "absent"];
  const states: Record<string, LetterState> = {};
  for (const guess of guesses)
    for (const { letter, state } of guess) {
      const cur = states[letter];
      if (!cur || priority.indexOf(state) < priority.indexOf(cur)) states[letter] = state;
    }
  return states;
}

function makeInitialState(_len: WordLength): GameState {
  return { answer: "", guesses: [], currentGuess: "", gameOver: false, won: false, shake: false, message: "", submitted: false };
}

function reducer(state: GameState, action: Action): GameState {
  switch (action.type) {
    case "RESTORE":
      return { ...action.saved, shake: false, message: "", submitted: action.saved.submitted ?? false };

    case "RESET":
      return { answer: action.answer, guesses: [], currentGuess: "", gameOver: false, won: false, shake: false, message: "", submitted: false };

    case "ADD_LETTER":
      if (state.gameOver || state.currentGuess.length >= state.answer.length) return state;
      return { ...state, currentGuess: state.currentGuess + action.letter };

    case "DELETE_LETTER":
      if (state.gameOver) return state;
      return { ...state, currentGuess: state.currentGuess.slice(0, -1) };

    case "SUBMIT_GUESS": {
      if (state.gameOver) return state;
      const { currentGuess, answer } = state;
      const { wordLength } = action;
      if (currentGuess.length < wordLength)   return { ...state, shake: true, message: "Not enough letters" };
      if (!isValidGuess(currentGuess, wordLength)) return { ...state, shake: true, message: "Not in word list" };
      const result = evaluateGuess(currentGuess, answer);
      const newGuesses = [...state.guesses, result];
      const won  = currentGuess === answer;
      const lost = !won && newGuesses.length >= getMaxGuesses(wordLength);
      return {
        ...state, guesses: newGuesses, currentGuess: "", won, gameOver: won || lost,
        message: won ? WIN_MESSAGES[newGuesses.length - 1] ?? "Nice!"
                     : lost ? `The word was ${answer.toUpperCase()}` : "",
      };
    }

    case "SHAKE_OFF":       return { ...state, shake: false };
    case "CLEAR_MESSAGE":   return { ...state, message: "" };
    case "MARK_SUBMITTED":  return { ...state, submitted: true };
    default: return state;
  }
}

// ── Component ───────────────────────────────────────────────────────────────

export interface GameResult {
  wordLength: number;
  won: boolean;
  attempts: number;
  currentStreak: number;
  longestStreak: number;
}

interface Props {
  userId: string | null;
  wordLength: WordLength;
  onGameOver?: (result: GameResult) => void;
}

export default function WordleGame({ userId, wordLength, onGameOver }: Props) {
  const [state, dispatch] = useReducer(reducer, wordLength, makeInitialState);
  const [streak, setStreak] = useState<StreakData>({ current: 0, longest: 0 });

  const readyRef = useRef(false);

  // ── On mount: open the save gate ─────────────────────────────────────────
  useEffect(() => {
    readyRef.current = true;
  }, []);

  // ── When wordLength changes: load saved game for that length ──────────────
  useEffect(() => {
    const saved = loadGame(wordLength);
    if (saved) {
      dispatch({ type: "RESTORE", saved });
    } else {
      dispatch({ type: "RESET", answer: getNextWord(wordLength) });
    }
    setStreak(getStreak(wordLength));
  }, [wordLength]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Save game state to localStorage after every meaningful change ─────────
  useEffect(() => {
    if (!readyRef.current) return; // don't overwrite real data with the default empty state
    saveGame(wordLength, state);
  }, [state, wordLength]);

  // ── Auto-clear shake ───────────────────────────────────────────────────────
  useEffect(() => {
    if (!state.shake) return;
    const t = setTimeout(() => dispatch({ type: "SHAKE_OFF" }), 600);
    return () => clearTimeout(t);
  }, [state.shake]);

  // ── Auto-clear transient messages ──────────────────────────────────────────
  useEffect(() => {
    if (!state.message || state.gameOver) return;
    const t = setTimeout(() => dispatch({ type: "CLEAR_MESSAGE" }), 1500);
    return () => clearTimeout(t);
  }, [state.message, state.gameOver]);

  // ── On game over: update streak + save to DB (runs exactly once per game) ──
  useEffect(() => {
    if (!state.gameOver || state.submitted) return;

    dispatch({ type: "MARK_SUBMITTED" });

    const updated = updateStreak(wordLength, state.won);
    setStreak(updated);

    onGameOver?.({ wordLength, won: state.won, attempts: state.guesses.length, currentStreak: updated.current, longestStreak: updated.longest });

    if (userId) {
      const guessWords = state.guesses.map((g) => g.map((r) => r.letter).join(""));
      fetch("/api/save-result", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ guesses: guessWords, solved: state.won, wordLength, currentStreak: updated.current, longestStreak: updated.longest }),
      }).catch(() => {});
    }
  }, [state.gameOver, state.submitted, state.guesses, state.won, userId, wordLength, state.answer, onGameOver]);

  // ── Next word ──────────────────────────────────────────────────────────────
  const handleNextWord = useCallback(() => {
    dispatch({ type: "RESET", answer: getNextWord(wordLength) });
  }, [wordLength, state.answer]);

  // ── Keyboard input ─────────────────────────────────────────────────────────
  const handleKey = useCallback((key: string) => {
    if (state.gameOver) return;
    if (key === "Enter")            dispatch({ type: "SUBMIT_GUESS", wordLength });
    else if (key === "⌫" || key === "Backspace") dispatch({ type: "DELETE_LETTER" });
    else if (/^[a-z]$/i.test(key)) dispatch({ type: "ADD_LETTER", letter: key.toLowerCase() });
  }, [wordLength, state.gameOver]);

  useEffect(() => {
    const h = (e: KeyboardEvent) => { if (!e.ctrlKey && !e.metaKey && !e.altKey) handleKey(e.key); };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [handleKey]);

  const letterStates = getLetterStates(state.guesses);

  return (
    <>
      {/* Fixed toast */}
      {state.message && !state.gameOver && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 pointer-events-none">
          <div className="font-bold px-5 py-2.5 rounded-lg shadow-xl animate-fade-in text-sm whitespace-nowrap bg-zinc-900 text-white dark:bg-white dark:text-zinc-900">
            {state.message}
          </div>
        </div>
      )}

      <div className="flex flex-col items-center w-full max-w-lg mx-auto">
        {/* Streak badges */}
        <div className="flex gap-6 text-xs text-zinc-500 dark:text-zinc-400 mb-1">
          <span>Streak <span className="font-bold text-zinc-800 dark:text-zinc-100">{streak.current}</span></span>
          <span>Best <span className="font-bold text-zinc-800 dark:text-zinc-100">{streak.longest}</span></span>
        </div>

        <GameBoard
          guesses={state.guesses}
          currentGuess={state.currentGuess}
          currentRow={state.guesses.length}
          wordLength={wordLength}
          shake={state.shake}
        />

        {/* Game-over card */}
        {state.gameOver && (
          <div className={[
            "w-full max-w-xs rounded-xl px-5 py-4 mb-4 text-center border",
            state.won
              ? "bg-green-50 border-green-200 dark:bg-green-900/30 dark:border-green-700"
              : "bg-red-50 border-red-200 dark:bg-red-900/30 dark:border-red-700",
          ].join(" ")}>
            <p className={`font-bold text-lg ${state.won ? "text-green-700 dark:text-green-300" : "text-red-700 dark:text-red-300"}`}>
              {state.won ? WIN_MESSAGES[state.guesses.length - 1] ?? "Nice!" : "Nice try!"}
            </p>
            {!state.won && (
              <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-1">
                The word was <span className="font-bold uppercase tracking-widest">{state.answer}</span>
              </p>
            )}
            <div className="flex justify-center gap-6 mt-2 text-xs text-zinc-500 dark:text-zinc-400">
              <span>Streak <span className="font-bold text-zinc-800 dark:text-white">{streak.current}</span></span>
              <span>Best <span className="font-bold text-zinc-800 dark:text-white">{streak.longest}</span></span>
            </div>
            <button
              onClick={handleNextWord}
              className="mt-3 w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-2.5 rounded-lg text-sm transition-colors"
            >
              Next Word
            </button>
          </div>
        )}

        <Keyboard letterStates={letterStates} onKey={handleKey} disabled={state.gameOver} />

        {!userId && (
          <p className="text-zinc-400 dark:text-zinc-500 text-xs mt-4 text-center">
            Sign in with Discord to save your results.
          </p>
        )}
      </div>
    </>
  );
}
