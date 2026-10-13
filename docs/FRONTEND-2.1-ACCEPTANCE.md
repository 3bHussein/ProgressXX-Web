# Frontend 2.1 — Food, Settings, language and training plans

Production target: root `index.html`. This is frontend acceptance with synthetic fixtures, not permission for commercial launch or database work.

## Behavior

- Food keeps locally known portion amount/unit/product metadata after a confirmed diary refresh. A 150g portion with 200kcal/100g remains300kcal; editing100g gives200kcal. Server-only records without physical portion metadata use one whole `entry`; doubling that quantity doubles the existing macros without inventing grams. Explicit kcal labels fit narrow screens.
- Settings uses a yellow category header and expandable categories, with account and language controls visible. Original control IDs and handlers remain; quick navigation opens its category. This is an original marketplace-inspired interface, not a reproduction of a verified Noon page.
- Settings selects English/LTR or Arabic/RTL for the eight routes. The device preference is saved separately from fitness data. A maintained catalogue is embedded in the root for offline availability. `node scripts/update-ui-catalogue.cjs` regenerates it from `UI-LANGUAGE-CATALOGUE.json`; the contract checks equality/static coverage.
- Translation preserves input values, implicit option protocol values, saved names, notes and diagnostic JSON. Scientific anatomy names/brands/units and unknown third-party errors may retain English. It does not translate users' saved data or change exported data formats. Storage denial applies language for the current page and reports that it cannot persist.
- Log → Manage training days renames a selected day across saved records, templates, schedule and its active session while retaining record IDs/history. Updated records enter the existing upsert queue. Rename waits while workout sync is busy. Creating a day and adding/removing exercises edits its future plan; removal retains historical exercises and an already-running session.
- Writes are read-back verified and previously stored values are restored on failure where storage permits. The regression covers a recoverable one-time quota failure, not an atomic transaction guarantee under persistent storage failure or process termination.

## Verification scope

New fixtures: `food-portions-after-refresh-browser.cjs`, `training-day-manager-browser.cjs`, `settings-language-pages-browser.cjs`, `ui-language-catalogue.cjs`. They run against the real root with synthetic in-memory fitness storage and blocked external requests, without account login or database activity. Language fixture reviews all eight routes at320/390/768/1280 widths, reversible/persisted language, category keyboard actions, user/protocol value preservation, Arabic Food addition and preference storage denial. Existing regression fixtures remain enabled; three new browser fixtures are included in the selected Firefox/WebKit matrix.

Local/remote final results and exact commit/deployment proof are recorded in `DEVELOPMENT-LOG.md`. Real-device rendering, screen-reader review, actual-account synchronization and two-device conflicts remain separate acceptance gates. No claim of exhaustive translation, bug-free RTL or completed Milestone3.

Database experiments remain paused by owner. Milestone2 PAUSED / INCOMPLETE; Phase3 IN PROGRESS; Phase4 PREPARATION / IN PROGRESS; commercial launch NOT APPROVED. No production tables/grants/RLS/migrations, paid services or account/database experiments are authorized by this work.

## Verified release evidence

[PR #34](https://github.com/3bHussein/ProgressXX-Web/pull/34), tested source `185c761f557a239b6305e37bd5247eec68350b30`, merge `cfc91921ed8be99cf9af0fcbfc22bd659c0adf93`. Final local82/82 PASS; all eight PR/four main workflows SUCCESS. New browser fixtures pass in Chromium/Firefox/WebKit on PR and main. Live root/worker HTTP200 bytes match tested source. Full evidence and limitations remain in Development Log; database pause and commercial NO-GO unchanged.
