-- PROPOSAL ONLY — DO NOT APPLY TO PRODUCTION without explicit owner approval.
-- Atomic compare-and-swap for account snapshots. Caller submits the baseline payload
-- it last loaded. Updates fail closed when another device changed the cloud payload.
-- RLS remains in force: SECURITY INVOKER + auth.uid() owner check.
-- NOTE: existing insert/update grants and RLS policies must be verified before deploying.
create or replace function public.progressxx_snapshot_cas(
  expected_payload jsonb,
  next_payload jsonb
)
returns table(applied boolean, conflict boolean, current_payload jsonb)
language plpgsql
security invoker
set search_path = public, pg_temp
as $$
declare
  owner_id uuid := auth.uid();
  present_payload jsonb;
begin
  if owner_id is null then
    raise exception 'Not authenticated';
  end if;
  if next_payload is null or jsonb_typeof(next_payload) <> 'object' then
    raise exception 'Invalid snapshot';
  end if;

  select s.payload into present_payload
    from public.user_app_snapshots s
   where s.user_id = owner_id
   for update;

  if found then
    if present_payload is distinct from expected_payload then
      return query select false,true,present_payload;
      return;
    end if;
    update public.user_app_snapshots s
       set payload=next_payload,updated_at=now()
     where s.user_id=owner_id;
    return query select true,false,next_payload;
    return;
  end if;

  -- Fail closed for missing accounts; do not silently create or overwrite records.
  raise exception 'Missing snapshot: establish initial snapshot via audited account bootstrap';
end;
$$;

revoke all on function public.progressxx_snapshot_cas(jsonb,jsonb) from public, anon;
grant execute on function public.progressxx_snapshot_cas(jsonb,jsonb) to authenticated;
