# ProgressX — Project handoff / memory for future chats

**Updated:** 2026-10-11. **Read alongside:** [README](../README.md), [ROADMAP](../ROADMAP.md), and **[DEVELOPMENT-LOG](DEVELOPMENT-LOG.md) — chronological source of truth for completed tasks**.

## Latest work (2026-10-12)

A static test for the 11-command unapplied privilege migration was added at `tests/security-migration-safety.cjs` and wired into `.github/workflows/full-ui-smoke.yml` (commit `df4a14761d11dbd77bb028c2f82e6eda0ee330ab`). Production database unchanged. Check current Actions status first; next step is independently approved staging/cost plus negative two-user RLS and CRUD tests. See `docs/DEVELOPMENT-LOG.md`.

## Latest verification (2026-10-12)

CI run #38178220700 passed. Production read-only RLS role simulation returned zero private rows to anonymous role and synthetic nonexistent authenticated account for sampled Food/Workout/Weight/Daily tables. See docs/RLS-NEGATIVE-READ-PROBE.md and DEVELOPMENT-LOG.md. This is limited SELECT testing; real two-account CRUD, staging grant hardening and cross-device synchronization remain unverified. No production schema/data changed.

## Mandatory continuity rule

Every time work is finished, **append a dated entry to docs/DEVELOPMENT-LOG.md**, update the latest issue/next step in this file, and update ROADMAP checkboxes/evidence when relevant. Include changed files, commit/PR, actual CI/run link and test result, deployed/not deployed, data impact and next specific action. Read the newest development-log entry first in a new chat. No change is finished until documentation has been updated; never fabricate tests or success. These updates require a deliberate GitHub commit per task — they are **not automatic outside an active session**.

## User intent / non-negotiables

- Develop **https://3bhussein.github.io/ProgressXX-Web/** into a real, mobile-friendly, multi-user fitness product ultimately suitable for sale.
- **Never use `/commercial-v1.html` as the target for experiments or deployments.** The root URL/`index.html` is the target.
- Preserve all existing workouts, food logs, imported spreadsheets, settings and integrations. Prefer incremental changes and full tests before every release.
- Future chat must inspect current code, CI and database before concluding an old bug is fixed.
- Keep mobile experience clean (e.g. anatomy has its own tab, navigation must not obscure interaction).
- The user typically communicates in Egyptian Arabic; explain what changed and what was verified.

## Background feature history (user reports, not all independently verified)

Workout Log has extensive historical records (previously 621/634+), 39 exercise types, W20-era progress; workout templates, schedule, live workout logging, exercise renaming, muscle anatomy with related exercises, weight check-ins, personal records and charts. Legacy exercise `Cross triceps 12*3` was requested removed. Logging interface should avoid rendering all history at once; fast search/filter.

Food requirements: Today's Food, Food Library, saved meals, date/time including 00:00, copying individual Breakfast/Lunch/Dinner from a previous day, barcode scanning and manual entry (a previous reported failing code was 6224010103344), offline food mode, daily summaries and nutrition archives. Account data must synchronize, not merely stay in browser local storage.

Data sources/history: Google Apps Script/Sheets were used for some personal data and legacy import; later the app uses Supabase for account data. Prior source spreadsheet names include `workout_history_W1-W19_v2(3).xlsx` and `workout_history_W1-W19_v2(4).xlsx`. **These names are historical context, not a guarantee files are present or that imports are correct.** Do not put their contents in this public repo. Review `docs/FULL-LEGACY-CUTOVER.md` and actual current code/migrations before modifying data flows.

## Latest Supabase production audit (2026-10-12)

Read-only inspection found 20/20 public tables with RLS enabled and owner-scoped policies on private data. **Security risk:** some tables grant TRUNCATE/TRIGGER to anon/authenticated (TRUNCATE is outside RLS row filtering). Supabase advisor warns leaked-password protection disabled. Details and next actions: [SUPABASE-SECURITY-AUDIT](SUPABASE-SECURITY-AUDIT.md). No permissions or user data changed; two-user isolation is **not yet verified**. Next: review/rehearse narrowly scoped permission revokes and run synthetic account negative tests, then verify cross-device sync.

