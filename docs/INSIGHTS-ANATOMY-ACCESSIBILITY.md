# Insights and anatomy control acceptance

Production target: root `index.html`. Database experiments remain paused.

## Selected fixes

Six previously unnamed fields now have accessible names: anatomy search and region, Insights exercise/week, and muscle-mapping exercise/group. Anatomy search/region names switch between English and Arabic when anatomy language changes. Removed the stray quote after the anatomy search ID. Existing IDs, values and event handlers remain.

Muscle-list buttons expose their selected state with `aria-pressed`; coverage Front/Back controls expose mutually exclusive pressed states. Selecting a muscle previously replaced the focused button and left keyboard focus on the document. Rendering now restores focus to the selected replacement only when focus was already inside the muscle list, preserving its horizontal/vertical scroll position. Search, language, region and other external controls keep their own focus.

## Automated fixture

`tests/insights-anatomy-controls-browser.cjs`, registered in Full UI and Firefox/WebKit CI. At 320/390/768 widths, uses Playwright accessible-role lookup for all six fields; verifies bilingual names, exactly one pressed muscle, Enter/Space focus retention, last-muscle visibility in a scrolled list, retained search focus/no-result recovery and keyboard coverage Front/Back states. Empty synthetic workout/food arrays remain unchanged; external requests are blocked and backend-call count must remain zero. No account login or storage writes are performed by the fixture.

Final local full suite **75/75 PASS**, including the last-item scroll assertion. Separate screenshot-enabled synthetic fixture PASS at all three widths; 390/768 list screenshots inspected. Standard PR/main CI and gated deployment VERIFIED for PR #32 / c564881; exact evidence below.

## Limits

Accessible-name/pressed-state and browser keyboard assertions do not certify NVDA/VoiceOver/TalkBack, physical Android/iPhone, contrast or full-app accessibility/translation. Anatomy images are blocked in this fixture; real image availability/licensing remains separate. These frontend checks do not prove live synchronization, account isolation or data restore. Phase 3 remains IN PROGRESS; commercial launch NOT APPROVED.


## 2026-10-14 Cairo — Insights/anatomy controls VERIFIED and deployed

[PR #32](https://github.com/3bHussein/ProgressXX-Web/pull/32), source `6bc761d6fefa3b9eeb7b38f150c7dc2a730b1308`, merge `c56488120ab82e0e1be65f2885a131134f337b91`. All eight PR workflows SUCCESS. Matching main: [Cross-browser frontend accessibility #38468949518](https://github.com/3bHussein/ProgressXX-Web/actions/runs/38468949518) SUCCESS, [Full ProgressXX migration smoke #38468949520](https://github.com/3bHussein/ProgressXX-Web/actions/runs/38468949520) SUCCESS, [Deploy ProgressXX Full App #38468949628](https://github.com/3bHussein/ProgressXX-Web/actions/runs/38468949628) SUCCESS, [Fast conflict safety contracts #38468949494](https://github.com/3bHussein/ProgressXX-Web/actions/runs/38468949494) SUCCESS. Local full sweep **75/75 PASS**. New named-control/bilingual/pressed-state/keyboard-focus regression explicitly PASS in Chromium/Full UI and standard Firefox/WebKit PR/main at320/390/768. PR jobs115541063731/115541063175 and main115542726413/115542726799/115542725794 logs confirm the fixture; selected frontend matrix now ten fixtures per engine. Screenshot-enabled synthetic fixture also PASS, 390/768 list screenshots inspected; no account login or real backend calls.

Dedicated deploy job115542726457 records Pages `build_type=workflow` and accepts same-SHA Full UI38468949520, Fast38468949494 and Cross-browser38468949518 before publishing. No PostgreSQL or legacy Jekyll run at merge SHA. Actual public root/worker HTTP200 bytes match tested source: root `97d23e4d825c30180c1038d602db2393515a405badd7ea6bc8cabf4965733a45`, worker `323f5022828b49efc6b39105e1c53e92716f73e74a9da738aec0dd1d56db4515`.

[Acceptance and limits](INSIGHTS-ANATOMY-ACCESSIBILITY.md): six named fields, anatomy bilingual filters, muscle/coverage pressed states, selected-button focus plus scroll retention and external filter focus verified. Real screen readers, physical devices, contrast and full-app accessibility/translation remain open. Phase 3 IN PROGRESS; Phase 4 preparation incomplete; Milestone 2 paused/incomplete and commercial launch NOT APPROVED. No SQL/Supabase/staging/backups, production schema/grants/RLS/migrations, stored fitness-data/sync changes or paid services. Final closeout is documentation-only; runtime proof belongs to the tested merge above.
