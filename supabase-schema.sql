-- Run this in the Supabase SQL editor to create from scratch.
-- If upgrading from the previous schema, see the migration notes at the bottom.

-- Users table
create table if not exists public.users (
  id         uuid primary key default gen_random_uuid(),
  discord_id text unique not null,
  email      text,
  username   text not null default '',
  avatar_url text,
  created_at timestamptz default now()
);

-- Daily words table (optional — admin-managed override for daily puzzles)
create table if not exists public.daily_words (
  id          serial primary key,
  word        text not null,
  word_length int  not null check (word_length between 4 and 8),
  play_date   date not null,
  unique(word_length, play_date)
);

-- Game results table (one row per completed game — no daily uniqueness, infinite play)
create table if not exists public.game_results (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid references public.users(id) on delete cascade,
  play_date   date not null default current_date,
  word_length int  not null default 5 check (word_length between 4 and 8),
  guesses     text[] not null,
  solved      boolean not null,
  attempts    int not null,
  created_at  timestamptz default now()
);

-- Streaks table (one row per user per word_length, upserted after each game)
create table if not exists public.streaks (
  user_id        uuid references public.users(id) on delete cascade,
  word_length    int not null check (word_length between 4 and 8),
  current_streak int not null default 0,
  longest_streak int not null default 0,
  updated_at     timestamptz default now(),
  primary key (user_id, word_length)
);

-- Per-category stats view
create or replace view public.user_stats as
select
  u.id            as user_id,
  u.username,
  u.avatar_url,
  gr.word_length,
  count(*)                                     as games_played,
  count(*) filter (where gr.solved)            as wins,
  count(*) filter (where not gr.solved)        as losses,
  round(
    count(*) filter (where gr.solved)::numeric
    / nullif(count(*), 0) * 100, 1
  )                                            as win_pct,
  round(avg(gr.attempts) filter (where gr.solved), 2) as avg_attempts,
  coalesce(s.current_streak, 0)               as current_streak,
  coalesce(s.longest_streak, 0)               as longest_streak,
  max(gr.play_date)                            as last_played
from public.users u
join public.game_results gr on gr.user_id = u.id
left join public.streaks s on s.user_id = u.id and s.word_length = gr.word_length
group by u.id, u.username, u.avatar_url, gr.word_length, s.current_streak, s.longest_streak;

-- Leaderboard view (all lengths combined)
create or replace view public.leaderboard as
select
  u.username,
  u.avatar_url,
  count(*) filter (where gr.solved)  as total_wins,
  count(*)                           as total_games,
  round(
    count(*) filter (where gr.solved)::numeric
    / nullif(count(*), 0) * 100, 1
  )                                  as win_pct,
  round(avg(gr.attempts) filter (where gr.solved), 2) as avg_attempts,
  max(s.longest_streak)              as best_streak
from public.users u
join public.game_results gr on gr.user_id = u.id
left join public.streaks s on s.user_id = u.id
group by u.id, u.username, u.avatar_url
order by total_wins desc, avg_attempts asc;

-- RLS
alter table public.users        enable row level security;
alter table public.daily_words  enable row level security;
alter table public.game_results enable row level security;
alter table public.streaks      enable row level security;

create policy "Users readable by all"       on public.users        for select using (true);
create policy "Daily words readable by all" on public.daily_words  for select using (true);
create policy "Results readable by all"     on public.game_results for select using (true);
create policy "Users insert results"        on public.game_results for insert with check (true);
create policy "Streaks readable by all"     on public.streaks      for select using (true);
create policy "Users upsert streaks"        on public.streaks      for insert with check (true);
create policy "Users update streaks"        on public.streaks      for update using (true);

-- ── Migration from previous schema ──────────────────────────────────────────
-- If you already have the old schema, run these in the SQL editor:
--
-- 1. Drop the old unique constraint (daily game limit):
--    alter table public.game_results drop constraint if exists game_results_user_id_play_date_key;
--    alter table public.game_results drop constraint if exists game_results_user_play_date_length_key;
--
-- 2. Create the streaks table (copy from above).
--
-- 3. Re-create the user_stats view (copy from above).
