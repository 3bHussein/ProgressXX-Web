# Daily conflict recovery UX — implementation specification (NOT ENABLED)

Status: design and synthetic tests only. Do not deploy this flow before a server-enforced conditional write has passed authenticated staging tests and the owner authorizes the migration.

## Entry condition
The owner-scoped CAS endpoint reports `applied:false, conflict:true` and returns the latest account payload. The current device must retain its **entire pending local payload**, baseline and timestamp. Do not clear the outbox or mark `Synced`.

## UI proposal
- Persistent **Sync conflict — changes kept on this device** notice in Daily and Settings, never hidden by an ordinary refresh.
- Show the changed Daily reminder IDs only, with readable field-by-field comparison for names, amounts, times, and enabled state. Identify records deleted on either side.
- Actions: **Keep cloud version** (explicit confirmation; retain downloadable local backup), **Use this device's version** (explicit confirmation; retry only against the current cloud baseline), **Merge manually** (review each field and deleted row), **Later** (no write; retain pending state).
- When both devices modify different reminders, propose merging those distinct changes; simultaneous edit/delete of the same ID is a conflict, never auto-resurrect or auto-delete.
- All successful resolutions recheck the server version atomically. A new conflict restarts review, never silently overwrites the cloud payload.
- If offline/auth expires, disable final cloud writes and keep unsynced changes locally.

## Minimum release gate
1. Run two independent browser contexts with mock conflict response and confirm no write on 'Later'.
2. Confirm local pending entries survive browser refresh, log out/in, and failed network retries.
3. Integration-test CAS under two genuine simultaneous authenticated requests (owner vs owner; owner vs other user), with RLS verification on a temporary test database.
4. Explicitly approve database migration and staged rollout; leave the proposal in `supabase/proposals/` until approval.

The current app **does not implement this dialog or CAS endpoint**. Existing Daily create/delete sync works under normal sequential updates, but concurrent edits remain last-writer-wins.
