# Insights panel recovery acceptance

Production target: root `index.html`. Database experiments remain paused.

## Evidenced problem and change

`renderIntelligence` previously invoked optional panels sequentially without independent guards. A Readiness or Recovery Map exception stopped Weekly, Nutrition, Body and Recovery Summary updates. Root rendering now guards each of those panels independently, together with exercise insights and muscle mapping. Failed output is replaced with a generic message pointing to the existing Refresh insights button. Both visual and detailed recovery output are replaced together, avoiding stale recovery claims after a map failure. Raw exception messages are not inserted into the page. Existing local console errors remain; do not share raw console output publicly.

The common render helper deduplicates warning names and protects against a failing fallback. Healthy refresh uses original renderers and retains existing exercise/week selections. This changes frontend rendering only, not stored fitness records, synchronization, account activation or database configuration.

## Regression and limits

`tests/insights-panel-recovery-browser.cjs` injects Readiness and Recovery Map errors simultaneously on the root with one synthetic workout, no login and all external requests blocked. It checks generic fallback in visible cards and collapsed detail, later Weekly/Nutrition/Body/Recovery Summary output, warning deduplication, retry recovery, retained selections and unchanged synthetic arrays. It asserts zero backend calls and no uncaught page error. Registered in Full UI and selected Firefox/WebKit workflows.

Local parallel sweep: **73/74 PASS**; existing `scripts/smoke-full-ui.cjs` mock sign-out wait timed out. Isolated full UI smoke rerun PASS; final Insights/browser and login optional-recovery checks also PASS after fallback text layout polish. No clean 74/74 parallel sweep is claimed. Browser screenshot inspection of the synthetic 390px fallback confirmed readable generic text; no customer data was used.

This is not a full application error boundary: malformed global datasets, unavailable analytics core, asynchronous event handlers, real account initialization and screen-reader/device acceptance remain separate gates. Core data safety and commercial approval are not inferred from this fixture. Remote CI/deployment pending until actual runs are observed.