## Most recent engineering change (2026-10-11)

Pages deployment workflow now requires restored Food/Daily login regression and optional-panel isolation regression tests before deployment (commit `2297115beebb3014b2c693682c7bd971b285fb5e`). At handoff, Actions run [#38155895490](https://github.com/3bHussein/ProgressXX-Web/actions/runs/38155895490) was QUEUED; inspect final result before treating this gate as verified. See [DEVELOPMENT-LOG](DEVELOPMENT-LOG.md) for full chronology. Next investigate real-account login and two-user RLS/data isolation.

## Latest issue / verification state

On 2026-10-11 user reported `Cannot read properties of undefined (reading 'filter')` **during login**, notably while loading Food/Daily and restored historical data.

GitHub's latest observed commit message: `Reproduce Food/Daily login undefined-filter crash with restored account fixture (#15)` (`f2ee3f45562ded0c5ac7f2037625c438ad521b94`). The observed latest `Full ProgressXX migration smoke` run #38154374844 was **successful** on 2026-10-11, and Pages deploy #38154374610 was **successful** on that commit. These are historical observations, **not** a guarantee the user's live restored account works now. First task is regression/manual verification and follow-up if it still breaks.

## Actual repository paths reviewed

- `index.html`: GitHub Pages root app; `full-app.html`, `commercial-v1.html`: other large HTML versions.
- `supabase/migrations/`: migrations, not proof live policies are correct.
- `docs/FULL-LEGACY-CUTOVER.md`: prior migration approach.
- `tests/`: `login-imported-archive-regression.cjs`, `login-optional-render-recovery.cjs`, `daily-history-supabase-hydration.cjs`, `account-pages-snapshot-sync.cjs`, `legacy-nutrition-settings-restore.cjs`, `weight-table-bridge.cjs`, workout table/schedule/noop/history tests.
- `.github/workflows/`: `deploy-pages.yml`, `full-ui-smoke.yml`, `page-snapshot-regression.yml`, and workout/weight regression workflows.

## Recommended continuation procedure for a new assistant/developer

1. Open this file, DEVELOPMENT-LOG, README, ROADMAP, `docs/FULL-LEGACY-CUTOVER.md`; read latest GitHub commits, open PRs, Actions and production app.
2. Establish **actual current** branch/head and whether required workflows pass. Avoid guessing the framework or build commands; inspect scripts/workflows.
3. Identify one top-priority unchecked item in ROADMAP. Reproduce it with safe fixtures (empty, malformed, historical and fresh users).
4. Patch only affected production paths; add regression tests; run tests in PR; verify deploy before reporting success.
5. For data/schema changes use reversible migrations, backups, RLS checks and per-account data reconciliation. Never reset user data to make tests pass.
6. Update ROADMAP checkboxes/evidence and this handoff's 'Latest issue' entry with commit, CI link, verification and next task. Keep handoff succinct and current.

## Secrets and safety

Do **not** publish Supabase service role keys, Apps Script credentials, user emails, tokens, personal health/nutrition exports or private records. Client-side anon/publishable Supabase keys are not secrets but **RLS is mandatory**. Do not treat obscuring frontend code as an authorization boundary. Payment entitlement checks belong on a trusted server.

## Suggested first instruction in future chat

"Continue ProgressX at 3bHussein/ProgressXX-Web. Read README.md, ROADMAP.md, docs/DEVELOPMENT-LOG.md, docs/PROJECT-HANDOFF.md and FULL-LEGACY-CUTOVER.md. Inspect latest GitHub Actions and deployed root site; verify login undefined.filter fix, then audit Food/Daily/Workout/Weight persistence and Supabase RLS. Preserve all existing data. Add regression tests and update the docs after each verified task."
