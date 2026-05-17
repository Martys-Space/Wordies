"use client";

import { useEffect, useRef, useState } from "react";
import WordleGame, { GameResult } from "./WordleGame";
import StatsPanel, { StatCard, StatRow, applyResult } from "./StatsPanel";
import { DEFAULT_LENGTH, VALID_LENGTHS, WordLength } from "@/lib/words";

const LENGTH_KEY  = "wordies_length";
const SIDEBAR_KEY = "wordies_sidebar_open";

function loadPreferredLength(): WordLength {
  try {
    const n = Number(localStorage.getItem(LENGTH_KEY));
    if ((VALID_LENGTHS as number[]).includes(n)) return n as WordLength;
  } catch { /* ignore */ }
  return DEFAULT_LENGTH;
}

function LengthButtons({ wordLength, onChange }: { wordLength: WordLength; onChange: (l: WordLength) => void }) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {VALID_LENGTHS.map((len) => (
        <button
          key={len}
          onClick={() => onChange(len)}
          className={[
            "w-10 h-10 rounded-lg text-sm font-bold transition-colors",
            wordLength === len
              ? "bg-indigo-600 text-white"
              : "bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700",
          ].join(" ")}
        >
          {len}
        </button>
      ))}
    </div>
  );
}

export default function GameContainer({ userId }: { userId: string | null }) {
  const [wordLength,   setWordLength]   = useState<WordLength>(DEFAULT_LENGTH);
  const [sidebarOpen,  setSidebarOpen]  = useState(true);
  const [lastResult,   setLastResult]   = useState<GameResult | null>(null);
  const [stats,        setStats]        = useState<StatRow[]>([]);
  const [statsLoading, setStatsLoading] = useState(false);
  const [statsError,   setStatsError]   = useState(false);
  const fetchedRef = useRef(false);

  // Load persisted preferences on mount
  useEffect(() => {
    setWordLength(loadPreferredLength());
    const saved = localStorage.getItem(SIDEBAR_KEY);
    if (saved !== null) setSidebarOpen(saved === "true");
  }, []);

  // Fetch stats once on mount (if logged in)
  useEffect(() => {
    if (!userId || fetchedRef.current) return;
    fetchedRef.current = true;
    setStatsLoading(true);
    const controller = new AbortController();
    fetch("/api/stats", { signal: controller.signal })
      .then((r) => r.json())
      .then((data) => { setStats(data); setStatsError(false); })
      .catch((err) => { if (err.name !== "AbortError") setStatsError(true); })
      .finally(() => setStatsLoading(false));
    return () => controller.abort();
  }, [userId]);

  // Live-update stats when a game ends
  useEffect(() => {
    if (!lastResult) return;
    setStats((prev) => applyResult(prev, lastResult));
  }, [lastResult]);

  function handleLengthChange(len: WordLength) {
    if (len === wordLength) return;
    setWordLength(len);
    localStorage.setItem(LENGTH_KEY, String(len));
  }

  function handleSidebarToggle() {
    setSidebarOpen((v) => {
      const next = !v;
      localStorage.setItem(SIDEBAR_KEY, String(next));
      return next;
    });
  }

  return (
    <div className="w-full flex items-start justify-center">

      {/* ── Sidebar — large screens only ───────────────────────────────── */}
      <aside className={[
        "hidden lg:flex flex-col shrink-0 border-r border-zinc-200 dark:border-zinc-700 min-h-screen transition-all duration-200",
        sidebarOpen ? "w-96 px-4 pt-4" : "w-12 items-center pt-4",
      ].join(" ")}>

        {/* Toggle button */}
        <button
          onClick={handleSidebarToggle}
          title={sidebarOpen ? "Collapse sidebar" : "Expand sidebar"}
          className={[
            "p-1.5 rounded-md text-zinc-500 hover:text-zinc-900 dark:hover:text-white",
            "hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors mb-4",
            sidebarOpen ? "self-end" : "",
          ].join(" ")}
        >
          <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
            {sidebarOpen ? (
              <path fillRule="evenodd" d="M12.79 5.23a.75.75 0 01-.02 1.06L8.832 10l3.938 3.71a.75.75 0 11-1.04 1.08l-4.5-4.25a.75.75 0 010-1.08l4.5-4.25a.75.75 0 011.06.02z" clipRule="evenodd" />
            ) : (
              <path fillRule="evenodd" d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z" clipRule="evenodd" />
            )}
          </svg>
        </button>

        {sidebarOpen && (
          <div className="flex flex-col gap-6 overflow-hidden">
            {/* Word length */}
            <div>
              <p className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wide mb-2">
                Word Length
              </p>
              <LengthButtons wordLength={wordLength} onChange={handleLengthChange} />
            </div>

            {/* Stats */}
            {userId && (
              <div>
                <p className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wide mb-3">
                  My Stats
                </p>
                {statsLoading && <p className="text-sm text-zinc-400 py-2">Loading…</p>}
                {statsError && !statsLoading && (
                  <p className="text-xs text-red-500">Could not load stats.</p>
                )}
                {!statsLoading && !statsError && (
                  <div className="grid grid-cols-2 gap-2">
                    {VALID_LENGTHS.map((len) => (
                      <StatCard key={len} len={len} row={stats.find((s) => s.word_length === len)} />
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </aside>

      {/* ── Main game column ────────────────────────────────────────────── */}
      <div className="flex flex-col items-center flex-1 min-w-0">
        <WordleGame
          userId={userId}
          wordLength={wordLength}
          onGameOver={setLastResult}
        />

        {/* Small screens: length selector + stats (hidden on lg+) */}
        <div className="lg:hidden flex flex-col items-center w-full">
          <div className="flex gap-2 mt-1 mb-2">
            <LengthButtons wordLength={wordLength} onChange={handleLengthChange} />
          </div>
          <StatsPanel
            userId={userId}
            stats={stats}
            loading={statsLoading}
            error={statsError}
          />
        </div>
      </div>

    </div>
  );
}
