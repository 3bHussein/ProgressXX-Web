# ProgressX conflict-safe rollout: implementation boundary (NOT DEPLOYED)

Updated: 2026-10-12. Design document only; no runtime flag, migration or Supabase writes.

## Current production truth
The live root app sends unconditional `POST user_app_snapshots?on_conflict=user_id` writes. It cannot check if another device modified the snapshot after the current device loaded it. A local pending marker and an on-screen preview do not prevent stale writes.

## Safe future migration phases
1. **Backups and inventory:** independently verify backup restore, existing snapshots, pending entries, deletions and normalized feature tables for two isolated test accounts.
2. **Server contract (requires separate explicit approval):** atomic per-user versioned compare-and-swap with a server-checked expected revision; return a conflict response that includes authoritative version/state, without exposing other accounts. Restrict RPC and direct table mutations through tested RLS/grants.
3. **Client contract (after server contract is verified):** save baseline server version; never acknowledge a local edit until server confirms CAS success. On 409, retain original local pending edits and baseline; fetch authoritative state and show a review. Do not retry the old entire snapshot blindly.
4. **Review flow:** show record identifiers and field-level differences, honor deletions/tombstones, require explicit decisions. Treat unknown record types as manual review. Resolve against the latest baseline and retry CAS, retaining pending edits if another conflict occurs.
5. **Staging acceptance:** simultaneous update/delete, A delete then B unrelated stale edit, offline retry, duplicate submissions, auth refresh, account A/B negative CRUD and restore tests.
6. **Gradual rollout and rollback:** opt-in canary after owner approval, observe non-PII conflict metrics, stop or restore via documented fallback without wiping pending data.

## Explicit non-goals
The standalone `conflict-review-prototype.html` is a preview for synthetic examples, not a production merge UI. No client-only JavaScript or fake 409 response can guarantee multi-device safety. Do not present green mock CI as proof of Supabase RLS or atomic conflict safety.

## Invariants
- User-specific local drafts survive refresh and server 409.
- A server-authoritative deletion never silently reappears.
- An unrelated newer edit is not silently overwritten.
- The authenticated account must own every read/write path.
- No production CAS rollout without separate authorization and rollback plan.
