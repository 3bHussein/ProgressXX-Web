-- Applied in Supabase on 2026-10-11. Per-account Daily history archive.
create table if not exists public.progressxx_daily_history (
 user_id uuid not null references auth.users(id) on delete cascade,
 day date not null,
 history jsonb not null default '{}'::jsonb,
 reminder_done jsonb not null default '{}'::jsonb,
 source text not null default 'app',
 updated_at timestamptz not null default now(),
 primary key(user_id,day)
);
alter table public.progressxx_daily_history enable row level security;
drop policy if exists progressxx_daily_history_owner on public.progressxx_daily_history;
create policy progressxx_daily_history_owner on public.progressxx_daily_history
 for all to authenticated using(user_id=(select auth.uid())) with check(user_id=(select auth.uid()));
grant select,insert,update,delete on public.progressxx_daily_history to authenticated;
