# ProgressX — Conflict-safe sync production acceptance checklist (NOT DEPLOYED)

Updated 2026-10-12. This checklist is a design/release gate, not authorization to alter the production Supabase database.

## Preconditions
- Preserve and independently verify restorable backups and all account-scoped pending edits, including deleted entries.
- Explicit owner approval to resume deferred paid Supabase staging and security work: `SECURITY-DEFERRED-2026-10-12`.
- Review RLS/grants and ownership for all CRUD/RPC paths; verify negative tests against two unrelated accounts.
- Choose and review atomic server-side compare-and-swap/version contract, including 409 conflict and idempotency keys.
- Review legacy snapshot data and migrate without changing any historical workout, weight, Daily or Food records.

## Required integration tests
1. Two devices same account: concurrent same-record update; stale write is rejected and pending edit remains recoverable.
2. Device A delete followed by device B stale unrelated edit: deletion remains deleted and unrelated edit may be merged only with appropriate baseline.
3. Offline delete/edit queue: repeated replay is idempotent, no delete resurrection, queued edits survive reload and auth renewal.
4. Device A/Different account B: negative GET, POST, PATCH, DELETE and RPC authorization tests.
5. Reauthenticate, refresh, token failure, disconnect and crash during in-flight reconciliation.
6. Validate Food, Daily, Workout, Weight, templates, settings, imported history, saved meals on phone and desktop.
7. Check real staging backup restore, throttling, logging redaction, rollback procedure and owner sign-off.

## Rollout rules
Do not deploy an untested CAS migration or turn on automatic conflict reconciliation by default. Start in isolated staging, gate behind approved controlled rollout, collect conflict metrics without PII, and preserve rollback. Any migration requires explicit instruction from the owner. Free mock/synthetic tests can proceed without this approval.

## Current status
**OPEN — specification only.** The production whole-snapshot upsert remains last-writer-wins; the accompanying simulation tests do not resolve it. Do not invite paying/external users until the security and data-safety release gates have passed.
