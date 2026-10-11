-- Staged, non-destructive RPC. Do not run on production until reviewed.
-- Operates only on auth.uid() and serializes all writes for that user.
create or replace function public.progressxx_sync_snapshot(p_payload jsonb, p_expected_updated_at timestamptz)
returns jsonb
language plpgsql
security invoker
set search_path = public, pg_temp
as $$
declare
  v_user uuid := auth.uid();
  v_prior jsonb;
  v_timestamp timestamptz;
  v_next_timestamp timestamptz;
  v_new jsonb;
  v_deleted jsonb;
  v_key text;
  v_inserted integer;
begin
  if v_user is null then raise exception 'Authentication required' using errcode = '28000'; end if;
  if p_payload is null or jsonb_typeof(p_payload) <> 'object' then
    raise exception 'Snapshot payload must be an object';
  end if;

  -- Insert placeholder without overwriting another device's existing state.
  insert into public.user_app_snapshots(user_id,payload)
    values(v_user,'{}'::jsonb)
    on conflict (user_id) do nothing;
  get diagnostics v_inserted = row_count;
  select payload, updated_at into v_prior, v_timestamp from public.user_app_snapshots
    where user_id=v_user for update;
  if v_inserted=0 and v_timestamp is distinct from p_expected_updated_at then
    raise exception 'Snapshot version conflict: reload before saving' using errcode='40001';
  end if;
  if v_prior is null then raise exception 'Snapshot missing or inaccessible'; end if;

  -- User snapshots contain stringified JSON arrays for workout tombstones.
  -- Do not silently accept invalid tombstone JSON.
  begin
    v_deleted := coalesce((v_prior->>'progressx-workout-deleted-ids-v1')::jsonb,'[]'::jsonb);
    v_deleted := v_deleted || coalesce((p_payload->>'progressx-workout-deleted-ids-v1')::jsonb,'[]'::jsonb);
  exception when others then
    raise exception 'Invalid workout deletion list';
  end;
  if jsonb_typeof(v_deleted) <> 'array' then raise exception 'Invalid deletion list type'; end if;
  select coalesce(jsonb_agg(distinct value), '[]'::jsonb)
    into v_deleted from jsonb_array_elements(v_deleted) item(value)
    where jsonb_typeof(value)='string';

  -- Maintain all existing unknown keys; incoming device wins only for keys
  -- it supplies. Workout deletions remain a grow-only union.
  v_new := v_prior || p_payload;
  v_new := jsonb_set(v_new,'{progressx-workout-deleted-ids-v1}',to_jsonb(v_deleted::text),true);

  foreach v_key in array array['progressx-data-v19','progressx-workout-sync-queue-v1']
  loop
    if v_new ? v_key then
      begin
        if jsonb_typeof((v_new->>v_key)::jsonb) <> 'array' then
          raise exception 'Invalid workout list';
        end if;
        if v_key='progressx-data-v19' then
          v_new := jsonb_set(v_new,array[v_key],to_jsonb((
            select coalesce(jsonb_agg(x.item),'[]'::jsonb)::text
              from jsonb_array_elements((v_new->>v_key)::jsonb) x(item)
              where not exists (
                select 1 from jsonb_array_elements_text(v_deleted) d(id)
                where d.id=x.item->>'id'
              ))),true);
        else
          v_new := jsonb_set(v_new,array[v_key],to_jsonb((
            select coalesce(jsonb_agg(x.item),'[]'::jsonb)::text
            from jsonb_array_elements((v_new->>v_key)::jsonb) x(item)
            where x.item->>'op'='delete' or not exists(
              select 1 from jsonb_array_elements_text(v_deleted) d(id)
              where d.id=coalesce(x.item->>'localId','') or d.id=coalesce(x.item#>>'{payload,id}','')
            ))),true);
        end if;
      exception when others then
        raise exception 'Invalid workout JSON for %',v_key;
      end;
    end if;
  end loop;

  v_next_timestamp:=greatest(clock_timestamp(),v_timestamp + interval '1 microsecond');
  update public.user_app_snapshots
    set payload=v_new,updated_at=v_next_timestamp
    where user_id=v_user;
  return jsonb_build_object('payload',v_new,'updated_at',v_next_timestamp);
end;
$$;
revoke all on function public.progressxx_sync_snapshot(jsonb,timestamptz) from public;
grant execute on function public.progressxx_sync_snapshot(jsonb) to authenticated;
