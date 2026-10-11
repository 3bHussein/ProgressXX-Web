# ProgressXX Full Migration — single cutover

**Destination:** this repository (`3bHussein/ProgressXX-Web`), which owns the published site. Never deploy commercial changes to the personal `ProgressXX` repo.

## Goal
Adapt the **complete existing original ProgressXX UI** (Home, Workout Log, Progress/Analytics, Food/Nutrition, Daily, Calculators, Settings, Human Muscular Anatomy/Intelligence) into the commercial Supabase application **in one release**, rather than recreating individual tabs.

## Source
- User-provided `ProgressXX (52)(1).html` (~500KB) is the feature and design reference.
- The original source contains private Google Apps Script/Sheet endpoints and legacy localStorage migrations. The original file MUST NOT be committed to this PUBLIC repository.
- The prior public app and all live Supabase data remain available during development and until cutover.

## Required gates before changing main/index.html
1. Build a safe, **sanitized** full-UI artifact with no private Google account, Apps Script endpoint, spreadsheet identifiers, personal workout records, tokens or personal defaults.
2. Replace original Sheet transport with Supabase Auth and owner-scoped data access, including offline conflict/retry handling.
3. Preserve the commercial tables and per-user data already in production; migration DDL must be additive and use RLS. Never drop/overwrite live rows.
4. Preserve original features: editable workouts and templates, live sessions, custom schedule, anatomy diagrams/interaction, food diary and library, macros, daily reminders/water, body metrics, analytics, calculators, settings, backup/recovery.
5. Personal data migration is **OFF** until separately requested; even after requested, require signed-in verified target user and dry-run/deduplication.
6. Test mobile interactions, especially bottom-navigation overlap, and desktop; test sign-in/out/account isolation, data persistence, offline/online and no accidental Sheet calls.
7. Test separate users across pages and RLS in Supabase; validate that unauthenticated access cannot see records.
8. Review final diff and verify rollback to the pre-cutover commit.
9. **Only then**, change `main/index.html` in one reviewed merge/commit and let GitHub Pages publish.

## Status
- Branch `feature/full-legacy-migration` created from published `main`.
- Legacy full UI is **not yet safely migrated**. No live data imports or public overwrite have occurred.
- Use `node scripts/audit-migration.mjs <candidate.html>` to reject private endpoints, check required screens and ban accidental legacy cloud transport; structural checks do not replace runtime tests.

## Current public baseline
Current commercial app includes Supabase login, workout/food diary, weekly schedule, live workout, template editor, food products. Keep these alive until full UI meets parity.
