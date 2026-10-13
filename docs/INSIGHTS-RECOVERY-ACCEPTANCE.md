# Insights panel recovery acceptance

Production target: root `index.html`. Database experiments remain paused.

## Evidenced problem and change

`renderIntelligence` previously invoked optional panels sequentially without independent guards. A Readiness or Recovery Map exception stopped Weekly, Nutrition, Body and Recovery Summary updates. Root rendering now guards each of those panels independently, together with exercise insights and muscle mapping. Failed output is replaced with a generic message pointing to the existing Refresh insights button. Both visual and detailed recovery output are replaced together, avoiding stale recovery claims after a map failure. Raw exception messages are not inserted into the page. Existing local console errors remain; do not share raw console output publicly.

The common render helper deduplicates warning names and protects against a failing fallback. Healthy refresh uses original renderers and retains existing exercise/week selections. This changes frontend rendering only, not stored fitness records, synchronization, account activation or database configuration.

## Regression and limits

`tests/insights-panel-recovery-browser.cjs` injects Readiness and Recovery Map errors simultaneously on the root with one synthetic workout, no login and all external requests blocked. It checks generic fallback in visible cards and collapsed detail, later Weekly/Nutrition/Body/Recovery Summary output, warning deduplication, retry recovery, retained selections and unchanged synthetic arrays. It asserts zero backend calls and no uncaught page error. Registered in Full UI and selected Firefox/WebKit workflows.

Local parallel sweep: **73/74 PASS**; existing `scripts/smoke-full-ui.cjs` mock sign-out wait timed out. Isolated full UI smoke rerun PASS; final Insights/browser and login optional-recovery checks also PASS after fallback text layout polish. No clean 74/74 parallel sweep is claimed. Browser screenshot inspection of the synthetic 390px fallback confirmed readable generic text; no customer data was used.

This is not a full application error boundary: malformed global datasets, unavailable analytics core, asynchronous event handlers, real account initialization and screen-reader/device acceptance remain separate gates. Core data safety and commercial approval are not inferred from this fixture. Standard PR/main CI and gated deployment VERIFIED for PR #31 / 8d2a3c2; exact evidence below.


## 2026-10-14 Cairo — Independent Insights recovery VERIFIED and deployed

[PR #31](https://github.com/3bHussein/ProgressXX-Web/pull/31), source `298902bcc76644d5460da3d1816ffbb72772878b`, merge `8d2a3c234c4766c580b1ba9a8fe5a9b94ab39903`. All eight PR workflows SUCCESS. Matching main: [Cross-browser frontend accessibility #38466994166](https://github.com/3bHussein/ProgressXX-Web/actions/runs/38466994166) SUCCESS, [Full ProgressXX migration smoke #38466994294](https://github.com/3bHussein/ProgressXX-Web/actions/runs/38466994294) SUCCESS, [Fast conflict safety contracts #38466994360](https://github.com/3bHussein/ProgressXX-Web/actions/runs/38466994360) SUCCESS, [Deploy ProgressXX Full App #38466994366](https://github.com/3bHussein/ProgressXX-Web/actions/runs/38466994366) SUCCESS. New browser regression explicitly PASS in Chromium/Full UI and standard Firefox/WebKit PR/main jobs; selected frontend matrix now nine fixtures per engine. PR jobs115534904094/115534904477 and main115536235262/115536235206 confirm independent failures, generic retry, subsequent panel updates, successful refresh, retained selections and unchanged synthetic arrays with zero backend calls. Local sweep **73/74 PASS**, existing mock sign-out timeout then isolated full UI smoke PASS; final targeted Insights and login recovery checks PASS after fallback text polish. No clean 74/74 parallel pass is claimed.

Dedicated deploy job115536235237 records Pages `build_type=workflow` and accepts same-SHA Full UI38466994294, Fast38466994360 and Cross-browser38466994166 before publishing. No PostgreSQL or legacy Jekyll workflow at merge SHA. Actual root/worker HTTP200 bytes match tested source: root `cc2c209009182c5ddffe9e254057f124d7e15396887ae4a1c269de4c2a645509`, worker `323f5022828b49efc6b39105e1c53e92716f73e74a9da738aec0dd1d56db4515`.

[Insights acceptance](INSIGHTS-RECOVERY-ACCEPTANCE.md) records behavior and exclusions. This completes the selected optional Insights panel recovery task, not the entire error-boundary/accessibility/device milestone. Phase 3 IN PROGRESS; Phase 4 preparation incomplete; Milestone 2 paused/incomplete and commercial launch NOT APPROVED. No SQL/Supabase/staging/backups, production schema/grants/RLS/migrations, stored fitness-data/sync changes or paid services. Final closeout is documentation-only; runtime evidence belongs to the tested merge above.
