# ProgressX — Workout, Nutrition & Progress Tracker

> **Status (2026-10-11): Pre-release / production readiness audit. NOT certified for public paid launch.**

**Live application:** https://3bhussein.github.io/ProgressXX-Web/  
**Source:** https://github.com/3bHussein/ProgressXX-Web  
**Roadmap:** [ROADMAP.md](ROADMAP.md) · **Latest work log:** [docs/DEVELOPMENT-LOG.md](docs/DEVELOPMENT-LOG.md) · **Continuity / AI handoff:** [docs/PROJECT-HANDOFF.md](docs/PROJECT-HANDOFF.md)

## What is ProgressX?

Mobile-first fitness companion for workouts, training schedules, body-weight check-ins, nutrition tracking, a food library, daily summaries, body anatomy, statistics and progress insights. The goal is to evolve the working personal application into a safe multi-user product suitable for private beta and eventually paid subscriptions.

### Available or under active refinement
- Workout log, exercise library, workout templates and active workout sessions
- Weight check-ins, schedule, personal records and insights
- Today's Food, Food Library, saved meals, daily history, nutrition and barcode workflows
- Human muscular anatomy with exercise associations
- PWA/offline support, backup/restore and diagnostics
- Login and account-oriented data synchronization

**Important:** Visible UI/features do **not** prove correct persistence, cross-device sync, per-user authorization or commercial readiness. Track verification separately.

## Repository map

| Path | Purpose |
| --- | --- |
| `index.html` | **Production GitHub Pages entrypoint** — prioritize this URL |
| `full-app.html` | Another large app HTML; inspect usage before changing |
| `commercial-v1.html` | Legacy/experimental page; **do not deploy/test as the production target** |
| `sw.js`, `manifest.webmanifest` | PWA/service worker |
| `supabase/migrations/` | Database migrations; review live schema and RLS before relying on them |
| `tests/` | JavaScript regression tests for account pages, login, workout, nutrition and sync |
| `.github/workflows/` | GitHub Actions smoke/regression checks and Pages deployment |
| `docs/FULL-LEGACY-CUTOVER.md` | Existing data cutover documentation |
| `ROADMAP.md` | Prioritized product plan and release gates |
| `docs/PROJECT-HANDOFF.md` | Project memory and exact instructions for a future chat/developer |

## Deployment and engineering rules

1. **Only target** https://3bhussein.github.io/ProgressXX-Web/ and its `index.html`. Do not accidentally promote `commercial-v1.html`.
2. Preserve existing features, user history and production data; do not reset any Supabase tables, Apps Script records, or browser storage without an explicit approved backup/migration plan.
3. Changes to Food, Daily, Workout, saved meals, schedules, weights or login require tests for add/edit/delete, refresh, logout/login, multi-user isolation, and device sync.
4. Run the appropriate repository regression tests and GitHub Actions. Don't call a change deployed/verified until the actual run/deployment outcome is confirmed.
5. Use PRs and review for risky changes; do not bypass required checks. Never commit service-role keys, passwords, tokens, personal workout exports, or real user records.
6. Track bug reproduction, root cause, regression test, deployed commit and verification result for each fix.
7. Make offline-to-online conflict behavior deterministic, including deletion tombstones and idempotent sync. Don't silently overwrite user changes.
8. Treat Supabase RLS and server-side authorization as mandatory. Public GitHub Pages frontend code cannot securely store secrets or independently enforce paid plans.

## Current risks / pending verification

- Recent reported login exception: `Cannot read properties of undefined (reading 'filter')`, particularly with restored Food/Daily histories. A regression-fix commit is present; **retest a real restored account, not just fixtures**.
- Verify Food, Daily, Food Library, Workout Log, Workout Schedule and Weight Check-ins each map to correct persistent tables and user IDs.
- Check historical data imported from the W1–W19 workout spreadsheets is preserved and isolated from new users.
- Validate offline queues, sync latency, deduplication and two-device conflict scenarios.
- Validate Supabase row-level security for every table/storage bucket and all operations.
- Establish privacy, account/data deletion, monitoring, backup restoration, billing and support before commercialization.

## Mandatory end-of-task tracking

After every change, append a dated entry to [DEVELOPMENT-LOG](docs/DEVELOPMENT-LOG.md) with changed files, commit, tests, deploy, risks and next step; refresh handoff snapshot and roadmap. Never mark an untested change as verified. This repository file is the durable record between chat sessions, **not an automatic background process**.

## How to resume this project in a new ChatGPT conversation

Share this GitHub repository and say:

> **Continue ProgressX from the repository documentation. Read README.md, ROADMAP.md, docs/DEVELOPMENT-LOG.md and docs/PROJECT-HANDOFF.md first. Check main branch, open PRs and recent GitHub Actions before making edits. Work only on the root index.html production site, preserve all user data, implement the highest-priority unverified item, add regression tests, verify CI and update the handoff files. Do not assume previously described issues are resolved without checking current code and deployment.**

See [PROJECT-HANDOFF](docs/PROJECT-HANDOFF.md) for detailed historical context.

## Commercial release policy

No public paid launch until **P0 release gates** pass: login/recovery, independent account isolation and RLS, full data lifecycle and multi-device sync, offline recovery, verified backups, deployment gates, privacy and data deletion. Private beta must use voluntary test users and safe test data.

## License

**No license has been declared in this README.** Public repository visibility does not automatically grant permission to reuse or resell the code. Choose a license deliberately before distributing source code.
