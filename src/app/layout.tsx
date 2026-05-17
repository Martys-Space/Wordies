import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Wordies",
  description: "Daily Wordle game with Discord login",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} h-full`} suppressHydrationWarning>
      <head>
        {/* Runs before paint — prevents flash of wrong theme */}
        <script dangerouslySetInnerHTML={{ __html: `
          (function(){
            var s = localStorage.getItem('theme');
            var d = window.matchMedia('(prefers-color-scheme: dark)').matches;
            if(s === 'dark' || (!s && d)) document.documentElement.classList.add('dark');
          })();
        `}} />
      </head>
      <body className="bg-white text-zinc-900 dark:bg-zinc-900 dark:text-white min-h-full flex flex-col antialiased">
        <Navbar />
        <main className="flex flex-col items-center px-4 py-6 flex-1">{children}</main>
      </body>
    </html>
  );
}
