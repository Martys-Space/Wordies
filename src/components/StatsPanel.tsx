"use client";

import { useEffect, useState } from "react";
import { VALID_LENGTHS } from "@/lib/words";
import type { GameResult } from "./WordleGame";

export interface StatRow {
  word_length: number;
  games_played: number;
  wins: number;
  losses: number;
  win_pct: number | null;
  avg_attempts: number | null;
  current_streak: number;
  longest_streak: number;
}

export function StatCard({ row, len }: { row: StatRow | undefined; len: number }) {
  const played   = row?.games_played  ?? 0;
  const wins     = row?.wins          ?? 0;
  const losses   = row?.losses        ?? 0;
  const winPct   = row?.win_pct   != null ? `${row.win_pct}%` : "—";
  const avg      = row?.avg_attempts != null ? String(row.avg_attempts) : "—";
  const streak   = row?.current_streak ?? 0;
  const best     = row?.longest_streak ?? 0;
  const hasData  = played > 0;

  return (
    <div className="rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 p-4 flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wide">
          {len} Letters
        </span>
        {streak > 0 && (
          <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400">
            {streak} streak
          </span>
        )}
      </div>

      {!hasData ? (
        <p className="text-xs text-zinc-400 dark:text-zinc-500 text-center py-2">No games yet</p>
      ) : (
        <>
          <div className="grid grid-cols-3 gap-1 text-center">
            <div>
              <p className="text-xl font-bold text-zinc-900 dark:text-white">{played}</p>
              <p className="text-[10px] text-zinc-500 dark:text-zinc-400">Played</p>
            </div>
            <div>
              <p className="text-xl font-bold text-green-600 dark:text-green-400">{wins}</p>
              <p className="text-[10px] text-zinc-500 dark:text-zinc-400">Won</p>
            </div>
            <div>
              <p className="text-xl font-bold text-red-500 dark:text-red-400">{losses}</p>
              <p className="text-[10px] text-zinc-500 dark:text-zinc-400">Lost</p>
            </div>
          </div>

          <div className="border-t border-zinc-100 dark:border-zinc-700 pt-2 grid grid-cols-3 gap-1 text-center">
            <div>
              <p className="text-sm font-semibold text-zinc-800 dark:text-zinc-200">{winPct}</p>
              <p className="text-[10px] text-zinc-500 dark:text-zinc-400">Win %</p>
            </div>
            <div>
              <p className="text-sm font-semibold text-zinc-800 dark:text-zinc-200">{avg}</p>
              <p className="text-[10px] text-zinc-500 dark:text-zinc-400">Avg</p>
            </div>
            <div>
              <p className="text-sm font-semibold text-indigo-600 dark:text-indigo-400">{best}</p>
              <p className="text-[10px] text-zinc-500 dark:text-zinc-400">Best</p>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export function applyResult(rows: StatRow[], result: GameResult): StatRow[] {
  const existing = rows.find((r) => r.word_length === result.wordLength);
  if (!existing) {
    const newRow: StatRow = {
      word_length: result.wordLength,
      games_played: 1,
      wins: result.won ? 1 : 0,
      losses: result.won ? 0 : 1,
      win_pct: result.won ? 100 : 0,
      avg_attempts: result.attempts,
      current_streak: result.currentStreak,
      longest_streak: result.longestStreak,
    };
    return [...rows, newRow].sort((a, b) => a.word_length - b.word_length);
  }
  return rows.map((row) => {
    if (row.word_length !== result.wordLength) return row;
    const played = row.games_played + 1;
    const wins   = row.wins + (result.won ? 1 : 0);
    const losses = row.losses + (result.won ? 0 : 1);
    const prevTotal = (row.avg_attempts ?? 0) * row.games_played;
    return {
      ...row,
      games_played: played,
      wins,
      losses,
      win_pct: Math.round((wins / played) * 100),
      avg_attempts: Math.round(((prevTotal + result.attempts) / played) * 10) / 10,
      current_streak: result.currentStreak,
      longest_streak: result.longestStreak,
    };
  });
}

const STATS_OPEN_KEY = "wordies_stats_open";

interface Props {
  userId: string | null;
  stats: StatRow[];
  loading: boolean;
  error: boolean;
}

export default function StatsPanel({ userId, stats, loading, error }: Props) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (localStorage.getItem(STATS_OPEN_KEY) === "true") setOpen(true);
  }, []);

  if (!userId) return null;

  function handleToggle() {
    setOpen((v) => {
      const next = !v;
      localStorage.setItem(STATS_OPEN_KEY, String(next));
      return next;
    });
  }

  return (
    <div className="mt-6 w-full max-w-lg px-2">
      <button
        type="button"
        onClick={handleToggle}
        className="flex items-center gap-1.5 text-sm text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors"
      >
        <svg
          className={`w-3.5 h-3.5 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
          viewBox="0 0 20 20" fill="currentColor"
        >
          <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z" clipRule="evenodd" />
        </svg>
        My Stats
      </button>

      {open && (
        <div className="mt-3">
          {loading && <p className="text-sm text-zinc-400 text-center py-4">Loading…</p>}
          {error && !loading && (
            <p className="text-sm text-red-500 text-center py-4">
              Could not load stats. Make sure the <code>streaks</code> table exists in Supabase.
            </p>
          )}
          {!loading && !error && (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {VALID_LENGTHS.map((len) => (
                <StatCard key={len} len={len} row={stats.find((s) => s.word_length === len)} />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
