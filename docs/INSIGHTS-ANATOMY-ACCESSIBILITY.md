# Insights and anatomy control acceptance

Production target: root `index.html`. Database experiments remain paused.

## Selected fixes

Six previously unnamed fields now have accessible names: anatomy search and region, Insights exercise/week, and muscle-mapping exercise/group. Anatomy search/region names switch between English and Arabic when anatomy language changes. Removed the stray quote after the anatomy search ID. Existing IDs, values and event handlers remain.

Muscle-list buttons expose their selected state with `aria-pressed`; coverage Front/Back controls expose mutually exclusive pressed states. Selecting a muscle previously replaced the focused button and left keyboard focus on the document. Rendering now restores focus to the selected replacement only when focus was already inside the muscle list, preserving its horizontal/vertical scroll position. Search, language, region and other external controls keep their own focus.

## Automated fixture

`tests/insights-anatomy-controls-browser.cjs`, registered in Full UI and Firefox/WebKit CI. At 320/390/768 widths, uses Playwright accessible-role lookup for all six fields; verifies bilingual names, exactly one pressed muscle, Enter/Space focus retention, last-muscle visibility in a scrolled list, retained search focus/no-result recovery and keyboard coverage Front/Back states. Empty synthetic workout/food arrays remain unchanged; external requests are blocked and backend-call count must remain zero. No account login or storage writes are performed by the fixture.

Final local full suite **75/75 PASS**, including the last-item scroll assertion. Separate screenshot-enabled synthetic fixture PASS at all three widths; 390/768 list screenshots inspected. Remote PR/main/deployment pending; no remote pass claimed.

## Limits

Accessible-name/pressed-state and browser keyboard assertions do not certify NVDA/VoiceOver/TalkBack, physical Android/iPhone, contrast or full-app accessibility/translation. Anatomy images are blocked in this fixture; real image availability/licensing remains separate. These frontend checks do not prove live synchronization, account isolation or data restore. Phase 3 remains IN PROGRESS; commercial launch NOT APPROVED.
