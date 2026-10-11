create schema auth;
create role authenticated;
grant usage on schema auth to authenticated;

create function auth.uid() returns uuid language sql stable as $$
 select nullif(current_setting('request.jwt.claim.sub',true),'')::uuid
$$;
create table public.user_app_snapshots(
 user_id uuid primary key,
 payload jsonb not null default '{}'::jsonb,
 updated_at timestamptz not null default now()
);
alter table public.user_app_snapshots enable row level security;
create policy snapshot_owner on public.user_app_snapshots to authenticated using (auth.uid()=user_id) with check (auth.uid()=user_id);
grant usage on schema public to authenticated;
grant select,insert,update on public.user_app_snapshots to authenticated;
