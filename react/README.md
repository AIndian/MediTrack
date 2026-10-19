# MediTrack React

Separate React web implementation. The Flutter app and its records are unchanged.
Use fictional sample information: browser storage is unencrypted.

Requires Node.js 22.12+ and Python 3.10+ (for the shared coverage reporter).

```sh
cd react
npm ci
npx playwright install chromium
npm run dev
```

```sh
npm run test:unit
npm run test:widget
npm run test:browser
npm run verify
```

`verify` runs tests, requires at least 60% lines, statements, branches and
functions across every JavaScript/JSX file under `src/`, builds `dist/`, then
checks real Chromium layouts on phone/tablet in portrait/landscape at 100/200%
text. Browser tests also verify minimum target sizes, input labels and local
workflows while the loaded app has no network connection.
It also runs `python ../tool/coverage_report.py --react`, reusing the Flutter
report helper, and checks that helper against synthetic Flutter and React LCOV.
Open `reports/coverage.html` for the shared line-by-line report, or
`coverage/index.html` for Vitest's interactive report. `coverage/lcov.info` and
`coverage/coverage-summary.json` support other reporting tools. Dependencies are
pinned in `package-lock.json`; generated outputs are ignored by Git.

The store mirrors Flutter's local-first operations with React's
`useSyncExternalStore`. It uses the separate key `meditrack.react.v1` and starts
empty. Corrupt or unavailable storage shows an error and is never overwritten.
Failed writes retain the in-memory records and show an error; retry the action
after storage becomes available. No server, accounts, notifications or sharing
are connected.

The unit suite ports `test/unit/app_store_test.dart` and reuses its fictional
medicine and fixed local clock. It also tests validation, failed writes, local
midnight, future-record filtering and isolation from Flutter storage.

## Screens and navigation

Hash URLs work on ordinary static hosting without server route rewrites.
Navigation uses labeled links and browser Back/Forward; secondary screens have
a Back button. Forms preserve their draft while moving between entry and review.
The header clock follows local minutes, midnight and browser resume. Today rolls
over to the next date without reusing yesterday's dose statuses.

| Existing Flutter screen | React route | Implementation |
|---|---|---|
| Today | `#/` | `src/routine-screens.jsx` |
| Medicines | `#/medicines` | `src/medicine-screens.jsx` |
| Medicine details | `#/medicines/:id` | `src/medicine-screens.jsx` |
| Add/edit medicine | `#/medicines/new`, `#/medicines/:id/edit` | `src/medicine-screens.jsx` |
| Review medicine | Add/edit URL plus `/review` | `src/medicine-screens.jsx` |
| Medication reminder | `#/dose/:id/:time` | `src/routine-screens.jsx` |
| Dose history | `#/history` | `src/routine-screens.jsx` |
| Symptoms | `#/symptoms` | `src/routine-screens.jsx` |
| Appointment summary | `#/summary` | `src/routine-screens.jsx` |
| Settings & sharing | `#/more` | `src/routine-screens.jsx` |

`src/components.jsx` adapts the existing `AppPage`, panel, medicine heading,
badge, dose controls and header clock into shared React components. `src/App.jsx`
owns navigation and subscribes to `AppStore`; screens call the same store
operations as their Flutter counterparts. No extra state-management library is
needed. The existing HTML palette, typography, card/button shapes, 205px rail,
700px breakpoint and large-text reflow are retained. `public/favicon.png` is
copied byte-for-byte from the existing `web/favicon.png`.

## Test copy and verified results

| Existing tests | React copy |
|---|---|
| `test/unit/app_store_test.dart` | `test/unit/app_store.test.js`, `test/unit/medicine.test.js` |
| `test/widget/app_flow_test.dart` | `test/widget/app_flow.test.jsx`, `test/widget/startup.test.jsx` |
| `test/widget/header_clock_test.dart` | `test/widget/header_clock.test.jsx`, browser layout checks |
| `test/widget/text_size_test.dart` | Text slider/toggle in `app_flow.test.jsx`, browser reflow tests |
| Mobile target-size and enlarged-text checks | `test/browser/accessibility.spec.js` |
| `test/support/fixtures.dart` | `test/support/fixtures.js` (same fictional medicine and fixed local date) |

Verified on Windows with Node.js 22.18.0 and Python 3.13 on October 19, 2026:

- 36 unit/component tests passed, including the production entry point.
- All 7 application JS/JSX files are included: 229/229 lines (100%),
  99.63% statements, 99.06% branches and 99.11% functions.
- 9 Chromium tests passed: 11 screens/states × 4 phone/tablet orientation sizes
  × 2 text sizes = 88 layout checks, plus an offline/persistence workflow.
- No horizontal page overflow; tested controls meet 48×48px targets and all
  inputs have labels. A sample phone screenshot is generated at
  `reports/react-phone.png` and was visually inspected.
- The shared reporter's Flutter and React paths pass its regression test.
- The production build passed. `npm audit` reported no known vulnerabilities
  in the installed dependency tree at verification time.

The separate `.github/workflows/react.yml` runs locked installation, coverage,
the shared reporter, a production build and Chromium tests, then uploads React
reports and build artifacts. The Flutter workflow is retained.

## Limits

This is a React web prototype, matching the current Flutter prototype's scope.
It is not React Native. Notifications, voice reminders, cloud sync, caregiver
permissions and external sharing remain unavailable. Low supply is a recorded
value, not an automatically decremented inventory. Only Taken/Skipped are
recorded; no automatic Missed-dose rule is invented. Allergies and medication
changes are not tracked. Archive/restore preserves dose history.

Core workflows work without a network once the app is loaded. Offline startup
and reload are not guaranteed: no service worker is installed. Browser storage
can be cleared by the browser and is unencrypted; use sample data only. There
is no automatic migration or shared database between Flutter and React.

Relative text sizes respect browser text preferences and zoom. Automated checks
cover Chromium, not Safari/Firefox, native VoiceOver/TalkBack, real devices, or
a complete accessibility audit. Line coverage does not prove visual or clinical
correctness. Flutter tests/builds were not rerun because the Flutter SDK is not
installed in this workspace; its application sources and tests are unchanged.

See [the small PR sequence](../docs/REACT_PR_PLAN.md) for staged publishing.
