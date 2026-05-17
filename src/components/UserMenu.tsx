"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { handleSignOut } from "@/app/actions";

interface Props {
  name: string;
  image: string | null;
}

export default function UserMenu({ name, image }: Props) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-2 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800 px-2 py-1 transition-colors"
        aria-label="User menu"
      >
        {image && (
          <Image
            src={image}
            alt={name}
            width={28}
            height={28}
            className="rounded-full"
          />
        )}
        <span className="text-sm font-medium hidden sm:block text-zinc-700 dark:text-zinc-300">
          {name}
        </span>
        <svg
          className={`w-3 h-3 text-zinc-400 transition-transform ${open ? "rotate-180" : ""}`}
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z" clipRule="evenodd" />
        </svg>
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-1.5 w-40 rounded-lg shadow-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 z-50 overflow-hidden">
          <div className="px-3 py-2 border-b border-zinc-100 dark:border-zinc-700">
            <p className="text-xs text-zinc-500 dark:text-zinc-400 truncate">{name}</p>
          </div>
          <form action={handleSignOut}>
            <button
              type="submit"
              className="w-full text-left px-3 py-2.5 text-sm text-red-600 dark:text-red-400 hover:bg-zinc-50 dark:hover:bg-zinc-700 transition-colors"
            >
              Sign out
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
