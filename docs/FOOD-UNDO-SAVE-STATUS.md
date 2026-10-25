# Food Undo and visible save state

## User behavior

Food diary supports one last Undo for two minutes: Quick add, repeating a previous meal (one batch), and diary-entry deletion. The notice stays visible at the top while scrolling within Food; it is hidden on other routes. Undo is disabled if any added entry was edited or disappeared after the addition. Other workout/weight/template operations are not advertised as undoable. Non-undoable diary edits and legacy meal-copy/template additions dismiss an older offer so it cannot be mistaken for the most recent diary action.

Undoing an addition removes only the exact unchanged added IDs. Undoing deletion explicitly creates new client IDs from the recorded portions/nutrition/date/time; the original tombstones and deletion intents are never cleared. This avoids resurrecting an old identity or undoing a deletion from another device. Restores do not overwrite unrelated rows. New IDs use crypto.randomUUID. Expired Undo payloads are pruned.

Diary rows, pending IDs, creation queue and Undo payload are written through the existing verified multi-key local batch before updating memory. Deletion also writes tombstones and a separate durable delete queue in that batch. Local failures roll back and show an unconfirmed-save message; the user is asked to check the diary before retrying.

The new `progressxx-food-delete-outbox-v1` survives reload/offline. Reconnect, a ready-account poll (15-second delay after failure) and the explicit Retry action process it using the existing authenticated `food_log_delete` API. Known snapshot conflicts pause new deletion retries. Deletion waits for the existing food-creation flush to finish, handles remapped IDs, and keeps the current live array when an old response arrives; a removed row cannot be reinserted locally by that response. Async completion checks the account scope. Undo/restore never clears an existing tombstone.

Undo and deletion-intent keys are excluded from normal backup export and cleared on restore, so an imported backup does not replay them. No database, RLS, Auth policy, endpoints, SDK or schema changes are included. Real-account cross-device behavior is not certified by these synthetic tests; existing sync/security milestones remain open.

## Save state

A closed native Save status panel appears after the page header across eight pages. It separates device draft, unconfirmed local state, offline, pending, in-progress, conflict/error and confirmed cloud save. Details show known pending Food/Workout/Weight/Daily counts and explain that exercise drafts are not completed records. Retry uses the existing domain queues and account-snapshot flush; conflict review opens the existing review UI without forcing a snapshot overwrite. Empty queues alone never produce a cloud-confirmed label.

A read-only `__pxSaveState` bridge exposes ready/dirty/busy/conflict/last confirmed snapshot state and an account scope, never credentials/tokens/payload. Acknowledgement is set only after the existing snapshot write and schedule mirror complete, bound to the write's account. In-progress direct table API calls also suppress the confirmed state. The bridge and Retry do not change authorization rules. The panel is not a guarantee that every table or another device is up to date. Local/pending nutrition messages no longer advance the old nutrition-success timestamp.

The earlier mobile geometry assertion now measures the real status-panel-to-Insights gap instead of expecting the newly added panel to be absent. All existing route/navigation checks remain strict.

## Evidence and limits

`tests/food-undo-save-status-browser.cjs` uses synthetic account stores and blocked external requests. Covers add/batch/delete Undo, new-ID restore and tombstones, modified-row protection, in-flight create acknowledgement ordering, durable offline deletion/reload/retry, addition/deletion storage rollback, expiry, account separation and late acknowledgement, no false confirmation from empty queues, draft/direct-write/snapshot/conflict states, conflict pause, keyboard/44px controls and EN/AR 320/390/768/1280. Existing Food portions, meal/session drafts, Food/Weight browsing, practical progress, all-page mobile, backup download/import/reload and mocked-auth save/reload/logout regressions pass locally. Full UI and Firefox/WebKit CI include the new acceptance test. Final runtime/deployment/production-byte evidence is in DEVELOPMENT-LOG.md.

Supabase skill security checks were reviewed: no service-role/secret key, no authorization from user_metadata, no RLS/security-definer/view/storage-policy changes, no unpinned SDK dependency. Existing publishable-key/authenticated REST paths are reused. Reviewed official changelog index (2026-10-25) and table/API guidance; no relevant API/config change is introduced. Markdown docs were fetched with curl because web rendering does not accept text/markdown. Database experiments remain paused: verification uses local/mock API requests, not production SQL.

References: https://supabase.com/changelog.md ; https://supabase.com/docs/guides/database/tables .
