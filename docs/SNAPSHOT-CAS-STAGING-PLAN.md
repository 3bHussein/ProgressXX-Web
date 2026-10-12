# Snapshot CAS — Staging-only migration proposal

**Status:** DRAFT / NOT APPLIED / NOT TESTED ON SERVER. Project inspected read-only on 2026-10-12: `progressxx-production`, no staging branch. Actual table `public.user_app_snapshots` has `user_id uuid NOT NULL`, `payload jsonb NOT NULL`, `updated_at timestamptz NOT NULL`. No revision column.

## Migration reviewed for separate staging only

```sql
-- DO NOT APPLY TO PRODUCTION UNTIL RESTORABLE BACKUP, TWO-ACCOUNT RLS REVIEW,
-- OLD-CLIENT CUTOVER PLAN AND OWNER APPROVAL.
ALTER TABLE public.user_app_snapshots
  ADD COLUMN IF NOT EXISTS revision bigint NOT NULL DEFAULT 0
  CHECK (revision >= 0);

CREATE OR REPLACE FUNCTION public.progressx_save_snapshot_cas(
  expected_revision bigint,
  next_payload jsonb
) RETURNS TABLE(saved boolean, current_revision bigint, current_payload jsonb)
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = ''
AS $$
DECLARE
  owner_id uuid := auth.uid();
  current_row public.user_app_snapshots%ROWTYPE;
BEGIN
  IF owner_id IS NULL THEN RAISE EXCEPTION 'Authentication required' USING ERRCODE = '28000'; END IF;
  IF expected_revision IS NULL OR expected_revision < 0
    OR next_payload IS NULL OR jsonb_typeof(next_payload) <> 'object' THEN
    RAISE EXCEPTION 'Invalid revision or snapshot' USING ERRCODE = '22023';
  END IF;
  -- First-write insert races are resolved by the unique user_id key.
  INSERT INTO public.user_app_snapshots(user_id,payload,revision,updated_at)
  VALUES(owner_id,next_payload,1,now())
  ON CONFLICT (user_id) DO NOTHING;
  IF FOUND THEN
    IF expected_revision = 0 THEN
      RETURN QUERY SELECT true,1::bigint,next_payload;
      RETURN;
    ELSE
      -- Must not return a success for a client with a missing base version.
      RAISE EXCEPTION 'Initial revision mismatch' USING ERRCODE = '40001';
    END IF;
  END IF;
  -- Existing row serialized on its owner row.
  SELECT * INTO current_row FROM public.user_app_snapshots
  WHERE user_id = owner_id FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'Owner row inaccessible' USING ERRCODE = '42501'; END IF;
  IF current_row.revision <> expected_revision THEN
    RETURN QUERY SELECT false,current_row.revision,current_row.payload;
    RETURN;
  END IF;
  UPDATE public.user_app_snapshots
  SET payload = next_payload,revision=revision+1,updated_at=now()
  WHERE user_id=owner_id;
  RETURN QUERY SELECT true,current_row.revision+1,next_payload;
END $$;
```

**Critical review finding:** This is deliberately **not production-ready**. The insert-before-revision-check path is unsuitable for an account without an existing snapshot if `expected_revision` is nonzero (the erroneous insert has to be rolled back); the migration requires a revised first-write flow and rigorous transaction tests. The function also needs an explicit execute-grant review and a strategy that disables bypass through legacy direct POST upserts after all clients migrate. Do **not** apply the draft SQL verbatim.

## Mandatory acceptance before deployment

1. Independently restored backup, and separate isolated staging with disposable accounts.
2. Read existing snapshot revision 0, stale update 409/412 semantics, concurrent first inserts, concurrent deletes and unrelated updates.
3. Cross-account direct RPC/API denial, RLS insert/select/update grants review.
4. Client retains pending drafts and handles old-version responses without a blind retry.
5. Confirm old clients cannot continue unconditional full-snapshot POST.
6. Re-run Food, Daily, Workout, Saved Meals, Weight and logout/login two-device matrix; rollback rehearsal.

No SQL was executed to change the connected production project.
