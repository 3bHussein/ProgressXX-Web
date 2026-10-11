-- Applied to production 2026-10-11, scoped per authenticated account.
create table if not exists public.progressxx_reminder_archive(
 user_id uuid not null references auth.users(id) on delete cascade,
 reminder_id text not null,
 name text not null,
 amount text,
 reminder_time text,
 enabled boolean not null default true,
 source text not null default 'app',
 primary key(user_id,reminder_id)
);
alter table public.progressxx_reminder_archive enable row level security;
drop policy if exists progressxx_reminder_archive_owner on public.progressxx_reminder_archive;
create policy progressxx_reminder_archive_owner on public.progressxx_reminder_archive
 for all to authenticated using(user_id=(select auth.uid())) with check(user_id=(select auth.uid()));
grant select,insert,update,delete on public.progressxx_reminder_archive to authenticated;
